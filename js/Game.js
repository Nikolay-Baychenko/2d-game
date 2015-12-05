// TODO: add 3 types of asteroids: default deadly one (big), medium, small.
//  	 delete/change code related to the previous game idea

RENAME_ME.Game = function(game) {
	this.ship;
	this.fireReloadTime = 2000; // ms
	this.lastFireTime = game.now - this.fireReloadTime;
	this.asteroids;
	this.numAsteroids = 10;
	this.bullets;
	this.bulletSpeedConstant = 2;
	this.numBulletsInPool = 20;

	this.maxAstersOnScreen = 4;
	this.miners;
	this.score;
	this.scoreText;
	//this.bgScrollSpeed = 0;

	this.YRespawnOffset = game.height - game.height / 3;
	this.AsteroidScaleConstant = 0.1;
	this.AsteroidSpeedFactor = 2;

	this.cursors;
	this.fireBtn;
};

RENAME_ME.Game.prototype = {
	create: function() {
		this.score = 0;
		this.reloading = false;
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

		// Adding bullets group
		this.bullets = this.game.add.group();
		this.bullets.enableBody = true;
		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(30, 'bullet');
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
	        var rand = Math.random() + this.AsteroidScaleConstant; // [C, 1 + C)

			asteroid.speed = Math.random() * this.AsteroidSpeedFactor;

			asteroid.anchor.setTo(0.5, 0.5);
	        asteroid.scale.setTo(rand, rand);


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
	    // Destroys the ship
	    this.ship.kill();
	},

	bulletCollision: function (bullet, asteroid) {

	//  When a bullet hits an alien we kill them both
	bullet.kill();
	asteroid.kill();

	//  Increase the score
	this.score += 1;

	//  And create an explosion :)		ADD LATTER
	//var explosion = explosions.getFirstExists(false);
	//explosion.reset(alien.body.x, alien.body.y);
	//explosion.play('kaboom', 30, false, true);

	},

	fire: function() {
			//  Grab the first bullet we can from the pool
			var bullet = this.bullets.getFirstExists(false);

			if (bullet)
			{
				//  And fire it
				bullet.reset(this.ship.x, this.ship.y + 8);
				bullet.body.velocity.y = -400;
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
	}
};
