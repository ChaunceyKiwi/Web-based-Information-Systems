////////////////////////////////////////////
// Global variable and initialization

var socket = io();
var roomId = 0;
$.get('/api/getRoomInfo', function(data) {
    var res = JSON.parse(data);
    updateRoomId(res.roomId);
    updateRoomMembers(res.usersInRoom);
});


////////////////////////////////////////////
// Function

function updateRoomId(newId) {
    roomId = newId;
    if (roomId == 0) {
        $("#roomId").text("Game center (Room0)");
    } else {
        $("#roomId").text("Room" + roomId);
    }
}

function updateRoomMembers(roomMembers) {
    $("#roomMembers").text("Room members: [" + roomMembers +"]");
}

////////////////////////////////////////////
// Event binding

// update chatting window when receive messages
socket.on('addMessageToRoom', function(msg){
    msg = JSON.parse(msg);
    var roomIdOfMsg = msg.roomId;

    if (roomId == roomIdOfMsg) {
        var output = msg.username + ": " + msg.message;
        $('#messages').append($('<li>').text(output));
        window.scrollTo(0, document.body.scrollHeight);
    }
});

// Create a new room and put creator in
$("#btn-create-game").click(function() {
    $.post('/api/room', function(data) {
        var res = JSON.parse(data);
        updateRoomId(res.roomId);
        updateRoomMembers(res.members);
        console.log(data);
    });
});

// Search and enter a room
$("#btn-search-room").click(function() {
    var roomSearchedId = $("#input-search-room").val();
    $("#input-search-room").val("");
    $.get('/room/' + roomSearchedId, function(data) {
        var res = JSON.parse(data);
        updateRoomId(res.roomId);
        updateRoomMembers(res.members);
        console.log(data);
    });
});

// Create a new user and put at game center
$("#btn-create-user").click(function() {
    var userObj = {};
    var username = $("#input-username");
    userObj.username = username.val();
    username.val('');
    $.post('/createUser', JSON.stringify(userObj), function(data) {
        var res = JSON.parse(data);
        updateRoomId(res.roomId);
        updateRoomMembers(res.members)
        console.log(data);
    });
});

// Exit a room
$("#btn-exit").click(function() {
    if (roomId == 0) {
        console.log("You are already in the game center!");
    } else {
        $.ajax({
            url: '/room/exit',
            type: 'DELETE',
            contentType: 'application/json',
            dataType: 'text',

            success: function (result) {
                updateRoomId(0);
                updateRoomMembers(JSON.parse(result).users);
                console.log(result);
            },
            error: function (result) {
                console.log(result);
            }
        });
    }
});

// Send a message to all members in current room
$("#btn-send-message").click(function() {
    var messageInputWindow = $('#messageInput');
    var message = messageInputWindow.val();
    messageInputWindow.val('');
    $.post('/api/chat', message, function(data) {
        console.log(data);
    })
});