var models = require("../models");

	models.Users.findAll({include: [
		{ model : models.Entities, include: [{model: models.TagInstances,
			include: [
				{model: models.Tags, required: true }
			] }
		]}
	] }).then(function(scp) {
	  console.log(JSON.stringify(scp,0,4));
	});


/*



models.Users.findAll({where: {FirstName : "Bill"}, include: [{model : models.UserEducations, separate: true, include: [models.Schools]}, {model : models.UserEmployments, separate: true, include: [models.Employers]}  ] }).then(function(scp) {
  console.log(JSON.stringify(scp,0,4));
});


models.Users.findById(42).then(function(u) {
	console.log(u);
});
*/
