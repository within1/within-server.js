// Send Message API tests

var test = require("../tests.js");
var persona = require("../persona.js")();

test("SendMessage", [
{
    msg: "Get list of current matches",
    url: "SendMessage",
    postdata : {

	    "Type": "1",
	    "Message": "Hello world! qwd qwdq wqwd qwd qwdqwd",
	    "ReceiverID": "4073",
    	"UserID" : "4078",
    	"UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I5O8cIbXa7vWMNTTfGRgAsQBMVgU8j40sofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ",
    },
    expect: {
    }
}]);
