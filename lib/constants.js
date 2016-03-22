// constants for messages, notifications, etc

var pushTypes = {
	"MessageReceived" : 1,
	"ThanxReceived" : 2,
	"NewMatchAvailable" : 3,
	"MatchExpiring" : 4,
	"YoureApproved" : 5

};


var emailTypes = {
	TypeEmailWelcomeToWithin : 1,
	TypeEmailIncompleteOnboarding : 2,
	TypeEmailMessageReceived : 3,
	TypeEmailThanxReceived : 4,
	TypeEmailComeBack : 5,
	TypeEmailSomeoneReferred : 6,
	TypeEmailYoureApproved : 7,
	TypeEmailPersonOnWaitlist : 8,
	TypeEmailNewWeekRecommendation : 9,
};


var msgTypes = {
	TeamWITHIN : 7,
	Thanx : 4
}


module.exports = { "pushTypes" : pushTypes, "emailTypes" : emailTypes, "msgTypes" : msgTypes,
	HrsMatchExpiration : 6*24,
	HrsPastMidnightToSendMatchNotification : 14,
	HrsMatchExpiringWarning : 5*24,
	HrsInactivityReminder : 14*24
};
