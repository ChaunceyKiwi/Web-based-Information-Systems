var socket = io();
$('form').submit(function(){
    var messageInputWindow = $('#m');
    socket.emit('chat message',messageInputWindow.val());
    messageInputWindow.val('');
    return false;
});

socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    window.scrollTo(0, document.body.scrollHeight);
});

$("#btn-create-game").click(function() {
    $.post('/api/room', function(data) {
        console.log(data);
    });
});

$("#btn-search-room").click(function() {
    var roomId = $("#input-search-room");
    $.get('/room/' + roomId.val(), function(data) {
        console.log(data);
    });
});

$("#btn-create-user").click(function() {
    var userObj = {};
    var username = $("#input-username");
    userObj.username = username.val();
    $.post('/createUser', JSON.stringify(userObj), function(data) {
        console.log(data);
    });
});

$("#btn-exit").click(function() {
    $.ajax({
        url: '/room/exit',
        type: 'DELETE',
        contentType:'application/json',
        dataType: 'text',

        success: function(result) {
            console.log(result);
        },
        error: function(result){
            console.log(result);
        }
    });
});