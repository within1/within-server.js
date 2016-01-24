// GetMessageThread API tests

var test = require("./tests.js");

test("GetMessageThread", [
{
    msg: "Listing messages",
    url: "GetMessageThread",
    postdata : {
    	"UserID" : "1",
    	"UserToken" : "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc0mhb1DzDq0EzXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIlx43DPPRh+5uQzOzP8bob7ckkNvE7yB9HbeZVS5I1BhjHA3/8Ac2Qf0+sjkHb8mKk/bSO1NammUS3jYXzGPcYv7AtzG7h11zX7yDAylMvmg00thD6v961ofF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ",
    	"SenderID" : "2",
    	"MessageCount" : 5
    },
    expect : {}

}]);
