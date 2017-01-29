///////////////////////////////////////////////////////////////////////////
// Initialization
window.MUSIC_DATA = {};
var clicked_id = -1;
var sort_method = 1; // 0 means sorted by artist, 1 means sorted by title
var songsLoaded = false;
var playlistsLoaded = false;

// Fetch data of playlists from server
$.get('/api/playlists', function(data) {
    var playlistArray = JSON.parse(data);
    window.MUSIC_DATA.playlists = playlistArray.playlists;
    songsLoaded = true;
    if (playlistsLoaded == true) {
        runApplication();
    }});

// Fetch data of songs from server
$.get('/api/songs', function(data) {
    var songsArray = JSON.parse(data);
    window.MUSIC_DATA.songs = songsArray.songs;
    playlistsLoaded = true;
    if (songsLoaded == true) {
        runApplication();
    }
});

///////////////////////////////////////////////////////////////////////////
// Function
function syncPlaylistsToServer() {
    var obj = {};
    obj.playlists = window.MUSIC_DATA.playlists;

    // contain the playlist data in the POST body
    $.post('/api/playlists', JSON.stringify(obj), function(result) {
        console.log(result);
    });
}

function switchView(evt, tabName) {
    // Hide all content, then show the content of tab clicked
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    var menu_item = document.getElementsByClassName("menu__item");
    var menu_item_modifier = menu_item[0].children;
    for (var i = 0; i < menu_item_modifier.length; i++) {
        menu_item_modifier[i].className = menu_item_modifier[i].className.replace("active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.parentNode.className += " active";

    // If click tab 'playlists', go to intial page
    if(tabName === "playlists") {
        document.getElementById("playlist").style.display = "block";
        var playlist_contents = document.getElementsByClassName("playlist-content");
        for (var j = 0; j < playlist_contents.length; j++) {
            playlist_contents[j].style.display = "none";
        }
    }

    history.replaceState(null, tabName, tabName);
}

function isElementAlreadyInTheArray(elem, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === elem) {
            return true;
        }
    }
    return false;
}

function addContentOfPlayList(i) {
    // Add the title of playlists
    var playlists = document.getElementById("playlists");
    var playlist_content = document.createElement("div");
    playlist_content.className = "row playlist-content";
    playlist_content.id = "playlist-content" + window.MUSIC_DATA.playlists[i].id;
    playlist_content.style.display = "none";

    var playlist_content_container = document.createElement("div");
    playlist_content_container.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 playlist-content-container";

    var playlist_content_heading = document.createElement("div");
    playlist_content_heading.className = "playlist-content-heading";
    var heading_name = document.createTextNode(window.MUSIC_DATA.playlists[i].name);

    playlists.appendChild(playlist_content);
    playlist_content.appendChild(playlist_content_container);
    playlist_content_container.appendChild(playlist_content_heading);
    playlist_content_heading.appendChild(heading_name);

    // Add the songs to the corresponding playlists
    for (var j = 0; j < window.MUSIC_DATA.playlists[i].songs.length; j++) {
        var song_id = window.MUSIC_DATA.playlists[i].songs[j];
        var list_group_item = document.createElement("div");
        list_group_item.className = "list-group-item songs-item";
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
        var plus_sign = document.createElement("a");
        var plus_sign_icon = document.createElement("span");
        plus_sign_icon.id = "song" + window.MUSIC_DATA.songs[song_id].id;
        plus_sign_icon.className = "glyphicon glyphicon-plus-sign";
        plus_sign.onclick = function() {
            document.getElementById("myModal").style.display = "block";
            clicked_id = event.target.id.replace("song","");
        };

        playlist_content_container.appendChild(list_group_item);
        list_group_item.appendChild(square);
        list_group_item.appendChild(song_info);
        list_group_item.appendChild(plus_sign);
        list_group_item.appendChild(play);
        song_info.appendChild(song_title);
        song_info.appendChild(song_artist);
        plus_sign.appendChild(plus_sign_icon);
        song_title.appendChild(title_content);
        song_artist.appendChild(artist_content);
    }
}

function addSong(i, target, displayOption) {
    var item = document.createElement("div");
    item.className = "list-group-item songs-item";
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

    var plus_sign = document.createElement("a");
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

function addPlaylist(i, target, displayOption) {
    var item = document.createElement("div");
    item.className = "list-group-item playlists-item";
    item.id = "playlist" + window.MUSIC_DATA.playlists[i].id;
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
    var txt = document.createTextNode(window.MUSIC_DATA.playlists[i].name);
    list_name.className = "list-name";

    var chevron = document.createElement("span");
    chevron.className = "glyphicon glyphicon-chevron-right";

    list_name.appendChild(txt);
    item.appendChild(square);
    item.appendChild(list_name);
    item.appendChild(chevron);
    target.appendChild(item);
}

function addPlaylistToSearchBar(i) {
    var search = document.getElementById("search");
    var item = document.createElement("div");
    item.className = "list-group-item playlists-item";
    item.id = "playlist-search" + window.MUSIC_DATA.playlists[i].id;
    item.style.display = "none";
    item.onclick = function() {
        var id = event.target.id.replace("playlist-search","");
        document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
        document.getElementById("playlist"+id).click();
    }

    var square = document.createElement("div");
    square.className = "square";

    var list_name = document.createElement("div");
    var txt = document.createTextNode(window.MUSIC_DATA.playlists[i].name);
    list_name.className = "list-name";

    var chevron = document.createElement("span");
    chevron.className = "glyphicon glyphicon-chevron-right";

    list_name.appendChild(txt);
    item.appendChild(square);
    item.appendChild(list_name);
    item.appendChild(chevron);
    search.appendChild(item);
}

function addModalOption(index) {
    // Add modal options
    var items = document.getElementById("playlist-items-for-modal");
    var itemForModal = document.createElement("a");
    itemForModal.className = "playlist-in-model";
    var text = document.createTextNode(window.MUSIC_DATA.playlists[index].name);
    itemForModal.appendChild(text);
    items.appendChild(itemForModal);

    // when click name of playlist, add song to that list
    itemForModal.onclick = function() {
        var play_list_name = event.target.innerText;
        for (var i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
            if(window.MUSIC_DATA.playlists[i].name === play_list_name) {
                if (!isElementAlreadyInTheArray(parseInt(clicked_id), window.MUSIC_DATA.playlists[i].songs)) {
                    window.MUSIC_DATA.playlists[i].songs.push(parseInt(clicked_id));
                    window.MUSIC_DATA.playlists[i].songs.sort(function(a, b){return a-b});
                    var playlist_content = document.getElementById("playlist-content" + i);
                    playlist_content.parentNode.removeChild(playlist_content);
                    addContentOfPlayList(i);
                    syncPlaylistsToServer();
                }
            }
        }
        document.getElementById("myModal").style.display = "none";
    }
}

function runApplication() {
    for (var i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
        // add playlists to the content of playlists tab
        addPlaylist(i, document.getElementById("playlist-item"), 'block');

        // modal initialization
        addModalOption(i);

        // add playlists to the content of search tab
        addPlaylistToSearchBar(i);

        // add content of playlist to playlists tab
        addContentOfPlayList(i);
    }

    for (var i = 0; i < window.MUSIC_DATA.songs.length; i++) {
        // add songs to the content of library tab
        addSong(i, document.getElementById("library-item"), 'block');

        // add songs to the content of search tab
        addSong(i, document.getElementById("search"), 'none');
    }

    document.getElementById("button-sort-by-artist").click();
    if (window.location.href.indexOf('/playlist') > -1 ) {
        document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
    } else if (window.location.href.indexOf('/library') > -1) {
        document.getElementsByClassName("menu__item--library")[0].children[0].click();
    } else if (window.location.href.indexOf('/search') > -1) {
        document.getElementsByClassName("menu__item--search")[0].children[0].click();
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

    var sort_by_artist = function(a, b) {
        var artistA = a.children[1].children[1].innerText;
        var artistB = b.children[1].children[1].innerText;
        artistA = artistA.replace("The ","").toLowerCase();
        artistB = artistB.replace("The ","").toLowerCase();
        return artistA.localeCompare(artistB);
    }

    var list = document.getElementById("library-item").children;
    var listArray = Array.prototype.slice.call(list, 0);
    listArray.sort(sort_by_artist);
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

    var sort_by_artist = function(a, b) {
        var artistA = a.children[1].children[0].innerText;
        var artistB = b.children[1].children[0].innerText;
        artistA = artistA.replace("The ","").toLowerCase();
        artistB = artistB.replace("The ","").toLowerCase();
        return artistA.localeCompare(artistB);
    }

    var list = document.getElementById("library-item").children;
    var listArray = Array.prototype.slice.call(list, 0);
    listArray.sort(sort_by_artist);
    for (var i = 0; i < list.length; i++) {
        listArray[i].parentNode.appendChild(listArray[i]);
    }
};

document.getElementById("search-bar").onkeyup = function() {
    var filter = this.value.toUpperCase();
    var search = document.getElementById("search");
    var list_group_item = search.getElementsByClassName("list-group-item");
    for (var i = 0; i < list_group_item.length; i++) {
        var textParent = list_group_item[i].children[1];
        if (filter == "") {
            textParent.parentNode.style.display = "none";
        } else {
            if (textParent.children.length === 0) {
                if (textParent.innerText.toUpperCase().indexOf(filter) > -1) {
                    textParent.parentNode.style.display = "block";
                } else {
                    textParent.parentNode.style.display = "none";
                }
            } else if (textParent.children.length === 2) {
                var search_title = textParent.children[0].innerText.toUpperCase().indexOf(filter);
                var search_artist = textParent.children[1].innerText.toUpperCase().indexOf(filter);
                if (search_title > -1 | search_artist > -1) {
                    textParent.parentNode.style.display = "block";
                } else {
                    textParent.parentNode.style.display = "none";
                }
            }
        }
    }
};

document.getElementsByClassName("menu__item--library")[0].children[0].onclick  = function() {
    switchView(event, 'library')
};

document.getElementsByClassName("menu__item--playlists")[0].children[0].onclick  = function() {
    switchView(event, 'playlists')
};

document.getElementsByClassName("menu__item--search")[0].children[0].onclick  = function() {
    switchView(event, 'search')
};

document.getElementById("btn-addlist").onclick = function() {
    document.getElementById("myModal2").style.display = "block";
};

document.getElementById("btn-addListConfirm").onclick = function() {
    var newPlaylist = {};
    newPlaylist.id = window.MUSIC_DATA.playlists.length;
    newPlaylist.name = document.getElementById("input-newListName").value;
    newPlaylist.songs = [];
    window.MUSIC_DATA.playlists.push(newPlaylist);
    syncPlaylistsToServer();
    document.getElementById("myModal2").style.display = "none";
    addPlaylist(newPlaylist.id, document.getElementById("playlist-item"), 'block');
    addContentOfPlayList(newPlaylist.id);
    document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
};

document.getElementById("close-modal2").onclick = function() {
    document.getElementById("myModal2").style.display = "none";
};

document.getElementById("close-modal").onclick = function() {
    document.getElementById("myModal").style.display = "none";
};