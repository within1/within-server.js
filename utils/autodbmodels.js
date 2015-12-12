var models = require("../models");


var Schools = models.sequelize.define("Schools",
 { ID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  Name:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  DateCreated:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  EntityTypeID:
   { type: 'TINYINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EntityID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true } },
    {tableName : "Schools",  timestamps: false }
 );

var UserEducations =  models.sequelize.define("UserEducations",
	{ ID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  DateCreated:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  DateModified:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  UserID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  Degree:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  StartMonth:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  StartYear:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EndYear:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EndMonth:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  Description:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  LocationID:
   { type: 'BIGINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: true },
  SchoolID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  Major:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  JourneyIndex:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  Name:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: 'default',
     primaryKey: false } },
    {tableName : "UserEducations",  timestamps: false }
);


var Users =  models.sequelize.define("Users",
{ ID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  EntityID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  EntityTypeID:
   { type: 'TINYINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  DateCreated:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  DateModified:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  ImageURL:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  FirstName:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  LastName:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  LinkedInID:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  FacebookID:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  IsAdmin:
   { type: 'BIT',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  DeviceToken:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  ShouldSendPushNotification:
   { type: 'BIT',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  Token:
   { type: 'VARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  TokenExpireTime:
   { type: 'DATETIME',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  NumberOfFlags:
   { type: 'INT',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  Gender:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  Locale:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  Timezone:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  ReferralID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  AppStatus:
   { type: 'INT',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  DateAppStatusModified:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  EmailAddress:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  AboutUser:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  ShouldSendEmailNotifications:
   { type: 'BIT',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  Title:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  DateLastActivity:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  InactivityEmailNotificationID:
   { type: 'BIGINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: true },
  InactivityPushNotificationID:
   { type: 'BIGINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: true },
  Birthday:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: '(((1)-(1))-(1991))',
     primaryKey: false },
  IsTeamWithin:
   { type: 'BIT',
     allowNull: false,
     defaultValue: '((0))',
     primaryKey: false },
  IncompleteOnboardingEmailNotificationID:
   { type: 'BIGINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: true },
  NumberOfFlagsGiven:
   { type: 'INT',
     allowNull: false,
     defaultValue: '((0))',
     primaryKey: false } },
    {tableName : "Users",  timestamps: false }
);


var Employers = models.sequelize.define("Employers",
{ ID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  DateCreated:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  Name:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  EntityTypeID:
   { type: 'TINYINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EntityID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true } },
    {tableName : "Employers",  timestamps: false }
);

var UserEmployments = models.sequelize.define("UserEmployments",

{ ID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  DateCreated:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  DateModified:
   { type: 'DATETIME',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  UserID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  Title:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: null,
     primaryKey: false },
  StartMonth:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  StartYear:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EndYear:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EndMonth:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  Summary:
   { type: 'NVARCHAR',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  EmployerID:
   { type: 'BIGINT',
     allowNull: false,
     defaultValue: null,
     primaryKey: true },
  LocationID:
   { type: 'BIGINT',
     allowNull: true,
     defaultValue: null,
     primaryKey: true },
  JourneyIndex:
   { type: 'INT',
     allowNull: true,
     defaultValue: null,
     primaryKey: false },
  Name:
   { type: 'NVARCHAR',
     allowNull: false,
     defaultValue: 'default',
     primaryKey: false } },
    {tableName : "UserEmployments",  timestamps: false }
);

UserEducations.belongsTo(Schools, {foreignKey: "SchoolID"});
UserEmployments.belongsTo(Employers, {foreignKey: "EmployerID"});
Users.hasMany(UserEducations, {foreignKey: "UserID"} );
Users.hasMany(UserEmployments, {foreignKey: "UserID"} );

/*
Users.findAll({where: {FirstName : "Bill"}, include: [{model : UserEducations, separate: true, include: [Schools]}, {model : UserEmployments, separate: true, include: [Employers]}  ] }).then(function(scp) {
	console.log(JSON.stringify(scp,0,4));
});*/

Users.findById(42).then(function(scp) {
  console.log(JSON.stringify(scp,0,4));
});