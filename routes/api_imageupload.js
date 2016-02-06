// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var apilib = require("../lib/apilib.js");
var userlib = require("../lib/userlib.js");
var fs = require("fs");
var config = require("../config.js");
var uuid = require('node-uuid');
var gm = require('gm').subClass({imageMagick: true, appPath : "c:/Program Files/ImageMagick-6.9.3-Q8/"});
var env       = process.env.NODE_ENV || "development";
var imagedir = config.imagedir[env];

var autoOrient = Promise.promisify(function(fn,cb) { gm(fn).autoOrient().write(fn, function(err, res) {cb(err, res) }) });
var thumbnail = Promise.promisify(function(fn, outfn, minwidth,minheight, quality, cb) { gm(fn).thumb(minwidth, minheight, outfn, quality, function(err, res) {cb(err, res) }) });


router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

/*
// this was used to test existence of imagemagick in the path; not used anymore -we're setting it above directly
router.get("/api/pathtester", function(req, res) {
	res.send(process.env);
})
*/

router.post('/api/UploadPicture', function(req, res) {
	var outfn = null, thmfn = null, cuid = null;
	var cauthuser = null;
	apilib.requireParameters(req, ["UserToken", "UserID", "Base64PictureEncoding"])
	.then(function() { return userlib.validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(authuser) {
		cauthuser = authuser;
		var buffer = new Buffer(req.body["Base64PictureEncoding"], "base64");
		cuid = uuid.v1();
		var rfn = imagedir+cuid;
		outfn = rfn+".JPG";
		thmfn = rfn+"_Thumb.JPG";
		fs.writeFileSync(outfn, buffer);
		console.log(outfn);
		return outfn;
	})
	.then(function(fn) { return autoOrient(outfn); })
	.then(function() { return thumbnail(outfn, thmfn, 100,100,80 )} )
	.then(function() {
		// remove previous images if exists
		if ((cauthuser.ImageURL != "") && (cauthuser.ImageURL != null)) {
			if (fs.existsSync(imagedir+cauthuser.ImageURL))
				fs.unlinkSync(imagedir+cauthuser.ImageURL)
			var oldthumb = imagedir+cauthuser.ImageURL.replace(".JPG", "_Thumb.JPG");
			if (fs.existsSync(oldthumb))
				fs.unlinkSync(oldthumb);
		}
	})
	.then(function() {
		// update user info
		return cauthuser.update({ImageURL : cuid+".JPG"});
	})
	.then(function() {
		return userlib.UpdateUserActivityAndNotifications(cauthuser.ID);
	})
	.then(function() {
		res.json({"UploadPictureResult" : {"ImageURL" : cuid+".JPG", "PictureType" : "Profile",  "Status" : { "Status": "1", "StatusMessage": "" }}});
		return true;
	}).catch(function(e) {
		console.error(e.toString() );
		console.error(e.stack );
		res.json({"UploadPictureResult" : {"ResultStatus" : {"Status" : "0", "StatusMessage" : e.toString() }}});
	});
});

module.exports = router;
