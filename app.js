var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var models = require('./models');
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));

var gameCenterId = 0;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res) {
    res.sendFile(__dirname + '/index.js');
});

app.post('/api/room', function(req, res) {
    var roomObj = {};

    models.Room.create({
    }).then(function(RoomInstance) {
        roomObj.id = RoomInstance.id;
        res.statusCode = 200;
        res.end(JSON.stringify(roomObj));
    });
});

app.post('/api/user', function(req, res) {
    var userObj = JSON.parse(Object.keys(req.body)[0]);
    var userObjReturned = {};

    models.User.create({
        username: userObj.username
    }).then(function(UserInstance) {
        userObjReturned.id = UserInstance.id;
        userObjReturned.username = UserInstance.username;
        userObjReturned.roomId = UserInstance.roomId;

        // New created users are at game center
        models.Room.findById(gameCenterId).then(function(room) {
            room.addUser(UserInstance);
        });

        res.statusCode = 200;
        res.end(JSON.stringify(userObjReturned));
    });
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(port, function(){
    console.log('Listening on port ' + port);
});