////////////////////////////////////////////
// Global variable and initialization
var socket = io();
var roomId = 0;
var userId = -1;
var roomMembersInRoom;
var gameCenterId = 0;
var usersDirectory = {};

$.get('/api/getInfo', function(data) {
    var res = JSON.parse(data);
    updateUserId(res.userId);
    updateRoomId(res.roomId);
    updateRoomMembers(res.members);
});

////////////////////////////////////////////
// Function
function updateUserId(newId) {
    userId = newId;
    $("#userId").text("User info: User" +userId);
}

function updateRoomId(newId) {
    roomId = newId;
    if (roomId === 0) {
        $("#room-info-id").text("Room ID: Game center (Room0)");
    } else {
        $("#room-info-id").text("Room ID: " + roomId);
    }
}

function updateRoomMembers(roomMembers) {
    if(Array.isArray(roomMembers)) {
        roomMembersInRoom = roomMembers;
    } else {
        roomMembersInRoom = [roomMembers];
    }

    var i;
    for (i = 0; i < 6; i++) {
        usersDirectory = {};
        $("#user-" + i).hide();
    }

    for (i = 0; i < roomMembers.length; i++) {
        usersDirectory[roomMembers[i].id] = roomMembers[i].username;
        $("#user-" + i).show();
        $("#user-" + i).text(roomMembers[i].username);
    }
}

////////////////////////////////////////////
// Event binding

// update chatting window when receive messages
socket.on('addMessageToRoom', function(msg){
    msg = JSON.parse(msg);
    var roomIdOfMsg = msg.roomId;

    if (roomId === roomIdOfMsg) {
        var output = msg.username + ": " + msg.message;
        $('#messages').append($('<li>').text(output));
        window.scrollTo(0, document.body.scrollHeight);
    }
});

// Add user to room
socket.on('addUserToRoom', function(msg){
    msg = JSON.parse(msg);
    var targetRoomId = msg.roomId;
    var targetUserId = msg.userId;
    var targetUserName = msg.username;
    if (roomId === targetRoomId && userId != targetUserId) {
        var info = {};
        info.id = msg.userId;
        info.username = targetUserName;
        roomMembersInRoom.push(info);
    }
    updateRoomMembers(roomMembersInRoom);
});

// Delete user from room
socket.on('deleteUserFromRoom', function(msg){
    msg = JSON.parse(msg);
    var targetRoomId = msg.roomId;
    var targetUserId = msg.userId;
    var targetUserName = msg.username;
    if (roomId === targetRoomId && userId != targetUserId) {
        var info = {};
        info.id = msg.userId;
        info.username = targetUserName;
        roomMembersInRoom.splice(roomMembersInRoom.indexOf(info), 1);
    }
    updateRoomMembers(roomMembersInRoom);
});

// Create a new room and put creator in
$("#btn-create-game").click(function() {
    var joinInfo = {};
    var exitInfo = {};

    $.post('/api/room', function(data) {
        var res = JSON.parse(data);

        exitInfo.userId = userId;
        exitInfo.roomId = roomId;
        exitInfo.username = usersDirectory[userId];
        joinInfo.userId = userId;
        joinInfo.roomId = res.roomId;
        joinInfo.username = usersDirectory[userId];

        var info = {};
        info.id = userId;
        info.username = usersDirectory[userId];
        updateRoomMembers(info);

        updateRoomId(res.roomId);
        socket.emit("deleteUserFromRoom", JSON.stringify(exitInfo));
        socket.emit("addUserToRoom", JSON.stringify(joinInfo));

        console.log(data);
    });
});

// Search and enter a room
$("#btn-join-room").click(function() {
    var joinInfo = {};
    var exitInfo = {};
    var roomSearchedId = $("#room-id").val();

    $("#room-id").val("");
    $.get('/room/' + roomSearchedId, function(data) {
        var res = JSON.parse(data);
        exitInfo.userId = userId;
        exitInfo.username = usersDirectory[userId];
        exitInfo.roomId = roomId;
        joinInfo.userId = userId;
        joinInfo.roomId = res.roomId;
        joinInfo.username = usersDirectory[userId];

        socket.emit("deleteUserFromRoom", JSON.stringify(exitInfo));
        socket.emit("addUserToRoom", JSON.stringify(joinInfo));

        updateRoomId(res.roomId);
        updateRoomMembers(res.members);
        console.log(data);
    });
});

// Create a new user and put at game center
$("#btn-create-user").click(function() {
    var userObj = {};
    var username = $("#input-username");
    var joinInfo = {};

    userObj.username = username.val();
    username.val('');
    $.post('/createUser', JSON.stringify(userObj), function(data) {
        var res = JSON.parse(data);

        updateRoomId(gameCenterId);
        updateUserId(res.id);
        updateRoomMembers(res.members);

        joinInfo.userId = res.id;
        joinInfo.roomId = gameCenterId;
        joinInfo.username = usersDirectory[res.id];
        socket.emit("addUserToRoom", JSON.stringify(joinInfo));

        console.log(data);
    });
});

// Exit a room
$("#btn-exit").click(function() {
    var joinInfo = {};
    var exitInfo = {};

    if (roomId === 0) {
        console.log("You are already in the game center!");
    } else {
        $.ajax({
            url: '/room/exit',
            type: 'DELETE',
            contentType: 'application/json',
            dataType: 'text',

            success: function (result) {
                console.log(result);
                exitInfo.userId = userId;
                exitInfo.roomId = roomId;
                exitInfo.username = usersDirectory[userId];
                joinInfo.userId = userId;
                joinInfo.roomId = gameCenterId;
                joinInfo.username = usersDirectory[userId];

                updateRoomId(0);
                updateRoomMembers(JSON.parse(result).members);
                socket.emit("deleteUserFromRoom", JSON.stringify(exitInfo));
                socket.emit("addUserToRoom", JSON.stringify(joinInfo));
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