///////////////////////////////////////////////////////////////////////////
// Event binding
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
}

document.getElementsByClassName("menu__item--library")[0].children[0].onclick  = function() {
    switchView(event, 'library')
}

document.getElementsByClassName("menu__item--playlists")[0].children[0].onclick  = function() {
    switchView(event, 'playlists')
}

document.getElementsByClassName("menu__item--search")[0].children[0].onclick  = function() {
    switchView(event, 'search')
}

///////////////////////////////////////////////////////////////////////////
// Function

function switchView(evt, tabName) {
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
    evt.currentTarget.className += " active";
    evt.currentTarget.parentNode.className += " active";

    if(tabName === "playlists") {
        var playlist = document.getElementById("playlist");
        playlist.style.display = "block";

        var playlist_contents = document.getElementsByClassName("playlist-content");
        for (var j = 0; j < playlist_contents.length; j++) {
            playlist_contents[j].style.display = "none";
        }
    }
}

function isElementAlreadyInTheArray(elem, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === elem) {
            return true;
        }
    }
    return false;
}

function addContentsOfPlayList() {
    for (var i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
        addContentOfPlayList(i);
    }
}

function addContentOfPlayList(i) {
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

    for (var j = 0; j < window.MUSIC_DATA.playlists[i].songs.length; j++) {
        var song_id = window.MUSIC_DATA.playlists[i].songs[j];
        var list_group_item = document.createElement("div");
        list_group_item.className = "list-group-item";
        var square = document.createElement("div");
        square.className = "square";

        var song_info = document.createElement("div");
        song_info.className = "song-info";
        var song_title = document.createElement("div");
        song_title.className = "song-title";
        var song_artist = document.createElement("div");
        song_artist.className = "song-artist";
        var title_content = document.createTextNode(window.MUSIC_DATA.songs[song_id].title);
        title.className = "song-title";
        var artist_content = document.createTextNode(window.MUSIC_DATA.songs[song_id].artist);
        artist.className = "song-artist";

        var play = document.createElement("span");
        play.className = "glyphicon glyphicon-play";

        var plus_sign = document.createElement("a");
        var plus_sign_icon = document.createElement("span");
        plus_sign.href = "#";
        plus_sign_icon.id = "song" + window.MUSIC_DATA.songs[song_id].id;
        plus_sign_icon.className = "glyphicon glyphicon-plus-sign";

        var modal = document.getElementById("myModal");
        var span = document.getElementById("close-modal");
        plus_sign.onclick = function() {
            modal.style.display = "block";
            var id = event.target.id.replace("song","");
            clicked_id = id;
        }

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function() {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

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

///////////////////////////////////////////////////////////////////////////
// Initialization
var clicked_id = -1;
var sort_method = 1; // 0 means sorted by artist, 1 means sorted by title


for (var i = 0; i < window.MUSIC_DATA.songs.length; i++) {
    var library_item = document.getElementById("library-item");
    var item = document.createElement("div");
    item.className = "list-group-item";

    var square = document.createElement("div");
    square.className = "square";

    var song_info = document.createElement("div");

    var title = document.createElement("div");
    var title_content = document.createTextNode(window.MUSIC_DATA.songs[i].title);
    title.className = "song-title";

    var artist = document.createElement("div")
    var artist_content = document.createTextNode(window.MUSIC_DATA.songs[i].artist);
    artist.className = "song-artist";

    song_info.className = "song-info";

    var play = document.createElement("span");
    play.className = "glyphicon glyphicon-play";

    var plus_sign = document.createElement("a");
    var plus_sign_icon = document.createElement("span");
    plus_sign.href = "#";
    plus_sign_icon.id = "song" + window.MUSIC_DATA.songs[i].id;
    plus_sign_icon.className = "glyphicon glyphicon-plus-sign";

    var modal = document.getElementById("myModal");
    var span = document.getElementById("close-modal");
    plus_sign.onclick = function() {
        modal.style.display = "block";
        var id = event.target.id.replace("song","");
        clicked_id = id;
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function() {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    plus_sign.appendChild(plus_sign_icon);
    title.appendChild(title_content);
    artist.appendChild(artist_content);
    song_info.appendChild(title);
    song_info.appendChild(artist);
    item.appendChild(square);
    item.appendChild(song_info);
    item.appendChild(plus_sign);
    item.appendChild(play);
    library_item.appendChild(item);
}

for (var i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
    var playlist_item = document.getElementById("playlist-item");
    var item = document.createElement("a");
    item.className = "list-group-item";
    item.id = "playlist" + window.MUSIC_DATA.playlists[i].id;
    item.href = "#";
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
    playlist_item.appendChild(item);

    // Add playlist to modal options
    var items = document.getElementById("playlist-items-for-modal");
    var itemForModal = document.createElement("a");
    var text = document.createTextNode(window.MUSIC_DATA.playlists[i].name);
    itemForModal.href = "#";
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
                }
            }
        }
        document.getElementById("myModal").style.display = "none";
    }

    itemForModal.className = "playlist-in-model";
    itemForModal.appendChild(text);
    items.appendChild(itemForModal);
}

for (var i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
    var search = document.getElementById("search");
    var item = document.createElement("a");
    item.className = "list-group-item";
    item.id = "playlist-search" + window.MUSIC_DATA.playlists[i].id;
    item.style.display = "none";
    item.href = "#";
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

for (var i = 0; i < window.MUSIC_DATA.songs.length; i++) {
    var search_tab = document.getElementById("search");
    var item = document.createElement("div");
    item.className = "list-group-item";
    item.style.display = "none";

    var square = document.createElement("div");
    square.className = "square";

    var song_info = document.createElement("div");

    var title = document.createElement("div");
    var title_content = document.createTextNode(window.MUSIC_DATA.songs[i].title);
    title.className = "song-title";

    var artist = document.createElement("div")
    var artist_content = document.createTextNode(window.MUSIC_DATA.songs[i].artist);
    artist.className = "song-artist";

    song_info.className = "song-info";

    var play = document.createElement("span");
    play.className = "glyphicon glyphicon-play";

    var plus_sign = document.createElement("a");
    var plus_sign_icon = document.createElement("span");
    plus_sign.href = "#";
    plus_sign_icon.id = "song" + window.MUSIC_DATA.songs[i].id;
    plus_sign_icon.className = "glyphicon glyphicon-plus-sign";

    var modal = document.getElementById("myModal");
    var span = document.getElementById("close-modal");
    plus_sign.onclick = function() {
        modal.style.display = "block";
        var id = event.target.id.replace("song","");
        clicked_id = id;
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function() {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    plus_sign.appendChild(plus_sign_icon);
    title.appendChild(title_content);
    artist.appendChild(artist_content);
    song_info.appendChild(title);
    song_info.appendChild(artist);
    item.appendChild(square);
    item.appendChild(song_info);
    item.appendChild(plus_sign);
    item.appendChild(play);
    search_tab.appendChild(item);
}

addContentsOfPlayList();
document.getElementsByClassName("menu__item--playlists")[0].children[0].click();
document.getElementById("button-sort-by-artist").click();