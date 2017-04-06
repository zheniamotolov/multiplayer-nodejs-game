var Entity = require('./Entity');
var Bullet = require('./Bullet');
//var playerList = require('./playerList');
module.exports = class Player extends Entity {
    constructor(id) {
        super();
        this.x = 250;
        this.y = 250;
        this.id = id;
        this.number = "" + Math.floor(10 * Math.random());
        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;
        this.pressingAttack=false;
        this.mouseAngle=0;
        this.maxSpeed = 10;
    }

    shootBullet(angle) {
        let bullet = new Bullet(this.id,angle);
        bullet.x = this.x;
        bullet.y = this.y;
        Bullet.list[bullet.id] = bullet;
    }

    update() {
        this.updateSpeed();
        super.update();
        if (this.pressingAttack ) {

            this.shootBullet(this.mouseAngle)
        }
    }

    updateSpeed() {
        if (this.pressingLeft) {
            this.speedX = -this.maxSpeed;
        }
        else if (this.pressingRight) {
            this.speedX = this.maxSpeed;
        }
        else
            this.speedX = 0;

        if (this.pressingDown) {
            this.speedY = this.maxSpeed;
        }
        else if (this.pressingUp) {
            this.speedY = -this.maxSpeed;
        }
        else {
            this.speedY = 0;
        }

    }

    getObjectPlayer() {

    }

    getIdOfPlayer() {
        return this.id;
    }
};