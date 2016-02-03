// notification sending background service

var models  = require('../models');
var dateFormat = require('dateformat');
var async = require("async");
var copytext = require("../lib/copytext.js");

var HrsMatchExpiration = 6*24;
var HrsPastMidnightToSendMatchNotification = 14;
var HrsMatchExpiringWarning = HrsMatchExpiration - 24;

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
		if ((cuser == null) || (cmatch == null) || (cuser["ShouldSendPushNotifications"] == false))
			return true;
		if ((status == 1) && (cmatch["MatchExpiringPushNotificationID"] == null)) {
			// create new notification
			var onehour = 1000*60*60;
			var oneday = (onehour*24);
			var cdate = Math.floor(new Date() / (oneday)) * oneday;
			return models.Notifications.create({
				"DateCreated" : dateFormat( new Date(), "isoUtcDateTime"),
				"DateTarget" : dateFormat( new Date(cdate + (HrsMatchExpiringWarning * onehour) + (HrsPastMidnightToSendMatchNotification * onehour) ), "isoUtcDateTime"),
				"DeviceToken" : cuser["DeviceToken"],
				"EmailSubject" : "",
				"Type" : pushTypes["MatchExpiring"],
				"HasSent" : false,
				"IsApplePushNotificationFlag" : true,
				"IsEmailNotificationFlag" : false,
				"PushMessage" : PushMatchExpiringCopy,
				"SourceTable" : "ExpiringMatch",
				"UserID" : cuser["ID"]
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
function SendEmailNotification(uid, dateCreated, hrsDelay, emailType, otherUserName, imageURL, content, otherUserID) {

}

// creates, and saves a push notification
function SendPushNotification(userinfo, dateCreated, hrsDelay, pushMsg, messageID, pushType) {
	if (!userinfo["ShouldSendPushNotifications"])
		return true;
	var onehour = 1000*60*60;
	return models.Notifications.create( {
		"DateCreated" :  dateFormat( dateCreated, "isoUtcDateTime"),
		"DateTarget" : dateFormat( (dateCreated + (hrsDelay * onehour)), "isoUtcDateTime"),
		"DeviceToken" : userinfo["DeviceToken"],
		"EmailSubject" : "",
		"Type" : pushType,
		"HasSent" : false,
		"IsApplePushNotificationFlag" : true,
		"IsEmailNotificationFlag" : false,
		"MessageID" : messageID,
		"PushMessage" : pushMsg,
		"SourceTable" : pushNotificationTable[pushType],
		"UserID" : userinfo["ID"]
	});
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
			cnotif.DateTarget = dateFormat( new Date(Date.now() + 6*24*60*60* 1000), "isoUtcDateTime");
			cnotif.DateSent = null;
			cnotif.HasSent = false;
			return cnotif.save();
		});
	} else {
		return copytext("./copytext.csv")
		.then(function(textvalues) {
			return models.Notifications.create({
				DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
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
				UserID : cuser["ID"]
			});
		})
		// create new notification
	}
}

module.exports = {"UpdateExpiringMatchNotification" : UpdateExpiringMatchNotification,
		"SendEmailNotification" : SendEmailNotification,
		"SendPushNotification" : SendPushNotification,
		"UpdateInactivityEmail" : UpdateInactivityEmail,
		"HrsMatchExpiration" : HrsMatchExpiration,
		"HrsPastMidnightToSendMatchNotification" : HrsPastMidnightToSendMatchNotification,
		"pushTypes" : pushTypes,
		 };


if (!module.parent) {
	// minimal tests
	UpdateExpiringMatchNotification(103, 75, 1 )
	.then(function(res) {
		console.log("Done here");
	})
}


