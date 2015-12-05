// auto-generated by dbmodelgenerator.js; run that to re-generate this
module.exports = function(sequelize) {
     var res = {
    "Sessions" : sequelize.define("Sessions",{
    "sid": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "expires": {
        "type": "DATETIME2",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "data": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "createdAt": {
        "type": "DATETIME2",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "updatedAt": {
        "type": "DATETIME2",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Sessions",  timestamps: false }),
    "Matches" : sequelize.define("Matches",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "OtherUserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "ReachingOutUserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "MatchDate": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "ReachingOutUserHasViewedFlag": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "ReachingOutUserHasDeletedFlag": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "OtherUserHasDeletedFlag": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "MatchRationale": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "NewestMessageID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "MatchExpireDate": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "IsDead": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "MatchExpiringEmailNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "MatchExpiringPushNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "LatestMessageEmailNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "LatestMessagePushNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    }
}, {tableName : "Matches",  timestamps: false }),
    "UserContactCards" : sequelize.define("UserContactCards",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "UserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Title": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Company": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "PhoneNumber": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Email": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "UserContactCards",  timestamps: false }),
    "UserEducations" : sequelize.define("UserEducations",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "UserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Degree": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "StartMonth": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "StartYear": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EndYear": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EndMonth": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Description": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "LocationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "SchoolID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Major": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "JourneyIndex": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": "default",
        "primaryKey": false
    }
}, {tableName : "UserEducations",  timestamps: false }),
    "UserEmployments" : sequelize.define("UserEmployments",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "UserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Title": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "StartMonth": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "StartYear": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EndYear": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EndMonth": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Summary": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EmployerID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "LocationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "JourneyIndex": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": "default",
        "primaryKey": false
    }
}, {tableName : "UserEmployments",  timestamps: false }),
    "Messages" : sequelize.define("Messages",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "SenderID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "ReceiverID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Type": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "HasRead": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Message1": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Messages",  timestamps: false }),
    "Notifications" : sequelize.define("Notifications",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateSent": {
        "type": "DATETIME",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "HasSent": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Error": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "PushMessage": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DeviceToken": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "SourceTable": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "UserID": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "MessageID": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "IsEmailNotificationFlag": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "IsApplePushNotificationFlag": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "EmailSubject": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateTarget": {
        "type": "DATETIME",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "RecipientEmail": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "RecipientName": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "FromName": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "FromEmail": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "ImageURL": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "OtherUserName": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Type": {
        "type": "TINYINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Notifications",  timestamps: false }),
    "UserLocations" : sequelize.define("UserLocations",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "UserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Description": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "LocationType": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "LocationID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "JourneyIndex": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "UserLocations",  timestamps: false }),
    "Employers" : sequelize.define("Employers",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "EntityTypeID": {
        "type": "TINYINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EntityID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    }
}, {tableName : "Employers",  timestamps: false }),
    "Locations" : sequelize.define("Locations",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Coordinates": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Locations",  timestamps: false }),
    "Schools" : sequelize.define("Schools",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "EntityTypeID": {
        "type": "TINYINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "EntityID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    }
}, {tableName : "Schools",  timestamps: false }),
    "TagInstances" : sequelize.define("TagInstances",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "TagID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "OwnerID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Type": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "TagInstances",  timestamps: false }),
    "Tags" : sequelize.define("Tags",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Types": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Tags",  timestamps: false }),
    "Aliases" : sequelize.define("Aliases",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "OwnerID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Aliases",  timestamps: false }),
    "Entities" : sequelize.define("Entities",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "EntityTypeID": {
        "type": "TINYINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    }
}, {tableName : "Entities",  timestamps: false }),
    "EntityTypes" : sequelize.define("EntityTypes",{
    "EntityTypeID": {
        "type": "TINYINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "EntityTypeName": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "EntityTypes",  timestamps: false }),
    "Referrals" : sequelize.define("Referrals",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "ReferralCode": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Referrals",  timestamps: false }),
    "UserRatings" : sequelize.define("UserRatings",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "RaterID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "RatedID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Rating": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Comments": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "isDeletedByRatedUser": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "UserRatings",  timestamps: false }),
    "UserReferrals" : sequelize.define("UserReferrals",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "ReferralID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "UserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    }
}, {tableName : "UserReferrals",  timestamps: false }),
    "sysdiagrams" : sequelize.define("sysdiagrams",{
    "name": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "principal_id": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "diagram_id": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "version": {
        "type": "INT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "definition": {
        "type": "VARBINARY",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "sysdiagrams",  timestamps: false }),
    "Users" : sequelize.define("Users",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "EntityID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "EntityTypeID": {
        "type": "TINYINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateCreated": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "ImageURL": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "FirstName": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "LastName": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "LinkedInID": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "FacebookID": {
        "type": "NVARCHAR",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "IsAdmin": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DeviceToken": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "ShouldSendPushNotification": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Token": {
        "type": "VARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "TokenExpireTime": {
        "type": "DATETIME",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "NumberOfFlags": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Gender": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Locale": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "Timezone": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "ReferralID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "AppStatus": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateAppStatusModified": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "EmailAddress": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "AboutUser": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "ShouldSendEmailNotifications": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Title": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    },
    "DateLastActivity": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "InactivityEmailNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "InactivityPushNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "Birthday": {
        "type": "DATETIME",
        "allowNull": false,
        "defaultValue": "(((1)-(1))-(1991))",
        "primaryKey": false
    },
    "IsTeamWithin": {
        "type": "BIT",
        "allowNull": false,
        "defaultValue": "((0))",
        "primaryKey": false
    },
    "IncompleteOnboardingEmailNotificationID": {
        "type": "BIGINT",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": true
    },
    "NumberOfFlagsGiven": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": "((0))",
        "primaryKey": false
    }
}, {tableName : "Users",  timestamps: false }),
    "TagAssociations" : sequelize.define("TagAssociations",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "ReachingOutTagID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "OfferedTagID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "AssociationModifier": {
        "type": "FLOAT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "TagAssociations",  timestamps: false }),
    "Feedbacks" : sequelize.define("Feedbacks",{
    "ID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "UserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "OtherUserID": {
        "type": "BIGINT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": true
    },
    "Rating": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Type": {
        "type": "INT",
        "allowNull": false,
        "defaultValue": null,
        "primaryKey": false
    },
    "Comments": {
        "type": "NVARCHAR",
        "allowNull": true,
        "defaultValue": null,
        "primaryKey": false
    }
}, {tableName : "Feedbacks",  timestamps: false })};
res.Messages.hasMany(res.Matches, {foreignKey: "NewestMessageID" } );
res.Matches.belongsTo(res.Messages, {foreignKey: "NewestMessageID" } );
res.Notifications.hasMany(res.Matches, {foreignKey: "MatchExpiringEmailNotificationID" } );
res.Matches.belongsTo(res.Notifications, {foreignKey: "MatchExpiringEmailNotificationID" } );
res.Notifications.hasMany(res.Matches, {foreignKey: "MatchExpiringPushNotificationID" , as : "MatchExpiringPushNotification" } );
res.Matches.belongsTo(res.Notifications, {foreignKey: "MatchExpiringPushNotificationID" , as : "MatchExpiringPushNotification" } );
res.Notifications.hasMany(res.Matches, {foreignKey: "LatestMessageEmailNotificationID" , as : "LatestMessageEmailNotification" } );
res.Matches.belongsTo(res.Notifications, {foreignKey: "LatestMessageEmailNotificationID" , as : "LatestMessageEmailNotification" } );
res.Notifications.hasMany(res.Matches, {foreignKey: "LatestMessagePushNotificationID" , as : "LatestMessagePushNotification" } );
res.Matches.belongsTo(res.Notifications, {foreignKey: "LatestMessagePushNotificationID" , as : "LatestMessagePushNotification" } );
res.Users.hasMany(res.Matches, {foreignKey: "OtherUserID" } );
res.Matches.belongsTo(res.Users, {foreignKey: "OtherUserID" } );
res.Users.hasMany(res.Matches, {foreignKey: "ReachingOutUserID" , as : "ReachingOutUser" } );
res.Matches.belongsTo(res.Users, {foreignKey: "ReachingOutUserID" , as : "ReachingOutUser" } );
res.Users.hasMany(res.UserContactCards, {foreignKey: "UserID" } );
res.UserContactCards.belongsTo(res.Users, {foreignKey: "UserID" } );
res.Locations.hasMany(res.UserEducations, {foreignKey: "LocationID" } );
res.UserEducations.belongsTo(res.Locations, {foreignKey: "LocationID" } );
res.Schools.hasMany(res.UserEducations, {foreignKey: "SchoolID" } );
res.UserEducations.belongsTo(res.Schools, {foreignKey: "SchoolID" } );
res.Users.hasMany(res.UserEducations, {foreignKey: "UserID" } );
res.UserEducations.belongsTo(res.Users, {foreignKey: "UserID" } );
res.Users.hasMany(res.Messages, {foreignKey: "ReceiverID" } );
res.Messages.belongsTo(res.Users, {foreignKey: "ReceiverID" } );
res.Users.hasMany(res.Messages, {foreignKey: "SenderID" , as : "Sender" } );
res.Messages.belongsTo(res.Users, {foreignKey: "SenderID" , as : "Sender" } );
res.Employers.hasMany(res.UserEmployments, {foreignKey: "EmployerID" } );
res.UserEmployments.belongsTo(res.Employers, {foreignKey: "EmployerID" } );
res.Locations.hasMany(res.UserEmployments, {foreignKey: "LocationID" } );
res.UserEmployments.belongsTo(res.Locations, {foreignKey: "LocationID" } );
res.Users.hasMany(res.UserEmployments, {foreignKey: "UserID" } );
res.UserEmployments.belongsTo(res.Users, {foreignKey: "UserID" } );
res.Locations.hasMany(res.UserLocations, {foreignKey: "LocationID" } );
res.UserLocations.belongsTo(res.Locations, {foreignKey: "LocationID" } );
res.Users.hasMany(res.UserLocations, {foreignKey: "UserID" } );
res.UserLocations.belongsTo(res.Users, {foreignKey: "UserID" } );
res.Entities.hasMany(res.Employers, {foreignKey: "EntityID" } );
res.Employers.belongsTo(res.Entities, {foreignKey: "EntityID" } );
res.Entities.hasMany(res.Schools, {foreignKey: "EntityID" } );
res.Schools.belongsTo(res.Entities, {foreignKey: "EntityID" } );
res.Entities.hasMany(res.TagInstances, {foreignKey: "OwnerID" } );
res.TagInstances.belongsTo(res.Entities, {foreignKey: "OwnerID" } );
res.Tags.hasMany(res.TagInstances, {foreignKey: "TagID" } );
res.TagInstances.belongsTo(res.Tags, {foreignKey: "TagID" } );
res.Entities.hasMany(res.Aliases, {foreignKey: "OwnerID" } );
res.Aliases.belongsTo(res.Entities, {foreignKey: "OwnerID" } );
res.EntityTypes.hasMany(res.Entities, {foreignKey: "EntityTypeID" } );
res.Entities.belongsTo(res.EntityTypes, {foreignKey: "EntityTypeID" } );
res.Users.hasMany(res.UserRatings, {foreignKey: "RatedID" } );
res.UserRatings.belongsTo(res.Users, {foreignKey: "RatedID" } );
res.Users.hasMany(res.UserRatings, {foreignKey: "RaterID" , as : "Rater" } );
res.UserRatings.belongsTo(res.Users, {foreignKey: "RaterID" , as : "Rater" } );
res.Referrals.hasMany(res.UserReferrals, {foreignKey: "ReferralID" } );
res.UserReferrals.belongsTo(res.Referrals, {foreignKey: "ReferralID" } );
res.Users.hasMany(res.UserReferrals, {foreignKey: "UserID" } );
res.UserReferrals.belongsTo(res.Users, {foreignKey: "UserID" } );
res.Entities.hasMany(res.Users, {foreignKey: "EntityID" } );
res.Users.belongsTo(res.Entities, {foreignKey: "EntityID" } );
res.Notifications.hasMany(res.Users, {foreignKey: "InactivityEmailNotificationID" } );
res.Users.belongsTo(res.Notifications, {foreignKey: "InactivityEmailNotificationID" } );
res.Notifications.hasMany(res.Users, {foreignKey: "IncompleteOnboardingEmailNotificationID" , as : "IncompleteOnboardingEmailNotification" } );
res.Users.belongsTo(res.Notifications, {foreignKey: "IncompleteOnboardingEmailNotificationID" , as : "IncompleteOnboardingEmailNotification" } );
res.Notifications.hasMany(res.Users, {foreignKey: "InactivityPushNotificationID" , as : "InactivityPushNotification" } );
res.Users.belongsTo(res.Notifications, {foreignKey: "InactivityPushNotificationID" , as : "InactivityPushNotification" } );
res.Referrals.hasMany(res.Users, {foreignKey: "ReferralID" } );
res.Users.belongsTo(res.Referrals, {foreignKey: "ReferralID" } );
res.Tags.hasMany(res.TagAssociations, {foreignKey: "OfferedTagID" } );
res.TagAssociations.belongsTo(res.Tags, {foreignKey: "OfferedTagID" } );
res.Tags.hasMany(res.TagAssociations, {foreignKey: "ReachingOutTagID" , as : "ReachingOutTag" } );
res.TagAssociations.belongsTo(res.Tags, {foreignKey: "ReachingOutTagID" , as : "ReachingOutTag" } );
res.Users.hasMany(res.Feedbacks, {foreignKey: "OtherUserID" } );
res.Feedbacks.belongsTo(res.Users, {foreignKey: "OtherUserID" } );
res.Users.hasMany(res.Feedbacks, {foreignKey: "UserID" , as : "User" } );
res.Feedbacks.belongsTo(res.Users, {foreignKey: "UserID" , as : "User" } );
 return res;
};
