var models = require("../models");
var dateFormat = require('dateformat');

function eventlog(userid, name) {
	var newLog = {DateCreated: dateFormat( new Date(), "isoUtcDateTime"), UserID : userid, EventName : name};
	if (arguments.length > 2)
		newLog["ParamInt"] = arguments[2];
	if (arguments.length > 3)
		newLog["ParamStr"] = arguments[3];
	if (arguments.length > 4)
		newLog["ParamStr2"] = arguments[4];
	return models.Events.create(newLog);
}

eventlog("1", "tester");
