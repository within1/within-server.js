// UploadPicture API tests

var test = require("./tests.js");


test("UploadPicture", [
{
    msg: "Upload picture",
    url: "UploadPicture",
    postdata : {
    	"Base64PictureEncoding" : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAITcAACE3ATNYn3oAAAAMSURBVBhXY1ixYgUAA/QB+cnN/OoAAAAASUVORK5CYII=",
    	"UserID" : "44",
    	"UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I27OvOdslDh7ctrNSHsbFYAtMI8XLPNx3IfF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ"
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


