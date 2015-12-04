// Indexing all Entities in the database using Elastic Search

var elasticsearch = require('elasticsearch');
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js').elastic[env];
var async 	  = require("async");

console.log(config);
var client = new elasticsearch.Client(config);
var models  = require('../models');


/*
client.ping({hello: "elastic search"}, function(err) {
	console.log(err);
})
*/

// index all the users, along with tags
function indexUsers(cb) {
	async.parallel({
		"users" : function(cb) {
			models.sequelize.query("SELECT * FROM users u", { type: models.sequelize.QueryTypes.SELECT}).then(function(items) { cb(null, items); });
		},
		"tags" : function(cb) {
			models.sequelize.query("SELECT u.ID as uid, ti.*, t.* FROM TagInstances ti join Users u on ti.OwnerID = u.EntityID join Tags t on t.ID = ti.TagID").then(function(tags) { cb(null, tags); });
		},
		"schools" : function(cb) {
			models.sequelize.query("SELECT ue.UserID as uid, s.* FROM UserEducations ue join Schools s on ue.SchoolID = s.ID").then(function(items) { cb(null, items); });
		},
		"employers" : function(cb) {
			models.sequelize.query("SELECT ue.UserID as uid, e.* FROM UserEmployments ue join Employers e on ue.EmployerID = e.ID").then(function(items) { cb(null, items); });
		}
	}, function(err, data) {
		// add interest & skill tags
		var skilltags = {};
		var interesttags = {};
		data["tags"][0].map(function(item) {
			if (item["Type"] == 1) {
				if (skilltags[item["uid"]] === undefined)
					skilltags[item["uid"]] = [];
				skilltags[item["uid"]].push(item["Name"]);
			} else if (item["Type"] == 3) {
				if (interesttags[item["uid"]] === undefined)
					interesttags[item["uid"]] = [];
				interesttags[item["uid"]].push(item["Name"]);
			}
		});
		// add school & employment tags
		var schools = {};
		data["schools"][0].map(function(item) {
			if (schools[item["uid"]] === undefined)
				schools[item["uid"]] = [];
			schools[item["uid"]].push(item["Name"]);
		});
		var empl = {};
		data["employers"][0].map(function(item) {
			if (empl[item["uid"]] === undefined)
				empl[item["uid"]] = [];
			empl[item["uid"]].push(item["Name"]);
		})
		async.map(data["users"], function(citem, cb) {
			if (skilltags[citem["ID"]] !== undefined)
				citem["skilltags"] = skilltags[citem["ID"]];
			if (interesttags[citem["ID"]] !== undefined)
				citem["interesttags"] = interesttags[citem["ID"]];
			if (schools[citem["ID"]] !== undefined)
				citem["schools"] = schools[citem["ID"]];
			if (empl[citem["ID"]] !== undefined)
				citem["employers"] = empl[citem["ID"]];
			client.index({"id" : citem["ID"], "index" : config["index"], "type" : "user", "body" : citem }, function(err, res) {
				cb(null, res);
			});
		}, function(err, res) {
			console.log(res);
			console.log("Users reindexed");
			cb(null);
		})
	});
}

// match specific user using the main ranking algorithm
function matchUser(uid, cb) {
	client.get({"index" : config["index"], "type" : "user", "id" : uid },
		function(err, cuser) {
			if (err !== undefined) {
				return cb(err,null);
			}
			client.search({"index" : config["index"], "type" : "user",
				body : {
					"explain": true,
					"query": {
						"function_score" : {
							"functions" : [
								{"filter" : { "term" : {"employers" : "milkbone"}},  weight: 10
								},
								{"filter" : { "terms" : {"skilltags" : ["enterprise", "operations"] }},  weight: 40
								},
							],
							"score_mode" : "sum",
							"boost_mode" : "replace",
						}
					}
				}
			} ).then(function(resp) {
				console.log(JSON.stringify(resp,0,4)); process.exit(1);
			});

		}
	);
}


// script called directly; reindex all users
if (!module.parent) {
	if (process.argv.length < 3) {
		console.log("Usage: searchindex.js [reindex / search]");
		process.exit(1);
	}
	if (process.argv[2] == "reindex") {
		indexUsers(function(err) {
			process.exit(0);
		});
	} else  {
		matchUser(21, function(err, items) {
			console.log(items);
		});
	}
};






