// mandrill incoming email handling

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');
var Promise = require('bluebird');


router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));


router.get("/api/MandrillInboundEventCall", function(req, res) {
	res.json({"ok" : "ok"});
})

router.post("/api/MandrillInboundEventCall", function(req, res) {
	console.log("Mandrill inbound call: ", JSON.stringify(req.body,0,4));
	res.json({"ok" : "ok"});
})

