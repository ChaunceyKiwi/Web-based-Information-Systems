var http = require('http');
var fs = require('fs');

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
    fs.readFile(__dirname + '/playlists.json', function(err, data) {
        response.end(data);
    });
};

var getSongs = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content_type', 'application/json');
    fs.readFile(__dirname + '/songs.json', function(err, data) {
        response.end(data);
    });
};

var updatePlaylists = function(request, response) {
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
