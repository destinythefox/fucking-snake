class Snake {
    constructor(scene, config){
        this.config = config;
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

        this.body[0].x = Phaser.Math.Wrap(this.body[0].x + this.direction.x, 0, this.config.width);
        this.body[0].y = Phaser.Math.Wrap(this.body[0].y + this.direction.y, 0, this.config.height);
    }

    flash(callback){
        const maxFlashes = this.config.snakeFlashFrequency;
        const totalDuration = maxFlashes * this.config.snakeFlashDuration;
    
        this.scene.tweens.add({
            targets: this.body,
            alpha: 0.5,
            duration: this.config.snakeFlashDuration / 2,
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

export default Snake;