var express = require("express");
var expressSession = require("express-session");
var compression = require('compression')
var http = require('http');
var models = require("./models");

// start web server
var app = express();
app.use(compression({ threshold: 512}));


app.use('/assets', express.static(__dirname + '/assets'));

app.get("/", function(req, res) {
	res.jsonp({"ok" : "ok"});
});

app.use('/assets', express.static(__dirname + '/assets'));

models.sequelize.sync().then(function() {
	models.sequelize.query("SELECT * FROM users", { type: models.sequelize.QueryTypes.SELECT}).then(function(users) {
		console.log("query success:");
		console.log(JSON.stringify(users,0,4));
	});
	var server = http.createServer(app);
	if (process.env.PORT == undefined) {
		process.env.PORT = 1337;
		server.listen(1337,"127.200.0.5");
	} else {
		server.listen(process.env.PORT);
	}
	console.log("Server started on port "+process.env.PORT);
});
