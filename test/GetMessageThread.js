// GetMessageThread API tests

var assert = require('assert');
var request = require("request");

// var url = "http://127.0.2.2/WithinWCF/";
var url = "http://localhost:60033/";

var validToken = "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc0mhb1DzDq0EzXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIlx43DPPRh+5uQzOzP8bob7ckkNvE7yB9HbeZVS5I1BhjHA3/8Ac2Qf0+sjkHb8mKk/bSO1NammUS3jYXzGPcYv7AtzG7h11zX7yDAylMvmg00thD6v961ofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ";

describe("GetMessageThread", function() {
	this.timeout(15000);
	it("should reject invalid tokens", function(done) {
		request({uri: url+"GetMessageThread", method: "POST", json : {"UserID" : "123", "UserToken" : "qwdqwd", "SenderID" : "123", "MessageCount" : 1 }}, function(error, res, body) {
			assert.equal(error, null);
			var infoResult = res["body"];
			console.log(infoResult);
			// assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["Status"], 0);
			// assert.equal(infoResult["GetContactCardDetailsResult"]["Status"]["StatusMessage"], "Unauthorized");
			// console.log(JSON.stringify(,0,4));
			done(null);
		});
	});

	it("should return with 5 messages", function(done) {
		request({uri: url+"GetMessageThread", method: "POST", json : {"UserID" : "1", "UserToken" : validToken, "SenderID" : "2", "MessageCount" : 5 }}, function(error, res, body) {
			assert.equal(error, null);
			var infoResult = res["body"];
			console.log(JSON.stringify(infoResult,0,4));
			done(null);
		});

	})
});

