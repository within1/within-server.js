// AddEditFacebookUser

var test = require("./tests.js");

test("Full user flow", [
{
    msg: "Overwriting token from FacebookID",
    url: "CheckForUserFromFacebookID",
    postdata : {
        "FacebookID": "990952180947706",
        "DeviceToken": "simulator"
    },
    expect: {

    }
},
{
    msg: "AddEditFacebookUser",
    url : "AddEditFacebookUser",
    postdata :  {
        "UserSkills": [],
        "DeviceToken": "simulator",
        "IsAdmin": "0",
        "UserWhyHeres": [],
        "EmailAddress": "joel@custlabs.com",
        "UserEmployment": [],
        "UserBreakTheIces": [],
        "Birthday": "",
        "FirstName": "Joel",
        "UserWants": [],
        "Gender": "male",
        "FacebookID": "990952180947706",
        "UserLocation": [
            {
                "JourneyIndex": "-1",
                "LocationType": "0",
                "Name": "San Francisco, California"
            }
        ],
        "UserEducation": [],
        "LastName": "Solymosi",
        "ShouldSendPushNotification": "0"
    }
}]);
