// Admin API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var userlib = require("../lib/userlib.js");
var notif = require("../lib/notifications.js");
var dateFormat = require('dateformat');
var copytext = require("../lib/copytext.js");
var adminlib = require("../lib/adminlib.js");

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

// returns a list of waitlisted users
router.post('/api/GetAllUsers', function(req, res) {
	apilib.requireParameters(req, ["AdminToken", "AdminID"])
	.then(function() { return userlib.validateAdminToken(req.body["AdminID"], req.body["AdminToken"]); })
	.then(function() {
		return models.Users.findAll({where : { AppStatus : 1}, orderby : {asc : "ID"}})
	})
	.then(function(cres) {
		console.log(cres);
		return Promise.map(cres, function(cid) {
			return userlib.getPublicUserInfo(cid["ID"], true);
		})
	})
	.then(function(allres) {
		res.json({"GetAllUsersResult" : {"Users" : allres, "Status" : { "Status": "1", "StatusMessage": "" }}});
	})
	.catch( apilib.errorhandler("GetAllUsersResult", req, res));
});


// Changes the application status of a given user. Must have Admin authorization to call
router.post('/api/ProcessApplication', function(req, res) {
	apilib.requireParameters(req, ["AdminToken", "AdminID", "ApplicationUserID", "NewAppStatus"])
	.then(function() { return userlib.validateAdminToken(req.body["AdminID"], req.body["AdminToken"]); })
	.then(function() {
		return adminlib.ProcessUserApplication(req.body["ApplicationUserID"], req.body["NewAppStatus"])
	})
	.then(function() {
		var wres = apilib.formatAPICall( {"AppStatus" : req.body["NewAppStatus"], "DateAppStatusModified" : new Date(),
					 "UserID" : req.body["ApplicationUserID"], "Status" : {"Status" : "1", "StatusMessage" : "Application successfully processed" } } ,["DateAppStatusModified"]);
		res.json({"ProcessApplicationResult" : wres } );
	})
	.catch( apilib.errorhandler("ProcessApplicationResult", req, res));
});

module.exports = router;

