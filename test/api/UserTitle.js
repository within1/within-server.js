// New user registration test

var test = require("../tests.js");

var randnum = Math.floor(Math.random() * 1000000);

test("Registering new user", [
{
    msg: "New user registration",
    url: "AddEditFacebookUser",
    postdata : {
	    "UserWants": [],
	    "UserEmployment": [],
	    "EmailAddress": "joel+"+randnum+"@custlabs.com",
	    "UserEducation": [],
	    "UserSkills": [],
	    "FirstName": "Joel",
	    "FacebookID": "990952180947706"+randnum,
	    "Gender": "male",
	    "Title" : "senior engineer",
	    "ShouldSendPushNotification": "1",
	    "Birthday": "",
	    "IsAdmin": "0",
	    "LastName": "Solymosi",
	    "DeviceToken": "simulator",
	    "UserWhyHeres": [],
	    "UserLocation": [
	        {
	            "Name": "San Francisco, California",
	            "LocationType": "0",
	            "JourneyIndex": "-1"
	        }
	    ],
	    "UserBreakTheIces": []
	},
    expect: {
    	"AddEditFacebookUserResult": {
    		"PublicUserInformation" : {
    			"Title" : "senior engineer"
    		}
    	}
    }



}]);

