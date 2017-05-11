var mongojs = require("mongojs");//localhost:27017/myGame
var db = mongojs('mongodb://root:root@ds111851.mlab.com:11851/mygame', ['account', 'progress']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var profiler = require('v8-profiler');
var fs = require('fs');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');

});
app.use('/client', express.static(__dirname + '/client'));


serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//require('./Entity');
require('./client/Inventory');
require('./Entity');
var SOCKET_LIST = {};

var DEBUG = true;

var isValidPassword = function (data, cb) {

    db.account.find({username: data.username, password: data.password}, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
}
var isUsernameTaken = function (data, cb) {

    db.account.find({username: data.username}, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
}
var addUser = function (data, cb) {
    db.account.insert({username: data.username, password: data.password}, function (err) {
        cb();
    });
}


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn', function (data) {
        isValidPassword(data, function (res) {
            if (res) {
                Player.onConnect(socket, data.username);
                socket.emit('signInResponse', {success: true});
            } else {
                socket.emit('signInResponse', {success: false});
            }
        });
    });
    socket.on('signUp', function (data) {
        isUsernameTaken(data, function (res) {
            if (res) {
                socket.emit('signUpResponse', {success: false});
            } else {
                addUser(data, function () {
                    socket.emit('signUpResponse', {success: true});
                });
            }
        });
    });


    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });


    socket.on('evalServer', function (data) {
        if (!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    });


});
/////////////////////////////////////////

var initPack = {player: [], bullet: []};
var removePack = {player: [], bullet: []};


Entity = function (param) {
    var self = {
        x: 600,
        y: 300,
        spdX: 0,
        spdY: 0,
        id: "",
        map: 'forest',
    }
    if (param) {
        if (param.x)
            self.x = param.x;
        if (param.y)
            self.y = param.y;
        if (param.map)
            self.map = param.map;
        if (param.id)
            self.id = param.id;
    }

    self.update = function () {
        self.updatePosition();
    }
    self.updatePosition = function () {
        if (self.x > 1200  || self.y > 500 ) {
            self.x -= 1;
            self.y -= 1;
        }
        else if(self.x <0|| self.y <0 ){
            self.x += 1;
            self.y += 1;
        }
        else {
            self.x += self.spdX;
            self.y += self.spdY;
        }
    }
    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    }
    return self;
}
Entity.getFrameUpdateData = function () {
    var pack = {
        initPack: {
            player: initPack.player,
            bullet: initPack.bullet,
        },
        removePack: {
            player: removePack.player,
            bullet: removePack.bullet,
        },
        updatePack: {
            player: Player.update(),
            bullet: Bullet.update(),
        }
    };
    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];
    return pack;
}


Player = function (param) {
    var self = Entity(param);
    self.number = "" + Math.floor(10 * Math.random());
    self.username = param.username;
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;
    self.maxSpd = 10;
    self.hp = 10;
    self.hpMax = 10;
    self.score = 0;
    self.inventory = new Inventory(param.socket, true);

    var super_update = self.update;
    self.update = function () {
        self.updateSpd();

        super_update();

        if (self.pressingAttack) {
            self.shootBullet(self.mouseAngle);
        }
    }
    self.shootBullet = function (angle) {
        if (Math.random() < 0.1)
            self.inventory.addItem("potion", 1);
        Bullet({
            parent: self.id,
            angle: angle,
            x: self.x,
            y: self.y,
            map: self.map,
        });
    }

    self.updateSpd = function () {

        if (self.pressingRight)
            self.spdX = self.maxSpd;
        else if (self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if (self.pressingUp)
            self.spdY = -self.maxSpd;
        else if (self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    }

    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            number: self.number,
            hp: self.hp,
            hpMax: self.hpMax,
            score: self.score,
            map: self.map,
        };
    }
    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            hp: self.hp,
            score: self.score,
            map: self.map,
        }
    }

    Player.list[self.id] = self;

    initPack.player.push(self.getInitPack());
    return self;
}
Player.list = {};
Player.onConnect = function (socket, username) {
    var map = 'forest';
    if (Math.random() < 0.5)
        map = 'field';
    var player = Player({
        username: username,
        id: socket.id,
        map: map,
        socket: socket,
    });
    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
        else if (data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
        else if (data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if (data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });

    socket.on('changeMap', function (data) {

        if (player.map === 'field')
            player.map = 'forest';
        else
            player.map = 'field';
    });

    socket.on('sendMsgToServer', function (data) {
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', player.username + ': ' + data);
        }
    });
    socket.on('sendPmToServer', function (data) { //data:{username,message}
        var recipientSocket = null;
        for (var i in Player.list)
            if (Player.list[i].username === data.username)
                recipientSocket = SOCKET_LIST[i];
        if (recipientSocket === null) {
            socket.emit('addToChat', 'The player ' + data.username + ' is not online.');
        } else {
            recipientSocket.emit('addToChat', 'From ' + player.username + ':' + data.message);
            socket.emit('addToChat', 'To ' + data.username + ':' + data.message);
        }
    });

    socket.emit('init', {
        selfId: socket.id,
        player: Player.getAllInitPack(),
        bullet: Bullet.getAllInitPack(),
    })
}
Player.getAllInitPack = function () {
    var players = [];
    for (var i in Player.list)
        players.push(Player.list[i].getInitPack());
    return players;
}

Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}
Player.update = function () {
    var pack = [];
    for (var i in Player.list) {
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
}


Bullet = function (param) {
    var self = Entity(param);
    self.id = Math.random();
    self.angle = param.angle;
    self.spdX = Math.cos(param.angle / 180 * Math.PI) * 10;
    self.spdY = Math.sin(param.angle / 180 * Math.PI) * 10;
    self.parent = param.parent;

    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function () {
        if (self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for (var i in Player.list) {
            var p = Player.list[i];
            if (self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id) {
                p.hp -= 1;

                if (p.hp <= 0) {
                    var shooter = Player.list[self.parent];
                    if (shooter)
                        shooter.score += 1;
                    p.hp = p.hpMax;
                    p.x = Math.random() * 1200;
                    p.y = Math.random() * 1200;
                }
                self.toRemove = true;
            }
        }
    }
    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            map: self.map,
        };
    }
    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
        };
    }

    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());
    return self;
}
Bullet.list = {};

Bullet.update = function () {
    var pack = [];
    for (var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        } else
            pack.push(bullet.getUpdatePack());
    }
    return pack;
}

Bullet.getAllInitPack = function () {
    var bullets = [];
    for (var i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack());
    return bullets;
}
/////////////////


setInterval(function () {
    var packs = Entity.getFrameUpdateData();

    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('init', packs.initPack);
        socket.emit('update', packs.updatePack);
        socket.emit('remove', packs.removePack);
    }


}, 1000 / 25);
var startProfiling = function (duration) {
    profiler.startProfiling('1', true);
    setTimeout(function () {
        var profile1 = profiler.stopProfiling('1');
        profile1.export(function (error, result) {
            fs.writeFile('profiler.cpuprofile', result);
            profile1.delete();
            console.log('profile saved');

        })
    }, duration)
};
startProfiling(10000);
