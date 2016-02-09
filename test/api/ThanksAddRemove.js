// Send Message API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("GetMatchesForUser", [
{
    msg: "Get list of current matches",
    url: "GetMatchesForUser",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" :persona["UserToken"],
    	"PageNumber" : "0",
    	"GetNewMatch" : "0"
    },
    expect: {
    }
}, function(prevreqs) {
	var otheruser = prevreqs[0]["GetMatchesForUserResult"]["Matches"][0]["UserInformation"];
	return {
		msg: "Adding thank you",
		url: "AddUserThankYou",
	    postdata :
	{
		"UserID" : persona["UserID"],
		"UserToken" : persona["UserToken"],
	    "OtherUserID": otheruser["ID"],
	},
	    expect : {}

	}

}
,function(prevreqs) {
	var otheruser = prevreqs[0]["GetMatchesForUserResult"]["Matches"][0]["UserInformation"];
	return {
		msg: "Listing all thankyous",
		url: "GetUsersAllThankYous",
	    postdata :
	{
		"UserID" : persona["UserID"],
		"UserToken" : persona["UserToken"],
	    "OtherUserID": otheruser["ID"],
	},
	    expect : {}
	}
},
function(prevreqs) {
	var otheruser = prevreqs[0]["GetMatchesForUserResult"]["Matches"][0]["UserInformation"];
	var ratingid = prevreqs[2]["GetUsersAllThankYousResult"]["GetUserAllThankYous"][0]["ID"];
	return {
		msg: "Removing one thankyous",
		url: "DeleteThankYou",
	    postdata :
	{
		"UserID" : persona["UserID"],
		"UserToken" : persona["UserToken"],
	    "RatingID": ratingid,
	},
	    expect : {}
	}
}

]);

