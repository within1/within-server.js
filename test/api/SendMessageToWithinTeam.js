// Send Message API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("SendMessage", [
{
    msg: "Sending message",
    url: "SendMessage",
    postdata :
{
    "Type": "1",
    "Message": "Hello within team!",
    "ReceiverID": 28,
	"UserID" : persona["UserID"],
	"UserToken" : persona["UserToken"],
},

    expect : {}

}]);
