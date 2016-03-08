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
	var trgUser = null;
	var allmsgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "SenderID", "MessageCount"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		// get other users' data
		return models.Users.findOne({where: {ID : req.body["SenderID"] }});
	})
	.then(function(otheruserdata) {
		trgUser = otheruserdata;
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
		// cut topmost N messages & format them according to API & mark them as read
		var flagMessageRead = function(cid) {
			return models.Messages.update({"HasRead" : true}, {where : {ID : cid}});
		};
		var allops = [];
		allmsgs = msglist;
		for (var i = 0; ((i < req.body["MessageCount"]) && (i<msglist.length)); i++ ) {
			var newmsg = userlib.copyValues(msglist[i], ["ID", "DateCreated", "SenderID", "ReceiverID", "Type", "HasRead"]);
			newmsg["Message"] = msglist[i]["Message1"];
			newmsg = apilib.formatAPICall(newmsg, ["DateCreated"]);
			resmsgs.push(newmsg);
			if (msglist[i]["HasRead"] == false)
				allops.push(flagMessageRead(msglist[i]["ID"]));
		}
		// set all unread result messages as having been read
		return Promise.all(allops);
	})
	.then(function() {
		//Has a "Thank You" been given by the User referenced by SenderID?
		return models.UserRatings.findAll({where: {RatedID : req.body["UserID"], RaterID : req.body["SenderID"]  }})
		.then(function(ratelist) {
			msgres["IsAlreadyRated"] = (ratelist.length > 0)?(1):(0);
			msgres["IsUnreadMessages"] = false;
			var culist = [];
			for (var i in allmsgs) {
				if (!allmsgs[i]["HasRead"]) {
					msgres["IsUnreadMessages"] = true;
				}
				if (culist.indexOf(allmsgs[i]["SenderID"]) == -1)
					culist.push(allmsgs[i]["SenderID"]);
			}
			//Only valid for Thank you if back and forth messaging
			msgres["IsValidForThankYou"] = (culist.length < 2)?(0):(1);
			if (trgUser["IsTeamWithin"] == 1)
				msgres["IsValidForThankYou"] = 0;
			msgres = apilib.formatAPICall(msgres);
			msgres["MesssageList"] = resmsgs;
		})
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
// Send message to another user; one at a time using queues
router.post("/api/SendMessage", apilib.queue("SendMessage", function(req, res) {
	return apilib.requireParameters(req, ["UserID", "UserToken", "ReceiverID", "Message", "Type"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() {

		// check if previous message matches with this one, and silently swallow it if it does
		// this is to work around iOS client double-sending messages on first window
		return models.Messages.findOne( { where : { $or :
			 [ { SenderID : req.body["UserID"], ReceiverID :  req.body["ReceiverID"] },
			   { ReceiverID : req.body["UserID"], SenderID :  req.body["ReceiverID"] } ]
			 , Type : 1 }, order : "id desc" })
		.then(function(msg) {
			if  ( (msg["SenderID"] == req.body["UserID"] ) && (msg["Message1"] == req.body["Message"]) ) {
				return {"MessageID" : msg["ID"]};
			} else {
				return msglib.SendMessage(req.body["UserID"], req.body["ReceiverID"], req.body["Message"], req.body["Type"]);
			}
		})
	})
	.then(function(msgres) {
		msgres["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"SendMessageResult" : msgres });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"SendMessageResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
}));

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
	var msgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "SenderID", "MessageID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		return models.Messages.findAll({where : {
			  $or : [
			  	{ SenderID : req.body["SenderID"], ReceiverID : req.body["UserID"] },
			  	{ ReceiverID : req.body["SenderID"], SenderID : req.body["UserID"] }
			  ],
			  ID : { lt : req.body["MessageID"]  }
		}, order : "ID desc" , raw : true })
	})
	.then(function(msglist) {
		msgs = msglist;
		// Mark all messages as read
		var markallread = [];
		var markAsRead = function(cid) {
			return function() {
				return models.Messages.update({HasRead : true}, {where : {ID : cid}});
			}
		};
		for (var i in msglist) {
			markallread.push(markAsRead(msglist[i]["ID"]));
		}
		return Promise.all(markallread);
	})
	.then(function() {
		// are there any unread messages left?
		return models.Messages.count({where : { SenderID : req.body["SenderID"], ReceiverID : req.body["UserID"], HasRead: false  }})
	})
	.then(function(unreadcnt) {
		// format response
		var resmsgs = [];
		for (var i in msgs) {
			var newmsg = userlib.copyValues(msgs[i], ["ID", "DateCreated", "SenderID", "ReceiverID", "Type", "HasRead"]);
			newmsg["Message"] = msgs[i]["Message1"];
			resmsgs.push(apilib.formatAPICall(newmsg, ["DateCreated"]));
		}
		var msg = (resmsgs.length == 0)?("No Records"):("");
		res.json({"GetPastMessagesResult" : {
			"IsUnreadMessages" : (unreadcnt > 0)?("True"):("False"),
			"MesssageList" : resmsgs,
			"Status" : {"Status" : "1", "StatusMessage" : msg }
		} });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"GetPastMessagesResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

// Deletes the Match and any messages between Users
router.post("/api/DeleteChatThread", function(req, res) {
	var msgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "OtherUserID" ])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		// remove all previous chat messages
		return models.Messages.destroy({where : {
			  $or : [
			  	{ SenderID : req.body["OtherUserID"], ReceiverID : req.body["UserID"] },
			  	{ ReceiverID : req.body["OtherUserID"], SenderID : req.body["UserID"] }
			  ] }
		})
	})
	// unmatch users
	.then(function() { return match.getExistingMatch(req.body["UserID"], req.body["OtherUserID"] ) })
	.then(function(cmatch) {
		if (cmatch != null)
			return models.Matches.destroy({where : {ID : cmatch["ID"]}});
	})
	.then(function() {
		res.json({"DeleteChatThreadResult" : {
			"Status" : {"Status" : "1", "StatusMessage" : "Chat thread deleted successfully." }
		} });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"DeleteChatThreadResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});



// same UI function as "DeleteChatThread" - the purpose of this one is to preserve the Matches and associated Messages in the DB
router.post("/api/RemoveMatchAndChatThread", function(req, res) {
	var msgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "OtherUserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() { return match.getExistingMatch(req.body["UserID"], req.body["OtherUserID"] ) })
	.then(function(match) {
		//get match, switch one of the "Deleted" flags on
		if (match == null)
			return;
		if (match["ReachingOutUserID"] == req.body["UserID"])
			return models.Matches.update({"ReachingOutUserHasDeletedFlag" : true, "IsDead" : true}, {where : {ID : cmatch["ID"]}} );
		else
			return models.Matches.update({"OtherUserHasDeletedFlag" : true, "IsDead" : true}, {where : {ID : cmatch["ID"]}} );
	})
	.then(function() {
		res.json({"RemoveMatchAndChatThreadResult" : {
			"Status" : {"Status" : "1", "StatusMessage" : "" }
		} });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"RemoveMatchAndChatThreadResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});


module.exports = router;

