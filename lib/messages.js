// Messages back-end API
var Promise = require('bluebird');
var dateFormat = require('dateformat');
var models  = require('../models');
var copytext = require("../lib/copytext.js");
var match = require("../lib/match.js");
var notif = require("../lib/notifications.js");
var cn = require("../lib/constants.js");


// adds a new message between two users;
// updates the match's NewestMessageID; and
// returns [new msg ID, match's ID]
// does not sends push notifications
function AddMessage(userID, receiverID, msg, Type) {
	var cmatch = null;
	var matchid = null;
	var msgid = null;
	if ((Type == 2) && (msg == ""))
		msg = "Business card shared";
	// Get the match within which the message was sent
	return match.getExistingMatch(userID, receiverID )
	// adds the message
	.then(function(msgmatch) {
		if (msgmatch == null)
			throw "SendMessage is being called in a context where there is no Match between the Users";
		cmatch = msgmatch;
		matchid = msgmatch["ID"];
		return models.Messages.create({
			DateCreated : dateFormat(new Date(), "isoUtcDateTime"),
			SenderID : userID,
			ReceiverID : receiverID,
			Message1 : msg,
			Type : Type,
			HasRead : false
		});
	})
	// update the NewestMessageID field
	.then(function(newmsg) {
		msgid = newmsg["ID"];
		return models.Matches.update({"NewestMessageID" : msgid } ,{where : {ID : matchid }} );
	})
	.then(function(cm) {
		return [msgid, matchid];
	});
}

// sends a message from one user to another
// uses the above, and also adds push notifications
function SendMessage(userID, receiverID, msg, Type) {
	var msgres = {};
	var allmsgs = null;
	var matchid = null;
	var cuser = null;
	return models.Users.findOne({ where : { ID : userID}})
	.then(function(userdata) {
		cuser = userdata;
		// create new message
		return AddMessage(userID, receiverID, msg, Type)
	})
	.then(function(msgarr) {
		matchid = msgarr[1];
		msgres["MessageID"] = msgarr[0];
		return models.Users.findOne({where : {ID : receiverID }})
	})
	.then(function(ruser) {
		if (ruser == null)
			throw "Receiving user can't be found for message";
		// send message to receiver
		if (ruser["IsTeamWithin"])
			// user PMd the within team
			return notif.SendAdminMail("TeamWithinMessageEmail", cuser["FirstName"]+" "+cuser["LastName"]+" messaged the WITHIN Team",
				"This is what " +cuser["FirstName"]+" has to say: \n"+msg+"\nSent: "+(new Date()),
				{"headers" : {"Reply-To" : cuser["EmailAddress"] }, "from_email" : cuser["EmailAddress"], "from_name" : cuser["FirstName"]+" "+cuser["LastName"] });
		// send a notification for all except thanx messages
		if ((cuser["DeviceToken"] != null) && ((msg.length > 0) && (Type != 4)) || (Type == 2)) {
			if (Type == 2)
				msg = cuser["FirstName"]+" sent you contact details";
			//immediate email notification
			return notif.SendEmailNotification(ruser, 0, notif.emailTypes["TypeEmailMessageReceived"], cuser["FirstName"], cuser["ImageURL"], msg, cuser["ID"] )
			.then(function() { return copytext("./copytext.csv"); } )
			.then(function(textvalues) {
				//immediate push notification
				return notif.SendPushNotification(ruser, 0,
					textvalues.get("PushMessageReceivedCopy1")+" "+cuser["FirstName"]+" "+textvalues.get("PushMessageReceivedCopy2"),
					msgres["MessageID"], cuser["ID"], notif.pushTypes["MessageReceived"]  );
			})
			.then(function() {
				// cancel reminder notification
				notif.UpdateExpiringMatchNotification(matchid, cuser["ID"], 0);
			})
		}
	})
	.then(function() {
		return msgres;
	})
}

module.exports = { "AddMessage" : AddMessage, "SendMessage" : SendMessage};
