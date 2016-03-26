// Consistency unit tests running every 5 minutes

var Promise = require('bluebird');
var cns = require("../lib/constants.js");
var models  = require('../models');
var notif = require("../lib/notifications.js");
var env = process.env.NODE_ENV || "development";

function scheduledTests() {
	var errs = [];
	// All approved users should have an unsent NewMatchAvailable notification in the future
	return models.sequelize.query("select ID from Users where Users.ID not in ( select UserID from Notifications where DateTarget > getdate() and SourceTable = 'NewMatchAvailable' and HasSent = 0 ) and appstatus = 2", { type: models.sequelize.QueryTypes.SELECT})
	.then(function(r) {
		if (r.length > 0)
			errs.push("Approved user does not have an unsent NewMatchAvailable notification in the future: "+JSON.stringify(r));
	})
	// there should be no unsent notifications in the past (1 hour buffer to have time to send them)
	.then(function() { return models.sequelize.query("SELECT * FROM [dbo].[Notifications] where HasSent = 0 and DateTarget < dateadd(hh, -1, GetDate() ) order by DateTarget asc", { type: models.sequelize.QueryTypes.SELECT})	})
	.then(function(r) {
		if (r.length > 0)
			errs.push("Unsent notification in the past: "+JSON.stringify(r));
	})
	// there should be no B -> A match, where an earlier A -> B match already exists
	.then(function() { return  models.sequelize.query("SELECT * FROM Matches m join Matches m2 on m.ReachingOutUserID = m2.OtherUserID and m2.ReachingOutUserID = m.OtherUserID", { type: models.sequelize.QueryTypes.SELECT}) })
	.then(function(r) {
		if (r.length > 0)
			errs.push("A -> B match, with a previous B -> A present: "+JSON.stringify(r));
	})
	// No matches with at least one message should have an expiring push notification
	.then(function() {
		return  models.sequelize.query("SELECT * FROM [dbo].[Matches] where MatchExpiringPushNotificationID is not null and NewestMessageID is not null", { type: models.sequelize.QueryTypes.SELECT})
	})
	.then(function(r) {
		if (r.length > 0)
			errs.push("Expriting match notification with at least one message present: "+JSON.stringify(r));
	})
	// send all errors to dev mail
	.then(function() {
		if (errs.length > 0)
			return notif.SendAdminMail("devMail", "Unit test failure on within "+env+" server", "Error stack:\n"+errs.join("\n"),
                { "from_name" : "Within error daemon" });
	})
	.then(function() {
		if (errs.length > 0)
			console.error(errs.join("\n"));
		return errs;
	})
}


module.exports = {"scheduledTests" : scheduledTests };

if (!module.parent) {
	console.log("Running one test cycle")
	return scheduledTests()
	.then(function(e) {
		console.log(e);
		process.exit();
	})
}
