// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var fs = require("fs");
var config = require("../config.js");
var uuid = require('node-uuid');
var gm = require('gm').subClass({imageMagick: true});

var autoOrient = Promise.promisify(function(fn,cb) { gm(fn).autoOrient().write(fn, function(err, res) {cb(err, res) }) });
var thumbnail = Promise.promisify(function(fn, outfn, minwidth,minheight, quality, cb) { gm(fn).thumb(minwidth, minheight, outfn, quality, function(err, res) {cb(err, res) }) });


router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

/*
router.get('/api/ImageUpload', function(req, res) {
	res.json({"description" : "Within.guru server Image Store", "version" : "1.0"});
});
*/

router.post('/api/UploadPicture', function(req, res) {
	var outfn = null, thmfn = null, cuid = null;
	apilib.requireParameters(req, ["UserToken", "UserID", "Base64PictureEncoding"])
	.then(function() { return apilib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		var buf = new Buffer(req.body["Base64PictureEncoding"], "base64");
		cuid = uuid.v1();
		var rfn = config.imagedir+cuid;
		outfn = rfn+".JPG";
		thmfn = rfn+"_Thumb.JPG";
		fs.writeFileSync(outfn, buf);
		res.json({"UploadPictureResult" : {"ImageURL" : cuid+".JPG", "PictureType" : "Profile",  "Status" : { "Status": "1", "StatusMessage": "" }}});
		return true;
	})
	.then(function() { return autoOrient(outfn); })
	.then(function() { return thumbnail(outfn, thmfn, 100,100,80 )})
	.then(function() {
		res.json({"UploadPictureResult" : {"ImageURL" : cuid+".JPG", "PictureType" : "Profile",  "Status" : { "Status": "1", "StatusMessage": "" }}});
	});
});

module.exports = router;

