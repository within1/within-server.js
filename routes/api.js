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
var notif = require("../lib/notifications.js");
var copytext = require("../lib/copytext.js");
var msglib =  require("../lib/messages.js");
var match = require("../lib/match.js");

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

router.get('/api', function(req, res) {
	res.json({"description" : "Within.guru server API", "version" : "1.0"});
});



// ------------------------------------
// Contact card handling

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
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetContactCardDetailsResult", req, res));
});

// adds, or edits user's contact card
router.post('/api/AddEditContactCard', function(req, res) {
	var isNew = false;
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.UserContactCards.findOne( {where: {UserID : req.body["UserID"] }});
	})
	.then(function(card) {
		console.log("cdd",card);
		var upd = apilib.update(card, req.body, ["UserID", "Name", "Title", "Company", "PhoneNumber", "Email"]);
		upd["DateModified"] = dateFormat(new Date(), "isoUtcDateTime");
		if (card == null) {
			upd["DateCreated"] = dateFormat(new Date(), "isoUtcDateTime");
			return models.UserContactCards.create(upd);
		}
		return upd.save();
	})
	.then(function(c) {
		c = c.get({plain : true});
		console.log(c);
		var apires = apilib.formatAPICall(c, ["DateCreated", "DateModified"]);
		res.json({"AddEditContactCardResult" : {"GetContactCardDetail" : apires, "Status" : {"Status" : "1", "StatusMessage" : "" }}  });
	})
	.catch( apilib.errorhandler("AddEditContactCardResult", req, res));
})


// updates a coma-separated list of messageIDs' HasRead bitfield for current user
router.post('/api/UpdateMessageState', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID", "MessageID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() {
		var sids = req.body["MessageID"].split(",");
		var ids = [];
		for (var i in sids) {
			var num = parseInt(sids[i]);
			if (isNaN(num))
				throw num+" is not an integer";
			ids.push(num);
		}
		console.log("ids",ids);
		return models.Messages.update({"HasRead" : 1}, {where : { $and : [ { $or : [{SenderID : req.body["UserID"]} , {ReceiverID : req.body["UserID"]} ] }, { $or : [{ID : ids}] } ]}});
	})
	.then(function(cdata) {
		apires = {"Status" : {"Status" : "1", "StatusMessage" : "" }};
		res.json({"UpdateMessageStateResult" : apires});
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("UpdateMessageStateResult", req, res));
});


// ------------------------------------
// returns: average thankyous, number of thankyous, latest thankyou for current user
router.post('/api/GetUserAverageThankYous', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() {
		return Promise.all([
			userlib.getAverageThanks(req.body["UserID"]),
			userlib.getNumberOfThankYous(req.body["UserID"]),
			userlib.getLatestUserThankYous(req.body["UserID"])
		]);
	})
	.then(function(data) {
		var apires = apilib.formatAPICall( { AverageThankYous : data[0], NumberOfThankYous : data[1], GetLatestUserThankYous : data[2] } );
		apires["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"GetUserAverageThankYousResult" :  apires  });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetUserAverageThankYousResult", req, res));
});

// lists all thankyous for a user
router.post("/api/GetUsersAllThankYous", function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID", "OtherUserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return userlib.getUserRatings(req.body["OtherUserID"], req.body["PageNumber"]);
	})
	.then(function(cdata) {
		apires = {"GetUserAllThankYous" : cdata, "Status" : {"Status" : "1", "StatusMessage" : "" }};
		res.json({"GetUsersAllThankYousResult" : apires} );
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetUsersAllThankYousResult", req, res));
});

// Adds a Thank You from the User to the OtherUser
router.post("/api/AddUserThankYou", function(req, res) {
	var msgid = null;
	var matchid = null;
	var cuser = null;
	var comment = (req.body["Comments"] !== undefined)?(req.body["Comments"]):("");
	apilib.requireParameters(req, ["UserToken", "UserID", "OtherUserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		var numstars = ((req.body["NumberOfStars"] === undefined) || (req.body["NumberOfStars"] == null))?("5"):(req.body["NumberOfStars"]);
		cuser = authuser;
		return models.UserRatings.create({
			DateCreated : dateFormat(new Date(), "isoUtcDateTime"),
			RaterID : authuser["ID"],
			RatedID : req.body["OtherUserID"],
			Rating : numstars,
			isDeletedByRatedUser : false,
			Comments : comment,
		})
	})
	.then(function(newRating) {
		return msglib.AddMessage(req.body["UserID"], req.body["OtherUserID"], "Thank you!", "4");
	})
	.then(function(msgarr) {
		msgid = msgarr[0];
		matchid = msgarr[1];
		// get rated user for sending message
		return models.Users.findOne({where : {ID : req.body["OtherUserID"] }})
	})
	.then(function(trgUser) {
		if (trgUser == null)
			throw "Target user for message can't be found: "+req.body["OtherUserID"];
		// send notifications
		if (trgUser["DeviceToken"] != null) {
			return copytext("./copytext.csv")
			.then(function(textvalues) { return notif.SendPushNotification(trgUser, 0, cuser["FirstName"]+textvalues.get("PushThanxReceivedCopy"), "", cuser["ID"], notif.pushTypes["ThanxReceived"] );  })
			.then(function() {
				return notif.SendEmailNotification(trgUser, 0, notif.emailTypes["TypeEmailThanxReceived"], cuser["FirstName"], cuser["ImageURL"], comment, cuser["ID"] );
			})
		}
	})
	// return message's info
	.then(function() {
		return models.Messages.findOne({where : {ID : msgid}, raw : true });
	})
	.then(function(msg) {
		if (msg == null)
			throw "newly created message not found";
		var cmsg =  apilib.formatAPICall(msg, ["DateCreated"]);
		cmsg["Message"] = cmsg["Message1"];
		delete cmsg["Message1"];
		res.json({AddUserThankYouResult :
			{
				"RecentMesssageDetail" : cmsg,
				"Status" : {"Status" : "1", "StatusMessage" : "" }
			} });
 	})
 	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("AddUserThankYouResult", req, res));
});

// deletes a thankyou message / rating for a user
router.post("/api/DeleteThankYou", function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID", "RatingID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.UserRatings.update({"isDeletedByRatedUser" : 1}, {where : { $and : [ { RaterID : req.body["UserID"]} , { ID : req.body["RatingID"]} ] } } );
	})
	.then(function(d) {
		res.json({GetDeleteRatingResult : {"Status" : {"Status" : "1", "StatusMessage" : "" }} });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetDeleteRatingResult", req, res));
});

// ------------------------------------
// submits a single user rating
router.post("/api/SubmitUserRating", function(req, res) {
	var cuser = null;
	apilib.requireParameters(req, ["UserToken", "UserID", "OtherUserID", "Rating"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.Feedbacks.create({
			UserID : authuser["ID"],
			OtherUserID : req.body["OtherUserID"],
			Rating : req.body["Rating"],
			Type : 0,
			Comments : (req.body["Comments"] !== undefined)?(req.body["Comments"]):(""),
			DateCreated : dateFormat(new Date(), "isoUtcDateTime"),
		})
	})
	.then(function(newFeedback) {
		res.json({"SubmitUserRatingResult" : {"Status" : {"Status" : "1", "StatusMessage" : "" }}  });
	})
	//Set Match "ReachingOutUserHasViewedFlag" to true
	.then(function() {
		return match.getExistingMatch(req.body["UserID"], req.body["OtherUserID"])
		.then(function(cm) {
			if (cm == null)
				throw "No match exists between users while doing SubmitUserRating: "+JSON.stringify(req.body);
			return models.Matches.update({"ReachingOutUserHasViewedFlag" : true}, {where : { ID : cm["ID"]}});
		})
	})

	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("SubmitUserRatingResult", req, res));
});


// ------------------------------------
// add user to waitlist & send email notification for within team
router.post("/api/AddUserToWaitlist", function(req, res) {
	var cuser = null;
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		cuser = authuser;
		if (authuser["AppStatus"] == 2)
			throw "You are already in!";
		authuser["AppStatus"] = 1;
		authuser["DateAppStatusModified"] = dateFormat(new Date(), "isoUtcDateTime");
		return authuser.save();
	})
	.then(function(authuser) {
		// update Incomplete Onboarding Notifications
		return models.Notifications.update({"HasSent" : true}, {where : {ID : cuser["IncompleteOnboardingEmailNotificationID"] }});
	})
	.then(function() {
		// notification to within team
		var username = cuser["FirstName"]+" "+cuser["LastName"];
		return notif.SendAdminMail("WaitlistEmail", username+" is now on the Waitlist!",  username+" just finished onboarding at "+(new Date()) );
	})
	.then(function() {
		// get private user details
		return userlib.getPublicUserInfo(cuser["ID"], true);
	})
	.then(function(userinfo) {
		var wres = {"PrivateUserDetail" : userinfo["PrivateUserInformation"], "Status" : {"Status" : "1", "StatusMessage" : "" } };
		res.json({"AddUserToWaitlistResult" : wres } );
	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"AddUserToWaitlistResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
})



module.exports = router;

