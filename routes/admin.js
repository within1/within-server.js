// main admin route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var basicAuth = require('basic-auth');
var config    = require(__dirname + '/../config.js');

// add basic authentication for modules listed from here:
router.use("/admin/*", function(req, res, next) {
	var user = basicAuth(req);
    if (!user || user.name !== config.admin.user || user.pass !== config.admin.password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
    }
    next();
})


router.get('/admin', function(req, res) {
	models.sequelize.query("SELECT * FROM users", { type: models.sequelize.QueryTypes.SELECT}).then(function(users) {
		res.jsonp({"ok" : "ok", "data" : users});
	});
});

module.exports = router;
