
var models = require("../models");


models.Matches.findAll({where : {"IsDead" : 0, "OtherUserHasDeletedFlag" : 0, "ReachingOutUserHasDeletedFlag" : 0, "ReachingOutUserID" : 165 } })
.then(function(m) {
	console.log(m[0]["DateCreated"].getTime() );
})