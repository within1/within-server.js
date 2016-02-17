// GetMessageThread API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("GetMessageThread", [
{
    msg: "Listing messages",
    url: "GetMessageThread",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" : persona["UserToken"],
    	"SenderID" : persona["anotherUserID"],
    	"MessageCount" : 5
    },
    expect : {}

}]);

