// combination of API calls:
// * registers a new user
// * submits for admin review
// * approves it using the admin credentials

var test = require("../tests.js");
var persona = require("../persona.js")();

var randnum = Math.floor(Math.random() * 1000000);
var fbid = "123123123"+randnum;

test("User reg, submit, approve combo", [
{
    msg: "Registering new user...",
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
            "EmployerName" : "Google",
            "StartYear": "2013",
            "Title": "I'm ",
            "Location": "London, UK",
            "JourneyIndex": "2",
            "Summary": "",
            "EndYear": "Present"
        },
        {
            "EmployerName" : "Yahoo",
            "StartYear": "2011",
            "Title": "I'm ",
            "JourneyIndex": "1",
            "Summary": "",
            "EndYear": "2013"
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
    "FacebookID": fbid,
    "FacebookAccessToken" : "tester tests 123",
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
            "Name": "San Francisco, CA2",
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
},
    expect: {
    }
}, function(prevreqs) {
	console.log("prev req: "+prevreqs);
	var cuid = prevreqs[0]["AddEditFacebookUserResult"]["PublicUserInformation"]["ID"];
	var ctoken = prevreqs[0]["AddEditFacebookUserResult"]["PrivateUserInformation"]["Token"];
	return {
		msg: "Adding user to waitlist",
	    url: "AddUserToWaitlist",
	    postdata :
			{
			    "UserID": cuid,
			    "UserToken": ctoken,
			},
	    expect: {
	    	"AddUserToWaitlistResult"  : {
		    	"Status": {
		            "Status": "1",
		            "StatusMessage": ""
		        }
		    }
	    }
	}
}

]);
