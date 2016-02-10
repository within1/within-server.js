// GetPastMessages

var test = require("../tests.js");
var persona = require("../persona.js")();


test("DeleteChatThread", [
{
    msg: "DeleteChatThread",
    url: "DeleteChatThread",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"OtherUserID" : persona["anotherUserID"],
    },
    expect: {
    }
}]);
