// CheckForUserFromFacebookID API tests

var assert = require('assert');
var request = require("request");

// var url = "http://127.0.2.2/WithinWCF/";
var url = "http://localhost:60033/";

var validToken = "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I/7AtzG7h11zX7yDAylMvmg00thD6v961ofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ";
/*
describe("CheckForUserFromFacebookID", function() {
	this.timeout(15000);
	it("should reject invalid tokens", function(done) {
		request({uri: url+"CheckForUserFromFacebookID", method: "POST", json : {"FacebookID" : "485521818275419", "DeviceToken" : validToken }}, function(error, res, body) {
			assert.equal(error, null);
			var infoResult = res["body"];
			console.log(infoResult);
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["Status"], 0);
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["StatusMessage"], "Unauthorized");
			// console.log(JSON.stringify(,0,4));
			done(null);
		});
	});
});

*/