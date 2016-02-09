// GetMessageDetails API tests

var test = require("../tests.js");
var persona = require("../persona.js")();


test("GetMessageDetails", [
{
    msg: "Get message details",
    url: "GetMessageDetails",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"MessageID" : persona["MessageID"]
    },
    expect: {
    }
}]);
