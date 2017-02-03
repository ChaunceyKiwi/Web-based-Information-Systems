var fs = require('fs');
var file = "music.db";
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var songsLoaded = false, playlistsLoaded = false;

db.serialize(function () {
    if(!exists) {
        db.run('CREATE TABLE songs ("id" INTEGER PRIMARY KEY, "album" VARCHAR(255), ' +
            '"title" VARCHAR(255), "artist" VARCHAR(255), "duration" INTEGER)');
        db.run('CREATE TABLE playlists ("id" INTEGER PRIMARY KEY, "name" VARCHAR(255))');
        db.run('CREATE TABLE songs_playlists ("id" INTEGER PRIMARY KEY, "playlist_id" INTEGER, "song_id" INTEGER, ' +
            'FOREIGN KEY(playlist_id) REFERENCES playlists(id), FOREIGN KEY(song_id) REFERENCES songs(id))');

        // insertion of data of songs
        fs.readFile(__dirname + '/songs.json', function(err, data) {
            var music_data = JSON.parse(data);
            var songs = music_data['songs'];
            for (var i = 0; i < songs.length; i++) {
                var song = songs[i];
                db.run(`INSERT INTO songs (id, album, title, artist, duration)
                VALUES (${song.id}, "${song.album}", "${song.title}", "${song.artist}", "${song.duration}")`);
            }

            // db.each('SELECT * FROM songs', function (err, row) {
            //     console.log(row);
            // });

            console.log("Data of songs is loaded");

            songsLoaded = true;
            if (songsLoaded == true && playlistsLoaded == true) {
                db.close();
            }
        });

        // insertion of data of playlists
        fs.readFile(__dirname + '/playlists.json', function(err, data) {
            var music_data = JSON.parse(data);
            var playlists = music_data['playlists'];
            for (var i = 0; i < playlists.length; i++) {
                var playlist = playlists[i];
                db.run(`INSERT INTO playlists (id, name) VALUES (${playlist.id}, "${playlist.name}")`);
                for (var j = 0; j < playlist.songs.length; j++) {
                    db.run(`INSERT INTO songs_playlists (id, playlist_id, song_id) 
                        VALUES (null, ${playlist.id}, ${playlist.songs[j]})`);
                }
            }

            db.each('SELECT * FROM songs_playlists', function (err, row) {
                console.log(row);
            });

            console.log("Data of playlist is loaded");

            playlistsLoaded = true;
            if (songsLoaded == true && playlistsLoaded == true) {
                db.close();
            }
        });
    } else {
        console.log("Database creation failed: database exists already.");
    }
});