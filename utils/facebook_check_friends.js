process.env.NODE_ENV = "live";
var models = require("../models");
var Promise = require('bluebird');
var request = require("request");
var match = require("../lib/match.js");

function getFacebookFriends(cuser, cb) {
	var reslist = [];
	var cpage = 0;
	var webget = function(url) {
		// console.log(url);
		request(url, function(err,res,body) {
			if ((err != null) || (res.statusCode != 200)) {
				console.error("facebook request statuscode "+res.statusCode+", error: "+err+" for user "+cuser["ID"]+" pulling "+url);
				return cb(null, [] );
			}

			var cinfo = JSON.parse(body);
			Array.prototype.push.apply(reslist,cinfo["data"]);
			if ((cinfo["paging"] == undefined) || (cinfo["paging"]["next"] === undefined))
				return cb(null, reslist);
			setTimeout(function() { webget(cinfo["paging"]["next"]) },0);
		});
	};
	webget("https://graph.facebook.com/v2.5/"+cuser["FacebookID"]+"/friends?limit=500&offset=0&format=json&access_token="+cuser["FacebookAccessToken"]);
}

var prfbfriends = Promise.promisify(getFacebookFriends);


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

