// single userinformation request post

var request = require("request");
var apiroot = "http://app.within.guru/WithinWCF/Service1.svc/";
// var apiroot = "http://localhost:60033/";

// getmatchesForUser test
function GetMatchesForUser() {
// /WithinWCF/Service1.svc/GetMatchesForUser
	request.post({
	//   headers: {'content-type' : 'application/x-www-form-urlencoded'},
	  url:     apiroot+"GetMatchesForUser",
	  method:  "POST",
	  json:    {"UserID" : 4067, "UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I8fbLEUMuggwf0XH1fUTMrHOGJSHpu7MKKv428sjZqTXVvSxe+GwNGkgcbrApOiKrRXOcQDv7r93", "PageNumber" : 0, "GetNewMatch" : 0}
	}, function(error, response, body){
		console.log(error);
		console.log(body);
	});
}

// GetMatchesForUser();

function GetUserInformation() {
	request.post({
	//   headers: {'content-type' : 'application/x-www-form-urlencoded'},
	  url:     apiroot+"GetUserInformation",
	  method:  "POST",
	  json:    {"UserID" : 4067, "UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I8fbLEUMuggwf0XH1fUTMrHOGJSHpu7MKKv428sjZqTXVvSxe+GwNGkgcbrApOiKrRXOcQDv7r93"}
	}, function(error, response, body){
		console.log(error);
		console.log(JSON.stringify(body,0,4));
	});
}

GetUserInformation();

// AddEditFacebookUser
// AddUserToWaitlist
