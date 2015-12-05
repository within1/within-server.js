var fs = require("fs");
var express = require("express");
var session = require("express-session");
var compression = require('compression')
var http = require('http');
var models = require("./models");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var SequelizeStore = require('connect-session-sequelize')(session.Store);

// start web server
var app = express();
app.use(compression({ threshold: 512 }));

app.use('/static/', express.static(__dirname + '/static/'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// apply sessions
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

app.use(function(req, res, next) {
  console.log("Requested URL: ",req.url);
  next();
});

// apply all routes
fs
  .readdirSync(__dirname+"/routes")
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.endsWith(".js"))
  })
  .forEach(function(file) {
  	var croute = require(__dirname+"/routes/"+file);
  	if (Object.keys(croute).length == 0)
  		return;
  	app.use(croute);
  });

var server = http.createServer(app);
if (process.env.PORT == undefined) {
	process.env.PORT = 5000;
	server.listen(5000,"127.200.0.5");
} else {
	server.listen(process.env.PORT);
}
console.log("Server started on port "+process.env.PORT);

