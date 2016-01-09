// finds matching users

var models  = require('../models');
var dateFormat = require('dateformat');


// returns a Promise<match>
function createNewMatch(userid) {
	return models.Matches.create({
		DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
		MatchDate : dateFormat( new Date(), "isoUtcDateTime"),
		OtherUserID : 2,
		ReachingOutUserID : userid,
		MatchDate : dateFormat( new Date(), "isoUtcDateTime"),
		ReachingOutUserHasViewedFlag : 0,
		ReachingOutUserHasDeletedFlag : 0,
		OtherUserHasDeletedFlag : 0,
		MatchRationale : "Automatch",
		MatchExpireDate : dateFormat( new Date(Date.now() + 6*24*60*60* 1000), "isoUtcDateTime"),
		IsDead : 0
	});
}

module.exports = { "createNewMatch" : createNewMatch};