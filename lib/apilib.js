// general functions for all API calls

var Promise = require('bluebird');
var dateFormat = require('dateformat');
var models  = require('../models');


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

	// validates the passed in tokens; returns with the user's model
	validateToken : function(userid, usertoken) {
		return models.Users.findAll({where: {ID : userid, Token : usertoken}})
		.then(function(userlist) {
			if (userlist.length == 0)
				throw "Valid token required";
			return userlist[0];
		});
	},


	UpdateUserActivityAndNotifications : function(userid) {

	}
};
