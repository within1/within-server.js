// Malformed education entries

var test = require("../tests.js");
var persona = require("../persona.js")();

test("New tag creation", [
{
    msg: "New tag creation",
    url: "AddEditFacebookUser",
    postdata :
{
"FacebookAccessToken": "CAALqbZAAtzogBAEmpcrsZCSxLtLDtIXUtnccj5j1SaiRRIZAX6QuDwxobHDHk4qImSOZB9NDRwhummLvUN7RHtoDg4q1NDd5l20n7IIxGjZC0cMSzIxqjXZBoHnD9jmciPML3OndZAF4RW6Aab1ZAcCO1oLAgQUocyFuy7b8m7ZCTPfTNeVgakyPuZA9mKMzQccJLtB2jX5jPp4QWE962C5ZAdaZBZB34wMHcQIPg5YzKBw8M5gZDZD",
"UserEmployment": [
{
"StartYear": "2014",
"Title": "We dude",
"EmployerName": "default",
"Location": "",
"JourneyIndex": "2",
"StartMonth": "0",
"Summary": "",
"EndMonth": "0",
"EndYear": "Present"
}
],
"UserWants": [
{
"TagName": "IT & Security"
},
{
"TagName": "On-Demand"
},
{
"TagName": "Digital Health"
},
{
"TagName": "Health & Wellness"
}
],
"EmailAddress": "csaba@brownpaperblag.com",
"UserEducation": [
{
"Major": " ",
"Description": "",
"JourneyIndex": "1",
"Degree": "High School",
"EndYear": "2015",
"Name": "default"
}
],
"FirstName": "Csaba",
"Title": "We dude",
"ImageURL": "af5e78b0-cfc1-11e5-a4f9-1b2c77b17a27.JPG",
"FacebookID": "983548635050514",
"UserSkills": [
{
"TagName": "IT & Security"
},
{
"TagName": "Legal"
},
{
"TagName": "Digital Health"
}
],
"IsAdmin": "False",
"LastName": "Solymosi",
"DeviceToken": "simulator",
"UserWhyHeres": [],
"UserLocation": [
{
"Description": "",
"LocationType": "1",
"JourneyIndex": "0",
"Name": "Tester"
},
{
"Description": "",
"LocationType": "0",
"JourneyIndex": "-1",
"Name": "San Francisco,us"
}
],
"UserBreakTheIces": [
{
"TagName": "Sports Geek"
},
{
"TagName": "Beach Bum"
},
{
"TagName": "Fitness Fanatic"
},
{
"TagName": "Yoga Guru"
}
]
},
    expect: {
    }
}]);
