// ProcessApplication API tests
var test = require("../tests.js");
var persona = require("../persona.js")();


test("ProcessApplication", [
{
	msg: "Rejecting user's application",
    url: "ProcessApplication",
    postdata :
		{
		    "AdminID": persona["UserID"],
		    "AdminToken": persona["UserToken"],
		    "ApplicationUserID": persona["anotherUserID"],
		    "NewAppStatus" : 0
		},
    expect: {
    	"ProcessApplicationResult"  : {
    		"AppStatus" : "0",
	    	"Status": {
	            "Status": "1"
	        }
	    }
    }
}]);
