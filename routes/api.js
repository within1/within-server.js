// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');

router.use(bodyParser.json({type : "*/*"}));
router.use(compression({ threshold: 512}));

router.get('/api', function(req, res) {
	res.json({"description" : "within server API"});
});


// helper functions for user info

// copyies specific values from source array; returns array containing those values only
function copyValues(source, vals) {
	var res = {};
	for (var i in vals) {
		res[vals[i]] = source[vals[i]];
	}
	return res;
}

// formats API call results per specification:
// Null parameters are interpreted as “there is no update for the parameter”; empty parameters (e.g. an empty array or an empty string) are interpreted as “the parameter should be updated to an empty value”
// Date response parameters are in “MM/DD/YYYY HH:MM:SS” format
function formatAPICall(data, datecols) {
	for (var k in data) {
		if (data[k] === true)
			data[k] = "True";
		else if (data[k] === false)
			data[k] = "False";
		else if (datecols.indexOf(k) != -1)
			data[k] = dateFormat(data[k], "mm/dd/yyyy HH:MM:ss");
		else if (data[k] == null)
			data[k] = "";
		else
			data[k] = data[k].toString();
	}
	return data;
}

function getPrivateUserInfo(userdata) {
	var vals = copyValues(userdata, ["AppStatus",  "DateAppStatusModified",  "DateLastActivity",  "DeviceToken",  "EmailAddress",  "FacebookID",  "IsAdmin",  "LinkedInID",  "ShouldSendEmailNotifications",  "ShouldSendPushNotifications",  "Token"] );
	return formatAPICall(vals, ["DateAppStatusModified", "DateLastActivity"]);
}

function getPublicUserInfo(userdata) {
	var vals = copyValues(userdata, ["AboutUser", "Birthday", "DateCreated", "DateModified", "FirstName", "Gender", "ID", "ImageURL", "IsTeamWithin", "LastName", "Locale", "Timezone", "Title" ] );
	return formatAPICall(vals, ["Birthday", "DateCreated", "DateModified"]);
}

function getUserTags(userdata, tagtype) {
	var cue = [];
	for (var k in userdata["Entity"]["TagInstances"]) {
		if (userdata["Entity"]["TagInstances"][k]["Type"] == tagtype)
			cue.push(userdata["Entity"]["TagInstances"][k]);
	}
	var res = [];
	for (var i in cue) {
		res.push(formatAPICall({"DateCreated" : cue[i]["DateCreated"], "DateModified" : cue[i]["DateModified"], "ID" : cue[i]["ID"],
			"TagName" : cue[i]["Tag"]["Name"], "TagType" : cue[i]["Type"], "UserID" : userdata["ID"]  },
			["DateCreated", "DateModified"] ));
	}
	return res;
}


router.post('/api/GetUserInformation', function(req, res) {
	var resdata = {};
	// validate token
	models.sequelize.query("SELECT * FROM users u where ID = ? and Token = ?",
			{ replacements: [req.body["UserID"], req.body["UserToken"] ] , type: models.sequelize.QueryTypes.SELECT})
	.then(function(authdata) {
		if (authdata.length == 0) {
			throw "Unauthorized";
		}

		return models.Users.findById(req.body["UserID"], {include: [
			{ model : models.UserEducations, separate: true, include: [models.Schools]},
			{ model : models.UserEmployments, separate: true, include: [models.Employers]},
			{ model : models.UserLocations, separate: true, include: [models.Locations] },
			{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
		]});
	})
	.then(function(userdata) {
		console.log(JSON.stringify(userdata,0,4));
		resdata["PrivateUserInformation"] = getPrivateUserInfo(userdata);
		resdata["PublicUserInformation"] = getPublicUserInfo(userdata);
		resdata["PublicUserInformation"]["GetUserSkill"] = getUserTags(userdata, 1);
		resdata["PublicUserInformation"]["GetUserBreakTheIce"] = getUserTags(userdata, 2);
		resdata["PublicUserInformation"]["GetuserWant"] = getUserTags(userdata, 3);
		resdata["PublicUserInformation"]["GetUserWhyHere"] = getUserTags(userdata, 4);
		resdata["PublicUserInformation"]["NumberOfThankYous"] = 1;
		resdata["PublicUserInformation"]["UserReferralCode"] = "qwd";

		/*
		resdata["PrivateUserInformation"]
		console.log(authdata);
		*/
		resdata["Status"] = { "Status": "1", "StatusMessage": "" };
		res.json({"GetUserInformationResult" : resdata } );
	}).catch(function(e) {
		console.log(e);
		res.json({"GetUserInformationResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
	// get public information

	// get private information

	// res.jsonp({"GetUserInformationResult" : res, "Status" : {"Status" : 1, "StatusMessage" : ""} });
});



router.post('/api/GetContactCardDetails', function(req, res) {
	var resdata = {};
	// validate token
	models.sequelize.query("SELECT * FROM users u where ID = ? and Token = ?",
			{ replacements: [req.body["UserID"], req.body["UserToken"] ] , type: models.sequelize.QueryTypes.SELECT})
	.then(function(authdata) {
		if (authdata.length == 0) {
			throw "Unauthorized";
		}
		return models.Users.findById(req.body["OtherUserID"], {include: [
			{ model : models.UserContactCards, separate: true },
		]});
	})
	.then(function(data) {
		var carddata = data.get({plain: true});
		if (carddata["UserContactCards"].length == 0)
			throw "No records found!";
		var c = carddata["UserContactCards"][0];
		var apires = formatAPICall(c, ["DateCreated", "DateModified"]);
		res.json({"GetContactCardDetailsResult" : {"GetContactCardDetail" : apires, "Status" : { "Status": "1", "StatusMessage": "" }}});
		// UpdateUserActivityAndNotifications
	})
	.catch(function(e) {
		console.log(e);
		res.json({"GetContactCardDetailsResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});
module.exports = router;
