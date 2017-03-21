var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var models = require('./models');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));
app.use(cookieParser());
var server = require('http').Server(app);
var io = require('socket.io')(server);

var getHtml = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/MusicApp.html', function(err, data) {
        response.end(data);
    });
};

var generateKey = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

app.get('/library', getHtml);
app.get('/playlists', getHtml);
app.get('/search', getHtml);
app.get('/login', getHtml);

app.get('/playlist.css', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/playlist.css', function(err, data) {
        response.end(data);
    });
});

app.get('/music-app.js', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/javascript');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/music-app.js', function(err, data) {
        response.end(data);
    });
});

app.get('/', function(request, response) {
    response.statusCode = 301;
    response.setHeader('Location', '/playlists');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    response.end('Redirecting');
});

var getPlaylists = function(callback, request){
    var data = {};
    var i;
    var key = request.cookies.sessionKey;

    if (key == undefined) {
        console.log("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                console.log("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    user.getPlaylists({
                        attributes: ['id', 'name'],
                        include: [{
                            model: models.Song,
                            attributes: ['id'],
                            through: {
                                attributes: []
                            }
                        }]
                    }).then(function(playlists) {
                        data["playlists"] = playlists.map(function(playlist) {
                            var jsonObj =  playlist.get({plain: true});
                            for (i = 0; i < jsonObj.Songs.length; i++) {
                                jsonObj.Songs[i] = jsonObj.Songs[i].id;
                            }
                            jsonObj["songs"] =  jsonObj["Songs"];
                            delete jsonObj["Songs"];
                            delete jsonObj["Users_Playlists"];
                            return jsonObj;
                        });

                        callback(data);
                    });
                });
            }
        });
    }
};

app.get('/api/playlists', function(request, response) {
    getPlaylists(function(playlistsData) {
        response.statusCode = 200;
        response.setHeader('Content_type', 'application/json');
        response.end(JSON.stringify(playlistsData));
    }, request);
});

app.get('/api/songs', function(request, response) {
    var data = {};
    models.Song.findAll({
            attributes: ['album', 'duration', 'title', 'id', 'artist']
        }).then(function(songs) {
            response.statusCode = 200;
            response.setHeader('Content_type', 'application/json');
            data["songs"] = songs.map(function(song){
                return song.get({plain: true});
            });
            response.end(JSON.stringify(data));
        });
});

app.get('/api/users', function(request, response) {
   var data = {};
   models.User.findAll({
       attributes: ['id', 'username']
   }).then(function(users) {
       response.statusCode = 200;
       response.setHeader('Content_type', 'application/json');
       data["users"] = users.map(function(user) {
           return user.get({plain: true});
       });
       response.end(JSON.stringify(data));
   })
});

// add a song to a playlist
app.post('/api/playlists/:playlistId([0-9]+)', function(request, response) {
    var songId = JSON.parse(Object.keys(request.body)[0]).song;
    var playlistId = request.params['playlistId'];
    var key = request.cookies.sessionKey;

    if (key == undefined) {
        console.log("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                console.log("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    user.getPlaylists({
                        where: {'id': playlistId}
                    }).then(function(PlaylistInstance) {
                        if (PlaylistInstance.length == 0) {
                            response.statusCode = 403;
                            response.end("Authorization failed!");
                        } else {
                            models.Song.findById(songId).then(function(song) {
                                PlaylistInstance[0].addSong(song);
                                response.statusCode = 200;
                                response.end("success!");
                            });
                        }
                    });
                });
            }
        });
    }
});

// return the information of local machine
app.get('/api/myInfo', function(request, response) {
    var key = request.cookies.sessionKey;
    var userData = {};

    if (key == undefined) {
        console.log("No session key found!");
        response.statusCode = 200;
        response.end("Unauthorized");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                response.statusCode = 200;
                response.end("Unauthorized");
            } else {
                searchResult.getUser().then(function(user) {
                    userData.id = user.id;
                    userData.username = user.username;
                    response.statusCode = 200;
                    response.end(JSON.stringify(userData));
                });
            }
        });
    }
});

// give user authority on playlist
app.post('/api/playlists/:id/users', function(request, response) {
    var userId = JSON.parse(Object.keys(request.body)[0]).user;
    var playlistId = request.params['id'];
    var key = request.cookies.sessionKey;

    if (key == undefined) {
        console.log("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                console.log("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    user.getPlaylists({
                        where: {'id': playlistId}
                    }).then(function(PlaylistInstance) {
                        if (PlaylistInstance.length == 0) {
                            response.statusCode = 403;
                            response.end("Authorization failed!");
                        } else {
                            models.User.findById(userId).then(function(user) {
                                PlaylistInstance[0].addUser(user);
                                response.statusCode = 200;
                                response.end("success!");
                            });
                        }
                    });
                });
            }
        });
    }
});

// create a new playlist
app.post('/api/playlists', function(request, response) {
    var playlist = JSON.parse(Object.keys(request.body)[0]);
    var obj = {};
    var userId = playlist.userId;

    models.Playlist.create({
        name: playlist.name
    }).then(function(PlaylistInstance) {
        console.log(userId);
        models.User.findById(userId).then(function(user) {
            console.log("Found");
            obj.id = PlaylistInstance.id;
            obj.name = PlaylistInstance.name;
            PlaylistInstance.addUser(user);
            response.statusCode = 200;
            response.end(JSON.stringify(obj));
        });
    });
});

// handling login request
app.post('/login', function(request, response) {
    var userInfo = JSON.parse(Object.keys(request.body)[0]);

    console.log(userInfo);

    models.User.findAll({
        where: {
            username: userInfo.username
        }
    }).then(function(searchResult) {
        var key_generated = generateKey();
        if (searchResult.length === 1) {
            bcrypt.compare(userInfo.password, searchResult[0].password, function(err, res) {
                if(res) {
                    models.Session.create({
                        sessionKey: key_generated
                    }).then(function(SessionInstance) {
                        models.User.findById(searchResult[0].id).then(function(user) {
                            SessionInstance.setUser(user);
                            response.statusCode = 200;
                            response.setHeader('Set-Cookie', "sessionKey=" + key_generated);
                            response.end();
                        })
                    });
                } else {
                    response.statusCode = 401;
                    response.end("Incorrect password!");
                }
            });
        } else {
            response.statusCode = 401;
            response.end("Incorrect username!");
        }
    });
});

// removing a song from a playlist
app.delete('/playlists/:playlistId', function(request, response) {
    var playlistId = request.params['playlistId'];
    var songId = request.body.song;
    var key = request.cookies.sessionKey;

    if (key == undefined) {
        console.log("No session key found!");
    } else {
        models.Session.findOne({where: {sessionKey: key}}).then(function(searchResult) {
            if (searchResult == undefined) {
                console.log("Fake or outdated session key!");
            } else {
                searchResult.getUser().then(function(user) {
                    user.getPlaylists({
                        where: {'id': playlistId}
                    }).then(function(PlaylistInstance) {
                        if (PlaylistInstance.length == 0) {
                            response.statusCode = 403;
                            response.end("Authorization failed!");
                        } else {
                            models.Song.findById(songId).then(function(song) {
                                PlaylistInstance[0].removeSong(song);
                                response.statusCode = 200;
                                response.end("success!");
                            });
                        }
                    });
                });
            }
        });
    }
});

io.on('connection', function(socket) {
    console.log('A user connected!');

    // When a user request for a playlist, send it
    socket.on('deleteSongFromPlaylist', function(msg) {
        io.emit('deleteSongFromPlaylist', msg);
    });

    socket.on('addSongToPlaylist', function(msg) {
        io.emit('addSongToPlaylist', msg);
    });
});

server.listen(3000, function () {
    console.log('Amazing music app server listening on port 3000!')
});