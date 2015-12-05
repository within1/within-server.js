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

router.get('/admin/users/*', function(req, res) {
	console.log(req.params);
	console.log("/admin route");
	// process query filter
	var cfilters = [];
	var cparams = [];
	if (req.params[0] !== undefined) {
		var cps = req.params[0].split("/");
		console.log(cps);
		for (var i = 0; i < cps.length; i +=2 ) {
			console.log(cps[i]);
			if (cps[i] == "")
				continue;
			else if (cps[i] == "tags") {
				cfilters.push(" INTERSECT select cu.ID from TagInstances ti join Users cu on ti.OwnerID = cu.EntityID where ti.TagID = ? ");
				cparams.push(cps[i+1]);
			} else if (cps[i] == "schools") {
				cfilters.push("  INTERSECT select UserID from UserEducations ue where ue.SchoolID = ?");
				cparams.push(cps[i+1]);
			} else if (cps[i] == "employers") {
				cfilters.push("  INTERSECT select UserID from UserEmployments cue where cue.EmployerID = ?");
				cparams.push(cps[i+1]);
			}
		}
	}
	var allfilters = "";
	if (cfilters.length > 0)
		allfilters = " where ID in (select ID from Users "+cfilters.join(" ")+" ) ";
	console.log()
	async.parallel({
		"users" : function(cb) {
			// query for all users
			models.sequelize.query("SELECT *, FORMAT(DateCreated, 's') as crdate FROM users u "+allfilters+" order by u.DateCreated desc", { replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"tags" : function(cb) {
			// query for all tags
			models.sequelize.query("select * from ( select ti.TagID, COUNT(u.ID) as usercount from TagInstances ti join Users u on ti.OwnerID = u.EntityID group by ti.TagID ) as tci left join Tags t on tci.TagID = t.ID order by usercount desc", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"employers" : function(cb) {
			cb(null, [] );
		}
		} , function(err, data) {
			var output = Mustache.render(fs.readFileSync("./routes/admin_userlist.html", "utf8"), data);
			var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
			res.send(framed);
		});
});

router.get("/admin/user/:userid", function(req, res) {
	if (req.params.userid === undefined)
		return res.send("no userid defined");
	// get single user model
	models.Users.findById(req.params.userid, {include: [
		{ model : models.UserEducations, separate: true, include: [models.Schools]},
		{ model : models.UserEmployments, separate: true, include: [models.Employers]},
		{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }]  },
		{ model : models.Matches, separate: true, through : "OtherUserID", as : "MatchesOtherUser"  },
		{ model : models.Matches, separate: true, through : "ReachingOutUserID", as : "MatchesReachingOutUser" }
	] }).then(function(data) {
		console.log(data);
		var resdata = {"user" : data};
		var rl = [];
		for (var i in data.dataValues) {
			if ((data.dataValues[i] instanceof Array) || (data.dataValues[i] instanceof Object)) {
				continue;
			} else {
				rl.push({"name" : i, "value" : data.dataValues[i]});
			}
		}
		resdata["basicinfo"] = rl;
		var output = Mustache.render(fs.readFileSync("./routes/admin_usersingle.html", "utf8"), resdata);
		var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
		res.send(framed);
	});
});

// -------- main KPI dashboard --------
router.get("/admin/stats", function(req,res) {
	var data = [];
	var output = Mustache.render(fs.readFileSync("./routes/admin_stats.html", "utf8"), data);
	var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
	res.send(framed);
});



module.exports = router;
