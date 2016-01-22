// Send Message API tests

var test = require("./tests.js");

test("SendMessage", [
{
    msg: "Sending message",
    url: "SendMessage",
    postdata :
{
    "Type": "1",
    "Message": "Hello world!",
    "ReceiverID": "4068",
	"UserID" : "4067",
	"UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I8fbLEUMuggwf0XH1fUTMrHOGJSHpu7MKKv428sjZqTXVvSxe+GwNGkgcbrApOiKrRXOcQDv7r93",
},

    expect : {}

}]);
