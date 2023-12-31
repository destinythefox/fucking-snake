import DebugSystem from './DebugSystem.js';
import StateMachine from './StateMachine.js';
import Snake from './GameLogic.js';

let cursors;
let isGameOver = false;

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
        //Define scene variables
        this.snake = new Snake(this, config);
        this.direction = new Phaser.Geom.Point(16, 0);
        this.food = this.add.rectangle(Phaser.Math.Between(0, 39) * 16, Phaser.Math.Between(0, 29) * 16, 16, 16, 0xff0000).setOrigin(0,0);
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF' });
        this.moveTime = 0;
        cursors = this.input.keyboard.createCursorKeys();
        isGameOver = false;
        
        // Initialize the state machine
        this.gameStates = new StateMachine(this);
    
        // Define the play state
        this.gameStates.add('play', {
            enter: function() {
            this.debugSystem.logFunctionCall('Entered play state');
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
            this.debugSystem.logFunctionCall('Exited play state');
            }
        });
    
        // Define the pause state
        this.gameStates.add('pause', {
            enter: function() {
            this.debugSystem.logFunctionCall('Entered pause state');
                this.pausedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Paused', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);
            },
            exit: function() {
            this.debugSystem.logFunctionCall('Exited pause state');
                if (this.pausedText) {
                    this.pausedText.destroy();
                }
            }
        });

        this.input.keyboard.on('keydown-P', () => {
            if (this.gameStates.currentState === 'play') {
                this.gameStates.change('pause');
            } else if (this.gameStates.currentState === 'pause') {
                this.gameStates.change('play');
            }
        });
    
        this.debugSystem = new DebugSystem(this, config.width, config.height);
        this.debugSystem.logFunctionCall('create');

            
        // Start the game in the play state
        this.gameStates.change('play');
    }

    update(time){
        this.gameStates.update(time);

        if (this.debugSystem.debugMode) {
            this.debugSystem.logFunctionCall('update');
            this.debugSystem.display();
    
        
        this.debugSystem.logFunctionCall("Food: " + this.food)
       this.debugSystem.logFunctionCall("Snake: " + this.snake);
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
            this.scoreText.setText('Score: ' + this.score);
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
    parent: 'game-container',
    width: 640,
    height: 480,
    version: 0.15,
    backgroundColor: "#1b1b1b",
    scene: [StartMenuScene, GameScene], 
    snakeFlashFrequency: 3,  // Number of times the snake should flash
    snakeFlashDuration: 200  // Duration of each flash in milliseconds
};

const game = new Phaser.Game(config);