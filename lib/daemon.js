// background message sending service

var async = require("async");
var Promise = require('bluebird');
var models  = require('../models');
var dateFormat = require('dateformat');
var cn = require("../lib/constants.js");
var apn = require('apn');


var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js');
var apnConnection = new apn.Connection(config["apn"][env]);
var serverImageURL = config["imageURL"][env];

apnConnection.on("error", function(e) { console.error("APN error", e); })
apnConnection.on("socketError", function(e) { console.error("APN socketError", e); })
apnConnection.on("cacheTooSmall", function(sizeDifference) { console.error("APN cacheTooSmall", sizeDifference); })
apnConnection.on("transmissionError", function(e) { console.error("APN transmissionError", e); })

var feedbackopts = { };
for (var i in config["apn"][env])
	feedbackopts[i] = config["apn"][env][i];
feedbackopts["batchFeedback"] = true;
feedbackopts["interval"] = 300;

var feedback = new apn.Feedback(feedbackopts);
feedback.on("feedback", function(devices) {
    devices.forEach(function(item) {
    	console.error("Feedback ",item);
        // Do something with item.device and item.time;
    });
});

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config["mandrill"]);

var notifqueue = null;

// -------------- email template management ---------------------
var templates = {
	1 : "1st-fb-login-welcome-1",
	2 : "incomplete-onboarding",
	3 : "message-received",
	4 : "thanx-received",
	5 : "come-back-we-miss-you",
	6 : "your-friend-referral-signed-up",
	7 : "congrats-you-re-accepted"
};

// sends one email notification
function notifEmailSend(crow) {
	// check if the user is still subscribed to email notifications
	return models.Users.findOne({where : { ID : crow["UserID"]}, raw : true})
	.then(function(cuser) {
		if (cuser == null)
			throw "User "+crow["UserID"]+" not found for notification "+crow["ID"];
		if (cuser["ShouldSendEmailNotifications"] == false)
			return null;
		if ((crow["RecipientEmail"] == null) || (crow["RecipientEmail"] == ""))
			throw "No RecipientEmail for notification "+crow["ID"];
		// console.log(crow);
		var ctemplate = templates[crow["Type"]];
		var tcontent = [];
		var msg = {};
		msg["to"] = [{"name" : crow["RecipientName"], "email" : crow["RecipientEmail"], "type" : "to"}];
		msg["subject"] = crow["EmailSubject"];
		tcontent.push({"name" : "UserName", "content" : crow["RecipientName"] });
		if ((crow["Type"] == cn.emailTypes["TypeEmailMessageReceived"] )) {
			tcontent.push({"name" : "MsgSenderName", "content" : crow["OtherUserName"] })
			tcontent.push({"name" : "MsgSenderImg", "content" : serverImageURL+crow["ImageURL"] })
			tcontent.push({"name" : "MsgContent", "content" : crow["PushMessage"] })

			msg["headers"] = {"Reply-To" : crow["ReplyCode"]+config["emails"][env]["Inbound"]};
			msg["from_email"] = crow["ReplyCode"]+config["emails"][env]["Inbound"];
			msg["from_name"] = crow["OtherUserName"];
		} else if ((crow["Type"] == cn.emailTypes["TypeEmailThanxReceived"] )) {
			tcontent.push({"name" : "ThankerName", "content" : crow["OtherUserName"] })
			tcontent.push({"name" : "ThankerImg", "content" :  serverImageURL+crow["ImageURL"]})
			tcontent.push({"name" : "ThanxContent", "content" :  crow["PushMessage"] })
		} else if ((crow["Type"] == cn.emailTypes["TypeEmailSomeoneReferred"] )) {
			tcontent.push({"name" : "ReferredName", "content" : crow["OtherUserName"] })
		}

		msg["global_merge_vars"] = tcontent;
		msg["merge"] = true;
		msg["merge_language"] = "handlebars";
		return new Promise(function (resolve, reject) {
			var allparams = {"template_name" : ctemplate, "template_content" : "", "message" : msg, "async" : false};
			// console.log(JSON.stringify(allparams,0,4));
			mandrill_client.messages.sendTemplate(allparams, resolve, reject);
		});
	})
}




// -------------- push notification management ---------------------

// sends one push notification
function notifPushSend(crow) {
	// check if the user is still subscribed to email notifications
	return models.Users.findOne({where : { ID : crow["UserID"]}, raw : true})
	.then(function(cuser) {
		console.log("notifPushSend ", cuser)
		if (cuser == null)
			throw "User "+crow["UserID"]+" not found for notification "+crow["ID"];
		if (cuser["ShouldSendPushNotifications"] == false)
			return null;
		if ((crow["DeviceToken"] == null) || (crow["DeviceToken"] == ""))
			throw "No DeviceToken for notification "+crow["ID"];
		var myDevice = new apn.Device(crow["DeviceToken"]);
		var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = 1;
		note.sound = "notification.wav";
		note.alert = crow["PushMessage"];
		var nargs = [crow["SourceTable"]];
		if (crow["UserID"] != null)
			nargs.push(crow["UserID"]);
		if (crow["MessageID"] != null)
			nargs.push(crow["MessageID"]);
		note.setLocArgs(nargs);
		apnConnection.pushNotification(note, myDevice);
		return true;
	});
}


// -------------- notification queue management ---------------------

// checks if the notification have been added to the queue; adds it if it haven't been processed yet
var notifAdd = function(rowid) {
	for (var i in notifqueue.tasks) {
		if (notifqueue.tasks[i]["data"] == rowid) {
			return false;
		}
	}
	notifqueue.push(rowid);
	return true;
}

// checks if there's any notifications to be sent out, and queues them
function notifRefill() {
	return models.Notifications.findAll({where : {HasSent : 0, DateTarget : { $lt : dateFormat( new Date(), "isoUtcDateTime") }}, order: "DateTarget asc" , raw : true } )
	.then(function(cdata){
		if (cdata.length == 0)
			return false;
		for (var i in cdata)
			notifAdd(cdata[i]["ID"]);
		return true;
	})
}

var notifSend = function(rowid, callback) {
	return models.Notifications.findOne({where : {ID : rowid }, raw: true })
	.then(function(crow) {
		if (crow == null)
			throw "Notification "+rowid+" not found";
		if (crow["HasSent"] == true)
			throw "Notification "+rowid+" already sent";
		if (crow["IsEmailNotificationFlag"] == true) {
			return notifEmailSend(crow);
		} else if (crow["IsApplePushNotificationFlag"] == true) {
			return notifPushSend(crow);
		} else {
			throw "Unknown notification type in row: "+JSON.stringify(crow);
		}
	})
	.then(function(p) {
		console.log("Success sending "+rowid)
	})
	.catch(function(e) {
		console.error("Error sending notif "+rowid+" : ");
		console.log(JSON.stringify(e,0,4));
	})
	// mark message as sent
	.then(function() {
		return models.Notifications.update({"HasSent" : 1, "DateSent" :  dateFormat( new Date(), "isoUtcDateTime") } ,
				 {where : {ID : rowid}});
	})
	.then(function() {
		callback(null);
		return null;
	})
}

notifqueue = async.queue(notifSend, 1)
notifqueue.drain = function() { }

// runs a refill every 30 seconds
daemonStart = function() {
	setInterval(function() {
		notifRefill();
	}, 30 * 1000);
}

module.exports = {"notifRefill" : notifRefill, "daemonStart" : daemonStart};

if (!module.parent) {
	console.log("Running one refill session")
	notifRefill();
}

