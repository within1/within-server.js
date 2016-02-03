// GetMatchesForUser API tests#2: forcibly create new match

var test = require("../tests.js");
var persona = require("../persona.js")();


test("GetMatchesForUser", [
{
    msg: "Get Matches For User",
    url: "GetMatchesForUser",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"PageNumber" : "0",
    	"GetNewMatch" : "1"
    },
    expect: {
    }
}]);
