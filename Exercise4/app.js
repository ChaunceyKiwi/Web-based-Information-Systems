var http = require('http');
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

var getStylesheet = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/playlist.css', function(err, data) {
       response.end(data);
    });
};

var getScript = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/javascript');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/music-app.js', function(err, data) {
        response.end(data);
    });
};

var getRedirect = function(request, response) {
    response.statusCode = 301;
    response.setHeader('Location', '/playlists');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    response.end('redirecting to google');
};

var getJQuery = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/javascript');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    fs.readFile(__dirname + '/jquery-3.1.1.js', function(err, data) {
        response.end(data);
    });
};

var getPlaylists = function(request, response) {
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




    // console.log(playlists);
    // response.end(playlists);
    // console.log(playlists);
    // response.end(JSON.stringify(playlists));
    // db.all('SELECT * FROM songs_playlists', function(err, rows) {
    //     response.end(JSON.stringify(rows));
    // });
};

var getSongs = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content_type', 'application/json');
    db.all('SELECT * FROM songs', function (err, rows) {
        response.end(JSON.stringify(rows));
    });
};

var updatePlaylists = function(request, response) {
    console.log("Received a AJAX POST request.");
    var dataReceived = '';
    request.on('data', function(chunk) {
        dataReceived += chunk;
    });

    request.on('end', function() {
        try {
            var newPlaylist = JSON.parse(dataReceived);
            fs.writeFile(__dirname + '/playlists.json', JSON.stringify(newPlaylist, null, 2), function(err) {
                if(err) {
                    console.log('Unknown error!');
                } else {
                    response.statusCode = 200;
                    response.end('Update successfully!');
                }
            })
        } catch (e) {
            response.statusCode = 400;
            response.end("Invalid JSON data received");
        }
    });
};

var server = http.createServer(function(request, response){
    if ((request.url === '/playlists' || request.url === '/library' || request.url === '/search')
        && request.method === 'GET') {
        getHtml(request, response);
    } else if (request.url === '/playlist.css') {
        getStylesheet(request, response);
    } else if (request.url === '/music-app.js') {
        getScript(request, response);
    } else if (request.url === '/api/playlists') {
        if (request.method === 'GET') {
            getPlaylists(request, response);
        } else if (request.method === 'POST') {
            updatePlaylists(request, response);
        }
    } else if (request.url === '/api/songs' && request.method === 'GET') {
        getSongs(request, response);
    } else if (request.url === '/') {
        getRedirect(request, response);
    } else if (request.url === '/jquery-3.1.1.js') {
        getJQuery(request, response);
    }
    else {
        response.setHeader('Content-Type', 'text/plain');
        response.end('Amazing playlist');
    }
});

server.listen(3000, function() {
    console.log('Amazing music app server listening on port 3000!')
});
