// AddUserToWaitlist API tests
var test = require("../tests.js");
var persona = require("../persona.js")();


test("AddUserToWaitlist", [
{
	msg: "Adding user to waitlist",
    url: "AddUserToWaitlist",
    postdata :
		{
		    "UserID": persona["UserID"],
		    "UserToken": persona["UserToken"],
		},
    expect: {
    	"AddUserToWaitlistResult"  : {
	    	"Status": {
	            "Status": "1",
	            "StatusMessage": ""
	        }
	    }
    }
}]);
