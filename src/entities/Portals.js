const PORTAL_SIZE = 16; // Size of one grid segment
const ENTRY_COLOR = 0xFFA500; // Orange color
const EXIT_COLOR = 0x0000FF; // Blue color

export default class Portal {
    constructor(scene, color) {
        this.color = color;
        this.linkedPortal;

        this.scene = scene;

        this.body = this.scene.add.circle(0, 0, PORTAL_SIZE / 2, color);
    }

    teleport(snake) {
        if(!this.linkedPortal){ //Return if no connected portal
            return;
        }

        let snakeHead = snake.body[0];
        let snakeHeadCenter = snakeHead.getCenter();

        if(this.linkedPortal.body.getBounds().contains(snakeHeadCenter.x, snakeHeadCenter.y)) {
            let portalTopLeft =  new Phaser.Geom.Point(this.linkedPortal.body.x - 8, this.linkedPortal.body.y - 8); //Get topleft origin (0,0) pos
            let offset = new Phaser.Geom.Point(snake.direction.x, snake.direction.y); //Offset by 16, - 16 depending on snake dir

            snakeHead.setPosition(portalTopLeft.x + offset.x, portalTopLeft.y + offset.y);

        }
    }

    randomPos(snake, food){
        let validLocation = false;

        while(!validLocation){
            const x = (Phaser.Math.Between(0, 39) * 16) - PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const y = (Phaser.Math.Between(0, 29) * 16) - PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell

            if (!this.isLocationOccupied(x, y, snake, food)) {
                validLocation = true;
                this.body.setPosition(x, y);
            }
        }
    }

    spawn(snake, food) {
        let validLocation = false;

        this.entry.setVisible(true);
        this.exit.setVisible(true);

        while (!validLocation) {
            const portal1X = (Phaser.Math.Between(0, 39) * 16); //+ PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const portal1Y = (Phaser.Math.Between(0, 29) * 16); //+ PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const portal2X = (Phaser.Math.Between(0, 39) * 16); //+ PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell
            const portal2Y = (Phaser.Math.Between(0, 29) * 16); //+ PORTAL_SIZE / 2; // Adjusted for half the size of a grid cell

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