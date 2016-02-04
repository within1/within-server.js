// SubmitUserRating

var test = require("../tests.js");
var persona = require("../persona.js")();

test("SubmitUserRating", [
{
    msg: "SubmitUserRating",
    url: "SubmitUserRating",
    postdata : {
        "UserID" : persona["UserID"],
        "UserToken" : persona["UserToken"],
    	"OtherUserID" : persona["anotherUserID"],
    	"Rating" : 4,
    },
    expect: [
    ]
},
]);
