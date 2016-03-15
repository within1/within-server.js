// UploadPicture API tests

var test = require("../tests.js");
var persona = require("../persona.js")();


test("UploadPicture", [
{
    msg: "Upload picture",
    url: "UploadPicture",
    postdata : {
        "Base64PictureEncoding" : "",
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
