// message sending & receiving API

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
var match = require("../lib/match.js");
var copytext = require("../lib/copytext.js");
var msglib =  require("../lib/messages.js");

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));


// get message thread with a single other user
router.post("/api/GetMessageThread", function(req, res) {
	var msgres = {};
	var resmsgs = [];
	var allmsgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "SenderID", "MessageCount"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		// get other users' data
		return models.Users.findOne({where: {ID : req.body["SenderID"] }});
	})
	.then(function(otheruserdata) {
		if (otheruserdata == null)
			throw "User "+req.body["SenderID"]+" not found";
		msgres["OtherUserFirstName"] = otheruserdata["FirstName"];
		msgres["OtherUserLastName"] = otheruserdata["LastName"];
		msgres["OtherUserImageURL"] = otheruserdata["ImageURL"];
		return models.Messages.findAll({where: {$or : [
				{ SenderID : req.body["SenderID"], ReceiverID : req.body["UserID"]},
				{ SenderID : req.body["UserID"], ReceiverID : req.body["SenderID"]}
			] },
			order : [ ["ID" , "DESC"] ]
		});
	})
	.then(function(msglist) {
		// cut topmost N messages & format them according to API
		allmsgs = msglist;
		for (var i = 0; ((i < req.body["MessageCount"]) && (i<msglist.length)); i++ ) {
			var newmsg = userlib.copyValues(msglist[i], ["ID", "DateCreated", "SenderID", "ReceiverID", "Type", "HasRead"]);
			newmsg["Message"] = msglist[i]["Message1"];
			newmsg = apilib.formatAPICall(newmsg);
			resmsgs.push(newmsg);
		}
		//Has a "Thank You" been given by the User referenced by SenderID?

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
		msgres["MesssageList"] = resmsgs;
	})
	.then(function() {
		msgres["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"GetMessageThreadResult" : msgres });
	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"GetMessageThreadResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});

// -----------------------------------------------------
// Send message to another user
router.post("/api/SendMessage", function(req, res) {
	var msgres = {};
	var allmsgs = null;
	var matchid = null;
	var cuser = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "ReceiverID", "Message", "Type"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		cuser = userdata;
		// create new message
		return msglib.AddMessage(req.body["UserID"], req.body["ReceiverID"], req.body["Message"], req.body["Type"])
	})
	.then(function(msgarr) {
		matchid = msgarr[1];
		msgres["MessageID"] = msgarr[0];
		return models.Users.findOne({where : {ID : req.body["ReceiverID"]}})
	})
	.then(function(ruser) {
		if (ruser == null)
			throw "Receiving user can't be found for message";
		// send message to receiver
		if (ruser["IsTeamWithin"])
			// user PMd the within team
			return notif.SendAdminMail("TeamWithinMessageEmail", cuser["FirstName"]+" "+cuser["LastName"]+" messaged the WITHIN Team",
				"This is what " +cuser["FirstName"]+" has to say: \n"+req.body["Message"]+"\nSent: "+(new Date()),
				{"headers" : {"Reply-To" : cuser["EmailAddress"] }, "from_email" : cuser["EmailAddress"], "from_name" : cuser["FirstName"]+" "+cuser["LastName"] });
		// send a notification for all except thanx messages
		if ((cuser["DeviceToken"] != null) && ((req.body["Message"].length > 0) && (req.body["Type"] != 4)) || (req.body["Type"] == 2)) {
			msg = req.body["Message"];
			if (req.body["Type"] == 2)
				msg = cuser["FirstName"]+" sent you contact details";
			//immediate email notification
			return notif.SendEmailNotification(ruser, new Date(), 0, notif.emailTypes["TypeEmailMessageReceived"], cuser["FirstName"], cuser["ImageURL"], msg, cuser["ID"] )
			.then(function() { return copytext("./copytext.csv"); } )
			.then(function(textvalues) {
				//immediate push notification
				return notif.SendPushNotification(ruser, new Date(),0,
					textvalues.get("PushMessageReceivedCopy1")+" "+cuser["FirstName"]+" "+textvalues.get("PushMessageReceivedCopy2"),
					msgres["MessageID"], notif.pushTypes["MessageReceived"]  );
			})
			.then(function() {
				// cancel reminder notification
				notif.UpdateExpiringMatchNotification(matchid, cuser["ID"], 0);
			})
		}
	})
	.then(function() {
		msgres["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"SendMessageResult" : msgres });
	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"SendMessageResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

// Returns the details of the Message that the MessageID references
// Used as a Push Notification callback
router.post("/api/GetMessageDetails", function(req, res) {
	var cmsg = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "MessageID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		return models.Messages.findOne({where : {ID : req.body["MessageID"]}})
	})
	.then(function(msgdata) {
		if (msgdata == null)
			throw "Message can not be found";
		if ((msgdata["SenderID"] != req.body["UserID"]) && (msgdata["ReceiverID"] != req.body["UserID"]))
			throw "Requested message does not belong to user";
		cmsg = userlib.copyValues(msgdata.get({plain : true}),  ["ID", "DateCreated", "SenderID", "ReceiverID", "Type", "HasRead"]);
		cmsg["Message"] = msgdata["Message1"];
		cmsg = apilib.formatAPICall(cmsg, ["DateCreated"]);
		return userlib.getPublicUserInfo(cmsg["SenderID"]);
	})
	.then(function(cu) {
		cmsg["SenderDetail"] = cu["PublicUserInformation"];
		return userlib.getPublicUserInfo(cmsg["ReceiverID"]);
	})
	.then(function(cu) {
		cmsg["ReceiverDetail"] = cu["PublicUserInformation"];
		var cres = {"MessageDetails" : cmsg};
		cres["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"GetMessageDetailsResult" : cres });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"GetMessageDetailsResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

/// Returns a count of all unread messages for the calling user
router.post("/api/GetTotalUnreadMessageCount", function(req, res) {
	var cmsg = null;
	apilib.requireParameters(req, ["UserID", "UserToken"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		return models.Messages.count({where : { ReceiverID : req.body["UserID"], HasRead : false }});
	})
	.then(function(cnt) {
		var cres = apilib.formatAPICall({"TotalUnreadMessageCount" : cnt});
		cres["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({ "GetTotalUnreadMessageCountResult" : cres });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"GetMessageDetailsResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

// Returns a list of messages older than the Message referenced by MessageID
router.post("/api/GetPastMessages", function(req, res) {
	var cmsg = null;
	apilib.requireParameters(req, ["UserID", "UserToken"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"GetMessageDetailsResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});


module.exports = router;
