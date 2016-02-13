// main configuration options for within app

config  = {
	sql : {
		local : {
			user : "CaptainBlackout",
			password : "A$3gwk19+gV?85zz",
			port: '1433',
	        host: 'devdb1.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'WithinDevelopment',
	        dialect : "mssql"
	    },
		development : {
			user : "CaptainBlackout",
			password : "A$3gwk19+gV?85zz",
			port: '1433',
	        host: 'devdb1.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'WithinDevelopment',
	        dialect : "mssql"
	    },
	    live: {
			user : "within",
			password : "Siy763zz=oN",
			port: '1433',
	        host: 'within.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'Within',
	        dialect : "mssql"
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
			FlagEmail	: "joel@custlabs.com",
			WaitlistEmail : "joel@custlabs.com",
			TeamWithinMessageEmail : "joel@custlabs.com",
		},
		development : {
			FlagEmail	: "joel@custlabs.com",
			WaitlistEmail : "joel@custlabs.com",
			TeamWithinMessageEmail : "joel@custlabs.com",

/*
			FlagEmail	: "hello+flag@within.guru",
			WaitlistEmail : "hello+waitlist@within.guru",
			TeamWithinMessageEmail : "hello+usermessage@within.guru",
			*/
		},
		live : {
			FlagEmail	: "hello+flag@within.guru",
			WaitlistEmail : "hello+waitlist@within.guru",
			TeamWithinMessageEmail : "hello+usermessage@within.guru",
		}
	},
	apn : {
		local : { pfx : __dirname+"/PushNotification_Production.p12", production : true, passphrase : "ah16B0xrcH" },
		development : { pfx : __dirname + "/PushNotification_Production.p12", production : true, passphrase : "ah16B0xrcH" },
		live : { pfx : __dirname + "/PushNotification_Production.p12", production : true, passphrase : "ah16B0xrcH" },
	}
};

module.exports = config;
