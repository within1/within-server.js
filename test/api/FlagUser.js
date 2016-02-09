// GetMatchesForUser API tests#2: forcibly create new match

var test = require("../tests.js");
var persona = require("../persona.js")();


test("FlagEventOrUser", [
{
    msg: "Flagging user",
    url: "FlagEventOrUser",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"OtherUserID" :persona["anotherUserID"],
    },
    expect: {
    }
}]);
