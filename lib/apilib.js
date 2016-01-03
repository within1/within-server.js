// general functions for all API calls

var Promise = require('bluebird');
var dateFormat = require('dateformat');
var models  = require('../models');
var copytext = require("../lib/copytext.js");

module.exports = {

	// require specific parameters for an API call
	requireParameters : Promise.promisify(function(req, paramlist, cb) {
		paramlist.forEach(function(c) {
			if (req.body[c] === undefined)
				throw  c+" parameter was either null or an empty string. A valid "+c+" is required";
		});
		cb(null);
	}),


	// formats API call results per specification:
	// Null parameters are interpreted as “there is no update for the parameter”; empty parameters (e.g. an empty array or an empty string) are interpreted as “the parameter should be updated to an empty value”
	// Date response parameters are in “MM/DD/YYYY HH:MM:SS” format
	formatAPICall : function(data, datecols) {
		for (var k in data) {
			if (data[k] === true)
				data[k] = "True";
			else if (data[k] === false)
				data[k] = "False";
			else if (datecols.indexOf(k) != -1)
				data[k] = dateFormat(data[k], "mm/dd/yyyy HH:MM:ss");
			else if (data[k] == null)
				data[k] = "";
			else
				data[k] = data[k].toString();
		}
		return data;
	},

	// logs a single event
	eventlog: function(userid, name) {
		var newLog = {DateCreated: dateFormat( new Date(), "isoUtcDateTime"), UserID : userid, EventName : name};
		if (arguments.length > 2)
			newLog["ParamInt"] = arguments[2];
		if (arguments.length > 3)
			newLog["ParamStr"] = arguments[3];
		if (arguments.length > 4)
			newLog["ParamStr2"] = arguments[4];
		return models.Events.create(newLog);
	},
	// validates the passed in tokens; returns with the user's model
	validateToken : function(userid, usertoken) {
		return models.Users.findAll({where: {ID : userid, Token : usertoken}})
		.then(function(userlist) {
			if (userlist.length == 0)
				throw "Valid token required";
			return userlist[0];
		});
	},

	UpdateInactivityEmail : function(cuser) {
		if (!cuser["ShouldSendEmailNotifications"]) {
			if (cuser["InactivityEmailNotificationID"] != null) {
				cuser["InactivityEmailNotificationID"] = null;
				return cuser.save();
			}
			return true;
		}
		// email notification should be sent out
		if (cuser["InactivityEmailNotificationID"] != null) {
			// update existing notification
			return models.Notifications.findOne({where: {ID: cuser["InactivityEmailNotificationID"] }})
			.then(function(cnotif) {
				cnotif.DateTarget = dateFormat( new Date(Date.now() + 6*24*60*60* 1000), "isoUtcDateTime");
				cnotif.DateSent = null;
				cnotif.HasSent = false;
				return cnotif.save();
			});
		} else {
			return copytext("./copytext.csv")
			.then(function(textvalues) {
				return models.Notifications.create({
					DateCreated : dateFormat( new Date(), "isoUtcDateTime"),
				});
			})
			// create new notification
		}
	},

	UpdateUserActivityAndNotifications : function(userid) {
		return models.Users.findOne({where: {ID : userid }})
		.then(function(cuser) {
			if (cuser == null)
				throw "UpdateUserActivityAndNotifications User not found "+userid;
			return cuser.update({DateLastActivity : dateFormat(new Date(), "isoUtcDateTime") });
		})
		.then(function(cuser) { return module.exports.UpdateInactivityEmail(cuser); })
		.then(function() { return module.exports.eventlog(userid, "User Activity")});
	}
};
