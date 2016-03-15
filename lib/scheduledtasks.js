// all scheduled tasks & crons
var Promise = require('bluebird');
var cns = require("../lib/constants.js");
var models  = require('../models');
var notif = require("../lib/notifications.js");
var copytext = require("../lib/copytext.js");
var daemon = require("../lib/daemon.js");


// ---- misc background task: new match notification generation ---
var newMatchNotification = function() {
	var textvalues = null;
	// get a list of all approved users, who do not have a "NewMatchAvailable" in the future
	return copytext(__dirname + "/../copytext.csv")
	.then(function(tv) {
		textvalues = tv;
		return models.sequelize.query("select * from Users left join \
(select max(MatchExpireDate) as lastexpire, ReachingOutUserID from Matches group by ReachingOutUserID ) as m \
on m.ReachingOutUserID = Users.ID   \
 where ID not in ( select UserID from Notifications where DateTarget > getdate() and SourceTable = 'NewMatchAvailable' and HasSent = 0 ) \
and appstatus = 2 ", { type: models.sequelize.QueryTypes.SELECT})
	})
	.then(function(res) {
		var nextDate = null;
		var updateOps = [];
		for (var i in res) {
			if (res[i]["lastexpire"] != null) {
				nextDate = new Date(res[i]["lastexpire"]);
			} else {
				// if the user have not been matched with anyone, send it 1 week periodically after enrollment
				nextDate = new Date(res[i]["DateCreated"]);
			}
			while (nextDate <= (new Date()) )
				nextDate.setDate(nextDate.getDate() + 7);
			updateOps.push(notif.SchedulePushNotification(res[i], nextDate, textvalues.get("PushNewMatchAvailableCopy"), null, res[i]["ID"], cns.pushTypes["NewMatchAvailable"]));
		}
		return Promise.all(updateOps);
	})
	.then(function(res) {
		if (res.length > 0)
			console.log("CRON: Generated "+res.length+" NewMatchAvailable notifications");
	})
}

var cronRun = function() {
	return newMatchNotification()
	.then(function() {
		daemon.notifRefill()
	})
}

// runs a refill every 30 seconds
cronStart = function() {
	setInterval(function() {
		cronRun();
	}, 30 * 1000);
}

module.exports = {"cronStart" : cronStart };

if (!module.parent) {
	console.log("Running one scheduled task cycle")
	cronRun();
}

