// GetMatchesForUser API tests

var test = require("./tests.js");


test("GetMatchesForUser", [
{
    msg: "Get Matches For User",
    url: "GetMatchesForUser",
    postdata : {
    	"UserID" : "71",
    	"UserToken" : "tester tests",
    	"PageNumber" : "0",
    	"GetNewMatch" : "1"
    },
    expect: {
    }
}]);

