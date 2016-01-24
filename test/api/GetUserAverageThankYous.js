// GetUserAverageThankYous

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Get user Average thank-yous", [
{
    msg: "Get user Average thank-yous",
    url: "GetUserAverageThankYous",
    postdata :
{
    "UserID": persona["UserID"],
    "UserToken": persona["UserToken"],
},
    expect: {

    }
}
]);
