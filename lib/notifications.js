// notification sending background service

var models  = require('../models');
var dateFormat = require('dateformat');
var async = require("async");
var copytext = require("../lib/copytext.js");
var Promise = require('bluebird');
var daemon = require("../lib/daemon.js");
var crypto = require('crypto');


var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config["mandrill"]);
var targetaddr = config["emails"][env];

var HrsMatchExpiration = 6*24;
var HrsPastMidnightToSendMatchNotification = 14;
var HrsMatchExpiringWarning = HrsMatchExpiration - 24;
var HrsInactivityReminder = 336;

var PushMatchExpiringCopy = "Your recommendation's 'bout to expire. Message them before they're gone!";

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

/// Either creates or "turns off" a Notification that is sent in the event that a
/// user does not check his/her new match and there is one day left before her/his
/// Match expires
function UpdateExpiringMatchNotification(matchid, userid, status) {
	var cuser = null;
	var cmatch = null;
	return models.Users.findOne({where : { ID : userid}})
	.then(function(cp) {
		cuser = cp;
		return models.Matches.findOne({where : {ID : matchid}});
	})
	.then(function(cp) {
		cmatch = cp;
		if ((cuser == null) || (cmatch == null) )
			return true;
		if ((status == 1) && (cmatch["MatchExpiringPushNotificationID"] == null)) {
			// create new notification
			var onehour = 1000*60*60;
			var oneday = (onehour*24);
			var cdate = Math.floor(new Date() / (oneday)) * oneday;
			var trgDate = new Date(cdate);
			trgDate.setHours(trgDate.getHours() + HrsMatchExpiringWarning + HrsPastMidnightToSendMatchNotification);
			return models.Notifications.create({
				"DateCreated" : dateFormat( new Date(), "isoUtcDateTime"),
				"DateTarget" : dateFormat( trgDate, "isoUtcDateTime"),
				"DeviceToken" : cuser["DeviceToken"],
				"EmailSubject" : "",
				"Type" : pushTypes["MatchExpiring"],
				"HasSent" : false,
				"IsApplePushNotificationFlag" : true,
				"IsEmailNotificationFlag" : false,
				"PushMessage" : PushMatchExpiringCopy,
				"SourceTable" : "ExpiringMatch",
				"UserID" : cuser["ID"],
				"OtherUserID" : cmatch["OtherUserID"]
			})
			.then(function(resnotif) {
				console.log(resnotif);
				return models.Matches.update( { MatchExpiringPushNotificationID : resnotif["ID"] }, {where : {ID : cmatch["ID"]}} );
			});
		} else if ((status == 0) && (cmatch["MatchExpiringPushNotificationID"] != null)) {
			// remove existing notification
			var cmatchid = cmatch["MatchExpiringPushNotificationID"];
			return models.Matches.update( { MatchExpiringPushNotificationID : null }, {where : {ID : cmatch["ID"]}} )
			.then(function(ci) {
				return models.Notifications.update( { HasSent : true }, {where : { ID : cmatchid }});
			})
		}
		return true;
	})
}

// creates, and saves an email notification
function SendEmailNotification(userinfo, hrsDelay, emailType, otherUserName, imageURL, content, otherUserID) {
	var dateCreated = new Date();
	var dateTarget = new Date();
	console.log(hrsDelay);
	dateTarget.setHours(dateTarget.getHours() + hrsDelay)
	console.log("trgdate: ",dateTarget)
	return copytext("./copytext.csv")
	.then(function(textvalues) {
		var resnotif = {
			"DateCreated" :  dateFormat( dateCreated, "isoUtcDateTime"),
			"DateTarget" : dateFormat( dateTarget, "isoUtcDateTime"),
			"DateSent" : null,
			"DeviceToken" : userinfo["DeviceToken"],
			"Type" : emailType,
			"FromEmail" : textvalues.get("WithinFromEmail"),
			"FromName" : textvalues.get("WithinFromName"),
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
			resnotif["EmailSubject"] = textvalues.get(emailSubjects[emailType]);
		} else if (emailType == emailTypes["TypeEmailMessageReceived"] ) {
			resnotif["EmailSubject"] = textvalues.get("EmailMesssageReceivedSubject")+" "+otherUserName;
			resnotif["ReplyCode"] = crypto.randomBytes(8).toString('hex');
		} else if (emailType == emailTypes["TypeEmailThanxReceived"] ) {
			resnotif["EmailSubject"] = textvalues.get("EmailThanxReceivedSubject1")+" "+otherUserName+textvalues.get("EmailThanxReceivedSubject2");
		} else if (emailType == emailTypes["TypeEmailSomeoneReferred"] ) {
			resnotif["EmailSubject"] = textvalues.get("EmailReferredSubject")+" "+otherUserName;
		} else {
			throw "cannot find subject value for type "+emailType;
		}
		return models.Notifications.create(resnotif);
	})
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


function UpdateInactivityEmail(cuser) {
	if (!cuser["ShouldSendEmailNotifications"]) {
		if (cuser["InactivityEmailNotificationID"] != null) {
			cuser["InactivityEmailNotificationID"] = null;
			return cuser.save();
		}
		return true;
	}
	// email notification should be sent out
	if (cuser["InactivityEmailNotificationID"] != null) {
		// update existing notification
		return models.Notifications.findOne({where: {ID: cuser["InactivityEmailNotificationID"] }})
		.then(function(cnotif) {
			var trgDate = new Date();
			trgDate.setDate(trgDate.getDate() + 6);
			cnotif.DateTarget = dateFormat( trgDate, "isoUtcDateTime");
			cnotif.DateSent = null;
			cnotif.HasSent = false;
			return cnotif.save();
		});
	} else {
		// create new notification
		return copytext("./copytext.csv")
		.then(function(textvalues) {
			var onehour = 1000*60*60;
			var oneday = (onehour*24);
			var cdate = Math.floor(new Date() / (oneday)) * oneday;
			var trgDate = new Date(cdate);
			trgDate.setHours(trgDate.getHours() + HrsInactivityReminder);
			return models.Notifications.create({
				DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
				DateTarget :  dateFormat( trgDate, "isoUtcDateTime"),
				HasSent : 0,
				PushMessage : "",
				DeviceToken : (cuser["DeviceToken"] == null)?(""):(cuser["DeviceToken"]),
				EmailSubject : textvalues.get("EmailComeBackSubject"),
				FromEmail :  textvalues.get("WithinFromEmail"),
				FromName :  textvalues.get("WithinFromName"),
				IsApplePushNotificationFlag : 0,
				IsEmailNotificationFlag : 1,
				RecipientEmail : cuser["EmailAddress"],
				RecipientName : cuser["FirstName"],
				SourceTable : "UserInactivity",
				UserID : cuser["ID"],
				Type : emailTypes["TypeEmailComeBack"]
			});
		})
		.then(function(newnotif) {
			return models.Users.update({"InactivityEmailNotificationID" : newnotif["ID"] }, {where : {ID : cuser["ID"]}});
		})
	}
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

module.exports = {"UpdateExpiringMatchNotification" : UpdateExpiringMatchNotification,
		"SendEmailNotification" : SendEmailNotification,
		"SendPushNotification" : SendPushNotification, "SchedulePushNotification" : SchedulePushNotification,
		"UpdateInactivityEmail" : UpdateInactivityEmail,
		"HrsMatchExpiration" : HrsMatchExpiration,
		"HrsPastMidnightToSendMatchNotification" : HrsPastMidnightToSendMatchNotification,
		"pushTypes" : pushTypes, "emailTypes" : emailTypes, "msgTypes" : msgTypes,
		"SendAdminMail" : SendAdminMail,
};


if (!module.parent) {
	// minimal tests
	// UpdateExpiringMatchNotification(103, 75, 1 )
	SendUserFlaggedEmail(12,"joel",24,"qwd",123)
	.then(function(res) {
		console.log("Done here ",res);
	})
}


