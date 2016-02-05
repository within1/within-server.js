// returns matches for the user

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var userlib = require("../lib/userlib.js");
var dateFormat = require('dateformat');
var match = require("../lib/match.js");
var notif = require("../lib/notifications.js");
var copytext = require("../lib/copytext.js");
var UniqueConstraintError = models.sequelize.UniqueConstraintError;

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

// ------------------------------------
// returns a Promise<match>
function createNewMatch(cuser) {
	console.log("Creating new match for user");
	var cmatches = null;
	return match.match(cuser["ID"],1)
	.then(function(matches) {
		cmatches = matches;
		var newmatch = null;
		var onehour = 1000*60*60;
		var oneday = (onehour*24);
		var cdate = Math.floor(new Date() / (oneday)) * oneday + notif.HrsPastMidnightToSendMatchNotification * onehour;
		var exptime = cdate + notif.HrsMatchExpiration * onehour;
		if (matches.length == 0)
			return null;
		console.log("New match ",matches);
		return models.Matches.create({
			DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
			MatchDate : dateFormat( new Date(), "isoUtcDateTime"),
			OtherUserID : matches[0]["id"],
			ReachingOutUserID : cuser["ID"],
			MatchDate : dateFormat( new Date(), "isoUtcDateTime"),
			ReachingOutUserHasViewedFlag : 0,
			ReachingOutUserHasDeletedFlag : 0,
			OtherUserHasDeletedFlag : 0,
			MatchRationale : "Automatch",
			MatchExpireDate : dateFormat(exptime, "isoUtcDateTime"),
			IsDead : 0
		})
		.catch(UniqueConstraintError, function(e) {
			// this happens if the match have already been created parallel to this request
			// we'll return the previously created match
			return models.Matches.findOne({ where : {
					OtherUserID : cmatches[0]["id"],
					ReachingOutUserID : cuser["ID"], }
			});
		})
		.then(function(cm) {
			newmatch = cm;
			if (cuser["DeviceToken"] == null)
				return newmatch;
			return copytext("./copytext.csv")
			.then(function(textvalues) {
				return notif.SendPushNotification(cuser, cdate, notif.HrsMatchExpiration, textvalues.get("PushNewMatchAvailableCopy"), "", notif.pushTypes["NewMatchAvailable"]);
			})
			.then(function(newmsg) { return notif.UpdateExpiringMatchNotification(newmatch["ID"], cuser["ID"], 1) })
			.then(function(newmsg) { return newmatch; } );
		})
	});
}


// returns matches for given user
router.post("/api/GetMatchesForUser", function(req, res) {
	var cuser = null;
	var allmatches = [];
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		cuser = authuser;
		if (authuser["AppStatus"] != 2)
			throw "You're on the waitlist! Check back shortly.";
		// find all previous non-dead matches:
		return Promise.all([
			models.Matches.findAll({where : {"IsDead" : 0, "OtherUserHasDeletedFlag" : 0, "ReachingOutUserHasDeletedFlag" : 0, "ReachingOutUserID" : cuser["ID"] } }),
			models.Matches.findAll({where : {"IsDead" : 0, "OtherUserHasDeletedFlag" : 0, "ReachingOutUserHasDeletedFlag" : 0, "OtherUserID" : cuser["ID"] } })
		]);
	})
	.then(function(matches) {
		for (var i in matches)
			for (var j in matches[i])
				allmatches.push( matches[i][j].get({plain: true}) );
		// check if we need to generate new matches
		var isnewestexpired = false;
		if (allmatches.length > 0) {
			var newestMatch = allmatches[0];
			for (var i in allmatches) {
				if ((allmatches[i]["ReachingOutUserID"] == cuser["ID"]) && (allmatches[i]["MatchDate"] > newestMatch["MatchDate"] ))
					newestMatch = allmatches[i];
			}
			if (newestMatch["MatchExpireDate"] < (new Date()))
				isnewestexpired = true;
		}

		if ((allmatches.length == 0) || (isnewestexpired) || ((req.body["GetNewMatch"] !== undefined) && (req.body["GetNewMatch"] == "1") ) ) {
			return createNewMatch(cuser)
			.then(function(newMatch) {
				if (newMatch == null)
					return true;
				// add as first element
				allmatches.unshift(newMatch);
				return true;
			});
		}
		return true;
	})
	// convert all matches into matchresults
	.then(function() {
		return Promise.map(allmatches, function(m) {
			// get public user information
			var res = null;
			var cuid = (m["OtherUserID"] == cuser["ID"])?(m["ReachingOutUserID"]):(m["OtherUserID"]);
			return userlib.getPublicUserInfo(cuid, false)
			.then(function(otherUserInfo) {
				res = userlib.copyValues(m, ["MatchDate", "MatchRationale"]);
				res["MatchID"] = m["ID"];
				res["UnreadMessageCount"] = 0;
				res["UserHasViewedMatch"] = m["ReachingOutUserHasViewedFlag"];
				res["IsPreferredMatch"] = false;
				res = apilib.formatAPICall(res, ["MatchDate"]);
				res["UserInformation"] = otherUserInfo["PublicUserInformation"];
				res["MatchExpireTime"] = dateFormat(m["MatchExpireDate"], "mm/dd/yyyy HH:MM:ss", true);
				// get latest one message
				return models.Messages.findAll({where : {$or : [{ ReceiverID : m["ReachingOutUserID"], SenderID : m["OtherUserID"]  },
					{ ReceiverID : m["OtherUserID"], SenderID : m["ReachingOutUserID"] } ] }, order : "ID desc", limit : 1});
			})
			.then(function(msg) {
				if ((msg == null) || (msg.length == 0)) {
					res["LatestMessage"] = null;
					return res;
				}
				cmsg = userlib.copyValues(msg[0].get({plain : true}),  ["ID", "DateCreated", "SenderID", "ReceiverID", "Type", "HasRead"]);
				cmsg["Message"] = msg[0]["Message1"];
				res["LatestMessage"] = apilib.formatAPICall(cmsg, ["DateCreated"]);
				return res;
			})
		})
	})
	// sort resulting array
	.then(function(matchresults) {
		// Match with no messages come first in response list
		matchresults.sort(function(a,b) {
			if (a["LatestMessage"] == null)
				return -1;
			if (b["LatestMessage"] == null)
				return 1;
			return (a["MatchID"] > b["MatchID"])?(-1):(1);
		})
		return matchresults;
	})
	.then(function(matchresults) {
		// remove all expired & no-message matches
		if (matchresults.length < 2)
			return matchresults;
		var removeids = [];
		for (var i = 1; i < matchresults.length; i++) {
			if (matchresults[i]["LatestMessage"] == null) {
				removeids.push(matchresults[i]["MatchID"]);
			}
		}
		console.log("removeids ",removeids);
		return Promise.map(removeids, function(citem) {
			console.log("removing ",citem);
			return models.Matches.update({"IsDead" : true}, {where : { ID : citem}});
		})
		.then(function() {
			for (var i in removeids) {
				for (var j in matchresults) {
					if (matchresults[j]["MatchID"] == removeids[i]) {
						matchresults.splice( j, 1);
						break;
					}
				}
			}
			return matchresults;
		})
	})
	.then(function(matchresults) {
		//if a message exists in a conversation, no longer can be preferred
		if ((matchresults.length > 0) && (matchresults[0]["LatestMessage"] == null))
			matchresults[0]["IsPreferredMatch"] = "true";
		var nextMatchDate = null;
		if (matchresults.length > 0)
			nextMatchDate = matchresults[0]["MatchExpireTime"];
		var msgres = {"Matches" : matchresults, "NextMatchDate" : nextMatchDate, "Status" : {"Status" : "1", "StatusMessage" : "" } };
		return res.json({"GetMatchesForUserResult" : msgres });
	})
	.catch( apilib.errorhandler("GetMatchesForUserResult", req, res));
});

module.exports = router;
