"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config.js').sql[env];
var sequelize = new Sequelize(config.database, config.user, config.password, config);
var db        = require(__dirname+"/all_models.js")(sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
console.log("Models reinit");
module.exports = db;
