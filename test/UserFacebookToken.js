// User updating test

var test = require("./tests.js");

test("Updating user with full info", [
{
    msg: "Updating user with fb info",
    url: "AddEditFacebookUser",
    postdata :
{
    "FacebookID": "990952180947706",
    "FacebookAccessToken" : "tester tests 123",
    "DeviceToken" : "simulator"
},
    expect: {
    }
}]);
