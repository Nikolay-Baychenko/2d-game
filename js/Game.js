// TODO: add 3 types of asteroids: default deadly one (big), medium, small.
//  	 delete/change code related to the previous game idea

RENAME_ME.Game = function(game) {
	this.difficultyParams = {
		normal: {
			Param2or3Fragments: 0.2
		},
		hard: {
			Param2or3Fragments: 0.5
		}
	};

	this.ship;
	this.healthPercent;
	this.healthBar;
	this.HealthBarHeight = 15;
	this.healthBarWidth = 180;
	this.fireReloadTime = 0;
	this.asteroids;
	this.numAsteroids = 200;
	this.bullets;
	this.numBulletsInPool = 20;

	this.maxAstersOnScreen = 10;
	this.score;
	this.scoreText;
	//this.bgScrollSpeed = 0;

	this.YRespawnOffset = game.height - game.height / 6;
	this.asteroidMaxScale = 0.8;
	this.asteroidMinScale = 0.4;
	this.asteroidMaxSpeed = 4;
	this.asteroidMinSpeed = 2;

	this.cursors;
	this.fireBtn;
};

RENAME_ME.Game.prototype = {
	create: function() {
		this.score = 0;
		// Adjusting physics
	    this.game.physics.startSystem(Phaser.Physics.ARCADE);
	    // Adjusting background
	    this.game.add.sprite(0, 0, 'space');

		this.healthPercent = 100;
		// healthbar plugin - https://github.com/bmarwane/phaser.healthbar
		this.healthBar = new HealthBar(this.game, {x: this.game.width - this.healthBarWidth / 2 - 10
												 , y: this.game.height - 17
												 , height: this.HealthBarHeight
												 , width: this.healthBarWidth});
		this.healthBar.setPercent(this.healthPercent - 30);
		//this.healthBar.setFixedToCamera(true);
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

		// Adding bullets group
		this.bullets = this.game.add.group();
		this.bullets.enableBody = true;
		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(this.numBulletsInPool, 'bullet');
		this.bullets.setAll('anchor.x', 0.5);
		this.bullets.setAll('anchor.y', 1);
		this.bullets.setAll('outOfBoundsKill', true);
		this.bullets.setAll('checkWorldBounds', true);

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
			var rand  = Math.random() * (this.asteroidMaxScale - this.asteroidMinScale) + this.asteroidMinScale;
			asteroid.speed = Math.random() * (this.asteroidMaxSpeed - this.asteroidMinSpeed) + this.asteroidMinSpeed;
			asteroid.anchor.setTo(0.5, 0.5);
	        asteroid.scale.setTo(rand, rand);
	        i >= this.maxAstersOnScreen && asteroid.kill(); //hide rest of the asteroids
	    }

		this.scoreText = this.game.add.text(10, this.game.height - 20, 'score: 0', { fontSize: '15px', fill: '#fff' });

	    // Enable controls
	    this.cursors = this.game.input.keyboard.createCursorKeys();
	    this.fireBtn = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function() {
		// Overlap settings
	    this.game.physics.arcade.overlap(this.asteroids, this.ship, this.asteroidCollision, null, this);

	    //this.tryToSpawnAsteroid();
	    this.asteroids.forEachAlive(function(asteroid)
	    	{
	    		asteroid.y > this.game.height ? asteroid.kill() : asteroid.y += asteroid.speed;
	    	}, this);

	    if (this.ship.alive) {
			// Stand by after movement
			this.ship.body.velocity.setTo(0, 0);
			// Move left
	    	if (this.cursors.left.isDown)
	        {
	            this.ship.body.velocity.x = -200;
	        }
			// Move right
	        else if (this.cursors.right.isDown)
	        {
	            this.ship.body.velocity.x = 200;
	        }

	        //  Firing
	        if (this.fireBtn.isDown) {
				this.fire();
	        }
	    }
		// Run collision
		this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.bulletCollision, null, this);

	    this.scoreText.text = 'Score: ' + this.score;
	},

	// The rest of the methods should be in A-Z order


	asteroidCollision: function() {
	    // Big asteroids destroy the ship,
	    // smaller ones drain the ship's "health"
	    this.ship.kill();
	},

	bulletCollision: function (bullet, asteroid) {

	//  When a bullet hits an alien we kill them both
	bullet.kill();
	asteroid.kill();

	if (asteroid.scale >= this.asteroidMinScale) {
		// spawn the asteroid's debris (i.e. smaller ateroids)

		var numFragments = Math.random() >= this.difficultyParams.normal.Param2or3Fragments ? 2 : 3;
	}

	//  Increase the score
	this.score += 1;

	//  And create an explosion :)		ADD LATTER
	//var explosion = explosions.getFirstExists(false);
	//explosion.reset(alien.body.x, alien.body.y);
	//explosion.play('kaboom', 30, false, true);

	},

	fire: function() {
		// Timing doesn't work, need to fix
		if (this.game.time.now > this.fireReloadTime) {
			//  Grab the first bullet we can from the pool
			var bullet = this.bullets.getFirstExists(false);
			if (bullet) {
				//  And fire it
				bullet.reset(this.ship.x, this.ship.y - 30);
				bullet.body.velocity.y = -400;
				this.fireReloadTime = this.game.time.now + 400;
			}
		}
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

	resetBullet: function(bullet) {
		//  Called if the bullet goes out of the screen
		bullet.kill();
	}
};
