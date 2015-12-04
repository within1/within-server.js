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

UserEducations.belongsTo(Schools, {foreignKey: "SchoolID"});

UserEducations.find({where: {UserID : 40}, include: [Schools] }).then(function(scp) {
	console.log(JSON.stringify(scp));
});
