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
    "ShouldSendPushNotification":"1",
    "UserSkills": [],
    "DeviceToken":"",
    "IsAdmin":"0",
    "UserWhyHeres":[],
    "EmailAddress":"joel@custlabs.com",
    "UserEmployment":[],
    "UserBreakTheIces":[],
    "Birthday":"03/28/1995",
    "FirstName":"Abiel",
    "UserWants":[],
    "Gender":"male",
    "FacebookID":"123123123"+randnum,
    "UserLocation":[
        {
            "JourneyIndex":"-1",
            "LocationType":"0",
            "Name":"Monterrey, Mexico"
        },
        {
            "JourneyIndex":"0",
            "LocationType":"1",
            "Name":"Monterrey, Mexico"
         }
    ],
    "UserEducation": [
        {
            "JourneyIndex":"-1",
            "Description":"",
            "Degree":"High School",
            "Major":" "
        },
        {
            "JourneyIndex":"-1",
            "Description":"",
            "Name":"Stanford University",
            "Degree":"College",
            "EndYear":"2018",
            "Major":"Computer Science"
        }
    ],
    "UserEmployment": [
        {
            "StartYear": "2013",
            "Title": "I'm ",
            "Location": "London, UK",
            "JourneyIndex": "2",
            "Summary": "",
            "EndYear": "Present"
        },
    ],
    "LastName":"GutiÃ©rrez",
    "FacebookAccessToken":""
},
    expect: {
    }
}]);
