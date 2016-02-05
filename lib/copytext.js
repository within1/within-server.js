// copytext reading module
var Promise = require('bluebird');
var parse = require('csv-parse');
var fs = require("fs");

module.exports = Promise.promisify(function(cfn, cb) {
	var cdata = {};
	var k = parse(fs.readFileSync(cfn, "utf8"), {relax:true}, function(err, out) {
		for (var i = 0; i < out.length; i++) {
			if (out[i].length != 2)
				continue;
			cdata[out[i][0]] = out[i][1];
		}
		cb(null, {
			get : function(name) {
				if (cdata[name] === undefined)
					return "";
				return cdata[name];
			}
		});
	});
});


if (!module.parent) {
	var k = module.exports("../copytext.csv").then(function(copytext) {
		console.log(copytext.get("WithinFromEmail"));
	})
}
