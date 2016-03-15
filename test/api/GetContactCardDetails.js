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
    expect: {
        "GetContactCardDetailsResult" : {
            "Status" : {
                "Status": "0",
                "StatusMessage": "Valid token required"
            }
        }
    }
},
{
    msg: "should respond with a card not found for invalid other user",
    url: "GetContactCardDetails",
    postdata : {
        "UserID" : persona["UserID"],
        "UserToken" : persona["UserToken"],
        "OtherUserID" : -1
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
    	"OtherUserID" : persona["anotherUserID"]
    },
    expect: [
    ]
},
]);

