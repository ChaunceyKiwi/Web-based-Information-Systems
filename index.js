var socket = io();
var roomId = 0;

function updateRoomId(newId) {
    roomId = newId;
    if (roomId == 0) {
        $("#roomId").text("Game center (Room0)");
    } else {
        $("#roomId").text("Room" + roomId);
    }
}

socket.on('addMessageToRoom', function(msg){
    msg = JSON.parse(msg);
    var roomIdOfMsg = msg.roomId;

    if (roomId == roomIdOfMsg) {
        var output = msg.username + ": " + msg.message;
        $('#messages').append($('<li>').text(output));
        window.scrollTo(0, document.body.scrollHeight);
    }
});

$("#btn-create-game").click(function() {
    $.post('/api/room', function(data) {
        var res = JSON.parse(data);
        updateRoomId(res.roomId);
        console.log(data);
    });
});

$("#btn-search-room").click(function() {
    var roomSearchedId = $("#input-search-room").val();
    $("#input-search-room").val("");
    $.get('/room/' + roomSearchedId, function(data) {
        var res = JSON.parse(data);
        updateRoomId(res.roomId);
        console.log(data);
    });
});

$("#btn-create-user").click(function() {
    var userObj = {};
    var username = $("#input-username");
    userObj.username = username.val();
    username.val('');
    $.post('/createUser', JSON.stringify(userObj), function(data) {
        var res = JSON.parse(data);
        updateRoomId(res.roomId);
        console.log(data);
    });
});

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
                console.log(result);
            },
            error: function (result) {
                console.log(result);
            }
        });
    }
});


$("#btn-send-message").click(function() {
    var messageInputWindow = $('#messageInput');
    var message = messageInputWindow.val();
    messageInputWindow.val('');
    $.post('/api/chat', message, function(data) {
        console.log(data);
    })
});