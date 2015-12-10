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
	this.healthBarHeight = 15;
	this.healthBarWidth = 180;
	this.fireReloadTime = 0;
	this.asteroids;
	this.numAsteroids = 80; // in pool (alive & killed)
	this.bullets;
	this.numBulletsInPool = 20;

	//this.maxAstersOnScreen = 10;
	this.score;
	this.scoreText;
	this.stateText;
	//this.bgScrollSpeed = 0;

	this.yRespawnOffset = game.height - game.height / 6;
	this.asteroidMaxScale = 0.8;
	this.asteroidMinScale = 0.4;
	this.asteroidMaxSpeed = 4;
	this.asteroidMinSpeed = 2;
	this.counterToControlAsteroidsSpawn = -6; // try to spawn then <= 0

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
												 , height: this.healthBarHeight
												 , width: this.healthBarWidth});
		this.healthBar.setPercent(this.healthPercent);
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
	        var randomY = Math.random() * this.game.height - this.yRespawnOffset;
	        var asteroid = this.asteroids.create(randomX, randomY, 'asteroid');
			var rand  = Math.random() * (this.asteroidMaxScale - this.asteroidMinScale) + this.asteroidMinScale;
			asteroid.speed = Math.random() * (this.asteroidMaxSpeed - this.asteroidMinSpeed) + this.asteroidMinSpeed;
			asteroid.anchor.setTo(0.5, 0.5);
	        asteroid.scale.setTo(rand, rand);

	        ++this.counterToControlAsteroidsSpawn;
	        this.counterToControlAsteroidsSpawn > 0 && asteroid.kill(); //hide rest of the asteroids
	    }

		this.scoreText = this.game.add.text(10, this.game.height - 20, 'score: 0', { fontSize: '15px', fill: '#fff' });

		this.stateText = this.game.add.text(this.game.world.centerX,this.game.world.centerY,' ', { font: '70px Arial', fill: '#fff' });
	    this.stateText.anchor.setTo(0.5, 0.5);
	    this.stateText.visible = false;

	    // Enable controls
	    this.cursors = this.game.input.keyboard.createCursorKeys();
	    this.fireBtn = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function() {
		// Run collision
	    this.game.physics.arcade.overlap(this.ship, this.asteroids, this.asteroidCollision, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.bulletCollision, null, this);

	    if (this.healthPercent <= 0) {
	    	this.gameOver();
	    }
	    else {
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

		    this.scoreText.text = 'Score: ' + this.score;
	    }
	},

	// The rest of the methods should be in A-Z order


	asteroidCollision: function(ship, asteroid) {
	    // Big asteroids destroy the ship,
	    // smaller ones drain the ship's "health"
	    if (asteroid.scale >= this.asteroidMinScale) {
	    	this.healthPercent = 0;
	    	this.healthBar.setPercent(this.healthPercent);
	    	
	    	this.gameOver();
	    }
	    else {
	    	var healthToDeduce = 25; // btw, JS hoists "vars"/"lets" to the top of a function/block
	    	this.healthPercent -= healthToDeduce;
	    	this.healthBar.setPercent(this.healthPercent);

	    	asteroid.kill;
	    }
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

	gameOver: function() {
		this.ship.kill();
		this.stateText.text = " GAME OVER \n  Final score:\n      "+ this.score +"\n (click to restart)";
    	this.stateText.visible = true;

        //the "click to restart" handler
        this.game.input.onTap.addOnce(this.restart, this);
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
	},

	restart: function() {

	}
};
