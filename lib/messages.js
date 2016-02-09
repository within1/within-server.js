// Messages back-end API
var Promise = require('bluebird');
var dateFormat = require('dateformat');
var models  = require('../models');
var copytext = require("../lib/copytext.js");
var match = require("../lib/match.js");


// adds a new message between two users;
// updates the match's NewestMessageID; and
// returns [new msg ID, match's ID]
// does not sends push notifications
function AddMessage(userID, receiverID, msg, Type) {
	var cmatch = null;
	var matchid = null;
	var msgid = null;
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

module.exports = { "AddMessage" : AddMessage};
