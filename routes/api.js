// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');

router.get('/api', function(req, res) {
	models.sequelize.query("SELECT * FROM users", { type: models.sequelize.QueryTypes.SELECT}).then(function(users) {
		res.jsonp({"ok" : "ok", "data" : users});
	});
});

module.exports = router;
