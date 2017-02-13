var express = require('express');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var db = new sqlite3.Database('music.db');
var models = require('./models');

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));

var getHtml = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/MusicApp.html', function(err, data) {
        response.end(data);
    });
};

app.get('/library', getHtml);
app.get('/playlists', getHtml);
app.get('/search', getHtml);

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

app.get('/jquery-3.1.1.js', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/javascript');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/jquery-3.1.1.js', function(err, data) {
        response.end(data);
    });
});

app.get('/api/playlists', function(request, response) {
    var data = {};

    models.Playlist.findAll({
        attributes: ['id', 'name'],
        include: [{
            model: models.Song,
            attributes: ['id'],
            through: {
                attributes: []
            }
        }]
    }).then(function(playlists) {
        response.statusCode = 200;
        response.setHeader('Content_type', 'application/json');

        data["playlists"] = playlists.map(function(playlist) {
            var jsonObj =  playlist.get({plain: true});
            for (i = 0; i < jsonObj.Songs.length; i++) {
                jsonObj.Songs[i] = jsonObj.Songs[i].id;
            }
            jsonObj["songs"] =  jsonObj["Songs"];
            delete jsonObj["Songs"];
            return jsonObj;
        });

        response.end(JSON.stringify(data));
    });
});

app.get('/api/songs', function(request, response) {
    var data = {}
    models.Song.findAll({
            attributes: ['album', 'duration', 'title', 'id', 'artist']
        }).then(function(songs) {
            response.statusCode = 200;
            response.setHeader('Content_type', 'application/json');
            data["songs"] = songs.map(function(song){
                return song.get({plain: true});
            });

            // console.log(data.songs.length);
            response.end(JSON.stringify(data));
        });
});

app.listen(3000, function () {
    console.log('Amazing music app server listening on port 3000!')
});