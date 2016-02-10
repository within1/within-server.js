// router for WCF service
// takes a WCF call, checks if we have a node.js implementation for it
// routes it to /api if so
// routes it to /WCF if not


var express = require('express');
var router  = express.Router();
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var request = require("request");
var env       = process.env.NODE_ENV || "development";
var imagedir = config.imagedir[env];
var models  = require('../models');
var dateFormat = require('dateformat');


router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

function routeProxy(funcname, postdata, cb) {
	var baseurl = (process.env.NODE_ENV == "development") ? ("http://dev.within.guru/") : ("http://app.within.guru/");
	if (process.env.NODE_ENV == "local")
		baseurl = "http://within.local/";
	/*
	var url = baseurl+"WCF/Service1.svc/"+funcname;
	url = baseurl+"WCF/"+funcname;

	var apifuncs = ["GetAllUsers", "GetMatchesForUser", "UploadPicture"];
	if (apifuncs.indexOf(funcname) != -1) {
		url = baseurl+"api/"+funcname;
	}*/
	url = baseurl+"api/"+funcname;
	console.log(url);
	request({uri: url, method: "POST", json : postdata }, function(error, res, body) {
		if (error != null)
			console.error(error);
		console.log("response from "+url+" ("+res.statusCode+")");
		models.RequestLogs.create({"Request" : JSON.stringify(postdata), "Response" : JSON.stringify(body), "URL" : funcname, "StatusCode" : res.statusCode, "UserID" : (postdata["UserID"] !== undefined)?(postdata["UserID"]):(null),
			"DateRequest" : dateFormat(new Date(), "isoUtcDateTime") })
		.then(function() {
			cb(null, body);
		})

	});
}

router.get('/WithinWCF/Service1.svc/:apicall', function(req, res) {
	if (req.params["apicall"] === undefined)
		return res.send("not found");
	return routeProxy(req.params["apicall"], req.body, function(err, data) {
		return res.send(data);
	})
});

router.post('/WithinWCF/Service1.svc/:apicall', function(req, res) {
	if (req.params["apicall"] === undefined)
		return res.send("not found");
	return routeProxy(req.params["apicall"], req.body, function(err, data) {
		return res.send(data);
	})
});

router.use('/WithinWCF/ImageUpload/', express.static(imagedir));


module.exports = router;
