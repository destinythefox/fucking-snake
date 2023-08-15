const PORTAL_SIZE = 16; // Size of one grid segment
const ENTRY_COLOR = 0xFFA500; // Orange color
const EXIT_COLOR = 0x0000FF; // Blue color

export default class Portal {
    constructor(scene) {
        this.scene = scene;
        this.entry = this.scene.add.circle(0, 0, PORTAL_SIZE / 2, ENTRY_COLOR); // Divided by 2 because it's a circle's radius
        this.exit = this.scene.add.circle(0, 0, PORTAL_SIZE / 2, EXIT_COLOR); // Divided by 2 because it's a circle's radius
        this.canUsePortal = true;
        this.entry.setVisible(false);
        this.exit.setVisible(false);
    }

    teleport(snakeHead) {
         if (!this.canUsePortal) {
            return; // Exit the function if the portal can't be used
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(snakeHead.getBounds(), this.entry.getBounds())) {
            snakeHead.setPosition(this.exit.x, this.exit.y);
        } else if (Phaser.Geom.Intersects.RectangleToRectangle(snakeHead.getBounds(), this.exit.getBounds())) {
            snakeHead.setPosition(this.entry.x, this.entry.y);
        }
        this.canUsePortal = false;
        this.scene.time.delayedCall(2000, () => {
            this.canUsePortal = true;
        });
    }

    spawn(snake, food) {
        let validLocation = false;

        this.entry.setVisible(true);
        this.exit.setVisible(true);

        while (!validLocation) {
            const portal1X = Phaser.Math.Between(0, 39) * 16 + PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const portal1Y = Phaser.Math.Between(0, 29) * 16 + PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const portal2X = Phaser.Math.Between(0, 39) * 16 + PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const portal2Y = Phaser.Math.Between(0, 29) * 16 + PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell

            if (!this.isLocationOccupied(portal1X, portal1Y, snake, food) && 
                !this.isLocationOccupied(portal2X, portal2Y, snake, food)) {
                validLocation = true;
                this.entry.setPosition(portal1X, portal1Y);
                this.exit.setPosition(portal2X, portal2Y);
            }
        }
    }

    isLocationOccupied(x, y, snake, food) {
        for (let segment of snake.body) {
            if (segment.getBounds().contains(x, y)) {
                return true;
            }
        }

        if (food.getBounds().contains(x, y)) {
            return true;
        }

        return false;
    }
}