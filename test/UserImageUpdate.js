// updates the image only

var test = require("./tests.js");

test("Updating image of the user only", [
{
    msg: "Updating image of the user only",
    url: "AddEditFacebookUser",
    postdata :
{
    "UserToken": "tester tests",
    "UserID": "74",
    "ImageURL": "6e581ac0-b643-11e5-b8f2-ed2fad383b4e.JPG"
},
    expect: {
    }
}]);
