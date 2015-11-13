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
	return res.redirect(301, "/admin/user/");
});

router.get('/admin/user/*', function(req, res) {
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
	console.log(cfilters);

	async.parallel({
		"users" : function(cb) {
			// query for all users
			models.sequelize.query("SELECT *, FORMAT(DateCreated, 's') as crdate FROM users u order by u.DateCreated desc", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"tags" : function(cb) {
			// query for all tags
			models.sequelize.query("select * from ( select ti.TagID, COUNT(u.ID) as usercount from TagInstances ti join Users u on ti.OwnerID = u.EntityID group by ti.TagID ) as tci left join Tags t on tci.TagID = t.ID order by usercount desc", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"employers" : function(cb) {
			cb(null, [] );
		}
		} , function(err, data) {
			console.log("hello");
			var output = Mustache.render(fs.readFileSync("./routes/admin_userlist.html", "utf8"), data);
			var framed = Mustache.render(fs.readFileSync("./routes/admin_frame.html", "utf8"), {"child" : output});
			res.send(framed);
		});
});

router.get("/admin/users/:userid", function(req, res) {
	if (req.params.userid === undefined)
		return res.send("no userid defined");
	res.send("hello world! 123 "+req.params.userid);
	console.log(req.params);

});

module.exports = router;
