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

app.use('/static/', express.static(__dirname + '/static/'));

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


models.sequelize.sync().then(function() {
	var server = http.createServer(app);
	if (process.env.PORT == undefined) {
		process.env.PORT = 1337;
		server.listen(1337,"127.200.0.5");
	} else {
		server.listen(process.env.PORT);
	}
	console.log("Server started on port "+process.env.PORT);
});
