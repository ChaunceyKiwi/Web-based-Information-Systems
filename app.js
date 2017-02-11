var express = require('express');
var app = express();
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('music.db');

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
    response.statusCode = 200;
    response.setHeader('Content_type', 'application/json');

    db.all('SELECT * FROM playlists', function(err, playlists) {
        db.all('SELECT * FROM songs_playlists', function(err, songs_playlists) {
            for (var i = 0; i < songs_playlists.length; i++) {
                if (playlists[songs_playlists[i].playlist_id].songs == undefined) {
                    playlists[songs_playlists[i].playlist_id].songs = [songs_playlists[i].song_id];
                } else {
                    playlists[songs_playlists[i].playlist_id].songs.push(songs_playlists[i].song_id);
                }
            }
            response.end(JSON.stringify(playlists));
        });
    });
});

app.get('/api/songs', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content_type', 'application/json');
    db.all('SELECT * FROM songs', function (err, rows) {
        response.end(JSON.stringify(rows));
    });
});

app.listen(3000, function () {
    console.log('Amazing music app server listening on port 3000!')
});