"use strict";
require("../models");

module.exports = function(sequelize, DataType) {
    var Room = sequelize.define('Room',
        {

        }, {
            classMethods: {
                associate: function(models) {
                    Room.belongsToMany(models.User, {
                        through: 'Users_Rooms'
                    });
                    Room.belongsTo(models.User, {
                        through: 'Host_Rooms'
                    });
                }
            }
        }
    );

    return Room;
};
