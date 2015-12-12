var models = require("../models");
var async = require("async");

	var cparams = ["2015-09-01", "2015-09-01", "2016-01-30"];
	async.parallel({
		"profileCreated" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from (select ID, Datediff(day, ?, DateCreated ) as cdate from users where DateCreated > ? and DateCreated < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"profileApproved" : function(cb) {
			models.sequelize.query("select count(distinct ID) as cnum, cdate from ( select ID, Datediff(day, ?, DateCreated) as cdate from users where AppStatus > 0 and  DateAppStatusModified > '2015-09-05' and DateAppStatusModified < '2015-10-01') as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"receivedRecommendation" : function(cb) {
			models.sequelize.query("select count(distinct ReachingOutUserID) as cnum, cdate from ( select ReachingOutUserID, Datediff(day, ?,MatchDate) as cdate from Matches where MatchDate > ? and MatchDate < ?) as t group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"reachOut" : function(cb) {
			models.sequelize.query("select count(distinct firstContactID) as cnum, cdate from (\
 select SenderID, ReceiverID, min(ID) as firstContactID, min(DateCreated) as firstcontact, Datediff(day, ?, min(DateCreated)) as cdate \
 from Messages group by SenderID, ReceiverID)\
 as t1 left JOIN (\
 select SenderID as bSenderID, ReceiverID as bReceiverID, min(ID) as contactbackID, min(DateCreated) as contactback from Messages \
 group by SenderID, ReceiverID\
 ) as t2 on (t1.SenderID = t2.bReceiverID and t1.ReceiverID = t2.bSenderID) \
 where ( (firstcontact >  ?) and (firstcontact < ?) and (contactback is null OR firstcontact < contactback))   group by cdate  ",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},
		"responsed" : function(cb) {
			models.sequelize.query("select count(distinct contactbackID) as cnum, cdate from  ( \
select SenderID, ReceiverID, min(ID) as firstContactID, min(DateCreated) as firstcontact \
from Messages group by SenderID, ReceiverID) as t1  \
left JOIN  \
(select SenderID as bSenderID, ReceiverID as bReceiverID, min(ID) as contactbackID, min(DateCreated) as contactback, Datediff(day, ?, min(DateCreated) ) as cdate from Messages group by SenderID, ReceiverID) as t2  \
on (t1.SenderID = t2.bReceiverID and t1.ReceiverID = t2.bSenderID)  \
where ( (firstcontact > ?) and (firstcontact < ?) and (contactback is null OR firstcontact < contactback)) \
group by cdate",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
		},

		"thanksGiven" : function(cb) {
			cb(null,null);
			/*
			models.sequelize.query("",
				{ replacements: cparams, type: models.sequelize.QueryTypes.SELECT}).then(function(res) { cb(null, res); });
			*/
		}
	}, function(err, data) {
		console.log(err);
		console.log(data);
	}
);
/*

models.Matches.findAll({where : {ReachingOutUserID : 27}, include: [{model: models.Users}]} ).then(function(scp) {
	  console.log(JSON.stringify(scp,0,4));
});


	models.Users.findAll({include: [
		{ model : models.Entities, include: [{model: models.TagInstances,
			include: [
				{model: models.Tags, required: true }
			] }
		]}
	] }).then(function(scp) {
	  console.log(JSON.stringify(scp,0,4));
	});



models.Users.findAll({where: {FirstName : "Bill"}, include: [{model : models.UserEducations, separate: true, include: [models.Schools]}, {model : models.UserEmployments, separate: true, include: [models.Employers]}  ] }).then(function(scp) {
  console.log(JSON.stringify(scp,0,4));
});


models.Users.findById(42).then(function(u) {
	console.log(u);
});
*/
