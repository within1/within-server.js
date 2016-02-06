// unit test: zero information should still register a user

var test = require("../tests.js");
var persona = require("../persona.js")();

var randnum = Math.floor(Math.random() * 1000000);
var fbid = "123123123"+randnum;

test("User reg with no info given", [
{
    msg: "Registering new user...",
    url: "AddEditFacebookUser",
    postdata :
{
    "FacebookID": fbid,
},
    expect: {
    }
},
]);


