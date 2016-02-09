// updates user's birthday

var test = require("../tests.js");
var persona = require("../persona.js")();

var randint = function(cm) { return Math.floor(Math.random() * cm); };

var newbirthday = (randint(10)+1) + "/"+(randint(20)+1) + "/"+(randint(50) + 1950);
console.log(newbirthday);

test("User login & birthday update", [
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
		msg: "Updating birthday",
		url: "AddEditFacebookUser",
	    postdata :
	{
		"UserID" : prevreqs[0]["AddEditFacebookUserResult"]["PublicUserInformation"]["ID"],
		"UserToken" :  prevreqs[0]["AddEditFacebookUserResult"]["PrivateUserInformation"]["Token"],
	    "Birthday": newbirthday
	},
	    expect : {}
	}
}

]);


