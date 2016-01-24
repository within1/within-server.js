// returns the persona for use in API calls

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');

module.exports = function() {
	var pfn = "persona_default.js";
	if (argv["persona"] !== undefined) {
		pfn = argv["persona"];
	}
	if (!fs.existsSync(__dirname+"/"+pfn)) {
		console.error("Persona "+pfn+" not found");
		process.exit(1);
	}
	var cdata = JSON.parse(fs.readFileSync(__dirname+"/"+pfn));
	return cdata;
}

