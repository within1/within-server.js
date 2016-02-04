// Malformed education entries

var test = require("../tests.js");
var persona = require("../persona.js")();

var randnum = Math.floor(Math.random() * 1000000);

test("Malformed education entries with new user creation", [
{
    msg: "Malformed education entries with new user creation",
    url: "AddEditFacebookUser",
    postdata :
{
    "FacebookID" : "123123123"+randnum,

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
        "UserLocation": [
            {
                "LocationType": "0",
                "JourneyIndex": "-1"
            }
        ],

},
    expect: {
    }
}]);

