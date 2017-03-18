var fs = require('fs');
var models = require('./models');

models.sequelize.sync({force: true}).then(function() {
    var songsObj;
    fs.readFile('./songs.json', function(err, data) {
        var music_data = JSON.parse(data);
        var songs = music_data['songs'];
        songsObj = songs;

        songs.forEach(function(song) {
            models.Song.create({
                id: song.id.toString(),
                title: song.title,
                album: song.album,
                artist: song.artist,
                duration: song.duration
            });
        });
    });

    fs.readFile('./playlists.json', function(err, data) {
        var songId, i;
        var music_data = JSON.parse(data);
        var playlists = music_data['playlists'];

        playlists.forEach(function(playlist) {
            models.Playlist.create({
                id: playlist.id.toString(),
                name: playlist.name
            }).then(function(PlaylistInstance) {
                for (i = 0; i < playlist.songs.length; i++) {
                    songId = playlist.songs[i];
                    models.Song.findById(songId).then(function(song) {
                        PlaylistInstance.addSong(song);
                    })
                }
            });
        });
    });

    fs.readFile('./users.json', function(err, data) {
        var playlistId, i;
        var music_data = JSON.parse(data);
        var users = music_data['users'];

        users.forEach(function(user) {
            models.User.create({
                username: user.username,
                password: user.password
            }).then(function(UserInstance) {
                for (i = 0; i < user.playlists.length; i++) {
                    playlistId = user.playlists[i];
                    models.Playlist.findById(playlistId).then(function(playlist) {
                        UserInstance.addPlaylist(playlist);
                    })
                }
            });
        });
    });

});
