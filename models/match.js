// Searching for matches of users

var models  = require('../models');
var Promise = require('bluebird');
var async = require("async");
var QueryInterface = models.sequelize.getQueryInterface();

// converts the queried user data into the model used in SQL queries
function userDataToModel(udata) {
	var citem = { };

	// console.log(JSON.stringify(udata ,0,4));
	// process.exit(1);

	for (var ci in udata) {
		if (!((udata[ci] instanceof Object) || (udata[ci] instanceof Array) || (ci == "Token") || (ci == "DeviceToken")))
			citem[ci] = udata[ci];
	}
	citem["schools"] = [];
	citem["majors"] = [];
	citem["degrees"] = [];
	citem["gradyear"] = 0;
	for (var ci in udata["UserEducations"]) {
		citem["schools"].push(udata["UserEducations"][ci]["School"]["ID"] );
		citem["majors"].push(udata["UserEducations"][ci]["Major"] );
		citem["degrees"].push(udata["UserEducations"][ci]["Degree"] );
		if (udata["UserEducations"][ci]["EndYear"] > citem["gradyear"])
			citem["gradyear"] = udata["UserEducations"][ci]["EndYear"];
	}
	citem["employers"] = [];
	citem["roles"] = [];
	for (var ci in udata["UserEmployments"]) {
		citem["employers"].push(udata["UserEmployments"][ci]["Employer"]["ID"] );
		citem["roles"].push(udata["UserEmployments"][ci]["Title"]);
	}

	citem["locations"] = [];
	citem["currentlocation"] = 0;
	for (var ci in udata["UserLocations"]) {
		if ((citem["hometown"] === undefined) && (udata["UserLocations"][ci]["LocationType"] == 1)) {
			citem["hometown"] = udata["UserLocations"][ci]["Location"]["ID"];
		}
		citem["locations"].push(udata["UserLocations"][ci]["Location"]["ID"])
		if (udata["UserLocations"][ci]["JourneyIndex"] == -1)
			citem["currentlocation"] = udata["UserLocations"][ci]["Location"]["ID"];

	}
	citem["skills"] = [];
	citem["icebreakers"] = [];
	citem["interests"] = [];
	if (udata["Entity"] !== undefined) {
		for (var i in udata["Entity"]["TagInstances"]) {
			var cti = udata["Entity"]["TagInstances"][i];
			if (cti["Type"] == 1)
				citem["skills"].push(cti["Tag"]["ID"]);
			else if (cti["Type"] == 2)
				citem["icebreakers"].push(cti["Tag"]["ID"]);
			else if (cti["Type"] == 3)
				citem["interests"].push(cti["Tag"]["ID"] );
		}
	}
	citem["ageblock"] = 0;
	if (udata["Birthday"] !== undefined) {
		var agesec = new Date() - udata["Birthday"];
		var ageyear = Math.floor(agesec / (1000*60*60*24*365));
		var cyear = new Date().getYear() + 1900;
		if (ageyear <= 24)
			citem["ageblock"] = "birthday >= '"+(cyear-24)+"-01-01'";
		else if ((25 <= ageyear ) && (ageyear <= 28))
			citem["ageblock"] = "birthday <= '"+(cyear-24)+"-01-01' and birthday >= '"+(cyear-28)+"-01-01'";
		else if ((29 <= ageyear ) && (ageyear <= 32))
			citem["ageblock"] = "birthday <= '"+(cyear-28)+"-01-01' and birthday >= '"+(cyear-32)+"-01-01'";
		else
			citem["ageblock"] = "birthday >= '"+(cyear-32)+"-01-01'";
	}
	return citem;
}


function getVectors(cuser) {
	return {
		"sameuser" : function(cb) {
			return cb(null, [{"id" : cuser["ID"]}] );
		},
		"testuser" : function(cb) {
			if (cuser["IsTestUser"] == 1)
				return models.Users.findAll( {where : { IsTestUser : false}, attributes: ['ID'], raw: true }).then(function(res) { return cb(null, res); });
			else
				return models.Users.findAll( {where : { IsTestUser : true}, attributes: ['ID'], raw: true }).then(function(res) { return cb(null, res); });
		},
		"alreadymatched" : function(cb) {
			models.sequelize.query("SELECT ReachingOutUserID , OtherUserID FROM Matches where ReachingOutUserID = ? or OtherUserID = ?", { replacements: [cuser["ID"], cuser["ID"] ], type: models.sequelize.QueryTypes.SELECT})
			.then(function(res) {
				var ures = [];
				for (var i in res) {
					if (res[i]["ReachingOutUserID"] == cuser["ID"])
						ures.push({"id" : res[i]["OtherUserID"]})
					else if (res[i]["OtherUserID"] == cuser["ID"])
						ures.push({"id" : res[i]["ReachingOutUserID"]})
					else
						throw "Neither reachingout, nor otheruser corresponds to target user ID "+cuser["ID"]+" "+JSON.stringify(res[i]);
				}
				cb(null, ures);
			});
		},
		"gender" : function(cb) {
			if (cuser["Gender"] == null)
				return cb(null, []);
			return models.Users.findAll( {where : {Gender : cuser["Gender"]}, attributes: ['ID'], raw: true }).then(function(res) { return cb(null, res); });
		},
		"hometown" : function(cb) {
			return models.sequelize.query("SELECT distinct(u.id) FROM Users u left join UserLocations ul on ul.UserID = u.ID where LocationType = 1 and LocationID = ?", { replacements: [cuser["hometown"] ], type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"ReachSkill2OfferedSkill" : function(cb) {
			if (cuser["skills"].length == 0)
				return cb(null, []);
			var skilltags = cuser["skills"].join(", ");
			return models.sequelize.query("SELECT u.id, TagID FROM Users u left join TagInstances ti on u.EntityID = ti.OwnerID where Type = 1 and TagID in ("+skilltags+")", {  type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"ReachSkill2OfferedInterest" : function(cb) {
			if (cuser["skills"].length == 0)
				return cb(null, []);
			var skilltags = cuser["skills"].join(", ");
			return models.sequelize.query("SELECT u.id, TagID FROM Users u left join TagInstances ti on u.EntityID = ti.OwnerID where Type = 3 and TagID in ("+skilltags+")", {  type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"ReachInterest2OfferedSkill" : function(cb) {
			if (cuser["interests"].length == 0)
				return cb(null, []);
			var intereststags = cuser["interests"].join(", ");
			return models.sequelize.query("SELECT u.id, TagID FROM Users u left join TagInstances ti on u.EntityID = ti.OwnerID where Type = 1 and TagID in ("+intereststags+")", {  type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"ReachInterest2OfferedInterest" : function(cb) {
			if (cuser["interests"].length == 0)
				return cb(null, []);
			var intereststags = cuser["interests"].join(", ");
			return models.sequelize.query("SELECT u.id, TagID FROM Users u left join TagInstances ti on u.EntityID = ti.OwnerID where Type = 3 and TagID in ("+intereststags+")", {  type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"ReachBTI2OfferedBTI" : function(cb) {
			if (cuser["icebreakers"].length == 0)
				return cb(null, []);
			var btitags = cuser["icebreakers"].join(", ");
			return models.sequelize.query("SELECT u.id, TagID FROM Users u left join TagInstances ti on u.EntityID = ti.OwnerID where Type = 2 and TagID in ("+btitags+")", {  type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"gradyear" : function(cb) {
			if (cuser["gradyear"] == 0)
				return cb(null, []);
			return models.sequelize.query("select UserID as id from (SELECT UserID, max(EndYear) as gradyear FROM [dbo].[UserEducations] group by UserID ) as t where gradyear = ?",{  type:  models.sequelize.QueryTypes.SELECT, replacements: [cuser["gradyear"] ]  }).then(function(res) { cb(null, res); });
		},
		"SharedEducation" : function(cb) {
			var edutags = cuser["schools"].join(", ");
			return models.sequelize.query("select UserID as id, SchoolID from UserEducations ue where SchoolID in ("+edutags+")",{ replacements: [cuser["ID"] ], type:  models.sequelize.QueryTypes.SELECT }).then(function(res) { cb(null, res); });
		},
		"SharedMajor" : function(cb) {
			var majors = [];
			for (var i in cuser["majors"])
				majors.push( QueryInterface.escape(cuser["majors"][i]) );
			majors = majors.join(", ");
			return models.sequelize.query("select UserID as id, Major from UserEducations ue where Major in ("+majors+")",{ type:  models.sequelize.QueryTypes.SELECT  }).then(function(res) { cb(null, res); });
		},
		"SharedDegree" : function(cb){
			var degrees = [];
			for (var i in cuser["degrees"])
				degrees.push( QueryInterface.escape(cuser["degrees"][i]) );
			degrees = degrees.join(", ");
			return models.sequelize.query("select UserID as id, Degree from UserEducations ue where Degree in ("+degrees+")",{ type:  models.sequelize.QueryTypes.SELECT  }).then(function(res) { cb(null, res); });
		},
		"CurrentLocation" : function(cb) {
			if (cuser["currentlocation"] == 0)
				return cb(null, []);
			return models.sequelize.query("select UserID as id from UserLocations where JourneyIndex = -1 and LocationID = ?",{  type:  models.sequelize.QueryTypes.SELECT, replacements: [cuser["currentlocation"] ]  }).then(function(res) { cb(null, res); });
		},
		"SharedEmployment" : function(cb) {
			if (cuser["employers"].length == 0)
				return cb(null, []);
			var empltags = cuser["employers"].join(", ");
			return models.sequelize.query("select UserID as id, EmployerID from UserEmployments ue where EmployerID in ("+empltags+")",{ type:  models.sequelize.QueryTypes.SELECT }).then(function(res) { cb(null, res); });
		},
		"SharedRole" : function(cb) {
			if (cuser["roles"].length == 0)
				return cb(null, []);
			var roles = [];
			for (var i in cuser["roles"])
				roles.push( QueryInterface.escape(cuser["roles"][i]) );
			roles = roles.join(", ");
			return models.sequelize.query("select UserID as id, EmployerID from UserEmployments ue where Title in ("+roles+")",{ type:  models.sequelize.QueryTypes.SELECT  }).then(function(res) { cb(null, res); });
		},
		"AgeRangeFit" : function(cb) {
			if (cuser["ageblock"] == 0)
				return cb(null, []);
			return models.sequelize.query("select ID from Users where "+cuser["ageblock"],{ type:  models.sequelize.QueryTypes.SELECT  }).then(function(res) { cb(null, res); });
		},
		"isTeamWithin" : function(cb) {
			return models.sequelize.query("select ID from Users where isTeamWithin = 1",{ type:  models.sequelize.QueryTypes.SELECT  }).then(function(res) { cb(null, res); });
		}
	}
}

var vectorWeights = {
	"sameuser" : -10000,
	"testuser" : -10000,
	"alreadymatched" : -10000,
	"isTeamWithin" : -10000,
	"gender" : 1,
	"hometown" : 1,
	"ReachSkill2OfferedSkill" : 1,
	"ReachSkill2OfferedInterest" : 2,
	"ReachInterest2OfferedSkill" : 6,
	"ReachInterest2OfferedInterest" : 1,
	"ReachBTI2OfferedBTI" : 1,
	"gradyear" : 1,
	"SharedEducation" : 3,
	"SharedMajor" : 1,
	"SharedDegree" : 1,
	"CurrentLocation" : 1,
	"SharedEmployment" : 2,
	"SharedRole" : 1,
	"AgeRangeFit" : 4,
}

function matchUser(uid, maxmatch, cb) {
	models.Users.findOne( {where : { ID : uid}, include: [
		{ model : models.UserEducations, separate: true, include: [models.Schools]},
		{ model : models.UserEmployments, separate: true, include: [models.Employers]},
		{ model : models.UserLocations, separate: true, include: [models.Locations]},
		{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
	]})
	.then(function(data) {
		var data = data.get({plain : true});
		var cuser = userDataToModel(data);
		// console.log(JSON.stringify(cuser,0,4)); process.exit(0);
		var vectors = getVectors(cuser);
		var asyncparallel = Promise.promisify(async.parallel);
		return asyncparallel(vectors);
	})
	.then(function(cdata) {
		var res = { };
		// console.log(JSON.stringify(cdata,0,4)); process.exit(0);
		// aggregate all the vectors
		for (var k in cdata) {
			for (var i in cdata[k]) {
				var cid = cdata[k][i]["ID"];
				if (cid === undefined)
					cid = cdata[k][i]["id"];
				if (cid === undefined)
					throw "no user id found in "+JSON.stringify(cdata[k], 0, 4);
				if (res[cid] === undefined) {
					res[cid] = {"id" : cid, "totalscore" : 0, vectors : { }};
				}
				if (res[cid]["vectors"][k] === undefined)
					res[cid]["vectors"][k] = [cdata[k][i]];
				else
					res[cid]["vectors"][k].push(cdata[k][i]);
				if (vectorWeights[k] === undefined)
					throw k+" has no weight defined";
				res[cid]["totalscore"] += vectorWeights[k];
			}
		}
		// sort candidates by total score
		var ures = [];
		for (var k in res) {
			if (res[k]["totalscore"] >= 0)
				ures.push(res[k]);
		}
		ures.sort(function(a,b) {
			if (a["totalscore"] > b["totalscore"])
				return -1;
			return (a["totalscore"] == b["totalscore"])?(0):(1);
		});
		// console.log(JSON.stringify(ures,0,4));
		if (maxmatch == 0)
			cb(ures);
		else
			cb(ures.splice(0,maxmatch));
	});
}


module.exports = {matchUser : matchUser, vectorWeights : vectorWeights};

if (!module.parent) {
	matchUser(39, 0, function(res) {
		console.log(res);
		process.exit(0);
	})
}

