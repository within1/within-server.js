// user-related general functions

var models  = require('../models');
var apilib = require("../lib/apilib.js");
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var notif = require("../lib/notifications.js");
var lifecycle = require("../lib/lifecycle.js");

var journeySort = require("../lib/userjourneysort.js");

// helper functions for user info

// copyies specific values from source array; returns array containing those values only
// optionally fills the array with specific empty values, if no previous value found
function copyValues(source, vals, emptyvals) {
	var res = {};
	for (var i in vals) {
		res[vals[i]] = source[vals[i]];
	}
	for (var i in emptyvals)
		if (res[emptyvals[i]] === undefined)
			res[emptyvals[i]] = "";
	return res;
}

function copyPrivateUserInfo(userdata) {
	var vals = copyValues(userdata, ["AppStatus",  "DateAppStatusModified",  "DateLastActivity",  "DeviceToken",  "EmailAddress",  "FacebookID",  "IsAdmin",  "LinkedInID",  "ShouldSendEmailNotifications",  "ShouldSendPushNotifications",  "Token"] );
	return apilib.formatAPICall(vals, ["DateAppStatusModified", "DateLastActivity"]);
}

function copyPublicUserInfo(userdata) {
	var vals = copyValues(userdata, ["AboutUser", "Birthday", "DateCreated", "DateModified", "FirstName", "Gender", "ID", "ImageURL", "IsTeamWithin", "LastName", "Locale", "Timezone", "Title" ] );
	return apilib.formatAPICall(vals, ["Birthday", "DateCreated", "DateModified"]);
}

function getUserTags(userdata, tagtype) {
	var cue = [];
	for (var k in userdata["Entity"]["TagInstances"]) {
		if (userdata["Entity"]["TagInstances"][k]["Type"] == tagtype)
			cue.push(userdata["Entity"]["TagInstances"][k]);
	}
	var res = [];
	for (var i in cue) {
		res.push(apilib.formatAPICall({"DateCreated" : cue[i]["DateCreated"], "DateModified" : cue[i]["DateModified"], "ID" : cue[i]["ID"],
			"TagName" : cue[i]["Tag"]["Name"], "TagType" : cue[i]["Type"], "UserID" : userdata["ID"]  },
			["DateCreated", "DateModified"] ));
	}
	return res;
}

function copyUserLocations(userdata) {
	var cul = [];
	for (var i in userdata["UserLocations"]) {
		var k = copyValues(userdata["UserLocations"][i], ["DateCreated", "DateModified", "Description", "ID", "JourneyIndex", "LocationType", "UserID"]);
		k["Name"] = userdata["UserLocations"][i]["Location"]["Name"];
		cul.push(apilib.formatAPICall(k, ["DateCreated", "DateModified"]));
	}
	return cul;
}

function copyUserEducation(userdata) {
	var cul = [];
	for (var i in userdata["UserEducations"]) {
		var k = copyValues(userdata["UserEducations"][i], ["DateCreated", "DateModified", "Degree", "Description", "EndMonth", "EndYear", "ID", "JourneyIndex", "Major", "StartMonth", "StartYear", "UserID"]);
		k["EndMonth"] = (k["EndMonth"] == -1)?("Present"):(k["EndMonth"]);
		k["EndYear"] = (k["EndYear"] == -1)?("Present"):(k["EndYear"]);
		k["Name"] = userdata["UserEducations"][i]["Name"];

		if ((userdata["UserEducations"][i]["Location"] !== undefined) && (userdata["UserEducations"][i]["Location"] != null))
			k["Location"] = userdata["UserEducations"][i]["Location"]["Name"];

		cul.push(apilib.formatAPICall(k, ["DateCreated", "DateModified"]));
	}
	return cul;
}


function copyUserEmployment(userdata) {
	var cul = [];
	for (var i in userdata["UserEmployments"]) {
		var k = copyValues(userdata["UserEmployments"][i], ["DateCreated", "DateModified", "Summary", "Title", "EndMonth", "EndYear", "ID", "JourneyIndex", "StartMonth", "StartYear", "UserID" ]);
		k["EndMonth"] = (k["EndMonth"] == -1)?("Present"):(k["EndMonth"]);
		k["EndYear"] = (k["EndYear"] == -1)?("Present"):(k["EndYear"]);
		if ((userdata["UserEmployments"][i]["Employer"] !== undefined) && (userdata["UserEmployments"][i]["Employer"] !== null))
			k["EmployerName"] = userdata["UserEmployments"][i]["Name"];
		k["Location"] = "";
		if ((userdata["UserEmployments"][i]["Location"] !== undefined) && (userdata["UserEmployments"][i]["Location"] != null))
			k["Location"] = userdata["UserEmployments"][i]["Location"]["Name"];
		cul.push(apilib.formatAPICall(k, ["DateCreated", "DateModified"]));
	}
	return cul;
}


// returns the user info in DB storable format from an AddEditFacebookUser JSON request
function getUserModelInfo(json) {
	return copyValues(json, ["FirstName", "LastName", "EmailAddress", "FacebookID", "Gender", "ShouldSendPushNotifications", "ShouldSendEmailNotifications", "Birthday", "DeviceToken", "Title", "FacebookAccessToken"], ["FirstName", "LastName"]);
}
// -------------------------------
// sanitizing education, and employment infos
var eduTerms = ["university", "of ", "the ", "a ", "college", "colleges", "at ", "U "];
var employmentTerms = [" inc", "company", "the ", "and ", "of ", "at ", " co", " llc", "incorporated", "corporation", " corp" ];

// returns Promise<ID> for given location's name; auto-creates location, if not found
function getLocationID(name) {
	if (name === undefined)
		name = "";
	return models.Locations.findOne({where : {"Name" : name} })
	.then(function(locationModel) {
		if (locationModel != null) {
			return locationModel;
		}
		// create new location
		return models.Locations.create({"DateCreated" : dateFormat(new Date(), "isoUtcDateTime"), "Name" : name, "Coordinates" : "" });
	})
	.then(function(locationModel) {
		return locationModel["ID"];
	})
}

// returns Promise<ID> for given school's name; auto-creates school, if not found
function getSchoolID(name) {
	if (name === undefined)
		name = "";
	name = name.toLowerCase();
	for (var i in eduTerms) {
		name = name.replace(eduTerms[i], "");
	}
	return models.Schools.findOne({where : {"Name" : name } })
	.then(function(schModel) {
		if (schModel != null) {
			return schModel;
		}
		// create new school
		return models.Entities.create({"EntityTypeID" : 3})
		.then(function(newEntity) {
			centity = newEntity;
			return models.Schools.create({"DateCreated" : dateFormat(new Date(), "isoUtcDateTime"), "Name" : name, "EntityID" : newEntity["ID"] });
		})
	})
	.then(function(schModel) {
		return schModel["ID"];
	});
}

// returns Promise<ID> for given employer's name; auto-creates employer, if not found
function getEmploymentID(name) {
	if (name === undefined)
		name = "";
	name = name.toLowerCase();
	for (var i in employmentTerms) {
		name = name.replace(eduTerms[i], "");
	}
	return models.Employers.findOne({where : {"Name" : name } })
	.then(function(eModel) {
		if (eModel != null) {
			return eModel;
		}
		// create new employer
		return models.Entities.create({"EntityTypeID" : 2})
		.then(function(newEntity) {
			centity = newEntity;
			return models.Employers.create({"DateCreated" : dateFormat(new Date(), "isoUtcDateTime"), "Name" : name, "EntityID" : newEntity["ID"] });
		})
	})
	.then(function(eModel) {
		return eModel["ID"];
	});
}


// returns Promise<ID> for given tag; auto-creates tag, if not found
function getTagID(name) {
	if (name === undefined)
		name = "";
	return models.Tags.findOne({where : {"Name" : name}})
	.then(function(eTag) {
		if (eTag != null)
			return eTag;
		// create new Tag
		return models.Entities.create({"EntityTypeID" : 1})
		.then(function(newEntity) {
			centity = newEntity;
			return models.Tags.create({"DateCreated" : dateFormat(new Date(), "isoUtcDateTime"), "Name" : name, "EntityID" : newEntity["ID"], "Types" : "0,1,2,3,4,5" });
		})
	})
	.then(function(eModel) {
		return eModel["ID"];
	});
}

// returns the average of thank-you stars
function getAverageThanks(userid) {
	return models.sequelize.query('SELECT avg(Rating) as avg FROM UserRatings where RatedID = ? and isDeletedByRatedUser = 0',{ replacements: [ userid ] , type: models.sequelize.QueryTypes.SELECT})
	.then(function(cntdata) {
		if ((cntdata.length == 0) || (cntdata[0]["avg"] == null))
			return 0;
		return cntdata[0]["avg"];
	});
}

// returns the number of thankyous for a user
function getNumberOfThankYous(userid) {
	return models.sequelize.query('SELECT count(ID) as cnt FROM UserRatings where RatedID = ? and isDeletedByRatedUser = 0',{ replacements: [ userid ] , type: models.sequelize.QueryTypes.SELECT})
	.then(function(cntdata) {
		return cntdata[0]["cnt"];
	});
}

// formats a rating list according to API
function formatRatings(cr) {
	var res = copyValues(cr, ["ID", "Comments", "DateCreated"]);
	res["NumbersOfStars"] = cr["Rating"];
	res["RatingUserID"] = cr["RaterID"];
	res["UserID"] = cr["RatedID"];
	res = apilib.formatAPICall(res, ["DateCreated"] );
	res["UserDetail"] = copyValues(cr["UserRatingsRater"], ["FirstName", "ImageURL", "LastName"]);
	res["UserDetail"]["ID"] = cr["UserRatingsRater"]["UserID"];
	res["UserDetail"] = apilib.formatAPICall(res["UserDetail"], []);
	return res;
}


// returns the last thankyous for the user
function getLatestUserThankYous(userid) {
	return models.UserRatings.findAll({where : {"RatedID" : userid, isDeletedByRatedUser : 0, Comments : {ne : ""} }, order : [ ["DateCreated" , "DESC"] ], limit : 1, include : [
		{ model : models.Users, as : "UserRatingsRater" }
	] })
	.then(function(ratinglist) {
		if (ratinglist.length == 0)
			return [];
		var res = formatRatings(ratinglist[0]);
		return [res];
	})
}

// returns all user ratings for given user; paginates every 10 ratings
function getUserRatings(userid, pagenumber) {
	var skipcount = 0;
	if (pagenumber !== undefined)
		skipcount = 10 * (pagenumber - 1);
	return models.UserRatings.findAll({where : {"RatedID" : userid, isDeletedByRatedUser : 0 }, order : [ ["DateCreated" , "DESC"] ], limit : 10, offset : skipcount, include : [
		{ model : models.Users, as : "UserRatingsRater" }
	] })
	.then(function(ratinglist) {
		var res = [];
		for (var i in ratinglist)
			res.push(formatRatings(ratinglist[i]));
		return res;
	})
}

// validates the passed in tokens; returns with the user's model
function validateToken(userid, usertoken) {
	return models.Users.findAll({where: {ID : userid, Token : usertoken}})
	.then(function(userlist) {
		if (userlist.length == 0)
			throw "Valid token required";
		return userlist[0];
	});
}

// validates the passed in tokens to be coming from an admin user; returns with the admin's model
function validateAdminToken(adminid, admintoken) {
	return models.Users.findAll({where: {ID : adminid, Token : admintoken, IsAdmin : 1 }})
	.then(function(userlist) {
		if (userlist.length == 0)
			throw "Valid admin token required";
		return userlist[0];
	});
}

// returns with the public information of the user
function getPublicUserInfo(userid, includePrivate) {
	var resdata = {};
	console.log(userid, includePrivate);
	return models.Users.findById(userid, {include: [
			{ model : models.UserEducations, separate: true, include: [models.Schools]},
			{ model : models.UserEmployments, separate: true, include: [models.Employers, models.Locations]},
			{ model : models.UserLocations, separate: true, include: [models.Locations] },
			{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }] }
	]})
	.then(function(userdata) {
		if (includePrivate)
			resdata["PrivateUserInformation"] = copyPrivateUserInfo(userdata);
		resdata["PublicUserInformation"] = copyPublicUserInfo(userdata);
		if (userdata["ImageURL"] == null)
			resdata["PublicUserInformation"]["ImageURL"] = null;
		resdata["PublicUserInformation"]["GetUserSkill"] = getUserTags(userdata, 1);
		resdata["PublicUserInformation"]["GetUserBreakTheIce"] = getUserTags(userdata, 2);
		resdata["PublicUserInformation"]["GetUserWant"] = getUserTags(userdata, 3);
		resdata["PublicUserInformation"]["GetUserWhyHere"] = getUserTags(userdata, 4);
		resdata["PublicUserInformation"]["GetUserLocation"] = copyUserLocations(userdata);

		resdata["PublicUserInformation"]["GetUserEducation"] = copyUserEducation(userdata);
		resdata["PublicUserInformation"]["GetUserEmployment"] = copyUserEmployment(userdata);
		resdata["PublicUserInformation"]["UserReferralCode"] = "dummy code";
		return true;
	})
	.then(function() { return getNumberOfThankYous(userid); })
	.then(function(cnt) {
		resdata["PublicUserInformation"]["NumberOfThankYous"] = cnt.toString();
	})
	.then(function() { return getLatestUserThankYous(userid); })
	.then(function(latest) {
		resdata["PublicUserInformation"]["GetLatestUserThankYous"] = latest;
		return resdata;
	});
}


function UpdateUserActivityAndNotifications(userid) {
	return models.Users.findOne({where: {ID : userid }})
	.then(function(cuser) {
		if (cuser == null)
			throw "UpdateUserActivityAndNotifications User not found "+userid;
		return cuser.update({DateLastActivity : dateFormat(new Date(), "isoUtcDateTime") });
	})
	.then(function(cuser) { return lifecycle.UpdateInactivityEmail(cuser); })
	.then(function() { return apilib.eventlog(userid, "User Activity")});
}


// creates a new user
function createNewUser(req) {
	// add new user
	console.log("New user creation");
	var centity = null;
	var usermodel = null;
	return models.Entities.create({"EntityTypeID" : 1})
	.then(function(newEntity) {
		centity = newEntity;
		return models.Referrals.create({"ReferralCode" : "dummy code"});
	})
	// create usermodel
	.then(function(newref) {
		var userinfo = getUserModelInfo(req.body);
		if (userinfo["Birthday"] === undefined)
			userinfo["Birthday"] = dateFormat( new Date(), "isoUtcDateTime");
		userinfo["IsTestUser"] = 0;
		userinfo["DateCreated"] = dateFormat( new Date(), "isoUtcDateTime");
		userinfo["DateModified"] = dateFormat( new Date(), "isoUtcDateTime");
		userinfo["DateLastActivity"] = dateFormat( new Date(), "isoUtcDateTime");
		userinfo["EntityID"] = centity["ID"];
		userinfo["IsAdmin"] = 0;
		userinfo["AppStatus"] = 0;
		userinfo["NumberOfFlags"] = 0;
		userinfo["NumberOfFlagsGiven"] = 0;
		userinfo["IsTeamWithin"] = 0;
		userinfo["ReferralID"] = newref["ID"];
		userinfo["DateAppStatusModified"] = dateFormat( new Date(), "isoUtcDateTime");
		userinfo["Token"] = Math.random().toString(36).substring(2);
		if (userinfo["ShouldSendEmailNotifications"] === undefined)
			userinfo["ShouldSendEmailNotifications"] = (req.body["ShouldSendEmailNotifications"] === undefined)?("1"):(req.body["ShouldSendEmailNotifications"]);
		if (userinfo["ShouldSendPushNotifications"] === undefined)
			userinfo["ShouldSendPushNotifications"] = (req.body["ShouldSendPushNotification"] === undefined)?("1"):(req.body["ShouldSendPushNotification"]);
		return models.Users.create(userinfo);
	})
	.then(function(cuser) {
		usermodel = cuser;
		console.log("Device token: ",req.body["DeviceToken"]);
		// remove this devicetokens from all other users
		if ((req.body["DeviceToken"] == null) || (req.body["DeviceToken"] == ""))
			return;
		return models.sequelize.query('update users set DeviceToken = null where DeviceToken = ? and ID != ?',{ replacements: [ req.body["DeviceToken"], usermodel["ID"] ] , type: models.sequelize.QueryTypes.UPDATE})
	})
	// add notifications
	//Send Welcome Email Notification
	.then(function() { return notif.SendEmailNotification(usermodel, 0, notif.emailTypes["TypeEmailWelcomeToWithin"], "","","","");  })
	// Create Incomplete Onboarding Email Notification
	.then(function() { return notif.SendEmailNotification(usermodel, 24, notif.emailTypes["TypeEmailIncompleteOnboarding"], "","","","");  })
	// update activity
	.then(function() { return UpdateUserActivityAndNotifications(usermodel["ID"]) })
	.then(function() {
		return usermodel;
	})
}

// returns a promise for adding all tags for given user
function addTags(usermodel, json, ctype ) {
	return models.TagInstances.destroy({where : {"OwnerID" : usermodel["EntityID"] }})
	.then(function() {
		// get all tag IDs
		return Promise.map(json, function(ctag) {
			return getTagID(ctag["TagName"]);
		})
		.then(function(tagids) {
			console.log("Tagids: ",tagids);
			var alltags = [];
			for (var i in tagids) {
				var ctag = {"TagID" : tagids[i], "OwnerID" : usermodel["EntityID"], "Type" : ctype};
				ctag["DateCreated"] = dateFormat( new Date(), "isoUtcDateTime");
				ctag["DateModified"] = dateFormat( new Date(), "isoUtcDateTime");
				alltags.push(ctag);
			}
			return models.TagInstances.bulkCreate(alltags);
		})
	});
}

function updateBasicInfo(usermodel, req) {
	var userinfo = getUserModelInfo(req.body);
	var cupd = {};
	for (var i in userinfo) {
		if ((userinfo[i] != "") && (userinfo[i] != null) && (userinfo[i] != usermodel[i]) ) {
			console.log("Updating "+i+" (was:  "+usermodel[i]+"  -> "+userinfo[i]);
			cupd[i] = userinfo[i];
		}
	}
	if ((usermodel["Token"] == null) && ((req.body["Token"] === undefined) || (req.body["Token"] == null)))
		cupd["Token"] = Math.random().toString(36).substring(2);
	if (Object.keys(cupd).length > 0)
		return models.Users.update(cupd, {where : {ID : usermodel["ID"]}});
	else
		return true;
}

// parallel updating of all user-related info
function updateUser(usermodel, req) {
	var updateOps = [];
	// update locations
	if ( (req.body["UserLocation"] !== undefined) && (req.body["UserLocation"] != null)) {
		updateOps.push(
			models.UserLocations.destroy({where: {"UserID" : usermodel["ID"]}})
			.then(function() {
				// get all the location IDs
				return Promise.map(req.body["UserLocation"], function(loc) {
					return getLocationID(loc["Name"]);
				})
				.then(function(ids) {
					console.log("location IDs: ",ids);
					var newuserlocs = [];
					for (var i in req.body["UserLocation"]) {
						var cloc = copyValues(req.body["UserLocation"][i], ["LocationType", "JourneyIndex"]);
						cloc["LocationID"] = ids[i];
						cloc["UserID"] = usermodel["ID"];
						cloc["DateCreated"] = dateFormat( new Date(), "isoUtcDateTime");
						cloc["DateModified"] = dateFormat( new Date(), "isoUtcDateTime");
						newuserlocs.push(cloc);
					}
					return models.UserLocations.bulkCreate(newuserlocs);
				});
			})
		);
	}
	// returns the school/employer IDs & location info from given UserEducation / UserEmployment model
	var idPull = function(propname, propidfunc) {
		return function(item) {
			var ci = null;
			var cname = "";
			if (item["Name"] !== undefined)
				cname = item["Name"];
			else if (item[propname] !== undefined)
				cname = item[propname];
			else
				cname = "";
			return propidfunc(cname)
			.then(function(pid) {
				ci = pid;
				if ((item["Location"] == undefined) || (item["Location"] == null))
					return [pid, null];
				return getLocationID(item["Location"])
				.then(function(locid) {
					return [pid, locid];
				})
			})
		}
	};
	if ( (req.body["UserEducation"] !== undefined) && (req.body["UserEducation"] != null)) {
		updateOps.push(
			models.UserEducations.destroy({where: {"UserID" : usermodel["ID"]} })
			.then(function() {
				// get all school IDs
				return Promise.map(req.body["UserEducation"], idPull("SchoolName", getSchoolID))
				.then(function(ids) {
					console.log("School IDs ", ids);
					var newschools = [];
					for (var i in req.body["UserEducation"]) {
						var csch = copyValues(req.body["UserEducation"][i], ["Degree", "StartMonth", "StartYear", "EndYear", "EndMonth", "Description", "Major", "JourneyIndex", "Name"], ["Name"]);
						csch["Name"] = (csch["Name"] === undefined)?(""):(csch["Name"]);
						csch["EndYear"] = (csch["EndYear"] == "Present")?(-1):(csch["EndYear"]);
						csch["EndMonth"] = (csch["EndMonth"] == "Present")?(-1):(csch["EndMonth"]);
						csch["SchoolID"] = ids[i][0];
						if (ids[i][1] != null)
							csch["LocationID"] = ids[i][1];
						csch["UserID"] = usermodel["ID"];
						csch["DateCreated"] = dateFormat( new Date(), "isoUtcDateTime");
						csch["DateModified"] = dateFormat( new Date(), "isoUtcDateTime");
						newschools.push(csch);
					}
					return models.UserEducations.bulkCreate(newschools);
				})
			})
		);
	}
	if ( (req.body["UserEmployment"] !== undefined) && (req.body["UserEmployment"] != null)) {
		updateOps.push(
			models.UserEmployments.destroy({where: {"UserID" : usermodel["ID"]} })
			.then(function() {
				// get all employment, and related location IDs
				return Promise.map(req.body["UserEmployment"], idPull("EmployerName", getEmploymentID) )
				.then(function(ids) {
					console.log("Emplyment IDs ", ids);
					var newempl = [];
					for (var i in req.body["UserEmployment"]) {
						var cempl = copyValues(req.body["UserEmployment"][i], ["Title", "StartMonth", "StartYear", "EndYear", "EndMonth", "Summary", "JourneyIndex"]);
						cempl["EndYear"] = (cempl["EndYear"] == "Present")?(-1):(cempl["EndYear"]);
						cempl["EndMonth"] = (cempl["EndMonth"] == "Present")?(-1):(cempl["EndMonth"]);
						cempl["EmployerID"] = ids[i][0];
						if (ids[i][1] != null)
							cempl["LocationID"] = ids[i][1];
						cempl["UserID"] = usermodel["ID"];
						cempl["DateCreated"] = dateFormat( new Date(), "isoUtcDateTime");
						cempl["DateModified"] = dateFormat( new Date(), "isoUtcDateTime");
						cempl["Name"] = req.body["UserEmployment"][i]["EmployerName"];
						cempl["Name"] = (cempl["Name"] === undefined)?(""):(cempl["Name"]);
						newempl.push(cempl);
					}
					return models.UserEmployments.bulkCreate(newempl);
				})
			})

		);
	}
	if ( (req.body["UserSkills"] !== undefined) && (req.body["UserSkills"] != null) ) {
		updateOps.push( addTags(usermodel, req.body["UserSkills"], 1) );
	}
	if ( (req.body["UserBreakTheIces"] !== undefined) && (req.body["UserBreakTheIces"] != null) ) {
		updateOps.push( addTags(usermodel, req.body["UserBreakTheIces"], 2) );
	}
	if ( (req.body["UserWants"] !== undefined) && (req.body["UserWants"] != null) ) {
		updateOps.push( addTags(usermodel, req.body["UserWants"], 3) );
	}
	updateOps.push( updateBasicInfo(usermodel, req) );

	// execute all updates
	return Promise.all(updateOps)
	.then(function() {
		return journeySort.userJourneySort(usermodel["ID"]);
	})
}

module.exports = {
			"copyValues" : copyValues,
			"validateToken" : validateToken, "validateAdminToken" : validateAdminToken,
			"getLocationID" : getLocationID,
			"getAverageThanks" : getAverageThanks, "getNumberOfThankYous" : getNumberOfThankYous, "getLatestUserThankYous" : getLatestUserThankYous,
			"getUserRatings" : getUserRatings,
			"getPublicUserInfo" : getPublicUserInfo,
			"createNewUser" : createNewUser, "updateUser" : updateUser,
			"UpdateUserActivityAndNotifications" : UpdateUserActivityAndNotifications
		};
