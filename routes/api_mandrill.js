// mandrill incoming email handling

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var replyParser = require("emailreplyparser");
var msglib =  require("../lib/messages.js");


//  router.use(bodyParser.urlencoded({ extended: false }));
router.use(compression({ threshold: 512}));

router.get("/api/MandrillInboundEventCall", function(req, res) {
	res.json({"ok" : "ok"});
})

// Processes one single reply from Mandrill's inbound call
function ProcessReply(d) {
	var replycode = "";
	var cnotif = null;
	return new Promise(function(resolve, reject) {
		var raddr = d["msg"]["headers"]["To"];
		var rid = raddr.split("@");
		if (!rid[0].startsWith("reply_"))
			reject("Email isn't sent to reply_ address: "+raddr);
		replycode = rid[0].substr(6);
		console.log("replycode ",replycode);
		resolve(null);
	})
	.then(function() { return models.Notifications.findOne({where : { ReplyCode : replycode } }); })
	.then(function(cn) {
		if (cn == null)
			throw "Reply code "+replycode+" not found";
		cnotif = cn;
		return models.Users.findOne({where : { ID : cnotif["UserID"]}})
	})
	.then(function(cu) {
		var cmsg = d["msg"]["text"];
		var rpl = replyParser.EmailReplyParser.read(cmsg);
		console.log(JSON.stringify(rpl,0,4));
		if (!rpl["found_visible"])
			throw "No visible fragment found for reply "+JSON.stringify(rpl);
		var resmsg = "";
		for (var i in rpl["fragments"]) {
			if ( (!rpl["fragments"][i]["signature"]) && (!rpl["fragments"][i]["hidden"]) && (!rpl["fragments"][i]["quoted"])) {
				resmsg += rpl["fragments"][i]["content"];
			}
		}
		console.log("resmsg: "+resmsg);
		return msglib.SendMessage(cnotif["UserID"], cnotif["OtherUserID"], resmsg, 1);
	})
}

router.post("/api/MandrillInboundEventCall", function(req, res) {
	if (req.body["mandrill_events"] === undefined)
		return res.json({"Error" : "No mandrill_events in post message"})
	var mbody = null;
	try {
		mbody = JSON.parse(req.body["mandrill_events"]);
	} catch (e) {
		return  res.json({"Error" : "mandrill_events invalid format"})
	}
	console.log("Mandrill inbound call: ", JSON.stringify(mbody,0,4));
	var allops = [];
	for (var i in mbody) {
		allops.push( ProcessReply(mbody[i]) );
	}
	return Promise.all(allops)
	.catch(function(e) {
		console.error("While processing mandrill request: "+JSON.stringify(e,0,4));
		console.error(e.stack);
	})
	.then(function() {
		res.json({"ok" : "ok"});
	})
})

module.exports = router;

