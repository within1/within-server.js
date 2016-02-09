// GetPastMessages

var test = require("../tests.js");
var persona = require("../persona.js")();


test("GetPastMessages", [
{
    msg: "GetPastMessages",
    url: "GetPastMessages",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    },
    expect: {
    }
}]);
