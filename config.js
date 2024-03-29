// main configuration options for within app

config  = {
	sql : {
/*
	    local: {
			user : "within",
			password : "Siy763zz=oN",
			port: '1433',
	        host: 'within.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'Within',
	        dialect : "mssql",
	    },
*/
		local : {
			user : "CaptainBlackout",
			password : "A$3gwk19+gV?85zz",
			port: '1433',
	        host: 'devdb1.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'WithinDevelopment',
	        dialect : "mssql",
	    },
		development : {
			user : "CaptainBlackout",
			password : "A$3gwk19+gV?85zz",
			port: '1433',
	        host: 'devdb1.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'WithinDevelopment',
	        dialect : "mssql",
	        logging: false
	    },
	    live: {
			user : "within",
			password : "Siy763zz=oN",
			port: '1433',
	        host: 'within.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'Within',
	        dialect : "mssql",
	        logging: false
	    }
	},
	admin : {
		user : "within",
		password : "Mojomojo8"
	},
	imagedir : {
		local : "..\\within-images\\",
		development: "c:\\inetpub\\wwwroot\\WithinWCF\\ImageUpload\\",
		live: "c:\\ftproot\\Within\\WithinWCF\\ImageUpload\\",
	},
	imageURL : {
		local : "https://dev.within.guru/WithinWCF/ImageUpload/",
		development: "https://dev.within.guru/WithinWCF/ImageUpload/",
		live: "https://app.within.guru/WithinWCF/ImageUpload/",
	},
	mandrill : "-9yaWsYS5OWZ5V-j9LCz8w",
	emails : {
		local : {
			devMail		: "joel@custlabs.com",
			FlagEmail	: "joel@custlabs.com",
			WaitlistEmail : "joel@custlabs.com",
			TeamWithinMessageEmail : "joel@custlabs.com",
			Inbound : "@devbound.within.guru",
		},
		development : {
/*
			devMail		: "joel@custlabs.com",
			FlagEmail	: "joel@custlabs.com",
			WaitlistEmail : "joel@custlabs.com",
			TeamWithinMessageEmail : "joel@custlabs.com",
			Inbound : "@devbound.within.guru",
*/
			devMail		: "joel@custlabs.com",
			FlagEmail	: "hello+flag@within.guru",
			WaitlistEmail : "hello+waitlist@within.guru",
			TeamWithinMessageEmail : "hello+usermessage@within.guru",
			Inbound : "@devbound.within.guru",

		},
		live : {
			devMail		: "joel@custlabs.com",
			FlagEmail	: "hello+flag@within.guru",
			WaitlistEmail : "hello+waitlist@within.guru",
			TeamWithinMessageEmail : "hello+usermessage@within.guru",
			Inbound : "@inbound.within.guru",
		}
	},
	apn : {
		local : { pfx : __dirname+"/PushNotification_Production.p12", production : true, passphrase : "ah16B0xrcH" },
		development : { pfx : __dirname + "/PushNotification_Production.p12", production : true, passphrase : "ah16B0xrcH" },
		live : { pfx : __dirname + "/PushNotification_Production.p12", production : true, passphrase : "ah16B0xrcH" },
	},
	version : "1.1"
};

module.exports = config;
