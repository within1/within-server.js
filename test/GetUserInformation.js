// GetMessageThread API tests

var assert = require('assert');
var request = require("request");

// var url = "http://127.0.2.2/WithinWCF/";
// var url = "http://localhost:60033/";
var url = "http://app.within.guru/WithinTest/Service1.svc/";

var validToken = "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I27OvOdslDh7ctrNSHsbFYAtMI8XLPNx3IfF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ";

describe("GetUserInformation", function() {
	this.timeout(15000);
	/*
	it("should reject invalid tokens", function(done) {
		request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : "4073", "UserToken" : "invalid"}}, function(error, res, body) {
			assert.equal(error, null);
			var infoResult = res["body"];
			console.log(res);
			assert.equal(infoResult["GetUserInformationResult"]["Status"]["Status"], 0);
			assert.equal(infoResult["GetUserInformationResult"]["Status"]["StatusMessage"], "Unauthorized");
			// console.log(JSON.stringify(,0,4));
			done(null);
		});
	}); */
	it("should respond with a full GetUserInformationResult for valid token", function(done) {
		request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : "4073", "UserToken" : validToken }}, function(error, res, body) {
			assert.equal(error, null);
			console.log(error);
			console.log(res);
			console.log(body);
			return done(null);
			var infoResult = res["body"];
			console.log(res.body.toString());
			assert.notEqual(infoResult["GetUserInformationResult"]["Status"]["StatusMessage"], "Unauthorized");
			assert.notEqual(infoResult["GetUserInformationResult"]["PrivateUserInformation"]["AppStatus"], 0);
			assert.equal(infoResult["GetUserInformationResult"]["PrivateUserInformation"]["EmailAddress"], firstUser["EmailAddress"]);
			apicmp("GetUserInformation", infoResult);
			console.log(JSON.stringify(infoResult,0,4)) ;
			return done(null);
		});
	});
});
