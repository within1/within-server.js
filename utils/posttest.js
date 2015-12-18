var request = require("request");

var url = "http://127.0.2.2/api/";
// var url = "http://127.0.2.2/WithinWCF/";
// var url = "http://dev.within.guru/WithinWCF/";
// var url = "http://localhost:60033/";

request({uri: url+"GetUserInformation", method: "POST", json : {"UserID" : "1", "UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I/7AtzG7h11zX7yDAylMvmg00thD6v961ofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ" }}, function(error, res, body) {
	console.log(error);
	console.log(JSON.stringify( body,0,4));
});