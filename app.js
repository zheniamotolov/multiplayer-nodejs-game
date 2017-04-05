var Player = require('./Player');
var Bullet = require('./Bullet');
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var SOCKET_LIST = {};
var PLAYER_LIST = {};
Player.list = {};
Bullet.list={};
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');

});
app.use('/client', express.static(__dirname + '/client'));


serv.listen(2000, function () {
    console.log('listening on localhost:2000');
});
Bullet.update=function(){
    if(Math.random()<0.1){
        let bullet = new Bullet(Math.random()*360);
        Bullet.list[bullet.id] = bullet;

    }
    let pack = [];
    for (let i in Bullet.list) {
        let bullet = Bullet.list[i];
        bullet.update();
        pack.push({
            x: bullet.x,
            y: bullet.y
        });
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
    });

};
Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
};
let io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

Player.onConnect(socket);
    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });


});
Player.update=function(){
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
    let pack={
        player:Player.update(),
        bullet:Bullet.update()
    };
    // let pack=Player.update();
    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }


}, 1000 / 25);
