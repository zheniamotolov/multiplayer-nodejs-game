let Entity = require('./Entity');
module.exports = class Bullet extends Entity {
    constructor(angle) {
        super();
        this.id = Math.random();
        this.speedX = Math.cos(angle / 180 * Math.PI) * 10;
        this.speedY = Math.sin(angle / 180 * Math.PI) * 10;
        this.timer = 0;
        this.toRemove = false;

    }

    update() {
        if (this.timer++ > 100) {
            this.toRemove = true;
           // console.log('he')
        }
        super.update();

    }

};