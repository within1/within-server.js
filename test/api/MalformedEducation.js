// Malformed education entries

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Malformed education entries", [
{
    msg: "Updating image of the user only",
    url: "AddEditFacebookUser",
    postdata :
{
    "UserToken": persona["UserToken"],
    "UserID": persona["UserID"],
    "ImageURL": "6e581ac0-b643-11e5-b8f2-ed2fad383b4e.JPG",

    "UserEducation": [
        {
            "Major": " ",
            "Description": "",
            "JourneyIndex": "1",
            "Degree": "Bachelor of Arts",
            "EndYear": "2015",
        },
        {"JourneyIndex":"-1","Description":"","Degree":"High School","Major":" "},
        {"JourneyIndex":"-1","Description":"","Degree":"High School","Major":" "},
        {"JourneyIndex":"-1","Description":"","Name":"Stanford University","Degree":"College","EndYear":"2018","Major":"Computer Science"}
    ],

},
    expect: {
    }
}]);
