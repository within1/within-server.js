// Indexing all Users in the database using Elastic Search

var elasticsearch = require('elasticsearch');
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js').elastic[env];
var async 	  = require("async");

console.log(config);
var client = new elasticsearch.Client(config);
var models  = require('../models');

// delete all previous userdata

function deleteIndex(cb) {
	client.indices.delete({
		index: config["index"],
	}, function(err, res) {
		console.log(err, res);
		return client.indices.create({index: config["index"] }, function(err, res) {
			console.log(err, res);
			cb(null);
		});
	});
}

// converts the queried user data into the model used in elastic search
function userDataToModel(udata) {
	var citem = { };

	// console.log(JSON.stringify(udata ,0,4));
	// process.exit(1);

	for (var ci in udata) {
		if (!((udata[ci] instanceof Object) || (udata[ci] instanceof Array) || (ci == "Token") || (ci == "DeviceToken")))
			citem[ci] = udata[ci];
	}
	citem["schools"] = [];
	for (var ci in udata["UserEducations"]) {
		citem["schools"].push(udata["UserEducations"][ci]["School"]["Name"].toLowerCase() );
	}
	citem["locations"] = [];
	for (var ci in udata["UserLocations"]) {
		if ((citem["hometown"] === undefined) && (udata["UserLocations"][ci]["LocationType"] == 1))
			citem["hometown"] = udata["UserLocations"][ci]["Location"]["Name"].toLowerCase();
		citem["locations"].push(udata["UserLocations"][ci]["Location"]["Name"].toLowerCase())
	}
	citem["skills"] = [];
	citem["icebreakers"] = [];
	citem["wants"] = [];
	if (udata["Entity"] !== undefined) {
		for (var i in udata["Entity"]["TagInstances"]) {
			var cti = udata["Entity"]["TagInstances"][i];
			if (cti["Type"] == 1)
				citem["skills"].push(cti["Tag"]["Name"].toLowerCase());
			else if (cti["Type"] == 2)
				citem["icebreakers"].push(cti["Tag"]["Name"].toLowerCase());
			else if (cti["Type"] == 3)
				citem["wants"].push(cti["Tag"]["Name"].toLowerCase());
		}
	}
	return citem;
}

// index all the users, along with tags / locations / etc data
function indexUsers(cb) {
	models.Users.findAll( {include: [
		{ model : models.UserEducations, separate: true, include: [models.Schools]},
		{ model : models.UserEmployments, separate: true, include: [models.Employers]},
		{ model : models.UserLocations, separate: true, include: [models.Locations]},
		{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
	]}).then(function(data) {
		var resdat = [];
		for (var i in data) {
			var k = data[i].get({plain : true});
			citem = userDataToModel(k);
			resdat.push(citem);
		}
		async.map(resdat, function(citem, cb) {
			console.log("adding to index "+citem["ID"]);
			client.index({"id" : citem["ID"], "reindex" : "true", "index" : config["index"], "type" : "user", "body" : citem }, function(err, res) {
				cb(null, res);
			});
		}, function(err, res) {
			console.log("index finished");
			process.exit(0);
		});
		// console.log(JSON.stringify(resdat,0,4));
	})
}

// returns the full vector lowercased
function lowerCaseVector(a) {
	var res = [];
	for (var i in a)
		res.push(a[i].toLowerCase())
	return res;
}

// feature vectors to base ranking on
var vectors = {
	"testuser" : function(cuser) {
		if (cuser["IsTestUser"])
			return {"filter" : { "term" : {"IsTestUser" : "false"}},  weight: -10000 }
		else
			return {"filter" : { "term" : {"IsTestUser" : "true"}},  weight: -10000 }
	},
	"reachSkill-OfferedSkill" : function(cuser) {
		var res = [];
		var skilllist = lowerCaseVector(cuser["skills"]);
		for (var k in skilllist)
			res.push({"filter" : { "term" : {"skills" : skilllist[k]}},  weight: 1 });
		return res;
	},
	"hometown" : function(cuser) {
		if ((cuser["hometown"] !== undefined) && (cuser["hometown"] != ""))
			return {"filter" : { "term" : {"hometown" : cuser["hometown"].toLowerCase() }},  weight: 10 };
		return null;
	},
	"gender" : function(cuser) {
		if ((cuser["Gender"] !== undefined) && (cuser["Gender"] != ""))
			return {"filter" : { "term" : {"Gender" : cuser["Gender"].toLowerCase() }},  weight: 10 };
		return null;
	}

}

function matchUser(uid, cb) {
	models.Users.findOne( {where : { ID : uid}, include: [
		{ model : models.UserEducations, separate: true, include: [models.Schools]},
		{ model : models.UserEmployments, separate: true, include: [models.Employers]},
		{ model : models.UserLocations, separate: true, include: [models.Locations]},
		{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
	]}).then(function(data) {
		var data = data.get({plain : true});
		var cuser = userDataToModel(data);
		var allfilterfunctions = [];
		for (var i in vectors) {
			cf = vectors[i](cuser);
			if (cf != null) {
				if (cf instanceof Array)
					for (var k in cf)
						allfilterfunctions.push(cf[k]);
				else
					allfilterfunctions.push(cf);
			}
		}
		console.log(JSON.stringify(allfilterfunctions,0,4));
		return client.search({"index" : config["index"], "type" : "user",
				body : {
					"explain": true,
					"query": {
						"function_score" : {
							query: { match_all: {} },
							"functions" : allfilterfunctions,
							"score_mode" : "sum",
							"boost_mode" : "replace",
						}
					}
				}
			})
	}).then(function(resp) {
		console.log(JSON.stringify(resp,0,4)); process.exit(1);
	});
}

function qtest() {
	client.search({"index" : config["index"], "type" : "user",
				body : {
					"explain": true,
					"query": {
						"function_score" : {
							query: { match_all: {} },
							"functions" : [
								{"filter" : { "terms" : {"hometown" : ["seattlish"] }},  weight: 15 },
							],
							"score_mode" : "sum",
							"boost_mode" : "replace",
						}
					}
				}
	}).then(function(resp) {
		console.log(JSON.stringify(resp,0,4)); process.exit(1);
	});
}

// script called directly; reindex all users
if (!module.parent) {
	if (process.argv.length < 3) {
		console.log("Usage: searchindex.js [reindex / delete / match]");
		process.exit(1);
	}
	if (process.argv[2] == "reindex") {
		indexUsers(function(err) {
			process.exit(0);
		});
	} else if (process.argv[2] == "delete") {
		deleteIndex(function(err) {
			process.exit(0);
		});
	} else if (process.argv[2] == "qtest") {
		qtest(function(err) {
			process.exit(0);
		});
	} else  if (process.argv[2] == "match") {
		matchUser(process.argv[3], function(err, items) {
			console.log(items);
		});
	}
};
