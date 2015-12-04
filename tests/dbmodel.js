var models = require("../models");

models.sequelize.getQueryInterface().describeTable("UserEducations").then(function(attr) {
	console.log(attr);
});
