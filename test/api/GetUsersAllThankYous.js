// GetUsersAllThankYous API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("Get Users' all ratings", [

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
            msg: "Get Users' all ratings, first page",
            url: "GetUsersAllThankYous",
            postdata : {
            "UserID": persona["UserID"],
            "UserToken": persona["UserToken"],
            "OtherUserID" : otheruser["ID"],
        },
        expect: {

        }
    };
},
 function(prevreqs) {
    var otheruser = prevreqs[0]["GetMatchesForUserResult"]["Matches"][0]["UserInformation"];
    return {
            msg: "Get Users' all ratings, first page",
            url: "GetUsersAllThankYous",
            postdata : {
            "UserID": persona["UserID"],
            "UserToken": persona["UserToken"],
            "OtherUserID" : otheruser["ID"],
            "PageNumber" : 2,
        },
        expect: {

        }
    };
}


]);
