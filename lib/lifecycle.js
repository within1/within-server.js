// lifecycle emails & notifications

var Promise = require('bluebird');
var models  = require('../models');
var copytext = require("../lib/copytext.js");
var cns = require("../lib/constants.js");
var notif = require("../lib/notifications.js");
var dateFormat = require('dateformat');


// called with each hit by the user: updates / extends the inactivity emails to be sent later
function UpdateInactivityEmail(cuser) {
	if (cuser["InactivityEmailNotificationID"] != null) {
		// update existing notification
		return models.Notifications.findOne({where: {ID: cuser["InactivityEmailNotificationID"] }})
		.then(function(cnotif) {
			var trgDate = new Date();
			trgDate.setHours(trgDate.getHours() + cns.HrsInactivityReminder);
			cnotif.DateTarget = dateFormat( trgDate, "isoUtcDateTime");
			cnotif.DateSent = null;
			cnotif.HasSent = false;
			return cnotif.save();
		});
	} else {
		// create new notification
		var trgDate = new Date();
		trgDate.setHours(trgDate.getHours() + cns.HrsInactivityReminder);
		return models.Notifications.create({
			DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
			DateTarget :  dateFormat( trgDate, "isoUtcDateTime"),
			HasSent : 0,
			PushMessage : "",
			DeviceToken : (cuser["DeviceToken"] == null)?(""):(cuser["DeviceToken"]),
			EmailSubject : copytext("EmailComeBackSubject"),
			FromEmail :  copytext("WithinFromEmail"),
			FromName :  copytext("WithinFromName"),
			IsApplePushNotificationFlag : 0,
			IsEmailNotificationFlag : 1,
			RecipientEmail : cuser["EmailAddress"],
			RecipientName : cuser["FirstName"],
			SourceTable : "UserInactivity",
			UserID : cuser["ID"],
			Type : cns.emailTypes["TypeEmailComeBack"]
		})
		.then(function(newnotif) {
			return models.Users.update({"InactivityEmailNotificationID" : newnotif["ID"] }, {where : {ID : cuser["ID"]}});
		})
	}
}

// Called when a new match is created; schedules expiring match notification
// Schedule: 1 day before match expires
function MatchCreated(matchid, userid) {
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
		if (cmatch["MatchExpiringPushNotificationID"] != null)
			return true;
		// create new notification
		var onehour = 1000*60*60;
		var oneday = (onehour*24);
		var cdate = Math.floor(new Date() / (oneday)) * oneday;
		var trgDate = new Date(cdate);
		trgDate.setHours(trgDate.getHours() + cns.HrsMatchExpiringWarning + cns.HrsPastMidnightToSendMatchNotification);
		return models.Notifications.create({
			"DateCreated" : dateFormat( new Date(), "isoUtcDateTime"),
			"DateTarget" : dateFormat( trgDate, "isoUtcDateTime"),
			"DeviceToken" : cuser["DeviceToken"],
			"EmailSubject" : "",
			"Type" : cns.pushTypes["MatchExpiring"],
			"HasSent" : false,
			"IsApplePushNotificationFlag" : true,
			"IsEmailNotificationFlag" : false,
			"PushMessage" : copytext("PushMatchExpiringCopy"),
			"SourceTable" : "ExpiringMatch",
			"UserID" : cuser["ID"],
			"OtherUserID" : cmatch["OtherUserID"]
		})
		.then(function(resnotif) {
			console.log(resnotif);
			return models.Matches.update( { MatchExpiringPushNotificationID : resnotif["ID"] }, {where : {ID : cmatch["ID"]}} );
		});
	})
}

// Called when a message is sent through a match
// Cancels expiring match notification & schedules "don't leave hanging" notification if first reachout message
// Cancels "don't leave hanging" notification if otheruser messages back
function MatchMessaged(matchid, userid, msgid) {
	var cuser = null;
	var cmatch = null;
	console.log("MatchMessaged "+matchid+" "+userid+" "+msgid);
	return models.Users.findOne({where : { ID : userid}})
	.then(function(cp) {
		cuser = cp;
		return models.Matches.findOne({where : {ID : matchid}});
	})
	.then(function(cp) {
		cmatch = cp;
		if ((cuser["ID"] == cmatch["ReachingOutUserID"]) && (cmatch["MatchExpiringPushNotificationID"] != null)) {
			// remove expiring match notification & set up reverse "Don't leave hanging"
			var cnotifid = cmatch["MatchExpiringPushNotificationID"];
			return models.Matches.update( { MatchExpiringPushNotificationID : null }, {where : {ID : cmatch["ID"]}} )
			.then(function(ci) {
				return models.Notifications.update( { HasSent : true }, {where : { ID : cnotifid }});
			})
			.then(function() {
				return models.Users.findOne({where : { ID : cmatch["OtherUserID"] }})
			})
			.then(function(otheruser) {
				var trgDate = new Date();
				trgDate.setHours(trgDate.getHours() + 24);
				return notif.SchedulePushNotification(otheruser, trgDate, otheruser["FirstName"]+" "+copytext("PushUnrespondedMessage"), msgid, userid, cns.pushTypes["MessageReceived"] );
			})
		} else if (cuser["ID"] == cmatch["OtherUserID"]) {
			// cancels "Don't leave hanging" reverse push notification
			// does this by cancelling all "message received" notification types between these two users
			return models.Notifications.update( { HasSent : true }, { where : { UserID : cmatch["OtherUserID"], OtherUserID : cmatch["ReachingOutUserID"], Type : cns.pushTypes["MessageReceived"] }  } );
		}
	})
}


module.exports = {
		"UpdateInactivityEmail" : UpdateInactivityEmail,
		"MatchCreated" : MatchCreated,
		"MatchMessaged" : MatchMessaged
}