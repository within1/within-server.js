// GetUserInformation API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("GetUserInformation", [
{
    msg: "should respond with a full GetUserInformationResult for valid token",
    url: "GetUserInformation",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" : persona["UserToken"],
    },
    expect: [
    ]
},
]);

