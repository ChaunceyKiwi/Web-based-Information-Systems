var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var models = require('./models');
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
app.use(cookieParser());

var gameCenterId = 0;

var generateKey = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res) {
    res.sendFile(__dirname + '/index.js');
});

// Get the information of current user
// return {userId, roomId, usersInRoom}
app.get('/api/getInfo', function(req, res) {
    var key = req.cookies.sessionKey;
    var obj = {};

    if (key == undefined) {
        res.statusCode = 401;
        //console.log("No session key found!");
        res.end("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                res.statusCode = 401;
                //console.log("Fake or outdated session key!");
                res.end("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    obj.userId = user.id;
                    user.getRooms().then(function(rooms) {
                        obj.roomId = rooms[0].id;
                        // should only return rooms of length1
                        rooms[0].getUsers({
                            attributes: ['id'],
                            order:[['createdAt','ASC']]
                        }).then(function(usersInRoom) {
                            obj.usersInRoom = usersInRoom.map(function(userInRoom) {
                                var dataReturn = userInRoom.get({plain: true});
                                delete dataReturn["Users_Rooms"];
                                return dataReturn;
                            });
                            getIdArray(obj.usersInRoom);
                            res.end(JSON.stringify(obj));
                            console.log(obj);
                        });
                    });
                });
            }
        });
    }
});

// Create a new room
// Return {location, roomId}
app.post('/api/room', function(req, res) {
    var key = req.cookies.sessionKey;

    if (key == undefined) {
        res.statusCode = 401;
        //console.log("No session key found!");
        res.end("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                res.statusCode = 401;
                //console.log("Fake or outdated session key!");
                res.end("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    models.Room.create({
                    }).then(function(RoomInstance) {
                        var roomInfo = {};
                        roomInfo.location = "/room/" + RoomInstance.id;
                        roomInfo.roomId = RoomInstance.id;
                        user.setRooms([]);
                        user.addRoom(RoomInstance);
                        res.statusCode = 200;
                        console.log(roomInfo);
                        res.end(JSON.stringify(roomInfo));
                    });
                });
            }
        });
    }
});

// Create a new user and put at game center
// Return {id, members}
app.post('/createUser', function(req, res) {
    var userObj = JSON.parse(Object.keys(req.body)[0]);
    var userObjReturned = {};

    models.User.findOne({where: {username: userObj.username}}).then(function(searchResult) {
        if (searchResult == undefined) {
            models.User.create({username: userObj.username}).then(function(UserInstance) {
                userObjReturned.id = UserInstance.id;

                models.Room.findById(gameCenterId).then(function(gameCenter) {
                    gameCenter.addUser(UserInstance).then(function() {
                        gameCenter.getUsers({
                            attributes: ['id'],
                            order:[['createdAt','ASC']]
                        }).then(function(usersInGameCenter) {
                            userObjReturned.members = usersInGameCenter.map(function(userInGameCenter) {
                                var dataReturn = userInGameCenter.get({plain: true});
                                delete dataReturn["Users_Rooms"];
                                return dataReturn;
                            });
                        }).then(function() {
                            // create session for new created user
                            var key_generated = generateKey();
                            models.Session.create({
                                sessionKey: key_generated
                            }).then(function(SessionInstance) {
                                SessionInstance.setUser(UserInstance);
                                res.statusCode = 200;
                                res.setHeader('Set-Cookie', "sessionKey=" + key_generated);
                                getIdArray(userObjReturned.members);
                                console.log(userObjReturned);
                                res.end(JSON.stringify(userObjReturned));
                            });
                        });
                     });
                });
            });
        } else {
            res.statusCode = 403;
            res.end("Occupied username");
        }
    });
});

// Search and enter a room
// Return {roomId, members}
app.get('/room/:id', function(req, res) {
    var key = req.cookies.sessionKey;
    var roomId = req.params['id'];

    if (key == undefined) {
        res.statusCode = 401;
        //console.log("No session key found!");
        res.end("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(targetSession) {
            if (targetSession == undefined) {
                res.statusCode = 401;
                //console.log("Fake or outdated session key!");
                res.end("Fake or outdated session key!");
            } else {
                models.Room.findById(roomId).then(function(RoomInstance) {
                    if (RoomInstance == undefined) {
                        res.statusCode = 400;
                        //console.log("The room does not exist!");
                        res.end("The room does not exist!");
                    } else {
                        targetSession.getUser().then(function(userToBeAdded) {
                            userToBeAdded.setRooms([]).then(function() {
                                RoomInstance.addUser(userToBeAdded).then(function() {
                                    var roomInfo = {};
                                    roomInfo.roomId = RoomInstance.id;
                                    RoomInstance.getUsers({
                                        attributes: ['id'],
                                        order:[['createdAt','ASC']]
                                    }).then(function(members) {
                                        roomInfo.members = members.map(function (member) {
                                            return member.get({plain: true}).id;
                                        });
                                        res.statusCode = 200;
                                        res.end(JSON.stringify(roomInfo));
                                    });
                                });
                            });
                        });
                    }
                });
            }
        });
    }
});

// Exit a room
// Return {users}
app.delete('/room/exit', function(req, res) {
    var key = req.cookies.sessionKey;
    var obj = {};

    if (key == undefined) {
        res.statusCode = 401;
        //console.log("No session key found!");
        res.end("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                res.statusCode = 401;
                //console.log("Fake or outdated session key!");
                res.end("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    models.Room.findById(gameCenterId).then(function(gameCenter) {
                        gameCenter.addUser(user).then(function() {
                            gameCenter.getUsers({
                                attributes: ['id'],
                                order:[['createdAt','ASC']]
                            }).then(function(usersInGameCenter) {
                                obj.users = usersInGameCenter.map(function(userInGameCenter) {
                                    var dataReturn = userInGameCenter.get({plain: true});
                                    delete dataReturn["Users_Rooms"];
                                    return dataReturn;
                                });
                            }).then(function() {
                                user.getRooms().then(function(rooms) {
                                    // should only return rooms of length1
                                    rooms[0].getUsers({
                                        where: {id: {$ne: user.id}},
                                        attributes: ['id'],
                                        order:[['createdAt','ASC']]
                                    }).then(function(usersRemainInRoom) {
                                        rooms[0].setUsers(usersRemainInRoom).then(function() {
                                            getIdArray(obj.users);
                                            res.statusCode = 200;
                                            res.end(JSON.stringify(obj));
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    }
});

// Send a message to all members in current room
app.post('/api/chat' , function(req, res) {
    var key = req.cookies.sessionKey;
    var msg = Object.keys(req.body)[0];

    if (key == undefined) {
        res.statusCode = 401;
        res.end("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                console.log(searchResult);
                res.statusCode = 401;
                res.end("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    user.getRooms().then(function(rooms) {
                        // should only return rooms of length1
                        var room = rooms[0];
                        var info = {};
                        info.username = user.username;
                        info.roomId = room.id;
                        info.message = msg;
                        res.statusCode = 200;
                        io.emit('addMessageToRoom', JSON.stringify(info));
                        res.end("Success");
                    });
                });
            }
        });
    }
});

io.on('connection', function(socket){
    socket.on('addUserToRoom', function(msg) {
        io.emit('addUserToRoom', msg);
    });

    socket.on('deleteUserFromRoom', function(msg) {
        io.emit('deleteUserFromRoom', msg);
    });
});

http.listen(port, function() {
    console.log('Listening on port ' + port);
});

// simplify id array
function getIdArray(IdObj) {
    var i;
    for (i = 0; i < IdObj.length; i++) {
        IdObj[i] = IdObj[i].id;
    }
}
