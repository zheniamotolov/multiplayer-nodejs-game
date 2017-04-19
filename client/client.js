//sign

var socket = io();
var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivSignIn = document.getElementById('signDiv-signIn');
var signDivSignUp = document.getElementById('signDiv-signUp');
var signDivPassword = document.getElementById('signDiv-password');
signDivSignIn.onclick = function () {
    socket.emit('signIn', {username: signDivUsername.value, password: signDivPassword.value})
};
socket.on('signInResponse', function (data) {
    if (data.success) {
        signDiv.style.display = 'none';
        gameDiv.style.display = 'inline-block';

    }
    else {
        signDivUsername.value = '';
        signDivPassword.value = '';
        alert('Sign is unsuccessful');

    }
});
socket.on('signUpResponse', function (data) {
    if (data.success) {
        alert('Sign is successful');
    }
    else {
        signDivUsername.value = '';
        signDivPassword.value = '';
        alert('Sign is unsuccessful');

    }
});
signDivSignUp.onclick = function () {
    socket.emit('signUp', {username: signDivUsername.value, password: signDivPassword.value})
};
//game
Player.list = {};
Bullet.list = {};
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
//game
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';
socket.on('init', function (data) {
    for (let i = 0; i < data.player.length; i++) {
        let player = new Player(data.player.id);
        Player.list[player.id] = player;
    }
    for (let i = 0; i < data.bullet.length; i++) {
        let bullet = new Bullet(data.bullet.id);
        Bullet.list[bullet.id] = bullet;
    }
});
socket.on('update', function (data) {
    for (let i = 0; i < data.player.length; i++) {
        let pack = data.player[i];
        let player = Player.list[pack.id];
        if (player) {
            if (pack.x !== undefined) {
                player.x = pack.x;
            }
            if (pack.y !== undefined) {
                player.y = pack.y;
            }

        }

    }
    for (let i = 0; i < data.bullet.length; i++) {
        let pack = data.bullet[i];
        let bullet = Bullet.list[pack.id];
        if (bullet) {
            if (pack.x !== undefined) {
                bullet.x = pack.x;

            }
            if (pack.y !== undefined) {
                bullet.y = pack.y;

            }
        }
    }
});
socket.on('remove', function (data) {
    for (let i = 0; i < data.length; i++) {
        delete Player.list[data.player[i]];
    }
    for (let i = 0; i < data.length; i++) {
        delete Bullet.list[data.bullet[i]];
    }


});

//on emit newPosition from app.js
setInterval(function () {
    ctx.clearRect(0, 0, 500, 500);
    for (let i in Player.list) {
        ctx.fillText(Player.list[i].number, Player.list[i].x, Player.list[i].y);
    }
    for (let i in Bullet.list) {
        ctx.fillRect(Bullet.list[i].x - 5, Bullet.list[i].y - 5, 10, 10);
    }
}, 40);

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
document.onmousedown = function (event) {
    socket.emit('keyPress', {inputId: 'attack', state: true});
};
document.onmouseup = function (event) {
    socket.emit('keyPress', {inputId: 'attack', state: false});
};
document.onmousemove = function (event) {
    var x = -235 + event.clientX - 8;
    var y = -235 + event.clientY - 8;
    var angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', {inputId: 'mouseAngle', state: angle});
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