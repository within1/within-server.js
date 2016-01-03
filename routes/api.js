// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var dateFormat = require('dateformat');


router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

router.get('/api', function(req, res) {
	res.json({"description" : "Within.guru server API", "version" : "1.0"});
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

function copyPrivateUserInfo(userdata) {
	var vals = copyValues(userdata, ["AppStatus",  "DateAppStatusModified",  "DateLastActivity",  "DeviceToken",  "EmailAddress",  "FacebookID",  "IsAdmin",  "LinkedInID",  "ShouldSendEmailNotifications",  "ShouldSendPushNotifications",  "Token"] );
	return apilib.formatAPICall(vals, ["DateAppStatusModified", "DateLastActivity"]);
}

function copyPublicUserInfo(userdata) {
	var vals = copyValues(userdata, ["AboutUser", "Birthday", "DateCreated", "DateModified", "FirstName", "Gender", "ID", "ImageURL", "IsTeamWithin", "LastName", "Locale", "Timezone", "Title" ] );
	return apilib.formatAPICall(vals, ["Birthday", "DateCreated", "DateModified"]);
}

function getUserTags(userdata, tagtype) {
	var cue = [];
	for (var k in userdata["Entity"]["TagInstances"]) {
		if (userdata["Entity"]["TagInstances"][k]["Type"] == tagtype)
			cue.push(userdata["Entity"]["TagInstances"][k]);
	}
	var res = [];
	for (var i in cue) {
		res.push(apilib.formatAPICall({"DateCreated" : cue[i]["DateCreated"], "DateModified" : cue[i]["DateModified"], "ID" : cue[i]["ID"],
			"TagName" : cue[i]["Tag"]["Name"], "TagType" : cue[i]["Type"], "UserID" : userdata["ID"]  },
			["DateCreated", "DateModified"] ));
	}
	return res;
}

function copyUserLocations(userdata) {
	var cul = [];
	for (var i in userdata["UserLocations"]) {
		var k = copyValues(userdata["UserLocations"][i], ["DateCreated", "DateModified", "Description", "ID", "JourneyIndex", "LocationType", "UserID"]);
		k["Name"] = userdata["UserLocations"][i]["Location"]["Name"];
		cul.push(apilib.formatAPICall(k, ["DateCreated", "DateModified"]));
	}
	return cul;
}

function copyUserEducation(userdata) {
	var cul = [];
	for (var i in userdata["UserEducations"]) {
		var k = copyValues(userdata["UserEducations"][i], ["DateCreated", "DateModified", "Degree", "Description", "EndMonth", "EndYear", "ID", "JourneyIndex", "Major", "StartMonth", "StartYear", "UserID", "Name"]);
		cul.push(apilib.formatAPICall(k, ["DateCreated", "DateModified"]));
	}
	return cul;
}


function copyUserEmployment(userdata) {
	var cul = [];
	for (var i in userdata["UserEmployments"]) {
		var k = copyValues(userdata["UserEmployments"][i], ["DateCreated", "DateModified", "Summary", "Title", "EndMonth", "EndYear", "ID", "JourneyIndex", "StartMonth", "StartYear", "UserID" ]);
		k["EmployerName"] = userdata["UserEmployments"][i]["Name"];
		k["Location"] = userdata["UserEmployments"][i]["Location"]["Name"];
		cul.push(apilib.formatAPICall(k, ["DateCreated", "DateModified"]));
	}
	return cul;
}

// returns the number of thankyous for a user
function getNumberOfThankYous(userid) {
	return models.sequelize.query('SELECT count(distinct RaterID) as cnt FROM UserRatings where RatedID = ? and isDeletedByRatedUser = 0',{ replacements: [ userid ] , type: models.sequelize.QueryTypes.SELECT})
	.then(function(cntdata) {
		console.log(cntdata);
		return cntdata[0]["cnt"];
	});
}

// returns the last thankyous for the user
function getLatestUserThankYous(userid) {
	return models.UserRatings.findAll({where : {"RatedID" : userid, isDeletedByRatedUser : 0, Comments : {ne : ""} }, order : [ ["DateCreated" , "DESC"] ], limit : 1, include : [
		{ model : models.Users, as : "UserRatingsRater" }
	] })
	.then(function(ratinglist) {
		if (ratinglist.length == 0)
			return [];
		console.log("qwe", ratinglist[0]);
		var res = copyValues(ratinglist[0], ["ID", "Comments", "DateCreated"]);
		res["NumbersOfStars"] = ratinglist[0]["Rating"];
		res["RatingUserID"] = ratinglist[0]["RaterID"];
		res["UserID"] = ratinglist[0]["RatedID"];
		res = apilib.formatAPICall(res, ["DateCreated"] );
		res["UserDetail"] = copyValues(ratinglist[0]["UserRatingsRater"], ["FirstName", "ImageURL", "LastName"]);
		res["UserDetail"]["ID"] = ratinglist[0]["UserRatingsRater"]["UserID"];
		res["UserDetail"] = apilib.formatAPICall(res["UserDetail"], []);
		return [res];
	})
}

// returns with the public information of the user
function getPublicUserInfo(userid, includePrivate) {
	var resdata = {};
	console.log(userid, includePrivate);
	return models.Users.findById(userid, {include: [
			{ model : models.UserEducations, separate: true, include: [models.Schools]},
			{ model : models.UserEmployments, separate: true, include: [models.Employers, models.Locations]},
			{ model : models.UserLocations, separate: true, include: [models.Locations] },
			{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
	]})
	.then(function(userdata) {
		console.log(JSON.stringify(userdata,0,4));
		if (includePrivate)
			resdata["PrivateUserInformation"] = copyPrivateUserInfo(userdata);
		resdata["PublicUserInformation"] = copyPublicUserInfo(userdata);
		resdata["PublicUserInformation"]["GetUserSkill"] = getUserTags(userdata, 1);
		resdata["PublicUserInformation"]["GetUserBreakTheIce"] = getUserTags(userdata, 2);
		resdata["PublicUserInformation"]["GetUserWant"] = getUserTags(userdata, 3);
		resdata["PublicUserInformation"]["GetUserWhyHere"] = getUserTags(userdata, 4);
		resdata["PublicUserInformation"]["GetUserLocation"] = copyUserLocations(userdata);

		resdata["PublicUserInformation"]["GetUserEducation"] = copyUserEducation(userdata);
		resdata["PublicUserInformation"]["GetUserEmployment"] = copyUserEmployment(userdata);
		resdata["PublicUserInformation"]["UserReferralCode"] = "dummy code";
		return true;
	})
	.then(function() { return getNumberOfThankYous(userid); })
	.then(function(cnt) {
		resdata["PublicUserInformation"]["NumberOfThankYous"] = cnt.toString();
	})
	.then(function() { return getLatestUserThankYous(userid); })
	.then(function(latest) {
		resdata["PublicUserInformation"]["GetLatestUserThankYous"] = latest;
		return resdata;
	});
}

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
	.then(function() { return getPublicUserInfo(usermodel["ID"], true); })
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
	throw "Unknown ID";
};

router.post('/api/AddEditFacebookUser', function(req, res) {
	var resdata = {};
	// authenticate user
	findUserFromRequestBody(req)
	// check for new user creation
	.then(function(userlist) {
		if (userlist.length > 1)
			throw "Multiple registered users for same Facebook ID";
		else if (userlist.length == 1)
			return userlist[0];
		throw "New user registration";
		// generate new user
	})
	// Authenticate user
	.then(function(usermodel) {
		console.log("asd", usermodel["ID"]);
		// if ((usermodel.Token != "") && ((req.body[""]))
		return usermodel;
	})
	.then(function(usermodel) { return getPublicUserInfo(usermodel["ID"], true); })
	.then(function(userinfo) {
		userinfo["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"AddEditFacebookUserResult" : userinfo });
	})
	.catch(function(e) {
		console.error(e.toString() );
		res.json({"AddEditFacebookUserResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});


router.post('/api/GetUserInformation', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return apilib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() { return getPublicUserInfo(req.body["UserID"], true); })
	.then(function(userinfo) {
		console.log("post getPublicUserInfo",userinfo);
		userinfo["Status"] = { "Status": "1", "StatusMessage": "" };
		res.json({"GetUserInformationResult" : userinfo } );
	}).catch(function(e) {
		console.error(e);
		res.json({"GetUserInformationResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

router.post('/api/GetContactCardDetails', function(req, res) {
	var resdata = {};
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return apilib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.Users.findById(req.body["OtherUserID"], {include: [
			{ model : models.UserContactCards, separate: true },
		]});
	})
	.then(function(data) {
		var carddata = data.get({plain: true});
		console.log("cdd",carddata);
		if (carddata["UserContactCards"].length == 0)
			throw "No records found!";
		var c = carddata["UserContactCards"][0];
		var apires = apilib.formatAPICall(c, ["DateCreated", "DateModified"]);
		res.json({"GetContactCardDetailsResult" : {"GetContactCardDetail" : apires, "Status" : { "Status": "1", "StatusMessage": "" }}});
		// UpdateUserActivityAndNotifications
	})
	.catch(function(e) {
		console.log(e);
		res.json({"GetContactCardDetailsResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});

// get message thread with a single other user
router.post("/api/GetMessageThread", function(req, res) {
	var msgres = {};
	var allmsgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "SenderID", "MessageCount"])
	.then(function() { return apilib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		return models.Messages.findAll({where: {$or : [
				{ SenderID : req.body["SenderID"], ReceiverID : req.body["UserID"]},
				{ SenderID : req.body["UserID"], ReceiverID : req.body["SenderID"]}
			] },
			order : [ ["ID" , "DESC"] ]
		});
	})
	.then(function(msglist) {
		//Has a "Thank You" been given by the User referenced by SenderID?
		allmsgs = msglist;
		return models.UserRatings.findAll({where: {RatedID : req.body["UserID"], RaterID : req.body["SenderID"]  }});
	})
	.then(function(ratelist) {
		msgres["IsAlreadyRated"] = (ratelist.length > 0)?(1):(0);
		msgres["IsUnreadMessages"] = false;
		var culist = [];
		for (var i in allmsgs) {
			if (!allmsgs[i]["HasRead"]) {
				msgres["IsUnreadMessages"] = true;
			}
			if (culist.indexOf(msgres["SenderID"]))
				culist.push(msgres["SenderID"]);
		}
		//Only valid for Thank you if back and forth messaging
		msgres["IsValidForThankYou"] = (culist.length < 2)?(0):(1);
		msgres = apilib.formatAPICall(msgres);
		msgres["MesssageList"] = allmsgs;
	})
	.then(function() {
		msgres["Status"] = {"Status" : 1, "StatusMessage" : "" };
		res.json({"GetMessageThreadResult" : msgres });
	})
	.catch(function(e) {
		console.error(e);
		res.json({"GetMessageThreadResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});



// add user to waitlist & send email notification for within team
router.post("/api/AddUserToWaitlist", function(req, res) {
	var cuser = null;
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return apilib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		cuser = authuser;
		authuser["AppStatus"] = 1;
		authuser["DateAppStatusModified"] = dateFormat(new Date(), "isoUtcDateTime");
		return authuser.save();
	})
	.then(function(authuser) {
		// update Incomplete Onboarding Notifications
		return models.Notifications.findOne({where : {ID : cuser["IncompleteOnboardingEmailNotificationID"] }});
	})
	.then(function(notifs) {
		if (notifs != null) {
			return notifs.update({"HasSent" : true});
		}
	})
	.then(function() {
		console.log("notification to within team");
		res.json({"GetAddUserToWaitlistResult" : {"Status" : {"Status" : 1, "StatusMessage" : "" }}  });
	})
	.catch(function(e) {
		console.error(e);
		res.json({"GetMessageThreadResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
})


module.exports = router;


