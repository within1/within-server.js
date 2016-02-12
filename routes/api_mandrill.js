// mandrill incoming email handling

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');
var Promise = require('bluebird');


//  router.use(bodyParser.urlencoded({ extended: false }));
router.use(compression({ threshold: 512}));


router.get("/api/MandrillInboundEventCall", function(req, res) {
	res.json({"ok" : "ok"});
})

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
	res.json({"ok" : "ok"});
})

module.exports = router;

