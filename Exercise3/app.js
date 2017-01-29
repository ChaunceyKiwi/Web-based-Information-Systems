var http = require('http');
var fs = require('fs');

var getHttp = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    fs.readFile(__dirname + '/MusicApp.html', function(err, data) {
        response.end(data);
    });
};

var postHttp = function(request, response) {
    response.statusCode = 200;
    var body = '';
    request.on('data', function(chunk) {
        body += chunk;
    });
    request.on('end', function() {
        console.log(body);
        response.end('Successfully added to DB!');
    });
}

var getStylesheet = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    fs.readFile(__dirname + '/playlist.css', function(err, data) {
       response.end(data);
    });
};

var getScript = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/javascript');
    fs.readFile(__dirname + '/music-app.js', function(err, data) {
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

var getRedirect = function(request, response) {
    response.statusCode = 301;
    response.setHeader('Location', '/playlists');
    response.end('redirecting to google');
};

var getJQuery = function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/javascript');
    fs.readFile(__dirname + '/jquery-3.1.1.js', function(err, data) {
        response.end(data);
    });
}

var server = http.createServer(function(request, response){
    console.log(request.url);
    if (request.url === '/playlists' && request.method === 'GET') {
        getHttp(request, response);
    } else if (request.url === '/playlists' && request.method === 'POST') {
        postHttp(request, response);
    } else if (request.url === '/playlist.css') {
        getStylesheet(request, response);
    } else if (request.url === '/music-app.js') {
        getScript(request, response);
    } else if (request.url === '/api/playlists') {
        getPlaylists(request, response);
    } else if (request.url === '/api/songs') {
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
