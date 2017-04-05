var Entity = require('./Entity');
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
        this.maxSpeed = 10;
    }

    update() {
        this.updateSpeed();
        super.update();
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