import DebugSystem from './DebugSystem.js';
import StateMachine from './StateMachine.js';

let cursors;
let scoreText;
let isGameOver = false;

class Snake {
    constructor(scene){
        this.scene = scene;
        
        this.color = 0x00ff00;
        this.body = [this.scene.add.rectangle(320, 240, 16, 16, this.color).setOrigin(0,0)]
        this.direction = new Phaser.Geom.Point(16, 0);

        console.log(this.body);
    }

    move() {
        for (let i = this.body.length - 1; i > 0; i--) {
            this.body[i].setPosition(this.body[i - 1].x, this.body[i - 1].y);
        }

        this.body[0].x = Phaser.Math.Wrap(this.body[0].x + this.direction.x, 0, config.width);
        this.body[0].y = Phaser.Math.Wrap(this.body[0].y + this.direction.y, 0, config.height);
    }

    flash(callback){
        const maxFlashes = config.snakeFlashFrequency;
        const totalDuration = maxFlashes * config.snakeFlashDuration;
    
        this.scene.tweens.add({
            targets: this.body,
            alpha: 0.5,
            duration: config.snakeFlashDuration / 2,
            yoyo: true,
            repeat: maxFlashes - 1,
            onComplete: function() {
                this.body.forEach(segment => segment.alpha = 1);
                callback(this.scene);
            }.bind(this)
        });
    }

    extend(){
        let tail = this.body[this.body.length - 1];
        this.body.push(this.scene.add.rectangle(tail.x, tail.y, 16, 16, this.color).setOrigin(0,0));
    }
}

class StartMenuScene extends Phaser.Scene {
    constructor(){
        super("menuScene");
    }

    preload() {}
    
    create() 
    {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Click to Start', { fontSize: '24px', fill: '#FF0000' }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start("gameScene");
        });
    }

    update() {}
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    preload() {}

    create() {
        this.snake = new Snake(this);

        //Define scene variables
        //this.snake = [this.add.rectangle(320, 240, 16, 16, 0x00ff00).setOrigin(0,0)];
        this.direction = new Phaser.Geom.Point(16, 0);
        this.food = this.add.rectangle(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16, 16, 16, 0xff0000).setOrigin(0,0);
        this.score = 0;
        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF' });
        this.moveTime = 0;
        cursors = this.input.keyboard.createCursorKeys();
        isGameOver = false;
        
    
        // Initialize the state machine
        this.gameStates = new StateMachine(this);
    
        // Define the play state
        this.gameStates.add('play', {
            enter: function() {
                console.log('Entered play state');
            },
            update: function(time) {
                if (isGameOver) return;


                if (time >= this.moveTime) {
    
                    this.handleInput.call(this);

                    this.snake.move();
                    this.checkSelfCollision(this);
                    this.checkFoodCollision(this);
    
                    this.moveTime = time + 100; // Updated move speed
                }
            },
            exit: function() {
                console.log('Exited play state');
            }
        });
    
        // Define the pause state
        this.gameStates.add('pause', {
            enter: function() {
                console.log('Entered pause state');
                this.pausedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Paused', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);
            },
            exit: function() {
                console.log('Exited pause state');
                if (this.pausedText) {
                    this.pausedText.destroy();
                }
            }
        });
    
        // Start the game in the play state
        this.gameStates.change('play');
    
        this.input.keyboard.on('keydown-P', () => {
            if (this.gameStates.currentState === 'play') {
                this.gameStates.change('pause');
            } else if (this.gameStates.currentState === 'pause') {
                this.gameStates.change('play');
            }
        });
    
        this.input.keyboard.on('keydown-D', () => {
        this.debugSystem.toggleDebugMode();
    });
    
        this.debugSystem = new DebugSystem(this, config.width, config.height);
        this.debugSystem.logFunctionCall('create');

        this.snake.flash(this.gameOver);
    }

    update(time){
        this.gameStates.update(time);

        if (this.debugSystem.debugMode) {
            this.debugSystem.logFunctionCall('update');
            this.debugSystem.display();
    
            //Debug
            console.log("Food:", this.food);
            console.log("Snake:", this.snake);
        }
        else{
            this.debugSystem.clearDebugTexts();
        }
    }

    handleInput() {
        if (cursors.left.isDown && this.snake.direction.x === 0) {
            this.snake.direction.setTo(-16, 0);
        } else if (cursors.right.isDown && this.snake.direction.x === 0) {
            this.snake.direction.setTo(16, 0);
        } else if (cursors.up.isDown && this.snake.direction.y === 0) {
            this.snake.direction.setTo(0, -16);
        } else if (cursors.down.isDown && this.snake.direction.y === 0) {
            this.snake.direction.setTo(0, 16);
        }
    }
    
    checkFoodCollision() {
        const headCenter = this.snake.body[0].getCenter();
        let tipX = headCenter.x + this.snake.direction.x;
        let tipY = headCenter.y + this.snake.direction.y;
    
        const foodBounds = this.food.getBounds();
        if (foodBounds.contains(tipX, tipY)) {
            this.snake.extend();
            this.food.setPosition(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16);
            this.score += 10;
            scoreText.setText('Score: ' + this.score);
        }
    }
    
    checkSelfCollision() {
        const headCenter = this.snake.body[0].getCenter();
        let tipX = headCenter.x + this.snake.direction.x;
        let tipY = headCenter.y + this.snake.direction.y;
    
        for (let i = 1; i < this.snake.body.length; i++) {
        const segmentBounds = this.snake.body[i].getBounds();
    
        if (segmentBounds.contains(tipX, tipY)) {
                if (this.debugSystem.debugMode) {
                    this.debugSystem.visualizeSelfCollision(i, this.snake.body[i]);
                } else {
                    this.snake.flash(this.gameOver);
                }
                break;
            }
        }
    }
    
    flashSnake(callback) {
        const maxFlashes = config.snakeFlashFrequency;
        const totalDuration = maxFlashes * config.snakeFlashDuration;
    
        this.tweens.add({
            targets: this.snake.body,
            alpha: 0.5,
            duration: config.snakeFlashDuration / 2,
            yoyo: true,
            repeat: maxFlashes - 1,
            onComplete: function() {
                this.snake.body.forEach(segment => segment.alpha = 1);
                callback(this);
            }.bind(this)
        });
    }
    
    gameOver(scene) {
        isGameOver = true;
        scene.add.text(320, 240, 'Game Over', { fontSize: '48px', fill: '#FF0000' }).setOrigin(0.5);
        scene.add.text(320, 290, 'Click to Restart', { fontSize: '24px', fill: '#FF0000' }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
    
            // Kill all tweens
            scene.tweens.killAll();

            scene.restart();
        });
    }

    restart(){
        this.scene.restart(); //this is our GameScene, which has a .scene (a reference to the scene manager)
    }
}

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    backgroundColor: "#1b1b1b",
    scene: [StartMenuScene, GameScene], 
    snakeFlashFrequency: 3,  // Number of times the snake should flash
    snakeFlashDuration: 200  // Duration of each flash in milliseconds
};

const game = new Phaser.Game(config);

