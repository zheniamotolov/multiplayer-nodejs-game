module.exports = class Entity {
    constructor() {
        this.x = 250;
        this.y = 250;
        this.id = "";
        this.speedX = 0;
        this.speedY = 0;

    }

    getDistance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }

    update() {
        this.updatePosition();
    }

    updatePosition() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
};