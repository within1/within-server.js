// copytext reading module
var parse = require("csv-parse/lib/sync");
var fs = require("fs");

// initalize CSV copytext
var cdata = {};
var out = parse(fs.readFileSync(__dirname + "/../copytext.csv", "utf8"), {relax:true});

for (var i = 0; i < out.length; i++) {
	if (out[i].length != 2)
		continue;
	cdata[out[i][0]] = out[i][1];
}

module.exports = function(name) {
	if (cdata[name] === undefined)
		throw "copytext name "+name+" not found";
	return cdata[name];
}

if (!module.parent) {
	console.log(module.exports("WithinTeamFirstMessageCopy"));
}
