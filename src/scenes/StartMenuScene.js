export class StartMenuScene extends Phaser.Scene {
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

export default StartMenuScene;