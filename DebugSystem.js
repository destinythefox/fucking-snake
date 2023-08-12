export default class DebugSystem {
   constructor(scene, gameWidth, gameHeight) {
        this.scene = scene; // Reference to this scene
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.debugMode = false; // Track if debug mode is active
        this.debugTexts = []; // Store references to all debug text objects
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
    }

    displayInfo() {
        console.log('Displaying debug information...');
    
    const fps = Math.round(1000 / this.scene.game.loop.delta);
    const memory = (performance && performance.memory && performance.memory.usedJSHeapSize) 
        ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' 
        : 'N/A';
    const snakeLength = this.scene.snake.length;

    this.clearDebugTexts();

    // Display FPS at the bottom right
    this.debugTexts.push(this.scene.add.text(this.gameWidth - 100, this.gameHeight - 70, `FPS: ${fps}`, { fontSize: '12px', fill: '#FFF' }).setOrigin(1, 1));

    // Display Memory usage just above FPS
    this.debugTexts.push(this.scene.add.text(this.gameWidth - 100, this.gameHeight - 50, `Memory: ${memory}`, { fontSize: '12px', fill: '#FFF' }).setOrigin(1, 1));

    // Display Snake Segments just above Memory usage
    this.debugTexts.push(this.scene.add.text(this.gameWidth - 100, this.gameHeight - 30, `Snake Segments: ${snakeLength}`, { fontSize: '12px', fill: '#FFF' }).setOrigin(1, 1));
    }

    clearDebugTexts() {
        this.debugTexts.forEach(text => text.destroy());
        this.debugTexts = [];
    }

   displayVariables() {
    this.clearDebugTexts();

    if (this.scene) {
        this.debugTexts.push(this.scene.add.text(10, 55, `Score: ${this.scene.score}`, { fontSize: '12px', fill: '#FFF' }));
        if (this.scene.direction) {
            this.debugTexts.push(this.scene.add.text(10, 70, `Direction: (${this.scene.direction.x}, ${this.scene.direction.y})`, { fontSize: '12px', fill: '#FFF' }));
        }
        this.debugTexts.push(this.scene.add.text(10, 85, `Snake Length: ${this.scene.snake.length}`, { fontSize: '12px', fill: '#FFF' }));
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
        console.log(`Function ${funcName} called.`);
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
}
