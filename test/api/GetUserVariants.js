// GetUserVariants API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("GetUserVariants", [
{
    msg: "GetUserVariants",
    url: "GetUserVariants",
    postdata : {
    	"UserID" : persona["UserID"],
    	"UserToken" : persona["UserToken"],
    },
    expect: [
    ]
},
]);

