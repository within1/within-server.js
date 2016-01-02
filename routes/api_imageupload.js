// main API route

var express = require('express');
var router  = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var compression = require('compression');
var dateFormat = require('dateformat');
var Promise = require('bluebird');

router.use(bodyParser.json({type : "*/*", limit: '50mb'}));
router.use(compression({ threshold: 512}));

router.get('/api/ImageUpload', function(req, res) {
	res.json({"description" : "Within.guru server ImageUpload API", "version" : "1.0"});
});

module.exports = router;
