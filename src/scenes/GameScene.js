import DebugSystem from '../systems/DebugSystem.js';
import StateMachine from '../utils/StateMachine.js';
import Snake from '../entities/Snake.js';
import config from '../game.js';
import Portal from '../entities/Portals.js';


export class GameScene extends Phaser.Scene {
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
        this.cursors = this.input.keyboard.createCursorKeys();
        this.isGameOver = false;
        
        // Initialize the state machine
        this.gameStates = new StateMachine(this);
    
        // Define the play state
        this.gameStates.add('play', {
            enter: function() {
            this.debugSystem.log('Entered play state');
            },
            update: function(time) {
                if (this.isGameOver) return;

                if (time >= this.moveTime) {
    
                    this.handleInput.call(this);

                    this.snake.move();
                    this.checkSelfCollision(this);
                    this.checkFoodCollision(this);
    
                    this.moveTime = time + 100; // Updated move speed
                }
            },
            exit: function() {
            this.debugSystem.log('Exited play state');
            }
        });
    
        // Define the pause state
        this.gameStates.add('pause', {
            enter: function() {
            this.debugSystem.log('Entered pause state');
                this.pausedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Paused', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);
            },
            exit: function() {
            this.debugSystem.log('Exited pause state');
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

        this.portal = new Portal(this, 100, 100, 500, 400);

    
        //Initialize Debug System
        this.debugSystem = new DebugSystem(this, config.width, config.height);
        this.debugSystem.log('create');
        
        // Start the game in the play state
        this.gameStates.change('play');

    }

    update(time){
        this.debugSystem.log('update');
        this.gameStates.update(time);
        
        this.debugSystem.log("Food: " + this.food)
        this.debugSystem.log("Snake: " + this.snake);

        if (this.debugSystem.debugMode) {
            this.debugSystem.display();
        }
        else{
            this.debugSystem.clearDebugTexts();
        }


        this.portal.teleport(this.snake.body[0]);
    }

    handleInput() {
        if (this.cursors.left.isDown && this.snake.direction.x === 0) {
            this.snake.direction.setTo(-16, 0);
        } else if (this.cursors.right.isDown && this.snake.direction.x === 0) {
            this.snake.direction.setTo(16, 0);
        } else if (this.cursors.up.isDown && this.snake.direction.y === 0) {
            this.snake.direction.setTo(0, -16);
        } else if (this.cursors.down.isDown && this.snake.direction.y === 0) {
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
        scene.isGameOver = true;
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

export default GameScene;