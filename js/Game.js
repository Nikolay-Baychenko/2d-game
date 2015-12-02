RENAME_ME.Game = function(game) {
	this.ship;
	this.asteroids;
	this.numAsteroids = 10;

	this.maxAstersOnScreen = 4;
	this.miners;
	this.score;
	this.scoreText;
	this.bgScrollSpeed = 0;

	this.YRespawnOffset = game.height - game.height / 3;
	this.AsteroidScaleConstant = 0.1;
	this.AsteroidSpeedFactor = 2;

	this.cursors;
	this.fireBtn;
};

RENAME_ME.Game.prototype = {
	create: function() {
		this.score = 0;
		// Adjusting physics
	    this.game.physics.startSystem(Phaser.Physics.ARCADE);
	    // Adjusting background
	    //bg = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'space');
	    //bg.autoScroll(0, this.bgScrollSpeed);
	    this.game.add.sprite(0, 0, 'space');
	    // Adding ship
	    this.ship = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 70, 'ship');
	    // Adjusting physics to the ship
	    this.game.physics.arcade.enable(this.ship);
	    // Setting gravity of ship to 0
	    this.ship.body.gravity.y = 0;
	    // Initial velocity of the ship
	    this.ship.body.velocity.x = 0;
	    this.ship.body.velocity.y = 0;

	    //ship's anchor is in the middle of the sprite
	    this.ship.anchor.setTo(0.5, 0.5);
	    //this.game.camera.follow(this.ship);
	    //deadzone explained here http://phaser.io/examples/v2/camera/deadzone
	    //this.game.camera.deadzone = new Phaser.Rectangle(100, 30, this.game.width - 200, 100);

	    // Adding asteroids group
	    this.asteroids = this.game.add.group();
	    // Adjusting physics for asteroids
	    this.asteroids.enableBody = true;
	    // Creating asteroids
	    for (var i = 0; i < this.numAsteroids; ++i)
	    {
	        var randomX = Math.random() * this.game.width;
	        var randomY = Math.random() * this.game.height - this.YRespawnOffset;
	        var asteroid = this.asteroids.create(randomX, randomY, 'asteroid');
	        var rand = Math.random() + this.AsteroidScaleConstant; // [C, 1 + C)

			asteroid.speed = Math.random() * this.AsteroidSpeedFactor;

			asteroid.anchor.setTo(0.5, 0.5);
	        asteroid.scale.setTo(rand, rand);
	        
	        asteroid.events.onInputDown.add(this.activateAsteroid, this);

	        i >= this.maxAstersOnScreen && asteroid.kill(); //hide rest of the asteroids
	    }

		this.scoreText = this.game.add.text(10, this.game.height - 20, 'score: 0', { fontSize: '15px', fill: '#fff' });

	    /*
	    for(var i = 0; i < 30; i++)
	    {
	        var randomTime = Math.random() * (7000 - 2000) + 2000;
	        generateAsteroid(randomTime);
	    }

	    function generateAsteroid(randomTime) {
	        setTimeout(function() {
	            // Setting asteroid's location
	            var randomX = Math.random() * (800 - 1) + 1;
	            var asteroid = asteroids.create(randomX, 10, 'asteroid');
	            // Setting gravity for asteroid
	            var randomGravity = Math.random() * (400 - 200) + 200;
	            asteroid.body.gravity.y = randomGravity;
	        }, randomTime);
	    }
	    */


	    // Enable controls
	    this.cursors = this.game.input.keyboard.createCursorKeys();
	    this.fireBtn = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function() {
		// Overlap settings
	    this.game.physics.arcade.overlap(this.asteroids, this.ship, this.asteroidCollision, this, null);

	    //this.tryToSpawnAsteroid();

	    this.asteroids.forEachAlive(function(asteroid)
	    	{
	    		asteroid.y > this.game.height ? asteroid.kill() : asteroid.y += asteroid.speed;
	    	}, this);

	    if (this.ship.alive) {
	    	if (this.cursors.left.isDown)
	        {
	            this.ship.body.velocity.x = -200;
	        }
	        else if (this.cursors.right.isDown)
	        {
	            this.ship.body.velocity.x = 200;
	        }

	        //  Firing?
	        if (this.fireButton.isDown) {
	            fireBullet();
	        }
	    }

	    this.scoreText.text = 'Score: ' + this.score;
	},

	activateAsteroid: function(asteroid, pointer) {

	},

	quitGame: function(pointer) {
		this.state.start('MainMenu');
	},

	render: function() {
		/* this.game.debug.body(this.planes[0].getSprite());
		this.game.debug.body(this.planes[1].getSprite());
		this.tubey.getGroup().forEachAlive(this.renderGroup, this);
		*/
		//this.bubbles.forEachAlive(this.renderGroup, this);

	},

	renderGroup: function(member) {
		this.game.debug.body(member);
	},

	asteroidCollision: function() {
	    // Destroys the ship
	    this.ship.kill();
	}
};
