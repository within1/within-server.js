// AddUserThankYou , and
// DeleteThankYou API tests


var test = require("../tests.js");
var persona = require("../persona.js")();

test("Adds a new rating, then marks it as deleted", [

{
    msg: "Adds a new rating",
    url: "AddUserThankYou",
    postdata : {
    "UserID": persona["UserID"],
    "UserToken": persona["UserToken"],
    "OtherUserID" : persona["anotherUserID"],
    "NumberOfStars" : 5,
    "Comments" : "You're a good person."
},
    expect: {

    }
},

{
    msg: "Marks a rating as deleted",
    url: "DeleteThankYou",
    postdata : {
    "UserID": persona["UserID"],
    "UserToken": persona["UserToken"],
    "RatingID" : persona["onerating"],
},
    expect: {

    }
}

]);
