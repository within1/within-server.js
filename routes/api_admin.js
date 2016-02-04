// Admin API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var userlib = require("../lib/userlib.js");

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
		///////////////
	})
	.catch( apilib.errorhandler("GetProcessApplicationResult", req, res));
});

module.exports = router;

