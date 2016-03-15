var fs = require("fs");
var express = require("express");
var compression = require('compression')
var http = require('http');
var models = require("./models");
var bodyParser = require('body-parser');
var scheduledTasks = require("./lib/scheduledtasks.js");
var env = process.env.NODE_ENV || "local";

// start web server
var app = express();
app.use(compression({ threshold: 512 }));

app.use('/static/', express.static(__dirname + '/static/'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({type : "*/*", limit: '50mb'}));

app.use(function(req, res, next) {
  console.log("Requested URL: ",req.url);
  console.log("Requested POST Data: ",JSON.stringify(req.body,0,4));
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

// default post handler
app.use(function(req, res, next) {
  console.error("No API defined for: "+req.url);
  res.status(404).send("No API defined for: "+req.url);
});

// start web server
var server = http.createServer(app);
if (process.env.PORT == undefined) {
	process.env.PORT = 5000;
	server.listen(5000,"127.200.0.5");
} else {
	server.listen(process.env.PORT);
}

console.log("Server started on port "+process.env.PORT);

// start notification daemon
if (env != "local") {
  scheduledTasks.cronStart();
  console.log("Notification daemon started");
}
