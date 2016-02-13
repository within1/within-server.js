// main web route

var express = require('express');
var session = require("express-session");
var router  = express.Router();
var cookieParser = require('cookie-parser');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var favicon = require('serve-favicon');

// apply sessions
/*
app.use(cookieParser())
app.use(session({
  secret: 'keyboard cat',
  store: new SequelizeStore({
    db: models.sequelize
  }),
  resave: true,
  saveUninitialized : true,
  proxy: true // if you do SSL outside of node.
}))
*/


router.get('/', function(req, res) {
	res.send("Within main server");
});


router.use(favicon(__dirname + '/../static/favicon.ico'));

module.exports = router;

