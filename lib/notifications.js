// notification sending background service

var models  = require('../models');
var dateFormat = require('dateformat');
var async = require("async");
var copytext = require("../lib/copytext.js");
var Promise = require('bluebird');
var daemon = require("../lib/daemon.js");
var crypto = require('crypto');
var cns = require("../lib/constants.js");


var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config["mandrill"]);
var targetaddr = config["emails"][env];

var pushTypes = {
	"MessageReceived" : 1,
	"ThanxReceived" : 2,
	"NewMatchAvailable" : 3,
	"MatchExpiring" : 4,
	"YoureApproved" : 5

};

var pushNotificationTable = {
	1 : "MessageReceived",
	2 : "ThanxReceived",
	3 : "NewMatchAvailable",
	4 : "MatchExpiring",
	5 : "YoureApproved",
};

var emailTypes = {
	TypeEmailWelcomeToWithin : 1,
	TypeEmailIncompleteOnboarding : 2,
	TypeEmailMessageReceived : 3,
	TypeEmailThanxReceived : 4,
	TypeEmailComeBack : 5,
	TypeEmailSomeoneReferred : 6,
	TypeEmailYoureApproved : 7,
	TypeEmailPersonOnWaitlist : 8,
};

// automatic subject mapping from copytext values; rest is filled programmatically
var emailSubjects = {
	1 : "EmailWelcomeSubject",
	2 : "EmailIncompleteOnboardingSubject",
	5 : "EmailComeBackSubject",
	7 : "EmailYourApprovedSubject"
}

var msgTypes = {
	TeamWITHIN : 7,
	Thanx : 4
}

// creates, and saves an email notification
function SendEmailNotification(userinfo, hrsDelay, emailType, otherUserName, imageURL, content, otherUserID) {
	var dateCreated = new Date();
	var dateTarget = new Date();
	console.log(hrsDelay);
	dateTarget.setHours(dateTarget.getHours() + hrsDelay)
	console.log("trgdate: ",dateTarget)
	var resnotif = {
		"DateCreated" :  dateFormat( dateCreated, "isoUtcDateTime"),
		"DateTarget" : dateFormat( dateTarget, "isoUtcDateTime"),
		"DateSent" : null,
		"DeviceToken" : userinfo["DeviceToken"],
		"Type" : emailType,
		"FromEmail" : copytext("WithinFromEmail"),
		"FromName" : copytext("WithinFromName"),
		"HasSent" : false,
		"IsApplePushNotificationFlag" : false,
		"IsEmailNotificationFlag" : true,
		"OtherUserName" : otherUserName,
		"OtherUserID" : otherUserID,
		"PushMessage" : content,
		"RecipientEmail" : userinfo["EmailAddress"],
		"RecipientName" : userinfo["FirstName"],
		"SourceTable" : "EmailNotification",
		"UserID" : userinfo["ID"],
		"EmailSubject" : "",
		"ImageURL" : imageURL
	};
	if (emailSubjects[emailType] !== undefined) {
		resnotif["EmailSubject"] = copytext(emailSubjects[emailType]);
	} else if (emailType == emailTypes["TypeEmailMessageReceived"] ) {
		resnotif["EmailSubject"] = copytext("EmailMesssageReceivedSubject")+" "+otherUserName;
		resnotif["ReplyCode"] = crypto.randomBytes(8).toString('hex');
	} else if (emailType == emailTypes["TypeEmailThanxReceived"] ) {
		resnotif["EmailSubject"] = copytext("EmailThanxReceivedSubject1")+" "+otherUserName+copytext("EmailThanxReceivedSubject2");
	} else if (emailType == emailTypes["TypeEmailSomeoneReferred"] ) {
		resnotif["EmailSubject"] = copytext("EmailReferredSubject")+" "+otherUserName;
	} else {
		throw "cannot find subject value for type "+emailType;
	}
	return models.Notifications.create(resnotif)
	.then(function(msg) {
		if (emailType == emailTypes["TypeEmailIncompleteOnboarding"]) {
			 // Make FK to Notification
			 return models.Users.update({"IncompleteOnboardingEmailNotificationID" : msg["ID"]}, { where : {ID : userinfo["ID"]}});
		}
	})
	.then(function() {
		// automatically queue messages
		if (env != "local")
			return daemon.notifRefill();
	})
}

// schedules a future push notification to be sent at specific date
function SchedulePushNotification(userinfo, dateTarget, pushMsg, messageID, otherUserID, pushType) {
	var dateCreated = new Date();
	return models.Notifications.create( {
		"DateCreated" :  dateFormat( dateCreated, "isoUtcDateTime"),
		"DateTarget" : dateFormat( dateTarget, "isoUtcDateTime"),
		"DeviceToken" : userinfo["DeviceToken"],
		"EmailSubject" : "",
		"Type" : pushType,
		"HasSent" : false,
		"IsApplePushNotificationFlag" : true,
		"IsEmailNotificationFlag" : false,
		"MessageID" : messageID,
		"PushMessage" : pushMsg,
		"SourceTable" : pushNotificationTable[pushType],
		"UserID" : userinfo["ID"],
		"OtherUserID" : otherUserID
	})
	.then(function() {
		// automatically queue messages
		if (env != "local")
			return daemon.notifRefill();
	})
}

// creates, and saves a push notification
function SendPushNotification(userinfo, hrsDelay, pushMsg, messageID, otherUserID, pushType) {
	var dateTarget = new Date();
	dateTarget.setHours(dateTarget.getHours() + hrsDelay)
	return SchedulePushNotification(userinfo, dateTarget, pushMsg, messageID, otherUserID, pushType);
}

// Admin notifications:
// returns a Promise to send the email to specified admin address
function SendAdminMail(ctype, subject, msg, addparams) {
	return new Promise(function (resolve, reject) {
		var d = {
				"to" : [{"email" : targetaddr[ctype], "type" : "to"}],
				"subject" : subject,
				"from_email" : "hello@within.guru",
				"from_name" : "The WITHIN Team",
				"text" : msg,
			};
		if (addparams != null) {
			for (var k in addparams)
				d[k] = addparams[k];
		}
		console.log("Mandrill admin message to "+targetaddr[ctype]);
		mandrill_client.messages.send({
			"message" : d
		}, resolve, reject);
	});
}

module.exports = {
		"SendEmailNotification" : SendEmailNotification,
		"SendPushNotification" : SendPushNotification, "SchedulePushNotification" : SchedulePushNotification,
		"pushTypes" : pushTypes, "emailTypes" : emailTypes, "msgTypes" : msgTypes,
		"SendAdminMail" : SendAdminMail,
};


if (!module.parent) {
	// minimal tests
	SendUserFlaggedEmail(12,"joel",24,"qwd",123)
	.then(function(res) {
		console.log("Done here ",res);
	})
}


