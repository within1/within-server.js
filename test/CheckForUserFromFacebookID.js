// CheckForUserFromFacebookID API tests

var test = require("./tests.js");

test("CheckForUserFromFacebookID", [
{
    msg: "Overwriting token from FacebookID",
    url: "CheckForUserFromFacebookID",
    postdata : {
        "FacebookID": "990952180947706",
        "DeviceToken": "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I/7AtzG7h11zX7yDAylMvmg00thD6v961ofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ"
    },
    expect: {

    }
}]);

