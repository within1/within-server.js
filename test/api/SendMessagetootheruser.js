// Send Message API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("SendMessage", [
{
    msg: "Get list of current matches",
    url: "SendMessage",
    postdata :
	{
	    "Type": "1",
	    "Message": "Hello world! 123132",
	    "ReceiverID": persona["otherUserID"],
		"UserID" : persona["UserID"],
		"UserToken" : persona["UserToken"],
	},
    expect: {
    }
}

]);
