// main tester functions
var assert = require('assert');
var request = require("request");
var argv = require('minimist')(process.argv.slice(2));
console.log(argv);

module.exports = function(name, testData) {
	var url = "http://dev.within.guru/WithinWCF/";
	var compare = null;
	var debug = false;
	if (argv["url"] !== undefined)
		url = argv["url"];
	if (argv["compare"] !== undefined)
		compare = argv["compare"];
	if (argv["print"] !== undefined)
		debug = true;
	console.log("Using API URL "+url)
	describe(name, function() {
	    this.timeout(15000);
	    testData.forEach(function(cm) {
	        it(cm["msg"], function(done) {
	        	if (debug)
		            console.log("Posting ",url+cm["url"],"\ndata: ",JSON.stringify(cm["postdata"]));
	            request({uri: url+cm["url"], method: "POST", json : cm["postdata"] }, function(error, res, body) {
	            	if (error != null) {
	            		console.log(JSON.stringify(error,0,4));
	            		return done(error);
	            	}
	            	if (res.statusCode != 200) {
	            		console.log("Result statuscode: "+res.statusCode);
	            		return done("invalid statuscode "+res.statusCode);
	            	}
	            	if (debug)
	                	console.log(JSON.stringify(body,0,4));
	                if (!compare)
		                return done(null);
		            // compare with other API's URL
		            if (debug)
		            	console.log("Comparing with ",compare+cm["url"],"\ndata: ",JSON.stringify(cm["postdata"]));
		            request({uri: compare+cm["url"], method: "POST", json : cm["postdata"] }, function(error, rescmp, bodycmp) {
		            	assert.deepEqual(res["body"], rescmp["body"]);
		            });
	            });
	        });
	    })
	});
}
