
var apn = require('apn');

var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js');
var apnConnection = new apn.Connection(config["apn"][env]);

crow = {"DeviceToken" : "0851d2521b79dd2cc86a10ce8fced417921651dd9a72654d5b16e9ee584e0b38"};

var myDevice = new apn.Device(crow["DeviceToken"]);
var note = new apn.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 1;
note.sound = "notification.wav";
var res = apnConnection.pushNotification(note, myDevice);
console.log(res);


