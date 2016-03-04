process.env.NODE_ENV = "live";

var models = require("../models");
models.sequelize.config.logging = false;
models.Users.findAll({where : { Title : null}, raw : true})
.then(function(u) {
	var allpr = [];
	var cfc = function(cuser) {
		return models.RequestLogs.findAll({ where : { Response : { $like : "%"+cuser["ID"]+"%"}, url : 'AddEditFacebookUser' }, raw: true})
		.then(function(crsp) {
			console.log(crsp.length);
			if (crsp.length == 0)
				return;
			var cupd = { };
			for (var i in crsp) {
				var cdata = JSON.parse(crsp[i]["Response"]);
				if (cdata["AddEditFacebookUserResult"]["PublicUserInformation"]["ID"] != cuser["ID"])
					continue;
				var creq =  JSON.parse(crsp[i]["Request"]);
				if (creq["Title"] !== undefined)
					cupd["Title"] = creq["Title"];
				if (creq["FacebookAccessToken"] !== undefined)
					cupd["FacebookAccessToken"] = creq["FacebookAccessToken"];
			}
			if (Object.keys(cupd).length > 0) {
				console.log(cuser["ID"], cupd);
			}
			return models.Users.update(cupd, {where : {ID : cuser["ID"]}});
		})
	};
	for (var cu in u) {
		allpr.push(cfc(u[cu]))
	}
	Promise.all(allpr);
})
