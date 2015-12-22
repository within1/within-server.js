var models = require("../models");


 models.Users.findById(1, {include: [
			{ model : models.UserRatings, separate: true, as:"UserRatingsRated" }
	]}).then(function(userinfo) {

		console.log(userinfo);
	});