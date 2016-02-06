// common admin functions
var models  = require('../models');
var copytext = require("../lib/copytext.js");
var notif = require("../lib/notifications.js");
var dateFormat = require('dateformat');

// returns a promise to process one user's application
function ProcessUserApplication(userid, newstatus) {
	var oldStatus = 0;
	var cuser = null;
	return models.Users.findOne({where : {ID : userid}})
	.then(function(ures) {
		if (ures == null)
			throw "User id "+userid+" not found";
		cuser = ures;
		oldStatus = ures["AppStatus"];
		return models.Users.update( { DateAppStatusModified : dateFormat( new Date(), "isoUtcDateTime"), AppStatus : newstatus }, {where : {ID : userid}});
	})
	.then(function(cr) {
		console.log("within team match & msg generation: "+oldStatus+" , "+newstatus);
		//send message from team within if accepted and have were not previously accepted
		if ((oldStatus == 2) || (newstatus != 2))
			return true;
		var cmatch = null;
		var textvalues = null;
		var wuser = null;
		return models.Users.findOne({where : { IsTeamWithin : true} })
			.then(function(wtu) {
				if (wtu == null)
					throw "We could not fetch the Within Team from the DB on the basis of the IsTeamWithin flag";
				wuser = wtu;
				return models.Matches.create({
					DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
					IsDead : false,
					MatchDate :  dateFormat( new Date(), "isoUtcDateTime"),
					MatchExpireDate : dateFormat( new Date(), "isoUtcDateTime"),
					MatchRationale : "Welcome!",
					ReachingOutUserID : wuser["ID"],
					OtherUserID : userid,
					ReachingOutUserHasViewedFlag : true,
					ReachingOutUserHasDeletedFlag : false,
					OtherUserHasDeletedFlag : false
				})
			})
			// add welcome messages
			.then(function(newmatch) {
				cmatch = newmatch;
				return copytext("./copytext.csv");
			})
			.then(function(tv) {
				textvalues = tv;
				return models.Messages.create({
					DateCreated : dateFormat(new Date(), "isoUtcDateTime"),
					SenderID : wuser["ID"],
					ReceiverID : userid,
					Message1 : textvalues.get("WithinTeamFirstMessageCopy"),
					Type : notif.msgTypes["TeamWITHIN"],
					HasRead : false
				});
			})
			// send approval email & push notification
			.then(function() { return notif.SendEmailNotification(cuser, new Date(), 0, notif.emailTypes["YoureApproved"], "", "", "", ""); })
			.then(function() { return notif.SendPushNotification(cuser, new Date(), 0,
				textvalues.get("PushYoureApprovedCopy1")+" "+cuser["FirstName"]+" "+textvalues.get("PushYoureApprovedCopy2"), "", notif.pushTypes["YoureApproved"] ) })
	})
}

module.exports = {"ProcessUserApplication" : ProcessUserApplication };
