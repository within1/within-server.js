// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var userlib = require("../lib/userlib.js");
var dateFormat = require('dateformat');


router.post('/api/CheckForUserFromFacebookID', function(req, res) {
	var usermodel = null;
	apilib.requireParameters(req, ["FacebookID", "DeviceToken"])
	.then(function() {
		return models.Users.findAll({where : { FacebookID : req.body["FacebookID"] }})
	})
	.then(function(userdata) {
		if (userdata.length == 0) {
			var resmsg = apilib.formatAPICall({"IsExistingUser" : false});
			resmsg["Status"] = { "Status": "1", "StatusMessage": "" };
			return res.json({"CheckForUserFromFacebookIDResult" : resmsg} );
		}
		usermodel = userdata[0];
		console.log("Userinfo: ",usermodel);

		// user exists, reset devicetoken, and set DateLastActivity
		usermodel["DeviceToken"] = req.body["DeviceToken"];
		usermodel["DateLastActivity"] = new Date().toISOString();
		return;
	})
	.then(function() { return userlib.getPublicUserInfo(usermodel["ID"], true); })
	.then(function(userinfo) {
		userinfo["IsExistingUser"] = "true";
		userinfo["ResultStatus"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"CheckForUserFromFacebookIDResult" : userinfo });
	}).catch(function(e) {
		console.error(e.toString() );
		res.json({"CheckForUserFromFacebookIDResult" : {"ResultStatus" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});

var findUserFromRequestBody = function(req) {
	if (( (req.body["FacebookID"] === undefined) || (req.body["FacebookID"] == "")) &&
		( (req.body["UserID"] === undefined) || (req.body["UserID"] == "")) )
		throw "Both FacebookID and UserID input to AddEditFacebookUser method is blank";
	if ( (req.body["FacebookID"] !== undefined ) && (req.body["FacebookID"] != "")) {
		// find by Facebook ID
		return models.Users.findAll({where : { FacebookID : req.body["FacebookID"] }});
	}
	if ( (req.body["UserID"] !== undefined) && (req.body["UserToken"] !== undefined))
		return models.Users.findAll({where : { ID : req.body["UserID"], Token : req.body["UserToken"]  }});
	throw "Unknown ID";
};



router.post('/api/AddEditFacebookUser', function(req, res) {
	var resdata = {};
	var userid = -1;
	// authenticate user
	findUserFromRequestBody(req)
	// check for new user creation
	.then(function(userlist) {
		if (userlist.length > 1)
			throw "Multiple registered users for same Facebook ID";
		else if (userlist.length == 1)
			// Authenticate user
			return userlist[0];
		// add new user
		return userlib.createNewUser(req);
	})
	// update user information
	.then(function(usermodel) {
		userid = usermodel["ID"];
		return userlib.updateUser(usermodel, req);
	})
	.then(function() { return userlib.getPublicUserInfo(userid, true); })
	.then(function(userinfo) {
		userinfo["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"AddEditFacebookUserResult" : userinfo });
	})
	.catch(function(e) {
		console.error(e.toString() );
		console.error(e.stack);
		res.json({"AddEditFacebookUserResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});


router.post('/api/GetUserInformation', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() { return userlib.getPublicUserInfo(req.body["UserID"], true); })
	.then(function(userinfo) {
		console.log("post getPublicUserInfo",userinfo);
		userinfo["Status"] = { "Status": "1", "StatusMessage": "" };
		res.json({"GetUserInformationResult" : userinfo } );
	}).catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"GetUserInformationResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

module.exports = router;


