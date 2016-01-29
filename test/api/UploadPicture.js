// UploadPicture API tests

var test = require("../tests.js");
var persona = require("../persona.js")();


test("UploadPicture", [
{
    msg: "Upload picture",
    url: "UploadPicture",
    postdata : {
    	"Base64PictureEncoding" : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAITcAACE3ATNYn3oAAAAMSURBVBhXY1ixYgUAA/QB+cnN/OoAAAAASUVORK5CYII=",
    	"UserID" : persona["UserID"],
    	"UserToken" : persona["UserToken"],
    },
    expect: {
    	"UploadPictureResult" : {
	    	"Status": {
	            "Status": "1",
	            "StatusMessage": ""
	        }
	    }
    }
}]);
