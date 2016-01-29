// notification sending background service

var models  = require('../models');
var dateFormat = require('dateformat');

models.Notifications.findAll({where : {HasSent : false, DateTarget : { $lt : dateFormat( new Date(), "isoUtcDateTime") }}, orderby : {"DateTarget" : "asc"}, limit : 1})
.then(function(cdata){
	console.log(cdata);
})
