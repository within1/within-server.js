
var models  = require('../models');

models.Users.findAll( {where : { AppStatus : { $ne : 2}}, attributes: ['ID'], raw: true })
.then(function(res) {
	console.log(res);
});
