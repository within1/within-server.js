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
	}

};

module.exports = config;
