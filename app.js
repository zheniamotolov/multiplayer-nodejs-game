var Player = require('./Player');
var Bullet = require('./Bullet');
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var SOCKET_LIST = {};
var PLAYER_LIST = {};
let DEBUG = true;
Player.list = {};
Bullet.list = {};
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');

});
app.use('/client', express.static(__dirname + '/client'));


serv.listen(2000, function () {
    console.log('listening on localhost:2000');
});
Bullet.update = function () {

    let pack = [];
    for (let i in Bullet.list) {
        let bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
        }
        else {
            pack.push({
                x: bullet.x,
                y: bullet.y
            });
        }
    }
    return pack;
};
Player.onConnect = function (socket) {
    let player = new Player(socket.id);
    Player.list[player.id] = player;
    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
        else if (data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
        else if (data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
        else if (data.inputId === 'attack')
            player.pressingAttack = data.state;
    });

};
Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
};
var USERS = {
    'bob': 'asd',
    'bob1': '123'

};
var isValidPassword = function(data,cb){
    setTimeout(function(){
        cb(USERS[data.username] === data.password);
    },10);
};
var isUsernameTaken = function(data,cb){
    setTimeout(function(){
        cb(USERS[data.username]);
    },10);
};
var addUser = function(data,cb){
    setTimeout(function(){
        USERS[data.username] = data.password;
        cb();
    },10);
};

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.on('signIn',function(data){
        isValidPassword(data,function(res){
            if(res){
                Player.onConnect(socket);
                socket.emit('signInResponse',{success:true});
            } else {
                socket.emit('signInResponse',{success:false});
            }
        });
    });
    socket.on('signUp',function(data){
        isUsernameTaken(data,function(res){
            if(res){
                socket.emit('signUpResponse',{success:false});
            } else {
                addUser(data,function(){
                    socket.emit('signUpResponse',{success:true});
                });
            }
        });
    });

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
    socket.on('sendMessageToServer', function (data) {
        let playerName = ('' + socket.id).slice(2, 7);
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', playerName + ':' + data);
        }

    });
    socket.on('evalAnswer', function (data) {
        if (!DEBUG) {
            return;
        }

        socket.emit('evalAnswer', eval(data));
    })

});
Player.update = function () {
    let pack = [];
    for (let i in Player.list) {
        let player = Player.list[i];
        player.update();
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number
        });
    }
    return pack;
};
setInterval(function () {
    let pack = {
        player: Player.update(),
        bullet: Bullet.update()
    };
    // let pack=Player.update();
    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }


}, 1000 / 25);
