var notifqueue = async.queue(notifSend, 1);

// pre-reqs for this:
// mandrill API handling
// message queue service

/*
notifqueue.drain = function() {
	console.log("All notifications sent")
}

// checks if the notification have been added to the queue; adds it if it haven't been processed yet
var notifAdd = function(id) {

}

// checks if there's any notifications to be sent out, and queues them
var notifRefill = function() {
	models.Notifications.findAll({where : {HasSent : false, DateTarget : { $lt : dateFormat( new Date(), "isoUtcDateTime") }}, orderby : {"DateTarget" : "asc"}, limit : 1})
	.then(function(cdata){
		if (cdata.length == 0)
			return false;
		for (var i in cdata)
			notifqueue.push()
	})
}

var notifSend = function(id, callback) {

}
*/
