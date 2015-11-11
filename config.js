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
	}
};

module.exports = config;
