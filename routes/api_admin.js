// Admin API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var userlib = require("../lib/userlib.js");

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

// returns a list of all users
router.post('/api/GetAllUsers', function(req, res) {
	apilib.requireParameters(req, ["AdminToken", "AdminID"])
	.then(function() {
		res.json({"GetAllUsersResult" : {"Users" : [], "Status" : { "Status": "1", "StatusMessage": "" }}});
	});
});



module.exports = router;

