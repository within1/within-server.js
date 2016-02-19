var Promise = require('bluebird');


function t() {
	return new Promise(function(resolve, reject) {
		console.log("p1");
		resolve();
	})
	.then(function(t) {
		throw "tester tests;"+t;
	});
}

function test() {
	var allops = [t()];
	return Promise.all(allops)
	.catch(function(e) {
		console.error("While processing mandrill request: "+JSON.stringify(e,0,4));
	})
	.then(function() {
		console.log("All ok");
	})
}

test();
