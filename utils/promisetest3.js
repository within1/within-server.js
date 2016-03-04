// multi-map promise test

process.env.NODE_ENV = "live";
var models = require("../models");
var Promise = require('bluebird');
var request = require("request");

models.Users.findAll({where : { ID : { $gt : 4181}, FacebookAccessToken : { $ne : null } }, raw : true}).then(function(u) {
	var allpr = [];
	for (var cu in u) {
		allpr.push(function(cuser) {
			var cu = 0;
			console.log(" 1: ",cu);
			return models.Users.findOne({where : { ID : cuser["ID"]}})
			.then(function(ci) {
				console.log(cu);
				if (ci == null) {
					console.log(cuser["ID"]);
				}
			});
		}(u[cu]));
		console.log(" 2: ",cu);
	}
	Promise.all(allpr);

});
