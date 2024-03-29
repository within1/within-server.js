// main admin route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var basicAuth = require('basic-auth');
var config    = require(__dirname + '/../config.js');
var fs = require("fs");
var Mustache = require("Mustache");
var async = require("async");
var match = require("../lib/match.js");
var adminlib = require("../lib/adminlib.js");
var dateFormat = require('dateformat');
var notif = require("../lib/notifications.js");
var msglib =  require("../lib/messages.js");
var bodyParser = require('body-parser');
var daemon = require("../lib/daemon.js");
var Promise = require('bluebird');
var request = Promise.promisify(require("request"));

router.use(bodyParser.urlencoded({ extended: false }));

// add basic authentication for modules listed from here:
router.use("/admin/", function(req, res, next) {
	var user = basicAuth(req);
    if (!user || user.name !== config.admin.user || user.pass !== config.admin.password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }
    next();
});

router.get("/admin", function(req, res) {
	return res.redirect(301, "/admin/users/");
});
router.get("/admin/", function(req, res) {
	return res.redirect(301, "/admin/users/");
});

// -------- main User dashboard --------
// filters the user by given parameters, pulls all school/employers/etc from db
// templates it up, and sends it back to the user
router.get('/admin/users/*', function(req, res) {
	// process query filter
	var cfilters = [];
	var cparams = [];
	var cfiltername = "";
	var cfilterid = "";
	if (req.params[0] !== undefined) {
		var cps = req.params[0].split("/");
		for (var i = 0; i < cps.length; i +=2 ) {
			cfiltername = cps[0];
			cfilterid = cps[1];
			if (cps[i] == "")
				continue;
			else if (cps[i] == "skill") {
				cfilters.push(" INTERSECT select cu.ID from TagInstances ti join Users cu on ti.OwnerID = cu.EntityID where ti.TagID = ? and type = 1");
				cparams.push(cps[i+1]);
			} else if (cps[i] == "BTI") {
				cfilters.push(" INTERSECT select cu.ID from TagInstances ti join Users cu on ti.OwnerID = cu.EntityID where ti.TagID = ? and type = 2");
				cparams.push(cps[i+1]);
			} else if (cps[i] == "interest") {
				cfilters.push(" INTERSECT select cu.ID from TagInstances ti join Users cu on ti.OwnerID = cu.EntityID where ti.TagID = ? and type = 3");
				cparams.push(cps[i+1]);
			} else if (cps[i] == "school") {
				cfilters.push("  INTERSECT select UserID from UserEducations ue where ue.SchoolID = ?");
				cparams.push(cps[i+1]);
			} else if (cps[i] == "employer") {
				cfilters.push("  INTERSECT select UserID from UserEmployments cue where cue.EmployerID = ?");
				cparams.push(cps[i+1]);
			}
		}
	}
	var allfilters = "";
	if (cfilters.length > 0)
		allfilters = " where ID in (select ID from Users "+cfilters.join(" ")+" ) ";
	async.parallel({
		"users" : function(cb) {
			// query for all users
			models.sequelize.query("SELECT *, FORMAT(DateCreated, 'MM-dd-yyyy') as crdate FROM users u "+allfilters+" order by u.DateCreated desc", { replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"BTI" : function(cb) {
			// query for relevant tags
			models.sequelize.query("select * from ( select ti.TagID, COUNT(u.ID) as usercount from TagInstances ti join Users u on ti.OwnerID = u.EntityID where ti.Type = 2 group by ti.TagID ) as tci left join Tags t on tci.TagID = t.ID", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"skills" : function(cb) {
			// query for relevant tags
			models.sequelize.query("select * from ( select ti.TagID, COUNT(u.ID) as usercount from TagInstances ti join Users u on ti.OwnerID = u.EntityID where ti.Type = 1 group by ti.TagID ) as tci left join Tags t on tci.TagID = t.ID", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"interests" : function(cb) {
			// query for relevant tags
			models.sequelize.query("select * from ( select ti.TagID, COUNT(u.ID) as usercount from TagInstances ti join Users u on ti.OwnerID = u.EntityID where ti.Type = 3 group by ti.TagID ) as tci left join Tags t on tci.TagID = t.ID", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"schools" : function(cb) {
			models.sequelize.query("select * from ( select count(distinct UserID) as usercount, SchoolID from UserEducations group by SchoolID ) as tci left join Schools s on s.ID = tci.SchoolID", { type: models.sequelize.QueryTypes.SELECT} ).then(function(res) { cb(null,res ); });
		},
		"employers" : function(cb) {
			models.sequelize.query("select * from ( select count(distinct UserID) as usercount, EmployerID from  UserEmployments group by EmployerID ) as tci left join Employers e on e.ID = tci.EmployerID", { type: models.sequelize.QueryTypes.SELECT} ).then(function(res) { cb(null,res ); });
		}
		} , function(err, data) {
			data["cfiltername"] = cfiltername;
			data["cfilterid"] = cfilterid;
			var output = Mustache.render(fs.readFileSync("./routes/admin_userlist.html", "utf8"), data);
			var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
			res.send(framed);
		});
});

// Single user listing
// pulls all model-relationships, templates it up, sends it back to the user
router.get("/admin/user/:userid", function(req, res) {
	if (req.params.userid === undefined)
		return res.send("no userid defined");
	// get single user model
	async.parallel({
		"user" : function(cb) {
			models.Users.findById(req.params.userid, {include: [
				{ model : models.UserEducations, separate: true, include: [models.Schools], order : "JourneyIndex asc" },
				{ model : models.UserEmployments, separate: true, include: [models.Employers], order : "JourneyIndex asc"},
				{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
			]}).then(function(data) { cb(null, data); })
		},
		// getting the reachouts, along with response, and feedback data
		"reachingout" : function(cb) {
			models.sequelize.query("select m.MatchRationale, cmt.Comments, u.*, u.ID as ouid, msg.* from Matches m join Users u on u.ID = m.OtherUserID \
outer apply (select top 1 * from UserRatings where \
 ( \
  (RaterID = m.OtherUserID and RatedID = m.ReachingOutUserID) OR \
  (RaterID = m.ReachingOutUserID and RatedID = m.OtherUserID ) \
  ) and (isDeletedByRatedUser = 0)  \
 ) as cmt   \
outer apply (select count(id) as msgcnt from Messages where  \
  (SenderID = m.OtherUserID and ReceiverID = m.ReachingOutUserID) OR \
  (SenderID  = m.ReachingOutUserID and ReceiverID = m.OtherUserID ) \
 ) as msg \
where m.ReachingOutUserID = ?", { replacements: [req.params.userid], type: models.sequelize.QueryTypes.SELECT} ).then(function(res) { cb(null,res ); });
		},
		"matchedwith" : function(cb) {
			models.sequelize.query("select m.MatchRationale, cmt.Comments, u.*, u.ID as ouid, msg.* from Matches m join Users u on u.ID = m.ReachingOutUserID \
outer apply (select top 1 * from UserRatings where \
 ( \
  (RaterID = m.OtherUserID and RatedID = m.ReachingOutUserID) OR \
  (RaterID = m.ReachingOutUserID and RatedID = m.OtherUserID ) \
  ) and (isDeletedByRatedUser = 0)  \
 ) as cmt   \
outer apply (select count(id) as msgcnt from Messages where  \
  (SenderID = m.OtherUserID and ReceiverID = m.ReachingOutUserID) OR \
  (SenderID  = m.ReachingOutUserID and ReceiverID = m.OtherUserID ) \
 ) as msg \
where m.OtherUserID = ?", { replacements: [req.params.userid], type: models.sequelize.QueryTypes.SELECT} ).then(function(res) { cb(null,res ); });
		},
		"activities" : function(cb) {
			return models.sequelize.query("SELECT URL, FORMAT(DateRequest, 'MM-dd-yyyy HH\\:mm\\:ss') as crdate FROM RequestLogs where UserID = ? order by id asc", { replacements: [req.params.userid], type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		}
	}, function(err, resdata) {
		data = resdata["user"];
		if (data == null)
			return res.send("User not found");
		var rl = [];
		for (var i in data.dataValues) {
			if ((data.dataValues[i] instanceof Array) || (data.dataValues[i] instanceof Object)  ) {
				continue;
			} else {
				rl.push({"name" : i, "value" : data.dataValues[i]});
			}
		}
		resdata["basicinfo"] = rl;
		resdata["BTI"] = [];
		resdata["Skills"] = [];
		resdata["Interests"] = [];
		for (var i in data["Entity"]["TagInstances"]) {
			if (data["Entity"]["TagInstances"][i]["Type"] == 1)
				resdata["Skills"].push(data["Entity"]["TagInstances"][i]);
			else if (data["Entity"]["TagInstances"][i]["Type"] == 2)
				resdata["BTI"].push(data["Entity"]["TagInstances"][i]);
			else if (data["Entity"]["TagInstances"][i]["Type"] == 3)
				resdata["Interests"].push(data["Entity"]["TagInstances"][i]);
		}
		for (var i in resdata["reachingout"]) {
			if (resdata["reachingout"][i]["MatchRationale"] !== undefined)
				resdata["reachingout"][i]["MatchRationale"] = resdata["reachingout"][i]["MatchRationale"].split("\n").join("<br />\n");

		}
		for (var i in resdata["matchedwith"]) {
			if (resdata["matchedwith"][i]["MatchRationale"] !== undefined)
				resdata["matchedwith"][i]["MatchRationale"] = resdata["matchedwith"][i]["MatchRationale"].split("\n").join("<br />\n");

		}
		if (resdata["user"]["AppStatus"] != 2)
			resdata["approvable"] = true;
		if (resdata["reachingout"].length > 0)
			resdata["hasreachout"] = 1;
		//  return res.json(resdata["matchedwith"]);
		var output = Mustache.render(fs.readFileSync("./routes/admin_usersingle.html", "utf8"), resdata);
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
});

// -------- main KPI dashboard --------
/* Mapping between KPI values, and database:

Profile created     => users.DateCreated
Profile approved	=> Appstatus & DateAppStatusModified
Received recommendations => MatchDate
Reached out			=> message first date
Conversation (responded) => response first date
number of thanks#   => currently undefined

*/
router.get("/admin/stats/*", function(req,res) {
	// parse date strings parameters
	var dateToStr = function(d) {
		return (d.getYear() + 1900)+"-"+(d.getMonth()+1)+"-"+(oneMonthEarlier.getDate());
	};
	// cparams define: [startdate,startdate,enddate];   byday defines resolution
	var oneMonthEarlier = new Date(new Date() - (1000*60*60*24 * 30));
	var cparams = [ dateToStr(oneMonthEarlier), dateToStr(oneMonthEarlier), dateToStr(new Date())];
	var byday = 7;
	// parse request parameters
	var cd = req.params[0].split("/");
	if ((cd.length > 0) && (cd[0].split("-").length == 3)) {
		cparams[0] = cd[0];
		cparams[1] = cd[0];
	}
	if ((cd.length > 1) && (cd[1].split("-").length == 3)) {
		cparams[2] = cd[1];
	}
	if (cd.length > 2)
		byday = parseInt(cd[2]);
	var data = [];
	var alldatasources = {
		"# of users logged in" : function(cb) {
			models.sequelize.query("select count(distinct UserID) as cnum, cdate from  ( select UserID, Datediff(day, ?, DateCreated ) as cdate from Events where DateCreated > ? and DateCreated < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Profile created" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from (select ID, Datediff(day, ?, DateCreated ) as cdate from users where DateCreated > ? and DateCreated < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Made it to waitlist" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from ( select ID, Datediff(day, ?, DateCreated) as cdate from users where AppStatus >= 1 and  DateAppStatusModified > ? and DateAppStatusModified < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Profile approved" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from ( select ID, Datediff(day, ?, DateCreated) as cdate from users where AppStatus > 1 and  DateAppStatusModified > ? and DateAppStatusModified < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Received recommendation" : function(cb) {
			models.sequelize.query("select count(distinct ReachingOutUserID) as cnum, cdate from ( select ReachingOutUserID, Datediff(day, ?,MatchDate) as cdate from Matches where MatchDate > ? and MatchDate < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Reached out" : function(cb) {
			// ...except for TeamWithin automatic reachout message
			return models.Users.findAll({where : { IsTeamWithin : true}, raw: true })
			.then(function(tws) {
				var twids = [];
				for (var i = 0; i < tws.length; i++)
					twids.push(tws[i]["ID"]);
				return models.sequelize.query("select count(distinct firstContactID) as cnum, cdate from (\
 select SenderID, ReceiverID, min(ID) as firstContactID, min(DateCreated) as firstcontact, Datediff(day, ?, min(DateCreated)) as cdate \
 from Messages group by SenderID, ReceiverID)\
 as t1 left JOIN (\
 select SenderID as bSenderID, ReceiverID as bReceiverID, min(ID) as contactbackID, min(DateCreated) as contactback from Messages \
 group by SenderID, ReceiverID\
 ) as t2 on (t1.SenderID = t2.bReceiverID and t1.ReceiverID = t2.bSenderID) \
 where ( (firstcontact >  ?) and (firstcontact < ?) and (contactback is null OR firstcontact < contactback) and (SenderID not in ("+twids.join(", ")+")))   group by cdate  ",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
			})
		},
		"Conversation (responded)" : function(cb) {
			return models.Users.findAll({where : { IsTeamWithin : true}, raw: true })
			.then(function(tws) {
				var twids = [];
				for (var i = 0; i < tws.length; i++)
					twids.push(tws[i]["ID"]);
				return models.sequelize.query("select count(distinct contactbackID) as cnum, cdate from  ( \
select SenderID, ReceiverID, min(ID) as firstContactID, min(DateCreated) as firstcontact \
from Messages group by SenderID, ReceiverID) as t1  \
left JOIN  \
(select SenderID as bSenderID, ReceiverID as bReceiverID, min(ID) as contactbackID, min(DateCreated) as contactback, Datediff(day, ?, min(DateCreated) ) as cdate from Messages group by SenderID, ReceiverID) as t2  \
on (t1.SenderID = t2.bReceiverID and t1.ReceiverID = t2.bSenderID)  \
where ( (firstcontact > ?) and (firstcontact < ?) and (contactback is null OR firstcontact < contactback)  and (SenderID not in ("+twids.join(", ")+")) ) \
group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
			});
		},
		"Number of contact cards shared" : function(cb) {
			models.sequelize.query("select count(distinct interact) as cnum, cdate from \
( select CONCAT(SenderID, '-',ReceiverID) as interact, Datediff(day, ?, DateCreated ) as cdate from Messages where DateCreated > ? and DateCreated < ? and Type = 2) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });

		},
		"Number of thanks" : function(cb) {
			models.sequelize.query("select count(distinct interact) as cnum, cdate from \
				( select CONCAT(RaterID, '-',RatedID) as interact, Datediff(day, ? , DateCreated ) as cdate from UserRatings \
					where DateCreated >  ? and DateCreated <  ? and isDeletedByRatedUser = 0) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		}
	};
	async.parallel(alldatasources,  function(err, data) {
		var allkeys = Object.keys(alldatasources);
		allkeys.splice(0,0,"From date");

		// console.log(JSON.stringify(data,0,4));
		paramtodate = function(s) {
			var k = s.split("-");
			return new Date(k[0],k[1]-1,k[2]);
		};
		// total number of days between start & end date
		var numdays = Math.floor((new Date(paramtodate(cparams[2])) - new Date(paramtodate(cparams[1]))) / (1000*60*60*24));
		var resbuckets = {};

		// add From date header
		resbuckets["From date"] = [];
		var ckdate = new Date(paramtodate(cparams[1]));
		for (var i = 0; i < Math.floor(numdays/byday)+1; i++) {
			resbuckets["From date"].push( dateFormat(ckdate, "yyyy-mm-dd")+"-");
			ckdate.setDate(ckdate.getDate() + byday);
		}

		// bucket each dayno-counter pair
		for (var key in data) {
			var cseries = data[key];
			resbuckets[key] = [];
			// initialize the entire series with 0
			for (var i = 0; i < Math.floor(numdays/byday)+1; i++)
				resbuckets[key].push(0);
			for (var i in cseries) {
				var cn = cseries[i]["cdate"];
				if (cn == null)
					continue;
				var cbucket = Math.floor(cn / byday);
				resbuckets[key][cbucket] += cseries[i]["cnum"];
			}
		}
		// add calculated values
		var calcvals = {
			"Reached out rate = Reach out / Received recommendation" : ["Reached out", "Received recommendation"],
			"Response rate = Responded / Reach out" : ["Conversation (responded)", "Reached out"],
			"Avg Conversation per recommendation" : ["Conversation (responded)", "Received recommendation"],
			"Avg number of contact cards shared per user: Cards shared / Conversation" : ["Number of contact cards shared", "Conversation (responded)"]
		};
		for (var i in calcvals) {
			var dres = [];
			for (var j in resbuckets[calcvals[i][0]]) {
				if (resbuckets[calcvals[i][1]][j] == 0)
					dres.push("-");
				else
					dres.push( (resbuckets[calcvals[i][0]][j] / resbuckets[calcvals[i][1]][j]).toFixed(2) );
			}
			allkeys.push(i);
			resbuckets[i] = dres;
		}
		console.log(resbuckets);
		var resopts = [];
		var alldayvars = [1,7,14,15,30,60];
		for (var i in alldayvars) {
			resopts.push({"val" : alldayvars[i], "selected" : (alldayvars[i] == byday)?("selected"):("") });
		}
		var rkpis = [];
		for (var k in allkeys)
			rkpis.push({"description" : allkeys[k], "series" : resbuckets[allkeys[k]] });
		var alldata = {"kpis" : rkpis, "mindate" : cparams[1], "maxdate" : cparams[2], "resolution_options" : resopts};
		// console.log(data);
		var output = Mustache.render(fs.readFileSync("./routes/admin_stats.html", "utf8"), alldata );
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
});

// display matches for a user
router.get("/admin/match/*", function(req,res) {
	if ((req.params.length == 0) || (req.params[0] == "")) {
		return res.send("No userid given");
	}
	var cd = null;
	match.match(req.params[0],8)
	.then(function(reslist) {
		cd = reslist;
		var idlist = [req.params[0]];
		for (var i in cd)
			idlist.push(cd[i]["id"]);
		return models.Users.findAll({where : {id: idlist } })
	})
	.then(function(ulist) {
		var culist = {};
		for (var i in ulist)
			culist[ulist[i]["ID"]] = ulist[i];
		var cvecs = Object.keys(match.vectorWeights);
		var data = { "vectornames" : cvecs, "user" : culist[req.params[0]]};
		for (var i in cd) {
			cd[i]["name"] = culist[cd[i]["id"]]["FirstName"]+" "+culist[cd[i]["id"]]["LastName"];
			cd[i]["uservectors"] = [];
			for (var k in cvecs) {
				// console.log(cd[i]["vectors"][cvecs[k]]);
				if (cd[i]["vectors"][cvecs[k]] === undefined) {
					cd[i]["uservectors"].push("-");
				} else if (cd[i]["vectors"][cvecs[k]] instanceof Array) {
					cd[i]["uservectors"].push(cd[i]["vectors"][cvecs[k]].length );
				} else {
					cd[i]["uservectors"].push("YES");
				}
			}
		}
		data["matches"] = cd;
		var output = Mustache.render(fs.readFileSync("./routes/admin_match.html", "utf8"), data );
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		return res.send(framed);
		// res.send(JSON.stringify(cd,0,4));
	})
	.catch(function(err) {
		res.send(JSON.stringify(err));
	})
});

router.post("/admin/user/:userid/approve", function(req, res) {
	return models.Users.findOne({where : { ID : req.params["userid"]}})
	.then(function(u) {
		if (u == null)
			throw "User not found";
		return adminlib.ProcessUserApplication(req.params["userid"], 2);
	})
	.then(function(r) {
		return res.redirect(301, "/admin/user/"+req.params["userid"]);
	})
	.catch(function(e) {
		console.error(e);
		return res.send(e);
	})
});

router.post("/admin/user/:userid/expirelatest", function(req, res) {
	var cuser = null;
	var notifids = [];
	// find notifications -to be flagged to send immediately
	return models.Notifications.findAll({where : {
				"SourceTable" : "NewMatchAvailable", UserID : req.params["userid"], "HasSent" : 0}, raw: true})
	.then(function(cnid) {
		for (var i in cnid)
			notifids.push(cnid[i]["ID"]);
		return models.Users.findOne({where : { ID : req.params["userid"]}})
	})
	.then(function(u) {
		cuser = u;
		return models.Matches.findAll( { where : { ReachingOutUserID : req.params["userid"] }, order : "ID desc", limit : 1})
	})
	.then(function(m) {
		if (m.length == 0)
			throw "No match found with reachingout user "+req.params["userid"];
		return models.Matches.update( { MatchExpireDate : dateFormat( new Date(), "isoUtcDateTime") }, { where : { ID : m[0]["ID"] } })
	})
	.then(function(r) {
		return request({uri : "http://"+req.headers.host+"/api/GetMatchesForUser", method: "POST", json : { "UserID" : cuser["ID"], "UserToken" : cuser["Token"] }})
	})
	.then(function(js) {
		// set notifications to be sent immediately
		return models.Notifications.update({"DateTarget" :  dateFormat( new Date(), "isoUtcDateTime"), "HasSent" : 0 }, {where : { ID : notifids }})
		.then(function(cupd) { return daemon.notifRefill(); })
	})
	.then(function(js) {
		// return res.send(js);
		return res.redirect(301, "/admin/user/"+req.params["userid"]);
	})
	.catch(function(e) {
		console.error(e);
		return res.send(e);
	})
});

// notifications lister
router.get('/admin/notifications/', function(req, res) {
	return models.Notifications.findAll({where : { hasSent : 0}, raw : true, order : "DateTarget asc", include: [models.Users] } )
	.then(function(u) {
		var revTable = {};
		for (var i in u) {
			u[i]["userid"] = u[i]["User.ID"];
			u[i]["username"] = u[i]["User.FirstName"]+" "+u[i]["User.LastName"];
			u[i]["EmailSlug"] = "";
			if (u[i]["IsEmailNotificationFlag"])
				u[i]["ctype"] = "email";
			else
				u[i]["ctype"] = "push";
			if ((u[i]["Type"] != null) && (u[i]["IsEmailNotificationFlag"] == 1))
				u[i]["EmailSlug"] = daemon.templates[u[i]["Type"]];
		}
		var output = Mustache.render(fs.readFileSync("./routes/admin_notifs.html", "utf8"), {"notifs" : u } );
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
});

router.get('/admin/notifications/sendnow/:id', function(req, res) {
	// set notifications to be sent immediately
	return models.Notifications.update({"DateTarget" :  dateFormat( new Date(), "isoUtcDateTime")  }, {where : { ID : req.params["id"] }})
		.then(function(cupd) { return daemon.notifRefill(); })
		.then(function() {
			return res.json({"res" : "sent"});
		})
});

// API calls lister
router.get('/admin/apicalls/', function(req, res) {
	return models.RequestLogs.findAll({ order : "DateRequest desc", limit : 20 })
	.then(function(u) {
		AddBreaks = function(s) {
			console.log(s);
			var k = (JSON.stringify( JSON.parse(s),0,4)).split("\n");
			for (var i in k) {
				k[i] = (k[i].match(/.{1,64}/g)).join("<wbr>");
			}
			return k.join("<br/>");
		}
		for (var i in u) {
			u[i]["Request"] = AddBreaks(u[i]["Request"]);
			if (u[i]["Request"].length > 32768)
				u[i]["Request"] = "[...]";
			u[i]["Response"] = AddBreaks(u[i]["Response"]);
		}
		var output = Mustache.render(fs.readFileSync("./routes/admin_apicalls.html", "utf8"), {"calls" : u } );
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
});

// Send message as team within
router.get("/admin/user/:userid/sendasteam", function(req, res) {
	var err = "";
	var output = Mustache.render(fs.readFileSync("./routes/admin_sendasteam.html", "utf8"), {"err" : err } );
	var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
	res.send(framed);
});

router.post("/admin/user/:userid/sendasteam", function(req, res) {
	var msg = req.body["msg"];
	// find within user

	return models.Users.findOne({where : { IsTeamWithin : true} })
	.then(function(tu) {
		return msglib.SendMessage(tu["ID"], req.params["userid"], msg, 1)
	})
	.then(function(r) {
		res.redirect("/admin/user/"+req.params["userid"]+"/sendasteam");
	})

});

// Add a new match to user
router.use("/admin/user/:userid/addmatch", function(req, res) {
	var sendresponse = function(err) {
		var err = "";
		var output = Mustache.render(fs.readFileSync("./routes/admin_addmatch.html", "utf8"), {"err" : err } );
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	}
	if (req.body["user_id"] === undefined) {
		return sendresponse("");
	} else {
		return models.Users.findOne({where : { ID : req.body["user_id"] } })
		.then(function(tu) {
			if (tu == null)
				throw "No such user";
		});
	}
});

router.post("/admin/user/:userid/logout", function(req, res) {
	return models.Users.findOne({where : { ID : req.params["userid"]}})
	.then(function(u) {
		if (u == null)
			throw "User not found";
		return models.Users.update({"Token" : null}, {where : { ID : u["ID"] }})
	})
	.then(function(r) {
		return res.redirect(301, "/admin/user/"+req.params["userid"]);
	})
})

module.exports = router;

