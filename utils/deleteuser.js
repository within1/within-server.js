// removes a user fully from DB

var models = require("../models");

function deleteUser(uid) {
	// retrieve user
	var cuser = null;
	models.Users.findOne({where : {ID : uid}, raw : true})
	.then(function(c) {
		if (c == null)
			throw "User id "+uid+" not found";
		cuser = c;
		models.Users.update({"IncompleteOnboardingNotificationID" : null, "IncompleteOnboardingEmailNotificationID" : null, "InactivityEmailNotificationID" : null}, {where : {ID : uid} })
		return true;
	})
	// remove entity-related objects
	.then(function() { return models.TagInstances.destroy({where : { OwnerID : cuser["EntityID"] } } ); })
	.then(function() { return models.Feedbacks.destroy({where : { $or : [ { UserID : uid }, {OtherUserID : uid} ] } } ); })
	.then(function() { return models.Events.destroy({where : {UserID : uid}}) })
	// remove all matches
	.then(function() { return models.Matches.destroy({where : {  $or : [ { ReachingOutUserID : uid }, { OtherUserID : uid }   ] } }) })
	// remove all messages
	.then(function() { return models.Messages.destroy({where : { $or : [  	{ SenderID : uid }, { ReceiverID : uid } ] } })	})
	// delete all notifications
	.then(function() { return models.Notifications.destroy({where : { ID : cuser["IncompleteOnboardingNotificationID"] } } ); })
	.then(function() { return models.Notifications.destroy({where : { ID : cuser["IncompleteOnboardingEmailNotificationID"] } } ); })
	.then(function() { return models.Notifications.destroy({where : { ID : cuser["InactivityEmailNotificationID"] } } ); })
	.then(function() { return models.Notifications.destroy({where : { UserID : uid.toString() } } ); })
	.then(function() { return models.UserContactCards.destroy({where : { UserID : uid } } ); })
	.then(function() { return models.UserEducations.destroy({where : { UserID : uid } } ); })
	.then(function() { return models.UserEmployments.destroy({where : { UserID : uid } } ); })
	.then(function() { return models.UserLocations.destroy({where : { UserID : uid } } ); })
	.then(function() { return models.UserRatings.destroy({where : { $or : [ { RaterID : uid }, {RatedID : uid} ] } } ); })
	// remove user model
	.then(function() { return models.Users.destroy({where : {ID : uid}}) })
	.then(function() { return models.Entities.destroy({where : {ID : cuser["EntityID"]}}) })
	.then(function() {
		console.log("Destroy complete")
	});
}


if (!module.parent) {
	console.log("Removing user")
	deleteUser(140);
}
