// background message sending service

var async = require("async");
var Promise = require('bluebird');
var models  = require('../models');
var dateFormat = require('dateformat');

var notifqueue = async.queue(notifSend, 1);

notifqueue.drain = function() {
	console.log("All notifications sent")
}

// checks if the notification have been added to the queue; adds it if it haven't been processed yet
var notifAdd = function(row) {
	console.log(row);
}

// checks if there's any notifications to be sent out, and queues them
var notifRefill = function() {
	models.Notifications.findAll({where : {HasSent : 0, DateTarget : { $lt : dateFormat( new Date(), "isoUtcDateTime") }}, order: "DateTarget asc" , raw : true } )
	.then(function(cdata){
		console.log(cdata);
		if (cdata.length == 0)
			return false;
		for (var i in cdata)
			notifAdd(cdata[i])
	})
}

var notifSend = function(row, callback) {

}

if (!module.parent) {
	console.log("Running one refill session")
	notifRefill();
}