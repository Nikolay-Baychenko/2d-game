RENAME_ME.Preloader = function(game) {
    this.ready = false;
};

RENAME_ME.Preloader.prototype = {

    preload: function() {
        //this.game.load.image('mainMenuBG', 'assets/imgs/spacescape-imgs/sp5.jpg');
        // loading image of background (random backgroud from sp1 to sp6)
        this.game.load.image('space', 'assets/imgs/spacescape-imgs/sp'+ (Math.floor(Math.random() * (7 - 1)) + 1) +'.jpg');
        // loading sprite of ship
        this.game.load.image('ship', 'assets/imgs/ship.png');
        // loading sprite of asteroid
        this.game.load.image('asteroid', 'assets/imgs/asteroid.png');
        // loading sprite of bullet
        this.game.load.image('bullet', 'assets/imgs/bullet.png');
        // loading audio
        this.game.load.audio('backgroundSound', 'assets/audio/bg.wav');
        this.game.load.audio('bulletSound', 'assets/audio/bullet.wav');
        this.game.load.audio('hitAsteroidSound', 'assets/audio/hitasteroid.wav');
        this.game.load.audio('powerUpSound', 'assets/audio/powerup.wav');
        this.game.load.audio('shipCrashSound', 'assets/audio/spaceshipcrash.wav');
    },

    create: function() {
        /*
        this.game.stage.backgroundColor = '#ffffff';
        var logo = this.add.sprite(this.world.width/2, this.world.height/2, 'logo');
        logo.anchor.set(0.5, 0.5);

        this.game.time.events.add(Phaser.Timer.SECOND * 2.0, function() {

            var tween = this.add.tween(logo)
                .to({alpha: 0}, 750, Phaser.Easing.Linear.none);

            tween.onComplete.add(function() {
                logo.destroy();
                this.startGame();
            }, this);

            tween.start();
        }, this);
        */
        this.startGame();
    },

    startGame: function() {
        this.state.start('MainMenu');
    }

};
