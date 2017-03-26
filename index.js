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

$("#btn-create-user").click(function() {
    var userObj = {};
    var username = $("#input-username");
    userObj.username = username.val();
    $.post('/api/user', JSON.stringify(userObj), function(data) {
        console.log(data);
    });
});