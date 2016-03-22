// email optout landing page:
// app.within.guru/optout?email=me@domain.com

var fs = require("fs");
var Mustache = require("Mustache");
var express = require('express');
var router  = express.Router();
var bodyParser = require('body-parser');
var models  = require('../models');

router.use(bodyParser.urlencoded({ extended: false }));

router.use('/optout', function(req, res) {
	var data =  { };
	if (req.query["email"] === undefined)
		return res.send("Please specify email address")
	models.Users.findOne({where : {EmailAddress : req.query["email"] }})
	.then(function(cu) {
		if (cu == null)
			return res.send("User with given email address not found");
		data["email"] = req.query["email"];
		if (req.method == "POST") {
			var ci = 0;
			if (req.body["opt_msg"] !== undefined)
				ci += 1;
			if (req.body["opt_thx"] !== undefined)
				ci += 2;
			if (req.body["opt_rec"] !== undefined)
				ci += 4;
			return models.Users.update({"EmailNotificationsOpt" : ci, "ShouldSendEmailNotifications" : (ci == 0)?(0):(1) }, {where : { ID : cu["ID"]}})
			.then(function() {
				data["updated"] = "Your settings have been updated<br /><br />";
				return models.Users.findOne({where : {EmailAddress : req.query["email"] }});
			})
		}
		return cu;
	})
	.then(function(cu) {
		data["opt_msg"] = ((cu["EmailNotificationsOpt"] & 1) > 0)?("checked"):("");
		data["opt_thx"] = ((cu["EmailNotificationsOpt"] & 2) > 0)?("checked"):("");
		data["opt_rec"] = ((cu["EmailNotificationsOpt"] & 4) > 0)?("checked"):("");
		var output = Mustache.render(fs.readFileSync("./routes/web_email_optout.html", "utf8"), data );
		res.send(output);
	})
});

module.exports = router;

