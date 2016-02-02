// test queues

var async = require("async");

var notifSend = function(id, cb) {
	console.log("processing "+id);
	console.log("stuff current queued: ", JSON.stringify(notifqueue.tasks) );
	setTimeout(function() { cb(null); }, 1000);
}

var notifqueue = async.queue(notifSend, 1);

notifqueue.drain = function() {
	console.log("All notifications sent")
}

var notifRefill = function() {
	for (var i = 0; i <1000; i++) {
		notifqueue.push(i);
	}
};

notifRefill();