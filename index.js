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
    $.get('/api/room', function(data) {
        console.log(data);
    });
});