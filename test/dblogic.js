// database business logic unit tests
var assert = require('assert');
var config    = require(__dirname + '/../config.js');
var request = require("request");
// use the live DB for these
process.env.NODE_ENV = "live";
var models  = require('../models');


describe("there should be no B -> A match, where an earlier A -> B match already exists", function() {
	// access the network with a 5 second timeout
	this.timeout(15000);
	it("should not return any results", function(done) {
		models.sequelize.query("SELECT * FROM Matches m join Matches m2 on m.ReachingOutUserID = m2.OtherUserID and m2.ReachingOutUserID = m.OtherUserID", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) {
			console.log(res);
			assert.equal(res.length,0);
			done(null);
		});
	});
});

describe("there should be no unsent notifications in the past", function() {
	this.timeout(15000);
	it("should not return any results", function(done) {
		models.sequelize.query("SELECT * FROM [dbo].[Notifications] where HasSent = 0 and DateTarget < GETDATE() order by DateTarget asc", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) {
			console.log(res);
			assert.equal(res.length,0);
			done(null);
		});
	});
});

// describe("Duplicate inserts of Incomplete onboarding email")
// SELECT * FROM Notifications where type = 2 and ID not in (select distinct IncompleteOnboardingEmailNotificationID as ID from Users where IncompleteOnboardingEmailNotificationID is not null)


describe("All messages must be present in Newestmessageid", function() {
	this.timeout(15000);
	it("should not return any results", function(done) {
		models.sequelize.query("select * from Matches m left join Messages msg on m.ReachingOutUserID = msg.SenderID and m.OtherUserID = msg.ReceiverID where m.NewestMessageID is null and msg.id is not null", { type: models.sequelize.QueryTypes.SELECT}).then(function(res) {
			console.log(res);
			assert.equal(res.length,0);
			done(null);
		});
	});
});
