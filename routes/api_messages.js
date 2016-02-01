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


// Send message to another user
router.post("/api/SendMessage", function(req, res) {
	var msgres = {};
	var allmsgs = null;
	apilib.requireParameters(req, ["UserID", "UserToken", "ReceiverID", "Message", "Type"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		// create new message
		return models.Messages.create({
			DateCreated : dateFormat(new Date(), "isoUtcDateTime"),
			SenderID : req.body["UserID"],
			ReceiverID : req.body["ReceiverID"],
			Message1 : req.body["Message"],
			Type : req.body["Type"],
			HasRead : false
		});
	})
	.then(function(newmsg) {
		msgres["MessageID"] = newmsg["ID"];
	})
	.then(function() {
		msgres["Status"] = {"Status" : 1, "StatusMessage" : "" };
		res.json({"SendMessageResult" : msgres });
	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"SendMessageResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});

module.exports = router;
