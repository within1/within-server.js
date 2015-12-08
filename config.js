// main configuration options for within app

config  = {
	sql : {
		development : {
			user : "CaptainBlackout",
			password : "A$3gwk19+gV?85zz",
			port: '1433',
	        host: 'devdb1.c7cqsrwz0mie.us-east-1.rds.amazonaws.com',
	        database: 'WithinDevelopment',
	        dialect : "mssql"
	    }
	},
	admin : {
		user : "within",
		password : "Mojomojo8"
	},
	elastic: {
		development: {
			host : "https://search-within-elastic-ktdabzbnfoyonuwjch3cmrvkya.us-west-1.es.amazonaws.com/",
			index : "within-dev"
		}
	}
};

module.exports = config;
