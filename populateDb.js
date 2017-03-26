var fs = require('fs');
var models = require('./models');

models.sequelize.sync({force: true}).then(function() {
    fs.readFile('./rooms.json', function(err, data) {
        var rooms_data = JSON.parse(data);
        var rooms = rooms_data['rooms'];

        rooms.forEach(function(room) {
            models.Room.create({
                id: room.id.toString()
            });
        });
    });

    fs.readFile('./users.json', function(err, data) {
        var users_data = JSON.parse(data);
        var users = users_data['users'];

        users.forEach(function(user) {
            models.User.create({
                id: user.id.toString(),
                username: user.username
            }).then(function(UserInstance) {
                var roomId = user.roomId;
                models.Room.findById(roomId).then(function(room) {
                    room.addUser(UserInstance);
                });
                if (user.hostOfRoom != -1) {
                    models.Room.findById(user.hostOfRoom).then(function(room){
                        room.setUser(UserInstance);
                    });
                }
            });
        });
    });
});
