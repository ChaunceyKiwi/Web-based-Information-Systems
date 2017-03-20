///////////////////////////////////////////////////////////////////////////
// Variable

window.MUSIC_DATA = {};
var clicked_id = -1;
var clicked_id_for_user= -1;
var sort_method = 1; // 0 means sorted by artist, 1 means sorted by title
var songsLoaded = false;
var usersLoaded = false;
var playlistsLoaded = false;

///////////////////////////////////////////////////////////////////////////
// Function

function getPlaylistById(id) {
    var i;
    for (i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
        var playlist = window.MUSIC_DATA.playlists[i];
        if (playlist.id === id) {
            return playlist;
        }
    }
    return null;
}

function getUserByName(username) {
    var i;
    for (i = 0; i < window.MUSIC_DATA.users.length; i++) {
        var user = window.MUSIC_DATA.users[i];
        if (user.username === username) {
            return user;
        }
    }
    return null;
}

function addSongToPlaylistInUIAndMemory(songId, playlistId) {
    var playlist = getPlaylistById(playlistId);
    playlist.songs.push(parseInt(songId));
    playlist.songs.sort(function(a, b){return a-b});

    var playlist_content_container = document.getElementById("playlist-content-container" + playlistId);

    // update by clean and re-add
    var elements = playlist_content_container.getElementsByClassName("songs-item");
    while (elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    addContentOfPlaylistDetail(playlist);
}


function addSongToPlaylistInDb(songId, playlistId) {
    var obj = {};
    obj.song = parseInt(songId);
    $.post('/api/playlists/' + playlistId, JSON.stringify(obj), function(result) {
        var additionInfo = {};
        additionInfo.songId = songId;
        additionInfo.playlistId = playlistId;
        socket.emit('addSongToPlaylist', JSON.stringify(additionInfo));
        console.log(result);
    });
}

function deleteSongFromPlaylistInUIAndMemory(songId, playlistId) {
    // removed from memory
    playlistId = parseInt(playlistId);
    songId = parseInt(songId);

    var playlist = getPlaylistById(playlistId);
    var songs = playlist.songs;
    var index = songs.indexOf(parseInt(songId));
    if (index > -1) {
        songs.splice(index, 1);
    }

    // removed from in the UI
    var anchor = document.getElementById("delete_song" + songId + "_" + playlistId);
    var target = anchor.parentNode.parentNode;
    target.remove();
}

function deleteSongFromPlaylist(songId, playlistId) {
    var obj = {};
    obj.song = parseInt(songId);

    $.ajax({
        url: '/playlists/' + playlistId,
        type: 'DELETE',
        data: JSON.stringify(obj),
        contentType:'application/json',
        dataType: 'text',

        // If has been removed from the DB
        success: function(result) {
            var deletionInfo = {};
            deletionInfo.songId = songId;
            deletionInfo.playlistId = playlistId;
            socket.emit('deleteSongFromPlaylist', JSON.stringify(deletionInfo));
            console.log(result);
        },
        error: function(result){
            console.log(result);
        }
    });
}

function addUserToPlaylist(userId, playlistId) {
    var obj = {};
    obj.user = userId;

    $.post('/api/playlists/' + playlistId + "/users", JSON.stringify(obj), function(result) {
        console.log(result);
    });
}

function createNewPlaylist(name) {
    var obj = {};
    obj.name = name;

    $.post('/api/playlists', JSON.stringify(obj), function(result) {
        console.log(result);

        var res = JSON.parse(result);
        var newPlaylist = {};

        // add the new playlist to memory
        newPlaylist.id = res.id;
        newPlaylist.name = res.name;
        newPlaylist.songs = [];
        window.MUSIC_DATA.playlists.push(newPlaylist);

        // update UI with new playlist
        addPlaylist(newPlaylist.id, document.getElementById("playlist-item"), 'block');

        var playlist = getPlaylistById(newPlaylist.id);
        addContentOfPlaylistOutline(playlist);
        addContentOfPlaylistDetail(playlist);
        addModalOption(playlist);
        addPlaylistToSearchBar(playlist);
    });
}

// Hide all content, then show the content of tab clicked
function switchView(evt, tabName) {
    $(".tab-content").hide();
    $(".menu__item").children().removeClass("active");
    evt.currentTarget.parentNode.className += " active";
    $("#"+tabName).show();

    // If click tab 'playlists', go to intial page of playlist
    if(tabName === "playlists") {
        $("#playlist").show();
        $(".playlist-content").hide();
    }
    history.replaceState(null, tabName, tabName);
}

function addContentOfPlaylistOutline(playlist) {
    // Add the title of playlists
    var playlists = document.getElementById("playlists");
    var playlist_content = document.createElement("div");
    playlist_content.className = "row playlist-content";
    playlist_content.id = "playlist-content" + playlist.id;
    playlist_content.style.display = "none";

    var playlist_content_container = document.createElement("div");
    playlist_content_container.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 playlist-content-container";
    playlist_content_container.id = "playlist-content-container" + playlist.id;

    var playlist_content_header = document.createElement("div");
    playlist_content_header.className = "row";

    var playlist_content_heading = document.createElement("div");
    playlist_content_heading.className = "playlist-content-heading col-xs-8 col-sm-8 col-md-8 col-lg-8";

    var heading_name = document.createTextNode(playlist.name);

    var addUserToPlaylistButton = document.createElement("button");
    addUserToPlaylistButton.className = "btn btn-addUser col-xs-4 col-sm-4 col-md-4 col-lg-4";
    addUserToPlaylistButton.innerHTML = "<span class='glyphicon glyphicon-plus'></span> User";

    addUserToPlaylistButton.onclick = function() {
        document.getElementById("myModal3").style.display = "block";
        clicked_id_for_user = event.target.parentElement.parentElement.id.replace("playlist-content-container","");
    };

    playlists.appendChild(playlist_content);
    playlist_content.appendChild(playlist_content_container);
    playlist_content_container.appendChild(playlist_content_header);
    playlist_content_heading.appendChild(heading_name);
    playlist_content_header.appendChild(playlist_content_heading);
    playlist_content_header.appendChild(addUserToPlaylistButton);
}

// add content of playlist to playlists tab
function addContentOfPlaylistDetail(playlist) {
    // Add the songs to the corresponding playlists
    for (var j = 0; j < playlist.songs.length; j++) {
        var song_id = playlist.songs[j];
        var list_group_item = document.createElement("div");
        list_group_item.className = "songs-item";
        var square = document.createElement("div");
        square.className = "square";
        var song_info = document.createElement("div");
        song_info.className = "song-info";
        var song_title = document.createElement("div");
        song_title.className = "song-title";
        var song_artist = document.createElement("div");
        song_artist.className = "song-artist";
        var title_content = document.createTextNode(window.MUSIC_DATA.songs[song_id].title);
        var artist_content = document.createTextNode(window.MUSIC_DATA.songs[song_id].artist);
        var play = document.createElement("span");
        play.className = "glyphicon glyphicon-play";

        var plus_sign = document.createElement("div");
        var plus_sign_icon = document.createElement("span");
        plus_sign_icon.id = "song" + window.MUSIC_DATA.songs[song_id].id;
        plus_sign_icon.className = "glyphicon glyphicon-plus-sign glyphicon-plus-sign-playlist";
        plus_sign.onclick = function() {
            document.getElementById("myModal").style.display = "block";
            clicked_id = event.target.id.replace("song","");
        };

        var delete_sign = document.createElement("div");
        var delete_sign_icon = document.createElement("span");
        delete_sign_icon.id = "delete_song" + window.MUSIC_DATA.songs[song_id].id
            + "_" + playlist.id;
        delete_sign_icon.className = "glyphicon glyphicon-remove";
        delete_sign.onclick = function() {
            clicked_id = event.target.id.replace("delete_song","");

            var pos = clicked_id.indexOf('_');
            var song_id = clicked_id.substring(0, pos);
            var playlists_id = clicked_id.substring(pos+1);

            deleteSongFromPlaylist(song_id, playlists_id);
        };

        var playlist_content_container = document.getElementById("playlist-content-container"
            + playlist.id);
        playlist_content_container.appendChild(list_group_item);
        list_group_item.appendChild(square);
        list_group_item.appendChild(song_info);
        list_group_item.appendChild(plus_sign);
        list_group_item.appendChild(delete_sign);
        list_group_item.appendChild(play);
        song_info.appendChild(song_title);
        song_info.appendChild(song_artist);
        plus_sign.appendChild(plus_sign_icon);
        delete_sign.appendChild(delete_sign_icon);
        song_title.appendChild(title_content);
        song_artist.appendChild(artist_content);
    }
}

function addSong(i, target, displayOption) {
    var item = document.createElement("div");
    item.className = "songs-item";
    item.style.display = displayOption;

    var square = document.createElement("div");
    square.className = "square";

    var title = document.createElement("div");
    var title_content = document.createTextNode(window.MUSIC_DATA.songs[i].title);
    title.className = "song-title";

    var artist = document.createElement("div");
    var artist_content = document.createTextNode(window.MUSIC_DATA.songs[i].artist);
    artist.className = "song-artist";

    var song_info = document.createElement("div");
    song_info.className = "song-info";

    var play = document.createElement("span");
    play.className = "glyphicon glyphicon-play";

    var plus_sign = document.createElement("div");
    var plus_sign_icon = document.createElement("span");
    plus_sign_icon.id = "song" + window.MUSIC_DATA.songs[i].id;
    plus_sign_icon.className = "glyphicon glyphicon-plus-sign";
    plus_sign.onclick = function() {
        document.getElementById("myModal").style.display = "block";
        clicked_id = event.target.id.replace("song","");
    };

    plus_sign.appendChild(plus_sign_icon);
    title.appendChild(title_content);
    artist.appendChild(artist_content);
    song_info.appendChild(title);
    song_info.appendChild(artist);
    item.appendChild(square);
    item.appendChild(song_info);
    item.appendChild(plus_sign);
    item.appendChild(play);
    target.appendChild(item);
}

// add playlists to the content of playlists tab
function addPlaylist(playlist, target, displayOption) {
    var item = document.createElement("div");
    item.className = "playlists-item";
    item.id = "playlist" + playlist.id;
    item.style.display = displayOption;
    item.onclick = function() {
        var playlist = document.getElementById("playlist");
        playlist.style.display = "none";
        var id = event.target.id.replace("playlist","");
        var playlist_content_id = "playlist-content" + id.toString();
        var playlist_content = document.getElementById(playlist_content_id);
        var playlist_contents = document.getElementsByClassName("playlist-content");
        for (var j = 0; j < playlist_contents.length; j++) {
            playlist_contents[j].style.display = "none";
        }
        playlist_content.style.display = "block";
    };

    var square = document.createElement("div");
    square.className = "square";

    var list_name = document.createElement("div");
    var txt = document.createTextNode(playlist.name);
    list_name.className = "list-name";

    var chevron = document.createElement("span");
    chevron.className = "glyphicon glyphicon-chevron-right";

    list_name.appendChild(txt);
    item.appendChild(square);
    item.appendChild(list_name);
    item.appendChild(chevron);
    target.appendChild(item);
}

// add playlists to the content of search tab
function addPlaylistToSearchBar(playlist) {
    var search = document.getElementById("search-playlists");
    var item = document.createElement("div");
    item.className = "playlists-item";
    item.id = "playlist-search" + playlist.id;
    item.style.display = "none";
    item.onclick = function() {
        var id = event.target.id.replace("playlist-search","");
        document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
        document.getElementById("playlist"+id).click();
    };

    var square = document.createElement("div");
    square.className = "square";

    var list_name = document.createElement("div");
    var txt = document.createTextNode(playlist.name);
    list_name.className = "list-name";

    var chevron = document.createElement("span");
    chevron.className = "glyphicon glyphicon-chevron-right";

    list_name.appendChild(txt);
    item.appendChild(square);
    item.appendChild(list_name);
    item.appendChild(chevron);
    search.appendChild(item);
}

// modal initialization
function addModalOption(playlist) {
    // Add modal options
    var items = document.getElementById("playlist-items-for-modal");
    var itemForModal = document.createElement("a");
    itemForModal.className = "playlist-in-modal";
    var text = document.createTextNode(playlist.name);
    itemForModal.appendChild(text);
    items.appendChild(itemForModal);

    // when click name of playlist, add song to that list
    itemForModal.onclick = function() {
        var play_list_name = event.target.innerText;
        if(playlist.name === play_list_name) {
            if (!isElementAlreadyInTheArray(parseInt(clicked_id), playlist.songs)) {
                addSongToPlaylistInDb(clicked_id, playlist.id);
            }
        }
        document.getElementById("myModal").style.display = "none";
    };
}

// modal initialization for adding user
function addUserOption(user) {
    // Add modal options
    var items = document.getElementById("users-for-modal");
    var itemForModal = document.createElement("a");
    itemForModal.className = "user-in-modal";
    var text = document.createTextNode(user.username);
    itemForModal.appendChild(text);
    items.appendChild(itemForModal);

    // when click name of playlist, add song to that list
    itemForModal.onclick = function() {
        var username = event.target.innerText;
        var user = getUserByName(username);
        var userId = user.id;
        addUserToPlaylist(userId, clicked_id_for_user);
        document.getElementById("myModal3").style.display = "none";
    };
}

function isElementAlreadyInTheArray(elem, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === elem) {
            return true;
        }
    }
    return false;
}

function runApplication() {
    var i;

    for (i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
        var playlist = window.MUSIC_DATA.playlists[i];
        addPlaylist(playlist, document.getElementById("playlist-item"), 'block');
        addPlaylistToSearchBar(playlist);
        addModalOption(playlist);
        addContentOfPlaylistOutline(playlist);
        addContentOfPlaylistDetail(playlist);
    }

    for (i = 0; i < window.MUSIC_DATA.users.length; i++) {
        var user = window.MUSIC_DATA.users[i];
        addUserOption(user);
    }

    for (i = 0; i < window.MUSIC_DATA.songs.length; i++) {
        // add songs to the content of library tab
        addSong(i, document.getElementById("library-item"), 'block');

        // add songs to the content of search tab
        addSong(i, document.getElementById("search-songs"), 'none');
    }

    document.getElementById("button-sort-by-artist").click();
    if (window.location.href.indexOf('/playlist') > -1 ) {
        document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
    } else if (window.location.href.indexOf('/library') > -1) {
        document.getElementsByClassName("menu__item--library")[0].children[0].click();
    } else if (window.location.href.indexOf('/search') > -1) {
        document.getElementsByClassName("menu__item--search")[0].children[0].click();
    } else if (window.location.href.indexOf('/users') > -1) {
        document.getElementsByClassName("menu__item--users")[0].children[0].click();
    }
}

///////////////////////////////////////////////////////////////////////////
// Event binding
window.onclick = function() {
    if (event.target == document.getElementById("myModal")) {
        document.getElementById("myModal").style.display = "none";
    }
};

document.getElementById("button-sort-by-artist").onclick = function() {
    if (sort_method === 1) {
        sort_method = 0;
        var button_sort_by_title = document.getElementById("button-sort-by-title");
        this.className = this.className + " button-sort-selected";
        button_sort_by_title.className =
            button_sort_by_title.className.replace(" button-sort-selected", "");
    }

    var list = document.getElementById("library-item").children;
    var listArray = Array.prototype.slice.call(list, 0);

    // sort by artist
    listArray.sort(function(a, b) {
        var artistA = a.children[1].children[1].innerText;
        var artistB = b.children[1].children[1].innerText;
        artistA = artistA.replace("The ","").toLowerCase();
        artistB = artistB.replace("The ","").toLowerCase();
        return artistA.localeCompare(artistB);
    });

    for (var i = 0; i < list.length; i++) {
        listArray[i].parentNode.appendChild(listArray[i]);
    }
};

document.getElementById("button-sort-by-title").onclick = function() {
    if (sort_method === 0) {
        sort_method = 1;
        var button_sort_by_artist = document.getElementById("button-sort-by-artist");
        this.className = this.className + " button-sort-selected";
        button_sort_by_artist.className =
            button_sort_by_artist.className.replace(" button-sort-selected", "");
    }

    var list = document.getElementById("library-item").children;
    var listArray = Array.prototype.slice.call(list, 0);

    // sort by title
    listArray.sort(function(a, b) {
        var artistA = a.children[1].children[0].innerText;
        var artistB = b.children[1].children[0].innerText;
        artistA = artistA.replace("The ","").toLowerCase();
        artistB = artistB.replace("The ","").toLowerCase();
        return artistA.localeCompare(artistB);
    });

    for (var i = 0; i < list.length; i++) {
        listArray[i].parentNode.appendChild(listArray[i]);
    }
};

document.getElementById("search-bar").onkeyup = function() {
    var filter = this.value.toUpperCase();
    var search = document.getElementById("search");
    var playlists_item = search.getElementsByClassName("playlists-item");
    var songs_item = search.getElementsByClassName("songs-item");
    var regex = new RegExp(this.value.toUpperCase(), "i");
    var i, textParent;

    for (i = 0; i < playlists_item.length; i++) {
        textParent = playlists_item[i].children[1];
        if (filter == "") {
            textParent.parentNode.style.display = "none";
        } else if (regex.test(textParent.innerText) == true) {
            textParent.parentNode.style.display = "block";
        } else {
            textParent.parentNode.style.display = "none";
        }
    }

    for (i = 0; i < songs_item.length; i++) {
        textParent = songs_item[i].children[1];
        if (filter == "") {
            textParent.parentNode.style.display = "none";
        }else if (regex.test(textParent.children[0].innerText) == true
            || regex.test(textParent.children[1].innerText) == true) {
            textParent.parentNode.style.display = "block";
        } else {
            textParent.parentNode.style.display = "none";
        }
    }
};

document.getElementsByClassName("menu__item--library")[0].children[0].onclick  = function() {
    switchView(event, 'library');
};

document.getElementsByClassName("menu__item--playlists")[0].children[0].onclick  = function() {
    switchView(event, 'playlists');
};

document.getElementsByClassName("menu__item--search")[0].children[0].onclick  = function() {
    switchView(event, 'search');
};

document.getElementsByClassName("menu__item--users")[0].children[0].onclick  = function() {
    console.log("aha?");
    switchView(event, 'users');
};

document.getElementById("btn-addlist").onclick = function() {
    document.getElementById("myModal2").style.display = "block";
};

document.getElementById("btn-addListConfirm").onclick = function() {
    var newPlaylist = {};
    newPlaylist.id = window.MUSIC_DATA.playlists.length;
    newPlaylist.name = document.getElementById("input-newListName").value;
    newPlaylist.songs = [];

    createNewPlaylist(newPlaylist.name);
    document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
    document.getElementById("myModal2").style.display = "none";
};

document.getElementById("loginConfirm").onclick = function() {
    var userInfo = {};
    userInfo.username = document.getElementById("username").value;
    userInfo.password = document.getElementById("password").value;

    $.post('./login', JSON.stringify(userInfo), function(data, status) {
        if (status === 'success') {
            location.pathname ='/playlists';
        } else {
            console.log(data);
        }
    });
};

document.getElementById("close-modal2").onclick = function() {
    document.getElementById("myModal2").style.display = "none";
};

document.getElementById("close-modal").onclick = function() {
    document.getElementById("myModal").style.display = "none";
};

///////////////////////////////////////////////////////////////////////////
// Initialization

/* Fetch data of playlists from server */
var socket = io('/');

socket.on('deleteSongFromPlaylist', function(data) {
    var songId = JSON.parse(data).songId;
    var playlistId = JSON.parse(data).playlistId;
    deleteSongFromPlaylistInUIAndMemory(songId, playlistId);
});

socket.on('addSongToPlaylist', function(data) {
    var songId = JSON.parse(data).songId;
    var playlistId = JSON.parse(data).playlistId;
    addSongToPlaylistInUIAndMemory(songId, playlistId);
});

if (window.location.href.indexOf('/users') > -1) {
    document.getElementsByClassName("menu__item--users")[0].children[0].click();
}

/* Fetch data of playlists from server */
$.get('/api/playlists', function(data) {
    window.MUSIC_DATA.playlists = JSON.parse(data).playlists;
    playlistsLoaded = true;
    if (songsLoaded == true && usersLoaded == true) {
        runApplication();
    }
});

/* Fetch data of songs from server */
$.get('/api/songs', function(data) {
    window.MUSIC_DATA.songs = JSON.parse(data).songs;
    songsLoaded = true;
    if (playlistsLoaded == true && usersLoaded == true) {
        runApplication();
    }
});

/* Fetch data of users from server */
$.get('/api/users', function(data) {
    window.MUSIC_DATA.users = JSON.parse(data).users;
    usersLoaded = true;
    if (playlistsLoaded == true && songsLoaded == true) {
        runApplication();
    }
});