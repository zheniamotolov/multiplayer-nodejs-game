let Entity = require('./Entity');
let Player = require('./Player')
module.exports = class Bullet extends Entity {
    constructor( parent,angle) {
        super();
        this.id = Math.random();
        this.speedX = Math.cos(angle / 180 * Math.PI) * 10;
        this.speedY = Math.sin(angle / 180 * Math.PI) * 10;
        this.timer = 0;
        this.parent = parent;
        this.toRemove = false;
        this.parent = parent;

    }

    update() {
        if (this.timer++ > 100) {
            this.toRemove = true;
            // console.log('he')
        }

        super.update();
        for (var i in Player.list) {
            // var p=Player.list[i];
            if (super.getDistance(Player.list[i]) < 32 && this.parent !== Player.list[i].id) {

                this.toRemove = true;
            }

        }

    }

};