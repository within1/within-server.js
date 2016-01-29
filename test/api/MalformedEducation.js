// updates the image only

var test = require("../tests.js");

test("Updating image of the user only", [
{
    msg: "Updating image of the user only",
    url: "AddEditFacebookUser",
    postdata :
{
    "UserToken": "Dbr/k5trWmO3XRTk3AWfX90E9jwpoh59w/EaiU9df/OkFa6bxluaKsQmBtKDNDHbBpplmFe2Zo06m6TOpxxDc0mhb1DzDq0EzXjBFsfQRVTewDXwdZZ5mxNdEp4HEdrIlx43DPPRh+5uQzOzP8bob7ckkNvE7yB9HbeZVS5I1BhjHA3/8Ac2Qf0+sjkHb8mKk/bSO1NammUS3jYXzGPcYm7OvOdslDh7ctrNSHsbFYAo0dI95WZPN7NNDunS6F9ptD1zgqp3Dr8scHcSM7//OIST2DJfJKNJUr8Y+ZPtC+4=",
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
