var models = require("../models");

	models.Users.findById(1, {include: [
		{ model : models.UserEducations, separate: true, include: [models.Schools] },
		{ model : models.UserEmployments, separate: true, include: [models.Employers]},
		{ model : models.Entities, include: [{model: models.TagInstances, separate: true, include: [models.Tags] }]  },
		{ model : models.Matches, separate: true },
		{ model : models.Matches, separate: true, through : "ReachingOutUserID", as : "ReachingOutUser" }
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
