// ProcessApplication API tests
var test = require("../tests.js");
var persona = require("../persona.js")();


test("ProcessApplication", [
{
	msg: "Accepting user's application",
    url: "ProcessApplication",
    postdata :
		{
		    "AdminID": persona["UserID"],
		    "AdminToken": persona["UserToken"],
		    "ApplicationUserID" : persona["anotherUserID"],
		    "NewAppStatus" : 2
		},
    expect: {
    	"ProcessApplicationResult"  : {
    		"AppStatus" : "2",
	    	"Status": {
	            "Status": "1"
	        }
	    }
    }
}]);
