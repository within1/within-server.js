var notif = require("../lib/notifications.js")
var models = require("../models");

models.Users.findOne({where : { ID : 44}})
.then(function(u) {
	return notif.SendPushNotification(u, 0, "tester tests", null, 0);
})

