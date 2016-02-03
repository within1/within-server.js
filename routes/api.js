// main API route

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

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

router.get('/api', function(req, res) {
	res.json({"description" : "Within.guru server API", "version" : "1.0"});
});



// ------------------------------------
// Contact card handling

// returns a single contact card's details
router.post('/api/GetContactCardDetails', function(req, res) {
	var resdata = {};
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.Users.findById(req.body["OtherUserID"], {include: [
			{ model : models.UserContactCards, separate: true },
		]});
	})
	.then(function(data) {
		var carddata = data.get({plain: true});
		console.log("cdd",carddata);
		if (carddata["UserContactCards"].length == 0)
			throw "No records found!";
		var c = carddata["UserContactCards"][0];
		var apires = apilib.formatAPICall(c, ["DateCreated", "DateModified"]);
		res.json({"GetContactCardDetailsResult" : {"GetContactCardDetail" : apires, "Status" : { "Status": "1", "StatusMessage": "" }}});
		// UpdateUserActivityAndNotifications
	})
	.catch( apilib.errorhandler("GetContactCardDetailsResult", req, res));
});

// adds, or edits user's contact card
router.post('/api/AddEditContactCard', function(req, res) {
	var isNew = false;
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.UserContactCards.findOne( {where: {UserID : req.body["UserID"] }});
	})
	.then(function(card) {
		console.log("cdd",card);
		var upd = apilib.update(card, req.body, ["UserID", "Name", "Title", "Company", "PhoneNumber", "Email"]);
		upd["DateModified"] = dateFormat(new Date(), "isoUtcDateTime");
		if (card == null) {
			upd["DateCreated"] = dateFormat(new Date(), "isoUtcDateTime");
			return models.UserContactCards.create(upd);
		}
		return upd.save();
	})
	.then(function(c) {
		c = c.get({plain : true});
		console.log(c);
		var apires = apilib.formatAPICall(c, ["DateCreated", "DateModified"]);
		res.json({"AddEditContactCardResult" : {"GetContactCardDetail" : apires, "Status" : {"Status" : "1", "StatusMessage" : "" }}  });
	})
	.catch( apilib.errorhandler("AddEditContactCardResult", req, res));
})

// ------------------------------------
// returns: average thankyous, number of thankyous, latest thankyou for current user
router.post('/api/GetUserAverageThankYous', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() {
		return Promise.all([
			userlib.getAverageThanks(req.body["UserID"]),
			userlib.getNumberOfThankYous(req.body["UserID"]),
			userlib.getLatestUserThankYous(req.body["UserID"])
		]);
	})
	.then(function(data) {
		var apires = apilib.formatAPICall( { AverageThankYous : data[0], NumberOfThankYous : data[1], GetLatestUserThankYous : data[2] } );
		apires["Status"] = {"Status" : "1", "StatusMessage" : "" };
		res.json({"GetUserAverageThankYousResult" :  apires  });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetUserAverageThankYousResult", req, res));
});

// updates a coma-separated list of messageIDs' HasRead bitfield for current user
router.post('/api/UpdateMessageState', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID", "MessageID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() {
		var sids = req.body["MessageID"].split(",");
		var ids = [];
		for (var i in sids) {
			var num = parseInt(sids[i]);
			if (isNaN(num))
				throw num+" is not an integer";
			ids.push(num);
		}
		console.log("ids",ids);
		return models.Messages.update({"HasRead" : 1}, {where : { $and : [ { $or : [{SenderID : req.body["UserID"]} , {ReceiverID : req.body["UserID"]} ] }, { $or : [{ID : ids}] } ]}});
	})
	.then(function(cdata) {
		apires = {"Status" : {"Status" : "1", "StatusMessage" : "" }};
		res.json({"UpdateMessageStateResult" : apires});
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("UpdateMessageStateResult", req, res));
});

// lists all thankyous for a user
router.post("/api/GetUsersAllThankYous", function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID", "OtherUserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return userlib.getUserRatings(req.body["OtherUserID"], req.body["PageNumber"]);
	})
	.then(function(cdata) {
		apires = {"GetUserAllThankYous" : cdata, "Status" : {"Status" : "1", "StatusMessage" : "" }};
		res.json({"GetUsersAllThankYousResult" : apires} );
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetUsersAllThankYousResult", req, res));
});

// deletes a thankyou message / rating for a user
router.post("/api/DeleteThankYou", function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID", "RatingID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		return models.UserRatings.update({"isDeletedByRatedUser" : 1}, {where : { $and : [ { RaterID : req.body["UserID"]} , { ID : req.body["RatingID"]} ] } } );
	})
	.then(function(d) {
		res.json({GetDeleteRatingResult : {"Status" : {"Status" : "1", "StatusMessage" : "" }} });
	})
	.then(function() { return userlib.UpdateUserActivityAndNotifications(req.body["UserID"]);	})
	.catch( apilib.errorhandler("GetDeleteRatingResult", req, res));
});

// ------------------------------------
// add user to waitlist & send email notification for within team
router.post("/api/AddUserToWaitlist", function(req, res) {
	var cuser = null;
	apilib.requireParameters(req, ["UserToken", "UserID"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		cuser = authuser;
		authuser["AppStatus"] = 1;
		authuser["DateAppStatusModified"] = dateFormat(new Date(), "isoUtcDateTime");
		return authuser.save();
	})
	.then(function(authuser) {
		// update Incomplete Onboarding Notifications
		return models.Notifications.findOne({where : {ID : cuser["IncompleteOnboardingEmailNotificationID"] }});
	})
	.then(function(notifs) {
		if (notifs != null) {
			return notifs.update({"HasSent" : true});
		}
	})
	.then(function() {
		console.log("notification to within team");
		res.json({"AddUserToWaitlistResult" : {"Status" : {"Status" : "1", "StatusMessage" : "" }}  });
	})
	.catch(function(e) {
		console.error(e);
		console.error(e.stack);
		res.json({"AddUserToWaitlistResult" : {"Status" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
})

// ------------------------------------
// returns a Promise<match>
function createNewMatch(cuser) {
	console.log("Creating new match for user");
	return Promise.promisify(match.matchUser)(cuser["ID"],1)
	.then(function(matches) {
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
					{ ReceiverID : m["OtherUserID"], SenderID : m["ReachingOutUserID"] } ] }, orderby : {desc : "ID"}, limit : 1});
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
		var msgres = {"Matches" : matchresults, "NextMatchDate" : null, "Status" : {"Status" : "1", "StatusMessage" : "" } };
		return res.json({"GetMatchesForUserResult" : msgres });
	})
	.catch( apilib.errorhandler("GetMatchesForUserResult", req, res));
});

module.exports = router;

