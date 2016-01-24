// UpdateMessageState API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Update multiple message's state", [
{
    msg: "Update multiple message's state",
    url: "UpdateMessageState",
    postdata :
{
    "UserID": persona["UserID"],
    "UserToken": persona["UserToken"],
    "MessageID" : "269,270,271"
},
    expect: {

    }
}
]);
