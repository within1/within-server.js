var assert = require('assert');
var config    = require(__dirname + '/../config.js');
var request = require("request");

var models = null;
var firstUser = null;
var APIResponses = {};
var APIlist = {"nodejs" : "http://127.0.2.2/api/legacy/", "legacy server" : "http://127.0.2.2/WithinWCF/" };

describe("infrastructure", function() {
	// access the network with a 5 second timeout
	this.timeout(15000);
	describe("SQL Server", function() {
		it("should connect", function() {
			models  = require('../models');
		});
		it("should get first user", function(done) {
			models.Users.findAll({limit:3}).then(function(res) { firstUser = res[1]; done(null); }).error(function(error) { done(error); });
		});
	});

	describe("elastic search connection", function() {
		it("should connect", function() {
			var search = require("../models/search.js");
		});
	});

	var prevAPICalls = {};
	var apicmp = function(funcname, data) {
		if (prevAPICalls[funcname] == null)
			prevAPICalls[funcname] = data;
		assert.deepEqual(prevAPICalls[funcname], data);
		return true;
	};

	var apitest = function(name, url) {
		describe("API calls for "+name+" at "+url, function() {
			describe("GetUserInformation", function() {
				it("should reject invalid tokens", function(done) {
					request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : "1", "UserToken" : "invalid"}}, function(error, res, body) {
						assert.equal(error, null);
						var infoResult = res["body"];
						assert.equal(infoResult["GetUserInformationResult"]["Status"]["Status"], 0);
						assert.equal(infoResult["GetUserInformationResult"]["Status"]["StatusMessage"], "Unauthorized");
						// console.log(JSON.stringify(,0,4));
						done(null);
					});
				});
				it("should respond with a full GetUserInformationResult for valid token", function(done) {
					request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : firstUser["ID"], "UserToken" : firstUser["Token"] }}, function(error, res, body) {
						assert.equal(error, null);
						var infoResult = res["body"];
						console.log(res);
						assert.notEqual(infoResult["GetUserInformationResult"]["Status"]["StatusMessage"], "Unauthorized");
						assert.notEqual(infoResult["GetUserInformationResult"]["PrivateUserInformation"]["AppStatus"], 0);
						assert.equal(infoResult["GetUserInformationResult"]["PrivateUserInformation"]["EmailAddress"], firstUser["EmailAddress"]);
						apicmp("GetUserInformation", infoResult);
						console.log(JSON.stringify(infoResult,0,4)) ;
						return done(null);
					});
				});
			});
			describe("AddEditFacebookUser", function() {
				it("should create new user", function(done) {
					console.log(url);
					request({uri: url+"AddEditFacebookUser", method: "POST", json : {"FacebookID" : "990952180947706" }}, function(error, res, body) {
						var infoResult = res["body"];
						// console.log(infoResult);
						done(null);
					});
				});
			});
		});
	};

	// apitest("legacy server" , "http://localhost:60033/");

	apitest("legacy server" , "http://127.0.2.2/WithinWCF/" );
	apitest("nodejs server" , "http://127.0.2.2/api/" );
/*
	for (var k in APIlist) {
		apitest(k, APIlist[k]);
	}
*/
	describe("API calls for both legacy, and new API", function() {

	});
});

// comparison of API calls between legacy, and new API

// Data integrity
