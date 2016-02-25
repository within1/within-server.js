// Malformed education entries

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Unnamed education entries should be saved as empty string", [
{
    msg: "Updating image of the user only",
    url: "AddEditFacebookUser",
    postdata :
{
    "UserToken": persona["UserToken"],
    "UserID": persona["UserID"],
    "ImageURL": "6e581ac0-b643-11e5-b8f2-ed2fad383b4e.JPG",
    "UserEducation":[{"JourneyIndex":"-1","Description":"","Degree":"College","EndYear":"2013","Major":"Mathematics"}],
},
    expect: {
        "AddEditFacebookUserResult": {
            "PublicUserInformation" : {
                "GetUserEducation" : [
                 {
                    "Name": ""
                 }
                ]
            }
        }

    }
}]);
