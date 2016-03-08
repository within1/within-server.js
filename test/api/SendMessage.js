// Send Message API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("SendMessage", [
{
    msg: "Get list of current matches",
    url: "GetMatchesForUser",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"PageNumber" : "0",
    	"GetNewMatch" : "0"
    },
    expect: {
    }
}, function(prevreqs) {
	var otheruser = prevreqs[0]["GetMatchesForUserResult"]["Matches"][0]["UserInformation"];
	return {
		url: "SendMessage",
	    postdata :
	{
	    "Type": "1",
	    "Message": "Hello world! 123132",
	    "ReceiverID": otheruser["ID"],
		"UserID" : persona["UserID"],
		"UserToken" : persona["UserToken"],
	},

	    expect : {}

	}

}



]);
