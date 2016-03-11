// multi-variant testing for within
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

// returns the variants for current user
router.post('/api/GetUserVariants', function(req, res) {
	apilib.requireParameters(req, ["UserToken", "UserID" ])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function() {
		res.json({
		    "UserVariantResults": {
		    	"Variants" : {
		    		"ComposeViewFirstResponder" : "It’s tough when you don’t have booze! Here’s the best way to get the convo going:\n1. Let them know which skills and experiences you’re interested in learning about.\n2. Suggest a few times to meet up—near them.\n3. Offer to help with something they’re interested in, or make an intro in return. This is how real relationships are made!",
		    		"strEnterMessage" : "Don't be shy!",
		    		"strRatingReviewMessage" : "Your review for this person will be visible on their profile for others to see - this will help them build their profile and get recognized for helping out. Any abusive content will be removed and reported."
		    	},
		        "Status": {
		            "Status": 1,
		            "StatusMessage": ""
		        }
		    }
		});
	})
	.catch( apilib.errorhandler("UserVariantResults", req, res));

});

module.exports = router;

