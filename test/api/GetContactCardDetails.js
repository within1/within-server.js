// GetContactCardDetails

var test = require("../tests.js");
var persona = require("../persona.js")();

test("GetContactCardDetails", [
{
	msg: "should reject invalid tokens",
	url: "GetContactCardDetails",
    postdata : {
    	"UserID" : "1",
    	"UserToken" : "invalid",
    	"OtherUserID" : "4"
    },
    expect: [
    ]
},
{
    msg: "should respond with a full GetUserInformationResult for valid token",
    url: "GetContactCardDetails",
    postdata : {
        "UserID" : persona["UserID"],
        "UserToken" : persona["UserToken"],
    	"OtherUserID" : 3
    },
    expect: [
    ]
},
]);

