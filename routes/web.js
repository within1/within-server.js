// main web route

var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
	res.send("Within main server");
});

module.exports = router;
