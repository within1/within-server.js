// AddEditContactCard

var test = require("../tests.js");

test("Edit contact card details", [
{
    msg: "Edit contact card details",
    url: "AddEditContactCard",
    postdata :
{
    "UserID": "44",
    "Title": "Director",
    "Company": "Custlabs qwd",
    "Name": "Joel Solymosi",
    "UserToken": "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I27OvOdslDh7ctrNSHsbFYAtMI8XLPNx3IfF+ukq1RskAHfwYwBZ1Wuz8ofII/JqUranUrT9omVQ",
    "Email": "joel@custlabs.com",
    "PhoneNumber": "+1 (312) 312-3312"
},
    expect: {

    }
}
]);
