var assert = require('assert');
var config    = require(__dirname + '/../config.js');
var request = require("request");

var models = null;
var firstUser = null;
var APIResponses = {};
var APIlist = {"nodejs" : "http://127.0.2.2/api/legacy/", "legacy server" : "http://127.0.2.2/WithinWCF/" };

describe("infrastructure", function() {
	// access the network with a 5 second timeout
	this.timeout(5000);
	describe("SQL Server", function() {
		it("should connect", function() {
			models  = require('../models');
		});
		it("should get first user", function(done) {
			models.Users.findAll({limit:1}).then(function(res) { firstUser = res[0]; done(null); }).error(function(error) { done(error); });
		});
	});

	describe("elastic search connection", function() {
		it("should connect", function() {
			var search = require("../models/search.js");
		});
	});

	var apitest = function(name, url) {
		describe("API calls for "+name+" at "+url, function() {
			describe("GetUserInformation", function() {
				it("should reject invalid tokens", function(done) {
					request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : "1", "UserToken" : "invalid"}}, function(error, res, body) {
						var infoResult = res["body"];
						assert.equal(infoResult["GetUserInformationResult"]["Status"]["Status"], 0);
						assert.equal(infoResult["GetUserInformationResult"]["Status"]["StatusMessage"], "Unauthorized");
						// console.log(JSON.stringify(,0,4));
						done(null);
					});
				});
				it("should respond with a full GetUserInformationResult for valid token", function(done) {
					console.log(firstUser["Token"]);
					request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : firstUser["ID"], "UserToken" : firstUser["Token"] }}, function(error, res, body) {
						var infoResult = res["body"];
						console.log(infoResult);
						done(null);
					});
				});
			});
		});
	};

	apitest("legacy server" , "http://127.0.2.2/WithinWCF/" );
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


