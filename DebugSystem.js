export default class DebugSystem {
    constructor(scene, gameWidth, gameHeight) {
        this.scene = scene; // Reference to this scene
        
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.debugTexts = []; // Store references to all debug text objects
        
        this.debugMode = false; // Track if debug mode is active
        this.logging = false;

        //Add key press listeners
        this.scene.input.keyboard.on('keydown-D', () => {
            this.toggleDebugMode();
        });

        this.scene.input.keyboard.on('keydown-L', () => {
            this.toggleLogging();
        });
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
    }

    toggleLogging(){
        this.logging = !this.logging;
    }

    
    display(){
        this.clearDebugTexts();

        this.displayVariables();
        this.displayInfo();
    }


   displayInfo() {
    console.log('Displaying debug information...');


    const fps = Math.round(1000 / this.scene.game.loop.delta);
    const memory = (performance && performance.memory && performance.memory.usedJSHeapSize) 
        ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' 
        : 'N/A';
    const snakeLength = this.scene.snake.body.length;

    //this.clearDebugTexts();

    // Display FPS at the bottom right
    this.debugTexts.push(this.scene.add.text(this.gameWidth - 100, this.gameHeight - 70, `FPS: ${fps}`, { fontSize: '12px', fill: '#FFF' }).setOrigin(1, 1));

    // Display Memory usage just above FPS
    this.debugTexts.push(this.scene.add.text(this.gameWidth - 100, this.gameHeight - 50, `Memory: ${memory}`, { fontSize: '12px', fill: '#FFF' }).setOrigin(1, 1));

    // Display Snake Segments just above Memory usage
    this.debugTexts.push(this.scene.add.text(this.gameWidth - 100, this.gameHeight - 30, `Snake Segments: ${snakeLength}`, { fontSize: '12px', fill: '#FFF' }).setOrigin(1, 1));

    if (this.debugMode) {
        // Visualization
        this.visualizeBounds(this.scene.food);
        this.visualizeTipOfSnake();

        if (this.scene.snake && this.scene.snake.body.length > 0) {
            this.scene.snake.body.forEach(segment => {
                this.visualizeBounds(segment);
            });
        }

        // Change food color to purple
        this.scene.food.setFillStyle(0x800080); // Purple color
    } else {
        // Reset food color to original
        this.scene.food.setFillStyle(0xff0000); // Original red color
    }
}


    clearDebugTexts() {
        this.debugTexts.forEach(text => text.destroy());
        this.debugTexts = [];
    }

    displayVariables() {
        //this.clearDebugTexts();

        if (this.scene) {
            this.debugTexts.push(this.scene.add.text(10, 55, `Score: ${this.scene.score}`, { fontSize: '12px', fill: '#FFF' }));
            if (this.scene.direction) {
                this.debugTexts.push(this.scene.add.text(10, 70, `Direction: (${this.scene.direction.x}, ${this.scene.direction.y})`, { fontSize: '12px', fill: '#FFF' }));
            }
            this.debugTexts.push(this.scene.add.text(10, 85, `Snake Length: ${this.scene.snake.body.length}`, { fontSize: '12px', fill: '#FFF' }));
            this.debugTexts.push(this.scene.add.text(10, 100, `Game State: ${this.scene.isGameOver ? "Game Over" : "Running"}`, { fontSize: '12px', fill: '#FFF' }));
            this.debugTexts.push(this.scene.add.text(10, 115, `Move Time: ${this.scene.moveTime}`, { fontSize: '12px', fill: '#FFF' }));
            if (this.scene.food) {
                this.debugTexts.push(this.scene.add.text(10, 130, `Food Position: (${this.scene.food.x}, ${this.scene.food.y})`, { fontSize: '12px', fill: '#FFF' }));
            }
            // Display the current state of the state machine
            this.debugTexts.push(this.scene.add.text(10, 145, `Current State: ${this.scene.gameStates.currentState}`, { fontSize: '12px', fill: '#FFF' }));
        }
    }

    visualizeSelfCollision(segmentIndex, segment) {
        segment.fillColor = 0x0000ff;
        this.displayCollisionSegment(segmentIndex);
    }

    displayCollisionSegment(segmentIndex) {
        const text = `Collided with segment: ${segmentIndex}`;
        const collisionText = this.scene.add.text(this.scene.cameras.main.centerX, this.scene.cameras.main.height - 20, text, { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);
        this.debugTexts.push(collisionText);
    }

    logFunctionCall(funcName) {
        if(!this.logging)
            return;

        console.log(`Logging: ${funcName}`);
    }

    pauseGame() {
        if (this.scene.scene.isPaused()) {
            this.scene.scene.resume();
            if (this.pausedText) {
                this.pausedText.destroy();
            }
        } else {
            this.scene.scene.pause();
            this.pausedText = this.scene.add.text(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'Game Paused', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);
        }
    }

    testMode() {
        // ... logic for test behaviors
    }

    visualizeTipOfSnake() {
        const headCenter = this.scene.snake.body[0].getCenter();
        let tipX = headCenter.x + this.scene.snake.direction.x / 2;
        let tipY = headCenter.y + this.scene.snake.direction.y / 2;

        let rect = this.scene.add.rectangle(tipX, tipY, 3, 3, 0xffff00, 0).setStrokeStyle(1, 0xffff00);

        this.debugTexts.push(rect);
    }

 visualizeBounds(gameObject) {
    if (!gameObject) {
        console.warn("GameObject is undefined in visualizeBounds");
        return;
    }

    const bounds = gameObject.getBounds();
    const rect = this.scene.add.rectangle(bounds.x, bounds.y, bounds.width, bounds.height, 0xffff00, 0).setOrigin(0,0).setStrokeStyle(1, 0xffff00);

    this.debugTexts.push(rect);
    }

}