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
			else if ((datecols !== undefined) && (datecols.indexOf(k) != -1))
				data[k] = dateFormat(data[k], "mm/dd/yyyy HH:MM:ss", true);
			else if (data[k] == null)
				data[k] = "";
			else if ((data[k] instanceof Object) || (data[k] instanceof Array))
				data[k] = this.formatAPICall(data[k]);
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

	errorhandler : function(resultname, req, res) {
		return function(e) {
			console.error(e);
			console.error(e.stack);
			var err = {};
			err[resultname] = {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }};
			res.json(err);
		};
	},
	// updates an instance from specific array's values; or create a new array if target is null
	update : function(trg, src, vals) {
		if (trg == null)
			trg = {};
		for (var i in vals)
			trg[vals[i]] = src[vals[i]];
		return trg;
	}
};
