// updates the image only

var test = require("../tests.js");

test("Updating image of the user only", [
{
    msg: "Updating image of the user only",
    url: "AddEditFacebookUser",
    postdata :
{
    "UserToken": "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc3iaHQaFLsi1zXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIQY6VRqDvBzltACUdl2CB+gr1grGpDN+UmOnCUh9wD+BcROYXx5SmyTNtFYi+oKU7gjPLI9dWeoJWLVLUmAr6I27OvOdslDh7ctrNSHsbFYAo0dI95WZPN7NNDunS6F9ptD1zgqp3Dr8scHcSM7//OIST2DJfJKNJUr8Y+ZPtC+4=",
    "UserID": "76",
    "ImageURL": "6e581ac0-b643-11e5-b8f2-ed2fad383b4e.JPG",

    "UserEducation": [
        {
            "Major": " ",
            "Description": "",
            "JourneyIndex": "1",
            "Degree": "Bachelor of Arts",
            "EndYear": "2015",
        }
    ],

},
    expect: {
    }
}]);
