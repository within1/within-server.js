// * registers a new user with location, school, employment & verifies it

var test = require("../tests.js");
var randnum = Math.floor(Math.random() * 1000000);
var fbid = "123123123"+randnum;

test("User reg, verify combo", [
{
    msg: "Registering new user...",
    url: "AddEditFacebookUser",
    postdata :
{
	"FacebookAccessToken": "tester",
	"UserEmployment": [
	{
		"Aliases": [],
		"Title": "Software Developer",
		"EmployerName": "LinkedIn",
		"Location": "Mountain View",
		"JourneyIndex": "-1",
		"Tags": [],
		"EndYear": "Present"
	}
	],
	"UserWants": [],
	"EmailAddress": "ovqbszx_zamoreson_1455664195@tfbnw.net",
	"UserEducation": [
	{
		"Major": " ",
		"Description": "",
		"JourneyIndex": "-1",
		"Degree": "College",
		"EndYear": "2013",
		"Name": "Stanford University"
	}
	],
	"UserSkills": [],
	"FirstName": "Linda",
	"FacebookID": fbid,
	"Gender": "female",
	"ShouldSendPushNotification": "1",
	"Birthday": "02/19/2001",
	"DeviceToken": "simulator",
	"IsAdmin": "0",
	"LastName": "Zamoreson",
	"UserWhyHeres": [],
	"UserLocation": [
	{
	"Name": "San Francisco, California",
	"LocationType": "0",
	"JourneyIndex": "-1"
	},
	{
	"Name": "New York, New York",
	"LocationType": "1",
	"JourneyIndex": "0"
	}
	],
	"UserBreakTheIces": []
},
    expect: {
    	"AddEditFacebookUserResult": {
    		"PrivateUserInformation" : {
    			"FacebookAccessToken": "tester"
    		},
    		"PublicUserInformation" : {
    			"GetUserEducation" : [
    				{
    					"Name" : "Stanford University"
    				}
    			],
    			"GetUserEmployment" : [
    				{
    					"EmployerName" : "LinkedIn"
    				}
    			]

    		}
    	}
    }
}]);
