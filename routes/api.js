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
var matchlib = require("../lib/matchlib.js");

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

router.get('/api', function(req, res) {
	res.json({"description" : "Within.guru server API", "version" : "1.0"});
});





// returns a single contact card's details
router.post('/api/GetContactCardDetails', function(req, res) {
	var resdata = {};
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
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
		console.error(e.stack);
		res.json({"GetContactCardDetailsResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});

// add user to waitlist & send email notification for within team
router.post("/api/AddUserToWaitlist", function(req, res) {
	var cuser = null;
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
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
		res.json({"AddUserToWaitlistResult" : {"Status" : {"Status" : "1", "StatusMessage" : "" }}  });
	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"AddUserToWaitlistResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
})

// returns matches for given user
router.post("/api/GetMatchesForUser", function(req, res) {
	var cuser = null;
	var allmatches = [];
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		cuser = authuser;
		// find previous matches:
		// Get Matches without messages where the calling user is the ReachingOutUser
		return models.Matches.findAll({where : {"IsDead" : 0, "ReachingOutUserID" : cuser["ID"], "NewestMessageID" : null, "OtherUserHasDeletedFlag" : 0, "ReachingOutUserHasDeletedFlag" : 0 } })
		.then(function(messageMatches) {
			for (var i in messageMatches)
				allmatches.push(messageMatches[i]);
			return true;
		});
	})
	// check if we need to generate new matches
	.then(function() {
		if (allmatches.length > 0)
			return true;
		return matchlib.createNewMatch(cuser["ID"])
		.then(function(newMatch) {
			allmatches.push(newMatch);
		});
	})
	// convert all matches into matchresults
	.then(function() {
		return Promise.map(allmatches, function(m) {
			// get public user information
			var cuid = (m["OtherUserID"] == cuser["ID"])?(m["ReachingOutUserID"]):(m["OtherUserID"]);
			return userlib.getPublicUserInfo(cuid, false)
			.then(function(otherUserInfo) {
				var res = userlib.copyValues(m, ["MatchDate", "MatchExpireTime", "MatchRationale"]);
				res["MatchID"] = m["ID"];
				res["UnreadMessageCount"] = 0;
				res["UserHasViewedMatch"] = m["ReachingOutUserHasViewedFlag"];
				res = apilib.formatAPICall(res);
				res["UserInformation"] = otherUserInfo["PublicUserInformation"];
				return res;
			})
		})
	})
	// send resulting array
	.then(function(matchresults) {
		var msgres = {"Matches" : matchresults, "NextMatchDate" : null, "Status" : {"Status" : "1", "StatusMessage" : "" } };
		return res.json({"GetMatchesForUserResult" : msgres });
	})
	.catch( apilib.errorhandler("GetMatchesForUserResult", req, res));
});

module.exports = router;

