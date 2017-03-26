"use strict";

module.exports = function(sequelize, DataType) {
    var User = sequelize.define('User',
        {
            username: {
                type: DataType.STRING,
                field: 'username'
            }
        }, {
            classMethods: {
                // associate: function(models) {
                //     User.hasOne(models.Room, {
                //         through: 'Users_Rooms'
                //     });
                // }
            }
        }
    );

    return User;
};
