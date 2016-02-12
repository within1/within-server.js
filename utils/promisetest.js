// test: internal promises are being caught by calling functions

var models = require("../models");

function embedPromise() {
	return models.Users.findAll({where : { FacebookID : "990952180947706" }})
	.then(function() {
		throw "adasdasd";
	})
	.then(function() {
		return true;
	})
}

models.Users.findAll({where : { FacebookID : "990952180947706" }})
.then(function(u) {
	return embedPromise();
})
.then(function(res) {
	console.log(res);
})
.catch(function(err) {
	console.log("error caught: "+err)
})
