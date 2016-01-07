// User updating test

var test = require("./tests.js");

test("Updating user with full info", [
    msg: "Updating user with full info",
    url: "AddEditFacebookUser",
    postdata :
{
    "UserWants": [
        {
            "TagName": "Wearables"
        },
        {
            "TagName": "AI"
        },
        {
            "TagName": "IT & Security"
        }
    ],
    "UserEmployment": [
        {
            "StartYear": "2013",
            "Title": "I'm ",
            "EmployerName": "We're feed",
            "Location": "",
            "JourneyIndex": "2",
            "Summary": "",
            "EndYear": "2015"
        }
    ],
    "EmailAddress": "joel@custlabs.com",
    "FirstName": "Joel",
    "UserSkills": [
        {
            "TagName": "Wearables"
        },
        {
            "TagName": "AI"
        },
        {
            "TagName": "IT & Security"
        }
    ],

    "Title": "Tester",
    "ImageURL": "603a4420-b55f-11e5-b1b8-51565ea856fa.JPG",
    "FacebookID": "990952180947706",
    "UserEducation": [
        {
            "Major": " ",
            "Description": "",
            "JourneyIndex": "1",
            "Degree": "Bachelor of Arts",
            "EndYear": "2015",
            "Name": "Stanford"
        }
    ],
    "IsAdmin": "False",
    "LastName": "Solymosi",
    "DeviceToken": "simulator",
    "UserWhyHeres": [],
    "UserLocation": [
        {
            "Description": "",
            "LocationType": "0",
            "JourneyIndex": "-1",
            "Name": "San Francisco, California"
        },
        {
            "JourneyIndex": "0",
            "Name": "San Francisco. CA",
            "LocationType": "1"
        }
    ],
    "UserBreakTheIces": [
        {
            "TagName": "Health Nut"
        },
        {
            "TagName": "Sports Geek"
        },
        {
            "TagName": "Yoga Guru"
        }
    ]
}
}]);
