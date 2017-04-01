////////////////////////////////////////////
// Global variable and initialization

var socket = io();
var roomId = 0;
var userId = -1;
var roomMembersInRoom;
var gameCenterId = 0;

$.get('/api/getInfo', function(data) {
    var res = JSON.parse(data);
    updateUserId(res.userId);
    updateRoomId(res.roomId);
    updateRoomMembers(res.usersInRoom);
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
        $("#roomId").text("Room info: Game center (Room0)");
    } else {
        location.pathname = '/pregame';
        $("#roomId").text("Room info: Room" + roomId);
    }
}

function updateRoomMembers(roomMembers) {
    if(Array.isArray(roomMembers)) {
        roomMembersInRoom = roomMembers;
    } else {
        roomMembersInRoom = [roomMembers];
    }
    $("#roomMembers").text("Room members: [" + roomMembersInRoom +"]");
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
    if (roomId === targetRoomId && userId != targetUserId) {
        roomMembersInRoom.push(targetUserId);
    }
    updateRoomMembers(roomMembersInRoom);
});

// Delete user from room
socket.on('deleteUserFromRoom', function(msg){
    msg = JSON.parse(msg);
    var targetRoomId = msg.roomId;
    var targetUserId = msg.userId;
    if (roomId === targetRoomId && userId != targetUserId) {
        roomMembersInRoom.splice(roomMembersInRoom.indexOf(targetUserId), 1);
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
        joinInfo.userId = userId;
        joinInfo.roomId = res.roomId;
        updateRoomMembers(userId);
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
        exitInfo.roomId = roomId;
        joinInfo.userId = userId;
        joinInfo.roomId = res.roomId;

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

        joinInfo.userId = res.id;
        joinInfo.roomId = gameCenterId;
        socket.emit("addUserToRoom", JSON.stringify(joinInfo));

        updateRoomId(gameCenterId);
        updateUserId(res.id);
        updateRoomMembers(res.members);
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
                joinInfo.userId = userId;
                joinInfo.roomId = gameCenterId;
                updateRoomId(0);
                updateRoomMembers(JSON.parse(result).users);
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