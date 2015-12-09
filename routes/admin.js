// main admin route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var basicAuth = require('basic-auth');
var config    = require(__dirname + '/../config.js');
var fs = require("fs");
var Mustache = require("Mustache");
var async = require("async");

// add basic authentication for modules listed from here:
router.use("/admin/", function(req, res, next) {
	var user = basicAuth(req);
    if (!user || user.name !== config.admin.user || user.pass !== config.admin.password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
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
	console.log(req.params);
	console.log("/admin route");
	// process query filter
	var cfilters = [];
	var cparams = [];
	var cfiltername = "";
	var cfilterid = "";
	if (req.params[0] !== undefined) {
		var cps = req.params[0].split("/");
		console.log(cps);
		for (var i = 0; i < cps.length; i +=2 ) {
			cfiltername = cps[0];
			cfilterid = cps[1];
			console.log(cps[i]);
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
				{ model : models.UserEducations, separate: true, include: [models.Schools]},
				{ model : models.UserEmployments, separate: true, include: [models.Employers]},
				{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
			]}).then(function(data) { cb(null, data); })
		},
		// getting the reachouts, along with any feedback data
		"reachingout" : function(cb) {
			models.sequelize.query("select * from Matches m join Users u on u.ID = m.OtherUserID where m.ReachingOutUserID = ?", { replacements: [req.params.userid], type: models.sequelize.QueryTypes.SELECT} ).then(function(res) { cb(null,res ); });
		},
		"matchedwith" : function(cb) {
			models.sequelize.query("select * from Matches m join Users u on u.ID = m.ReachingOutUserID where m.OtherUserID = ?", { replacements: [req.params.userid], type: models.sequelize.QueryTypes.SELECT} ).then(function(res) { cb(null,res ); });
		}
	}, function(err, resdata) {
		data = resdata["user"];
		var rl = [];
		for (var i in data.dataValues) {
			if ((data.dataValues[i] instanceof Array) || (data.dataValues[i] instanceof Object) || (i == "Token")) {
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
		var output = Mustache.render(fs.readFileSync("./routes/admin_usersingle.html", "utf8"), resdata);
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
});

/*
Profile created     => users.DateCreated
Profile approved	=> Appstatus & DateAppStatusModified
Received recommendations => MatchDate
Reached out			=> message first date
Conversation (responded) => response first date
number of thanks#   => currently undefined

*/
// -------- main KPI dashboard --------
router.get("/admin/stats", function(req,res) {
	var data = [];
	var cparams = ["2015-09-01", "2015-09-01", "2016-10-01"];
	var byday = 1;
	async.parallel({
		"Profile created" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from (select ID, Datediff(day, ?, DateCreated ) as cdate from users where DateCreated > ? and DateCreated < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Profile approved" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from ( select ID, Datediff(day, ?, DateCreated) as cdate from users where AppStatus > 0 and  DateAppStatusModified > ? and DateAppStatusModified < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Received recommendation" : function(cb) {
			models.sequelize.query("select count(distinct ReachingOutUserID) as cnum, cdate from ( select ReachingOutUserID, Datediff(day, ?,MatchDate) as cdate from Matches where MatchDate > ? and MatchDate < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Reached out" : function(cb) {
			models.sequelize.query("select count(distinct firstContactID) as cnum, cdate from (\
 select SenderID, ReceiverID, min(ID) as firstContactID, min(DateCreated) as firstcontact, Datediff(day, ?, min(DateCreated)) as cdate \
 from Messages group by SenderID, ReceiverID)\
 as t1 left JOIN (\
 select SenderID as bSenderID, ReceiverID as bReceiverID, min(ID) as contactbackID, min(DateCreated) as contactback from Messages \
 group by SenderID, ReceiverID\
 ) as t2 on (t1.SenderID = t2.bReceiverID and t1.ReceiverID = t2.bSenderID) \
 where ( (firstcontact >  ?) and (firstcontact < ?) and (contactback is null OR firstcontact < contactback))   group by cdate  ",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"Conversation (responded)" : function(cb) {
			models.sequelize.query("select count(distinct contactbackID) as cnum, cdate from  ( \
select SenderID, ReceiverID, min(ID) as firstContactID, min(DateCreated) as firstcontact \
from Messages group by SenderID, ReceiverID) as t1  \
left JOIN  \
(select SenderID as bSenderID, ReceiverID as bReceiverID, min(ID) as contactbackID, min(DateCreated) as contactback, Datediff(day, ?, min(DateCreated) ) as cdate from Messages group by SenderID, ReceiverID) as t2  \
on (t1.SenderID = t2.bReceiverID and t1.ReceiverID = t2.bSenderID)  \
where ( (firstcontact > ?) and (firstcontact < ?) and (contactback is null OR firstcontact < contactback)) \
group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},

		"Number of thanks" : function(cb) {
			cb(null,null);
			/*
			models.sequelize.query("",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
			*/
		}
	},  function(err, data) {
		paramtodate = function(s) {
			var k = s.split("-");
			return new Date(k[0],k[1]-1,k[2]);
		};
		// total number of days between start & end date
		var numdays = Math.floor((new Date(paramtodate(cparams[2])) - new Date(paramtodate(cparams[1]))) / (1000*60*60*24));
		var resbuckets = {};
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
		var rkpis = [];
		for (var k in resbuckets)
			rkpis.push({"description" : k, "series" : resbuckets[k]});
		console.log(rkpis);
		// console.log(data);
		var output = Mustache.render(fs.readFileSync("./routes/admin_stats.html", "utf8"), {"kpis" : rkpis});
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
/*
	var profileApproved = "";
	var recommendation = "";
	var reachresponse = "";
 	var thanksgiven = "";
 	*/
});



module.exports = router;
