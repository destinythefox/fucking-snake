class Snake {
    constructor(scene, config){
        this.config = config;
        this.scene = scene;
        
        this.color = 0x00ff00;
        this.flashCount = 3,  // Number of times the snake should flash
        this.flashDurationMS = 200  // Duration of each flash in milliseconds

        this.body = [this.scene.add.rectangle(320, 240, 16, 16, this.color).setOrigin(0,0)]
        this.direction = new Phaser.Geom.Point(16, 0);

        this.speed = 1; //Speed Multiplier
        this.timeLastMovedMS = 0; //last move()
        this.moveIntervalMS = 100; //How long between move() calls
    }

    update(time) {
        if (this.speed > 0 && time - this.timeLastMovedMS >= this.moveIntervalMS / this.speed) {
            this.move();
            this.scene.checkSelfCollision(this);
            this.scene.checkFoodCollision(this);

            this.timeLastMovedMS = time;
        }
    }

    move() {
        for (let i = this.body.length - 1; i > 0; i--) {
            this.body[i].setPosition(this.body[i - 1].x, this.body[i - 1].y);
        }

        this.body[0].x = Phaser.Math.Wrap(this.body[0].x + this.direction.x, 0, this.config.width);
        this.body[0].y = Phaser.Math.Wrap(this.body[0].y + this.direction.y, 0, this.config.height);
    }

    flash(callback){

        this.scene.tweens.add({
            targets: this.body,
            alpha: 0.5,
            duration: this.flashDurationMS / 2,
            yoyo: true,
            repeat: this.flashCount - 1,
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