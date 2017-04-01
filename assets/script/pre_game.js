window.onload = function () {
  $('.container').outerHeight( window.innerHeight - $('#header_bar').height() );
  $('div.chat-content').innerHeight( window.innerHeight - 969 );
  $('div.chat-content')[0].scrollTop = $('div.chat-content')[0].scrollHeight - $('div.chat-content')[0].clientHeight;
}