import StartMenuScene from './scenes/StartMenuScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 640,
    height: 480,
    version: 0.15,
    backgroundColor: "#1b1b1b",
    scene: [StartMenuScene, GameScene]
};
export default config; 

const game = new Phaser.Game(config);