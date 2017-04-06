var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';

var socket = io();
//on emit newPosition from app.js
socket.on('newPositions', function (data) {
    ctx.clearRect(0, 0, 500, 500);
    for (var i = 0; i < data.player.length; i++) {
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
    }
    for (var i = 0; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10);
    }

});
socket.on('addToChat', function (data) {
    chatText.innerHTML += '<div>' + data + '</div>';
});
socket.on('evalAnswer', function (data) {
    console.log(data);
});

document.onkeydown = function (event) {
    if (event.keyCode === 68) {
        socket.emit('keyPress', {inputId: 'right', state: true})
    }
    else if (event.keyCode === 83)   //s
        socket.emit('keyPress', {inputId: 'down', state: true});
    else if (event.keyCode === 65) //a
        socket.emit('keyPress', {inputId: 'left', state: true});
    else if (event.keyCode === 87) // w
        socket.emit('keyPress', {inputId: 'up', state: true});
};
document.onkeyup = function (event) {
    if (event.keyCode === 68) {
        socket.emit('keyPress', {inputId: 'right', state: false})
    }
    else if (event.keyCode === 83)   //s
        socket.emit('keyPress', {inputId: 'down', state: false});
    else if (event.keyCode === 65) //a
        socket.emit('keyPress', {inputId: 'left', state: false});
    else if (event.keyCode === 87) // w
        socket.emit('keyPress', {inputId: 'up', state: false});
};
chatForm.onsubmit = function (e) {
    e.preventDefault();
    if (chatInput.value[0] === '/') {
        socket.emit('evalAnswer', chatInput.value.slice(1))
    }
    else {
        socket.emit('sendMessageToServer', chatInput.value);
    }

    chatInput.value = '';
}
/**
 * Created by eugene on 5.4.17.
 */
