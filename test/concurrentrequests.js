// problem: multiple concurrent requests to getmatches where no matches existed before results in bogus results
// this script takes a user persona as input, removes all matches to it, and calls the getmatches API on 2 threads simultaneously

var request = require("request");
// use the live DB for these
process.env.NODE_ENV = "local";
var models  = require('../models');
var persona = require("./persona.js")();
var async = require("async");
var dateFormat = require('dateformat');


console.log(persona);
var baseurl = "http://within.local/api/";
models.Matches.update( { MatchExpireDate : dateFormat( new Date(), "isoUtcDateTime") } , {where : { $or : [ { ReachingOutUserID :  persona["UserID"] },  { OtherUserID : persona["UserID"] }] } })
.then(function() {
	console.log("Doing N async requests...");
	var creq = function(cb) {
		var tm = Math.floor( Math.random() * 3000);
		console.log("Waiting "+tm);
		setTimeout(function() {
			request({uri: baseurl+"GetMatchesForUser", method: "POST", json : {
		    	"UserID" : persona["UserID"],
		    	"UserToken" : persona["UserToken"],
		    } }, function(error, res, body) {
		    	cb(error, body);
		    });
		}, tm);
	};
	var zerowait = function(cb) {
		request({uri: baseurl+"GetMatchesForUser", method: "POST", json : {
	    	"UserID" : persona["UserID"],
	    	"UserToken" : persona["UserToken"],
	    } }, function(error, res, body) {
	    	cb(error, body);
	    });
	};
	async.parallel({
		"z0" : zerowait,
		"z1" : zerowait,
		"z2" : zerowait,
		"t1" : creq,
		"t2" : creq,
		"t3" : creq,
		"t4" : creq,
		"t5" : creq,
		"t6" : creq,
		"t7" : creq
	}, function(err, data) {
		console.log(err);
		console.log(data);
		console.log("Final request to cross-check");
		return models.Matches.findAll({where : { $or : [ { ReachingOutUserID :  persona["UserID"] },  { OtherUserID : persona["UserID"] }] }, raw: true })
		.then(function(cr) {
			console.log(cr);
			if (cr.length != 1)
				console.log("should have one match, instead of "+cr.length );
		})
	});
});

