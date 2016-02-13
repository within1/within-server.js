var notif = require("../lib/notifications.js")
var models = require("../models");

var daemon = require("../lib/daemon.js");

/*
models.Users.findOne({where : { ID : 44}})
.then(function(u) {
	return notif.SendPushNotification(u, 0, "tester tests", null, 0);
})

*/
console.log(daemon.notifRefill);