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

// Create a new room
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
                        user.setRooms([]);
                        user.addRoom(RoomInstance);
                        RoomInstance.setUser(user);
                        res.statusCode = 200;
                        res.end(JSON.stringify(roomInfo));
                    });
                });
            }
        });
    }
});

// Create a new user and put at game center
app.post('/createUser', function(req, res) {
    var userObj = JSON.parse(Object.keys(req.body)[0]);
    var userObjReturned = {};

    models.User.findOne({where: {username: userObj.username}}).then(function(searchResult) {
        if (searchResult == undefined) {
            models.User.create({username: userObj.username}).then(function(UserInstance) {
                userObjReturned.id = UserInstance.id;
                userObjReturned.username = UserInstance.username;
                userObjReturned.roomId = UserInstance.roomId;

                models.Room.findById(gameCenterId).then(function(room) {
                    room.addUser(UserInstance);
                });

                // create session for new created user
                var key_generated = generateKey();
                models.Session.create({
                    sessionKey: key_generated
                }).then(function(SessionInstance) {
                    SessionInstance.setUser(UserInstance);
                    res.statusCode = 200;
                    res.setHeader('Set-Cookie', "sessionKey=" + key_generated);
                    res.end(JSON.stringify(userObjReturned));
                });
            });
        } else {
            res.statusCode = 403;
            res.end("Occupied username");
        }
    });
});

app.get('/room/:id', function(req, res) {
    var key = req.cookies.sessionKey;
    var roomId = req.params['id'];

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
                models.Room.findById(roomId).then(function(RoomInstance) {
                    if (RoomInstance == undefined) {
                        res.statusCode = 400;
                        //console.log("The room does not exist!");
                        res.end("The room does not exist!");
                    } else {
                        RoomInstance.getUser({attributes: ['id']}).then(function(userInstance) {
                            var roomInfo = {};
                            roomInfo.id = RoomInstance.id;
                            roomInfo.host = userInstance.get({plain: true}).id;
                            RoomInstance.getUsers({attributes: ['id']}).then(function(members) {
                                roomInfo.members = members.map(function(member){
                                    return member.get({plain: true}).id;
                                });
                                res.statusCode = 200;
                                res.end(JSON.stringify(roomInfo));
                            });
                        });
                    }
                });
            }
        });
    }
});

// app.delete('/room/exit', function(req, res) {
//     var key = req.cookies.sessionKey;
//
//     if (key == undefined) {
//         res.statusCode = 401;
//         //console.log("No session key found!");
//         res.end("No session key found!");
//     } else {
//         models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
//             if (searchResult == undefined) {
//                 res.statusCode = 401;
//                 //console.log("Fake or outdated session key!");
//                 res.end("Fake or outdated session key!");
//             } else {
//                 searchResult.getUser().then(function(user) {
//                     user.getRooms().then(function(rooms) {
//                     });
//                 });
//             }
//         });
//     }
// });

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(port, function(){
    console.log('Listening on port ' + port);
});