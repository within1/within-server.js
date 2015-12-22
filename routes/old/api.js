router.post("/api/GetMessageThread", function(req, res) {
	var resdata = {};
	requireParameters(req, ["UserID", "UserToken", "SenderID", "MessageCount"])
	.then(function() { return validateToken(req.body["UserID"], req.body["UserToken"]); })
	.then(function(userdata) {
		return models.Messages.findAll({where: {$or : [
				{ SenderID : req.body["SenderID"], ReceiverID : req.body["UserID"]},
				{ SenderID : req.body["UserID"], ReceiverID : req.body["SenderID"]}
			] },
			order : [ ["ID" , "DESC"] ]
		});
	})
	.then(function(msgdata) {
		console.log(msgdata);
		res.json(msgdata);
	})
	.catch(function(e) {
		console.log(e);
		res.json({"GetMessageThreadResult" : {"Status" : {"Status" : 0, "StatusMessage" : e.toString() }}});
	});
});
