// sort users' journey by dates
var models  = require('../models');

function userJourneySort(userid) {
	return models.Users.findOne( { where : {ID : userid}, include: [
			{ model : models.UserEducations, separate: true, include: [models.Schools]},
			{ model : models.UserEmployments, separate: true, include: [models.Employers, models.Locations]},
			{ model : models.UserLocations, separate: true, include: [models.Locations] },
	]})
	.then(function(data) {
		var allItems = [];
		for (var i in data["UserEducations"])
			allItems.push(data["UserEducations"][i])
		for (var i in data["UserEmployments"])
			allItems.push(data["UserEmployments"][i])
		getItemDate = function(item) {
			if (item["Employer"] !== undefined)
				return [item["StartYear"], item["StartMonth"]]
			else
				return [item["EndYear"], item["EndMonth"]]
		};

		allItems.sort(function(a,b) {
			var adate = getItemDate(a);
			var bdate = getItemDate(b);
			if (adate[0] > bdate[0])
				return 1;
			if (adate[0] < bdate[0])
				return -1;
			if (adate[1] == null)
				return 1;
			if (bdate[1] == null)
				return -1;
			return (adate[1] <= bdate[1])?(-1):(0);
		})

		var updateOps = [];
		var ci = 1;
		allItems.forEach(function(a) {
			if (a["JourneyIndex"] != ci)
				updateOps.push( function() {
					a["JourneyIndex"] = ci;
					return a.save();
				}() )
			ci += 1;
		})
		return Promise.all(updateOps);
	})
	.then(function() {
		return true;
	})
}

module.exports = {"userJourneySort" : userJourneySort}

if (!module.parent) {
    console.log("Testing user journey sort")
    return userJourneySort(171)
    .then(function(e) {
        console.log(e);
        process.exit();
    })
}