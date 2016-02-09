// Login & logout API tests
var test = require("../tests.js");
var persona = require("../persona.js")();

test("User login & logout", [
{
	msg: "Logging in user",
	url: "AddEditFacebookUser",
    postdata : {
    	"FacebookID":  persona["FacebookID"],
    },
    expect: [
    ]
},
function(prevreqs) {
	return {
		msg: "Logging out user",
		url: "LogoutUser",
	    postdata : {
	    	"UserID":  prevreqs[0]["AddEditFacebookUserResult"]["PublicUserInformation"]["ID"],
	    	"UserToken":  prevreqs[0]["AddEditFacebookUserResult"]["PrivateUserInformation"]["Token"],
	    },
	    expect:
		    {"LogoutUserResult" : {"Status" : {"Status" : 1}}}
	}
}

]);
