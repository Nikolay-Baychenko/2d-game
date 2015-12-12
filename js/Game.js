// TODO: add 3 types of asteroids: default deadly one (big), medium, small.
//  	 delete/change code related to the previous game idea

RENAME_ME.Game = function(game) {
	this.difficultyLvlObject;
	this.difficultyParams = {
		normal: {
			healthToDeduceOnFragmentCollison: 20,
			param2or3Fragments: 0.2,
			pointsBrokenAster: 2,
			pointsAnnihilatedFragment: 3
		},
		hard: {
			healthToDeduceOnFragmentCollison: 25,
			param2or3Fragments: 0.5,
			pointsBrokenAster: 3,
			pointsAnnihilatedFragment: 3
		}
	};

	this.ship;
	this.shipVelocityX = 180;
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

	this.XYScaleVelocityForAsteroid = {velocity: {}}; // 4 params for an asteroid-to-spawn
	this.asteroidMaxScale = 0.8;
	this.asteroidMinScale = 0.4;
	this.asteroidMaxSpeedY = 4;
	this.asteroidMinSpeedY = 2;
	this.asteroidMaxSpeedX = 0.5;
	this.asteroidMinSpeedX = 0.1;
	this.smallAsteroidVelMultiplierX = 3;
	this.smallAsteroidVelMultiplierY = 1.2;
	this.smallAsteroidScale = this.asteroidMinScale / 3;
	this.evenSmallerAsteroidScale = this.asteroidMinScale / 3.5;
	this.counterToControlAsteroidsSpawn = -6; // try to spawn then <= 0

	this.cursors;
	this.fireBtn;

	// more funny constants:
	this.thirdTheScreen = game.height / 3;
	this.fragmentsScatterMaxDistance = 40;
};

RENAME_ME.Game.prototype = {
	create: function() {
		this.difficultyLvlObject = this.difficultyParams.normal;
		this.score = 0;
		// Adjusting physics
	    this.game.physics.startSystem(Phaser.Physics.ARCADE);
	    // Adjusting background
	    this.game.add.sprite(0, 0, 'space');

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

		this.ship.health = 100;
		// healthbar plugin - https://github.com/bmarwane/phaser.healthbar
		this.healthBar = new HealthBar(this.game, {x: this.game.width - this.healthBarWidth / 2 - 10
												 , y: this.game.height - 17
												 , height: this.healthBarHeight
												 , width: this.healthBarWidth});
		this.healthBar.setPercent(this.ship.health);

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
	    	this.updateXYScaleSpeedVar();
	        var asteroid = this.asteroids.create(this.XYScaleVelocityForAsteroid['x'], this.XYScaleVelocityForAsteroid['y'], 'asteroid');
			asteroid.body.velocity.setTo(this.XYScaleVelocityForAsteroid['velocity'].x, this.XYScaleVelocityForAsteroid['velocity'].y);
			asteroid.anchor.setTo(0.5, 0.5);
	        asteroid.scale.setTo(this.XYScaleVelocityForAsteroid['scale'], this.XYScaleVelocityForAsteroid['scale']);

	        ++this.counterToControlAsteroidsSpawn;
	        this.counterToControlAsteroidsSpawn > 0 && asteroid.kill(); //hides rest of the asteroids
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

	    if (this.ship.health <= 0) {
	    	this.gameOver();
	    }
	    else {
	    	//this.tryToSpawnAsteroid();
		    this.asteroids.forEachAlive(function(asteroid)
		    	{
		    		if (asteroid.y > this.game.height)
		    			asteroid.kill(); 
		    		else {
		    			asteroid.x += asteroid.body.velocity.x;
		    			asteroid.y += asteroid.body.velocity.y;
		    		}
		    	}, this);

		    if (this.ship.alive) {
				// Stand by after movement
				this.ship.body.velocity.setTo(0, 0);
				// Move left
		    	if (this.cursors.left.isDown)
		        {
		            this.ship.body.velocity.x = -this.shipVelocityX;
		        }
				// Move right
		        else if (this.cursors.right.isDown)
		        {
		            this.ship.body.velocity.x = this.shipVelocityX;
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
	    if (asteroid.scale.x >= this.asteroidMinScale) {
	    	this.ship.damage(100);
	    	this.healthBar.setPercent(this.ship.health);
	    	
	    	this.gameOver();
	    }
	    else {
	    	this.ship.damage(this.difficultyLvlObject.healthToDeduceOnFragmentCollison);
	    	this.healthBar.setPercent(this.ship.health);

	    	asteroid.kill;
	    }
	},

	bulletCollision: function (bullet, asteroid) {
		bullet.kill();
		asteroid.kill();

		if (asteroid.scale.x >= this.asteroidMinScale) {
			// spawn the asteroid's debris (i.e. smaller ateroids)
			var numFragmentsMinusOne = Math.random() >= this.difficultyLvlObject.param2or3Fragments ? 1 : 2; //we reuse hitted asteroid as 1 of the fragments
			var fragmentScale = numFragmentsMinusOne >= 1 ? this.evenSmallerAsteroidScale : this.smallAsteroidScale;
			var fragment;
			var scatterDistance;
			var fragmentVelX = asteroid.body.velocity.x;
			var fragmentVelY = asteroid.body.velocity.y * this.smallAsteroidVelMultiplierY;

			for (var i = 0; i < numFragmentsMinusOne; ++i) { //gen 1 or 2 fragments (the final one below the loop)
				fragment = this.asteroids.getFirstDead();
				scatterDistance = Math.random() * this.fragmentsScatterMaxDistance;

				//1st flies to the left, 2nd (if present) down
				if (i < 1) {
					fragmentVelX *= (this.smallAsteroidVelMultiplierX * -1);
					fragment.x = asteroid.x - scatterDistance;
				} else {
					fragmentVelX *= -1
					fragment.x = asteroid.x;
				}
				fragment.y = asteroid.y - scatterDistance;
				fragment.scale.setTo(fragmentScale, fragmentScale);
				fragment.body.velocity.setTo(fragmentVelX,
											   fragmentVelY);
				fragment.revive();
			}

			// convert the asteroid to a final fragment, always flies to the right
			scatterDistance = Math.random() * this.fragmentsScatterMaxDistance;
			asteroid.x += scatterDistance;
			asteroid.y -= scatterDistance;
			asteroid.body.velocity.setTo(asteroid.body.velocity.x * this.smallAsteroidVelMultiplierX,
											fragmentVelY);
			asteroid.scale.setTo(fragmentScale, fragmentScale);

			asteroid.revive();

			this.score += this.difficultyLvlObject.pointsBrokenAster;
		}
		else {
			this.score += this.difficultyLvlObject.pointsAnnihilatedFragment;
		}

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
		//this.ship.kill(); ship is killed automatically than its health <= 0
		this.stateText.text = " GAME OVER \n  Final score:\n      "+ this.score +"\n (click to restart)";
    	this.stateText.visible = true;

        //the "click to restart" handler
        this.game.input.onTap.addOnce(this.restart, this);
	},

	spawnFragment: function(asteroid, fragmentType) {
		
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

	},

	updateXYScaleSpeedVar: function() {
		this.XYScaleVelocityForAsteroid['x'] = Math.random() * this.game.width;
	    this.XYScaleVelocityForAsteroid['y'] = Math.random() * this.game.height * -2 - this.thirdTheScreen;
	    this.XYScaleVelocityForAsteroid['scale']  = Math.random() * (this.asteroidMaxScale - this.asteroidMinScale) + this.asteroidMinScale;
		this.XYScaleVelocityForAsteroid.velocity.y = Math.random() * (this.asteroidMaxSpeedY - this.asteroidMinSpeedY) + this.asteroidMinSpeedY;
		this.XYScaleVelocityForAsteroid.velocity.x = Math.random() * (this.asteroidMaxSpeedX - this.asteroidMinSpeedX) + this.asteroidMinSpeedX;
		if (Math.random() > 0.5)
			this.XYScaleVelocityForAsteroid.velocity.x *= -1;
	},
};
