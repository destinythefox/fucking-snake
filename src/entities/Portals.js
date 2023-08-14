const PORTAL_SIZE = 16; // Size of one grid segment
const ENTRY_COLOR = 0xFFA500; // Orange color
const EXIT_COLOR = 0x0000FF; // Blue color

export default class Portal {
    constructor(scene, x1, y1, x2, y2) {
        this.scene = scene;
        this.entry = this.scene.add.circle(x1, y1, PORTAL_SIZE / 2, ENTRY_COLOR); // Divided by 2 because it's a circle's radius
        this.exit = this.scene.add.circle(x2, y2, PORTAL_SIZE / 2, EXIT_COLOR); // Divided by 2 because it's a circle's radius
    }

    teleport(snakeHead) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(snakeHead.getBounds(), this.entry.getBounds())) {
            snakeHead.setPosition(this.exit.x, this.exit.y);
        } else if (Phaser.Geom.Intersects.RectangleToRectangle(snakeHead.getBounds(), this.exit.getBounds())) {
            snakeHead.setPosition(this.entry.x, this.entry.y);
        }
    }
}