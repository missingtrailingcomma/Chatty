$('#messageForm').submit(function() {
  updateScroll();
});

function updateScroll(){
    var element = document.getElementById("messages");
    var setHeight = element.scrollHeight;
    $('#messages').animate({"scrollTop": setHeight}, 600);
}

$('#content').height($(document).height() - $('#messageForm').height() - $('#board').height() - 40);

var socket = io();

$('#messageForm').submit(function(){
  if ($('#m').val() === "") {
    alert("Enter Something", "Chatty");
  } else {
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
  }
  return false;
});

socket.on('chat message', function(msg){
  var id = msg.substr(0,msg.indexOf(','));
  var message = msg.substr(msg.indexOf(',') + 1);
  if (socket.id === id) {
    $('#messages').append($('<li class="rightt" >').text(message));
  } else {
    $('#messages').append($('<li class="leftt" >').text(message));
  }
});

socket.on('update board usernames', function(users) {
  $('#board').html('Online <span style="font-weight: bold" >' + users.join(' : ') + '</span>');
});

socket.on('connection fail', function(errmsg) {
  alert(errmsg);
});
