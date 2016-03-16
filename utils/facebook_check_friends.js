process.env.NODE_ENV = "live";
var models = require("../models");
var Promise = require('bluebird');
var request = require("request");
var match = require("../lib/match.js");

var prfbfriends = Promise.promisify(match.getFacebookFriends);


models.Users.findAll({where : { FacebookAccessToken : { $ne : null } }, raw : true}).then(function(u) {
	var allpr = [];
	for (var cu in u) {
		allpr.push(function(cuser) {
			return prfbfriends(cuser)
			.then(function(cu) {
				if (cu.length == 0)
					return true;
				var callpr = [];
				// console.log(cu);
				for (var i in cu) {
					callpr.push(function(cfbid) {
						var otheruser = null;
						return models.Users.findOne({where : {FacebookID : cfbid["id"]}})
						.then(function(cuid) {
							if (cuid != null) {
								otheruser = cuid["ID"];
								return match.getExistingMatch(cuid["ID"], cuser["ID"])
							}
							return null;
						})
						.then(function(cm) {
							if (cm != null) {
								console.log("Match found between FB friends: "+otheruser+" - "+cuser["ID"]);
							}
						})
					}(cu[i]));
				}
			})
		}(u[cu]));
	}
	Promise.all(allpr);
});

