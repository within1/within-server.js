// main tester functions
var assert = require('assert');
var request = require("request");
var argv = require('minimist')(process.argv.slice(2));
console.log(argv);

module.exports = function(name, testData) {
	var url = "http://127.0.2.2/api/";
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
	    this.timeout(60000);
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
	            		console.error("Result statuscode: "+res.statusCode);
	            		console.error(body);
	            		return done("invalid statuscode "+res.statusCode);
	            	}
	            	if (debug)
	                	console.log(JSON.stringify(body,0,4));
	                // check against expectations
	                var checkResults = function(expect, ctree) {
	                	for (var k in expect) {
	                		if (ctree[k] === undefined)
	                			return k+" not found in "+JSON.stringify(body,0,4);
	                		if (expect[k] instanceof Object) {
	                			return checkResults(expect[k], ctree[k]);
	                		}
	                		assert.equal(ctree[k], expect[k]);
	                	}
	                	return "";
	                };
	                var chkres = checkResults(cm["expect"], body);
	                if (chkres != "")
	                	return done(chkres);
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
