// getallusers admin api

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Lists all users via admin API", [
{
    msg: "Lists all users via admin API a new rating",
    url: "GetAllUsers",
    postdata : {
    "AdminID": persona["UserID"],
    "AdminToken": persona["UserToken"],
},
    expect: {

    }
}
]);
