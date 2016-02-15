// CheckForUserFromFacebookID API tests

var test = require("../tests.js");

var randnum = Math.floor(Math.random() * 1000000);

test("CheckForUserFromFacebookID", [
{
    msg: "Overwriting token from FacebookID",
    url: "CheckForUserFromFacebookID",
    postdata :
    {
    "DeviceToken": "simulator"+randnum,
    "FacebookID": "990952180947706"
	},

    expect: {
    	"CheckForUserFromFacebookIDResult" : {
    		"PrivateUserInformation" : {
    			"DeviceToken" : "simulator"+randnum
    		}
    	}
    }
}]);
