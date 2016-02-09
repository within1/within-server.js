// GetTotalUnreadMessageCount

var test = require("../tests.js");
var persona = require("../persona.js")();


test("GetTotalUnreadMessageCount", [
{
    msg: "GetTotalUnreadMessageCount",
    url: "GetTotalUnreadMessageCount",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    },
    expect: {
    }
}]);
