var assert = require('assert');
var request = require("request");

// var url = "http://127.0.2.2/WithinWCF/";
var url = "http://127.0.2.2/api/";
var validToken = "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I/7AtzG7h11zX7yDAylMvmg00thD6v961ofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ";

describe("GetContactCardDetails", function() {
	this.timeout(15000);
	it("should reject invalid tokens", function(done) {
		request({uri: url+"GetContactCardDetails", method: "POST", json : {"UserID" : "1", "UserToken" : "invalid", "OtherUserID" : "invalid"}}, function(error, res, body) {
			assert.equal(error, null);
			var infoResult = res["body"];
			console.log(infoResult);
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["Status"], 0);
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["StatusMessage"], "Unauthorized");
			// console.log(JSON.stringify(,0,4));
			done(null);
		});
	});
	it("should respond with an empty GetContactCardDetailsResult for valid token, and no contact card", function(done) {
		request({uri: url+"GetContactCardDetails", method: "POST", json : {"UserID" : "1", "UserToken" : validToken, "OtherUserID" : "2"}}, function(error, res, body) {
			var infoResult = res["body"];
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["Status"], 0);
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["StatusMessage"], "No records found!");
			done(null);
		});
	});

	it("should respond with an full GetContactCardDetailsResult for valid token, and existing contactcard", function(done) {
		request({uri: url+"GetContactCardDetails", method: "POST", json : {"UserID" : "1", "UserToken" : validToken, "OtherUserID" : "4"}}, function(error, res, body) {
			var infoResult = res["body"];
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["Status"], 1);
			assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["StatusMessage"], "");
			assert.notEqual(infoResult["GetContactCardDetailsResult"]["GetContactCardDetail"]["Email"], "");
			done(null);
		});

	});
});
