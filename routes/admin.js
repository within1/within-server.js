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

// -------- main KPI dashboard --------
router.get("/admin/stats", function(req,res) {
	var data = [];
	var profileCreated = "select count(distinct ID) as cnum, cdate from (select ID, Datediff(day, DateCreated, GETDATE() ) as cdate from users) as t  group by cdate";
	var output = Mustache.render(fs.readFileSync("./routes/admin_stats.html", "utf8"), data);
	var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
	res.send(framed);
});



module.exports = router;
