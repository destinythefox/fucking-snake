import DebugSystem from './DebugSystem.js';

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    backgroundColor: "#1b1b1b",
    scene: {
        create: create,
        update: update
    },
    snakeFlashFrequency: 3,  // Number of times the snake should flash
    snakeFlashDuration: 200  // Duration of each flash in milliseconds
};

const game = new Phaser.Game(config);

let food;
let cursors;
let moveTime = 0;
let score = 0;
let scoreText;
let isGameOver = false;

function create() {
    this.snake = [this.add.rectangle(320, 240, 16, 16, 0x00ff00)];
    this.debugSystem = new DebugSystem(this);
    this.debugSystem.logFunctionCall('create');
    this.direction = new Phaser.Geom.Point(16, 0);
    food = this.add.rectangle(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16, 16, 16, 0xff0000);
    cursors = this.input.keyboard.createCursorKeys();
    score = 0;
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF' });

    this.input.keyboard.on('keydown-P', () => {
        if (this.debugSystem.debugMode) {
            this.debugSystem.pauseGame();
        }
    });

    this.input.keyboard.on('keydown-NUMPAD_ONE', () => {
        if (this.debugSystem.debugMode) {
            this.debugSystem.testMode();
        }
    });

    this.input.keyboard.on('keydown-D', () => {
        this.debugSystem.toggleDebugMode();
    });

    // Bind functions to the current context
    checkFoodCollision = checkFoodCollision.bind(this);
    checkSelfCollision = checkSelfCollision.bind(this);
    flashSnake = flashSnake.bind(this);
    gameOver = gameOver.bind(this);
    handleInput = handleInput.bind(this);
    moveSnake = moveSnake.bind(this);
}

function update(time) {
    if (this.debugSystem.debugMode) {
        this.debugSystem.logFunctionCall('update');
        this.debugSystem.displayInfo();
        this.debugSystem.displayVariables();
    }

    if (isGameOver) return;

    if (time >= moveTime) {
        handleInput();
        moveSnake();
        checkSelfCollision();
        checkFoodCollision();

        moveTime = time + 100; // Updated move speed
    }
}

function handleInput() {
    if (cursors.left.isDown && this.direction.x === 0) {
        this.direction.setTo(-16, 0);
    } else if (cursors.right.isDown && this.direction.x === 0) {
        this.direction.setTo(16, 0);
    } else if (cursors.up.isDown && this.direction.y === 0) {
        this.direction.setTo(0, -16);
    } else if (cursors.down.isDown && this.direction.y === 0) {
        this.direction.setTo(0, 16);
    }
}

function moveSnake() {
    for (let i = this.snake.length - 1; i > 0; i--) {
        this.snake[i].setPosition(this.snake[i - 1].x, this.snake[i - 1].y);
    }
    this.snake[0].x = Phaser.Math.Wrap(this.snake[0].x + this.direction.x, 0, game.config.width);
    this.snake[0].y = Phaser.Math.Wrap(this.snake[0].y + this.direction.y, 0, game.config.height);
}

function checkFoodCollision() {
    const headPosition = this.snake[0].getBounds();
    let tipX = this.snake[0].x + this.direction.x / 2;
    let tipY = this.snake[0].y + this.direction.y / 2;

    const foodBounds = food.getBounds();
    if (foodBounds.contains(tipX, tipY)) {
        const tail = this.snake[this.snake.length - 1];
        this.snake.push(this.add.rectangle(tail.x, tail.y, 16, 16, 0x00ff00));
        food.setPosition(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16);
        score += 10;
        scoreText.setText('Score: ' + score);
    }
}

function checkSelfCollision() {
    const headPosition = this.snake[0].getBounds();
    let tipX = this.snake[0].x + this.direction.x / 2;
    let tipY = this.snake[0].y + this.direction.y / 2;

    for (let i = 1; i < this.snake.length; i++) {
        const segmentBounds = this.snake[i].getBounds();

        if (segmentBounds.contains(tipX, tipY)) {
            if (this.debugSystem.debugMode) {
                this.debugSystem.visualizeSelfCollision(i, this.snake[i]);
            } else {
                flashSnake(gameOver);
            }
            break;
        }
    }
}

function flashSnake(callback) {
    const maxFlashes = config.snakeFlashFrequency;
    const totalDuration = maxFlashes * config.snakeFlashDuration;

    this.tweens.add({
        targets: this.snake,
        alpha: 0.5,
        duration: config.snakeFlashDuration / 2,
        yoyo: true,
        repeat: maxFlashes - 1,
        onComplete: function() {
            this.snake.forEach(segment => segment.alpha = 1);
            callback();
        }.bind(this)
    });
}

function gameOver() {
    isGameOver = true;
    this.add.text(320, 240, 'Game Over', { fontSize: '48px', fill: '#FF0000' }).setOrigin(0.5);
    this.add.text(320, 290, 'Click to Restart', { fontSize: '24px', fill: '#FF0000' }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
        // Kill all tweens
        this.tweens.killAll();

        // Reset global variables
        moveTime = 0;
        score = 0;
        isGameOver = false;

        // Restart the scene
        this.scene.restart();
    });
}
