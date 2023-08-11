const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    backgroundColor: "#1b1b1b",
    scene: {
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let snake;
let food;
let cursors;
let moveTime = 0;
let direction = new Phaser.Geom.Point(16, 0);
let score = 0;
let scoreText;
let debugText;
let isGameOver = false;

function create() {
    // Initialize snake with one segment
    snake = [this.add.rectangle(320, 240, 16, 16, 0x00ff00)];

    // Place food at a random position
    food = this.add.rectangle(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16, 16, 16, 0xff0000);

    cursors = this.input.keyboard.createCursorKeys();

    // Initialize score and display it
    score = 0;
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF' });

    // Initialize debug text
    debugText = this.add.text(16, 450, '', { fontSize: '16px', fill: '#FFF' });
}

function update(time) {
    // Clear previous collision boxes and food collision visualization
    this.children.list.forEach(child => {
        if (child.fillAlpha === 0.3 || child.fillAlpha === 0.5) {
            child.destroy();
        }
    });

    if (isGameOver) return;

    if (time >= moveTime) {
        if (cursors.left.isDown && direction.x === 0) {
            direction.setTo(-16, 0);
        } else if (cursors.right.isDown && direction.x === 0) {
            direction.setTo(16, 0);
        } else if (cursors.up.isDown && direction.y === 0) {
            direction.setTo(0, -16);
        } else if (cursors.down.isDown && direction.y === 0) {
            direction.setTo(0, 16);
        }

        const prevTailX = snake[snake.length - 1].x;
        const prevTailY = snake[snake.length - 1].y;

        // 1. Move the snake
        for (let i = snake.length - 1; i > 0; i--) {
            snake[i].setPosition(snake[i - 1].x, snake[i - 1].y);
        }
        snake[0].x = Phaser.Math.Wrap(snake[0].x + direction.x, 0, game.config.width);
        snake[0].y = Phaser.Math.Wrap(snake[0].y + direction.y, 0, game.config.height);

        // Calculate the tip of the snake's head based on its current direction
        let tipX = snake[0].x + direction.x / 2;
        let tipY = snake[0].y + direction.y / 2;

        // 2. Check for food consumption
        const foodBounds = food.getBounds();
        if (foodBounds.contains(tipX, tipY)) {
            // Visualize the collision on the food
            this.add.rectangle(food.x, food.y, 16, 16, 0xFFFF00, 0.5);  // yellow rectangle for visualization

            snake.push(this.add.rectangle(prevTailX, prevTailY, 16, 16, 0x00ff00));
            food.setPosition(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16);
            score += 10;
            scoreText.setText('Score: ' + score);
        }

        // 3. Check for self-collision
        const headPosition = snake[0].getBounds();
        for (let i = 1; i < snake.length; i++) {
            const segmentBounds = snake[i].getBounds();

            // Check if the tip of the head's position is within the segment
            if (segmentBounds.contains(tipX, tipY)) {
                console.log(`Collision detected with segment ${i} at position (${tipX}, ${tipY})`);
                snake[i].fillColor = 0x0000FF;
                debugText.setText(`Collision at segment ${i}`);
                gameOver(this);
                break;
            } else {
                snake[i].fillColor = 0x00FF00;
            }
        }

        moveTime = time + 70;
    }
}




function gameOver(scene) {
    isGameOver = true;
    scene.add.text(320, 240, 'Game Over', { fontSize: '48px', fill: '#FF0000' }).setOrigin(0.5);
    scene.add.text(320, 290, 'Click to Restart', { fontSize: '24px', fill: '#FF0000' }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
        scene.scene.restart();
    });
}
