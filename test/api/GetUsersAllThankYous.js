// GetUsersAllThankYous API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Get Users' all ratings", [
{
    msg: "Get Users' all ratings, first page",
    url: "GetUsersAllThankYous",
    postdata : {
    "UserID": persona["UserID"],
    "UserToken": persona["UserToken"],
    "OtherUserID" : persona["anotherUserID"],
},
    expect: {

    }
},
{
    msg: "Get Users' all ratings, second page",
    url: "GetUsersAllThankYous",
    postdata : {
    "UserID": persona["UserID"],
    "UserToken": persona["UserToken"],
    "OtherUserID" : persona["anotherUserID"],
    "PageNumber" : 2,
},
    expect: {

    }
}

]);
