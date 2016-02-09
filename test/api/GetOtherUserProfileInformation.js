// GetOtherUserProfileInformation API tests
var test = require("../tests.js");
var persona = require("../persona.js")();

test("GetOtherUserProfileInformation", [
{
	msg: "GetOtherUserProfileInformation",
	url: "GetOtherUserProfileInformation",
    postdata : {
    	"UserID" :  persona["UserID"],
    	"UserToken" : persona["UserToken"],
    	"OtherUserID" : persona["anotherUserID"],
    	"IsMatch" : "1"
    },
    expect: [
    ]
}
]);
