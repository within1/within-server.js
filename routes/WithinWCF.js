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

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

module.exports = router;

function routeProxy(funcname, postdata, cb) {
	var baseurl = (process.env.NODE_ENV == "development") ? ("http://dev.within.guru/") : ("http://app.within.guru/");
	var url = baseurl+"WCF/Service1.svc/"+funcname;
	var apifuncs = ["GetAllUsers"];
	if (apifuncs.indexOf(funcname) != -1) {
		url = baseurl+"api/"+funcname;
	}
	console.log(url);
	request({uri: url, method: "POST", json : postdata }, function(error, res, body) {
		cb(null, body);
	});
}

router.get('/WithinWCF/Service1.svc/:apicall', function(req, res) {
	if (req.params["apicall"] === undefined)
		return res.send("not found");
	res.send("api call: "+JSON.stringify(req.params,0,4));
});


router.post('/WithinWCF/Service1.svc/:apicall', function(req, res) {
	if (req.params["apicall"] === undefined)
		return res.send("not found");
	return routeProxy(req.params["apicall"], req.body, function(err, data) {
		return res.send(data);
	})
});
