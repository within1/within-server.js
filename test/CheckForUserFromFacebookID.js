// CheckForUserFromFacebookID API tests

var test = require("./tests.js");

test("CheckForUserFromFacebookID", [
{
    msg: "Overwriting token from FacebookID",
    url: "CheckForUserFromFacebookID",
    postdata :
    {
    "DeviceToken": "simulator",
    "FacebookID": "990952180947706"
	},

    expect: {

    }
}]);

