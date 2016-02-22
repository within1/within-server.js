// temp string test

var test = require("../tests.js");
var persona = require("../persona.js")();

test("String test", [
{

    msg: "s",
    url: "AddEditFacebookUser",
    postdata :
{
"UserSkills": [],
"DeviceToken": "none",
"IsAdmin": "0",
"UserWhyHeres": [],
"EmailAddress": "harry_xpuexgb_leson@tfbnw.net",
"UserEmployment": [
{
"StartMonth": "01",
"EndYear": "2013",
"JourneyIndex": "-1",
"EndMonth": "12",
"Aliases": [],
"EmployerName": "Sprint",
"StartYear": "2012",
"Title": "Product Manager",
"Tags": []
},
{
"StartMonth": "12",
"EndYear": "Present",
"JourneyIndex": "-1",
"Aliases": [],
"EmployerName": "Google",
"StartYear": "2013",
"Title": "Product Manager",
"Tags": []
}
],
"UserBreakTheIces": [],
"Birthday": "08/08/1980",
"FirstName": "Harry",
"UserWants": [],
"ShouldSendPushNotifications": "0",
"Gender": "male",
"FacebookID": "114844985572931",
"UserLocation": [
{
"JourneyIndex": "-1",
"LocationType": "0",
"Name": "San Francisco, California"
},
{
"JourneyIndex": "0",
"LocationType": "1",
"Name": "Mansfield, Ohio"
}
],
"UserEducation": [
{
"JourneyIndex": "-1",
"Description": "",
"Name": "Harvard University",
"Degree": "College",
"EndYear": "2012",
"Major": "Graphic Design"
}
],
"LastName": "Leson",
"FacebookAccessToken": "CAALqbZAAtzogBAKrEQMzNnCVGTyo9mY43rHbOv40CUVFZBUzFHNxF5mq1H9xZB2A09T8mgSJIeuQTpmn1ZCDG0rnozeZBUJPjhl5C19WT9X30LO7x7T6pkaI47s5yvZAbhNsZCV4SXZBwgG0JPpVEBbnzr6KVWgZB3LdH377Rq0MCz4FZA38cZAM53GoIkXEkzKitoe5HemZBlsP1uuMGzlbzrMKTYRxYotZC3REZD"
}

,
expect : {

}
}]);
