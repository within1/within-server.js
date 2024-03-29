// router for WCF service
// takes a WCF call, checks if we have a node.js implementation for it
// routes it to /api if so
// routes it to /WCF if not


var express = require('express');
var router  = express.Router();
var bodyParser = require('body-parser');
var compression = require('compression');
var Promise = require('bluebird');
var request = Promise.promisify(require("request"));
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
	var url = baseurl+"api/"+funcname;
	console.log(url);
	return request({uri: url, method: "POST", json : postdata })
	.then(function(res) {
		body = res["body"];
		console.log("response from "+url+" ("+res.statusCode+")");
		var cuid = (postdata["UserID"] !== undefined)?(postdata["UserID"]):(null);
		if ((cuid == null) && (funcname == "AddEditFacebookUser") && (body["AddEditFacebookUserResult"] !== undefined) &&
				(body["AddEditFacebookUserResult"]["PublicUserInformation"]["ID"] !== undefined))
			cuid = body["AddEditFacebookUserResult"]["PublicUserInformation"]["ID"];
		return models.RequestLogs.create({"Request" : JSON.stringify(postdata), "Response" : JSON.stringify(body), "URL" : funcname, "StatusCode" : res.statusCode, "UserID" : cuid,
			"DateRequest" : dateFormat(new Date(), "isoUtcDateTime") })
	})
	.then(function() {
		cb(null, body);
	})
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
router.use("/WithinWCF/ImageUpload/*", function(req, res) {
	res.sendStatus(404);
})

module.exports = router;
