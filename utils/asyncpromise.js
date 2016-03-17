// testing: async heaps called from a promise

var async = require("async");
var Promise = require('bluebird');
var models  = require('../models');
var dateFormat = require('dateformat');

var notifSend = function(rowid, callback) {
	return models.Notifications.findOne({where : {ID : rowid }, raw: true })
	.then(function(crow) {
		throw "Notification "+rowid+" already sent";
	})
	.then(function(p) {
		console.log("Success sending "+rowid+" : "+p)
	})
	.catch(function(e) {
		console.error("Error sending notif "+rowid+" : "+JSON.stringify(e,0,4));
	})
	// mark message as sent
	.then(function() {
		return models.Notifications.update({"HasSent" : 1, "DateSent" :  dateFormat( new Date(), "isoUtcDateTime") } , {where : {ID : 1111111111}});
	})
	.then(function() {
		callback(null);
		return null;
	})
}

var notifAdd = function(rowid) {
	for (var i in notifqueue.tasks) {
		if (notifqueue.tasks[i]["data"] == rowid) {
			console.log("skipped "+rowid)
			return false;
		}
	}
	console.log(notifqueue.tasks);
	notifqueue.push(rowid);
	return true;
}


notifqueue = async.queue(notifSend, 1)
notifqueue.drain = function() { console.log("drained") };

for (var i = 111; i <131; i++)
	notifAdd( Math.floor(Math.random()*10));

