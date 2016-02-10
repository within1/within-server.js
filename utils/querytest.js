
var models  = require('../models');

var req = { body : {
    	"UserID" : 44,
    	"SenderID" : 24,
    	"MessageID" : 10000,
    	"MessageCount" : 100
 } };

Promise.all([])
.then(function() {
	return models.Messages.findAll({where : {
				  $or : [
				  	{ SenderID : req.body["SenderID"], ReceiverID : req.body["UserID"] },
				  	{ ReceiverID : req.body["SenderID"], SenderID : req.body["UserID"] }
				  ],
				  ID : { lt : req.body["MessageID"]  }
			}, order : "ID desc" })
})
.then(function(res) {
	console.log(res);
});
