var gm = require('gm').subClass({imageMagick: true});

var Promise = require('bluebird');
var autoOrient = Promise.promisify(function(fn,cb) { gm(fn).autoOrient().write(fn, function(err, res) {cb(err, res) }) });
var thumbnail = Promise.promisify(function(fn, outfn, minwidth,minheight, quality, cb) { gm(fn).thumb(minwidth, minheight, outfn, quality, function(err, res) {cb(err, res) }) });


return autoOrient("./imagemagicktest.jpg")
.then(function(cres) {
	console.log(cres);
})