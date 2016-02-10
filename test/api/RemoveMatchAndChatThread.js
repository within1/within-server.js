// RemoveMatchAndChatThread

var test = require("../tests.js");
var persona = require("../persona.js")();


test("RemoveMatchAndChatThread", [
{
    msg: "RemoveMatchAndChatThread",
    url: "RemoveMatchAndChatThread",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"OtherUserID" : persona["anotherUserID"],
    },
    expect: {
    }
}]);

