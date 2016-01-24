// Send Message API tests

var test = require("./tests.js");

test("SendMessage", [
{
    msg: "Sending message",
    url: "SendMessage",
    postdata :
{
    "Type": "2",
    "Message": "",
    "ReceiverID": "4083",
	"UserID" : "4073",
	"UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I27OvOdslDh7ctrNSHsbFYAtMI8XLPNx3IfF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ",
},

    expect : {}

}]);
