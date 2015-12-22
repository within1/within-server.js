var models = require("../models");

models.Users.findAll({where : { FacebookID : "990952180947706" }})
.then(function(u) {
	var cu = u[0];
	cu["DeviceToken"] = "tester";
	cu["DateLastActivity"] = new Date().toISOString();
	return cu.save();
})
.then(function(res) {
	console.log(res);
})