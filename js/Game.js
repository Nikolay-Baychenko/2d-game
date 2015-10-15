RENAME_ME.Game = function(game) {
	this.ship;
	this.asteroids;
	this.numAsteroids = 10;
	this.miners;
	this.score;
};

RENAME_ME.Game.prototype = {
	create: function() {
		this.score = 0;
		// Adjusting physics
	    game.physics.startSystem(Phaser.Physics.ARCADE);
	    // Adjusting background
	    game.add.sprite(0, 0, 'space');
	    // Adding ship
	    this.ship = game.add.sprite(game.world.centerX, game.world.height - 100, 'ship');
	    // Adjusting physics to the ship
	    game.physics.arcade.enable(ship);
	    // Setting gravity of ship to 0
	    this.ship.body.gravity.y = 0;
	    // Initial velocity of the ship
	    this.ship.body.velocity.x = 0;
	    this.ship.body.velocity.y = 3;

	    //ship's anchor is in the middle of the sprite
	    this.ship.anchor.setTo(0.5, 0.5);
	    game.camera.follow(this.ship);

	    // Adding asteroids group
	    this.asteroids = game.add.group();
	    // Adjusting physics for asteroids
	    this.asteroids.enableBody = true;
	    // Creating asteroids

	    for (var i = 0; i < numAsteroids; ++i)
	    {
	        var randomPlace = Math.random() * (1000 - 1) + 1;
	        var asteroid = this.asteroids.create(randomPlace, -1000 * i, 'asteroid');
	        asteroid.events.onInputDown.add(activateAsteroid,this);

	        /*
	        var randomGravity = Math.random() * (45 - 40) + 40;
	        asteroid.body.gravity.y = randomGravity;
	        */
	    }

	    /*
	    for(var i = 0; i < 30; i++)
	    {
	        var randomTime = Math.random() * (7000 - 2000) + 2000;
	        generateAsteroid(randomTime);
	    }

	    function generateAsteroid(randomTime) {
	        setTimeout(function() {
	            // Setting asteroid's location
	            var randomPlace = Math.random() * (800 - 1) + 1;
	            var asteroid = asteroids.create(randomPlace, 10, 'asteroid');
	            // Setting gravity for asteroid
	            var randomGravity = Math.random() * (400 - 200) + 200;
	            asteroid.body.gravity.y = randomGravity;
	        }, randomTime);
	    }
	    */


	    // Enable controls
	    //cursors = game.input.keyboard.createCursorKeys();
	},

	update: function() {
		// Overlap settings
	    game.physics.arcade.overlap(asteroids, ship, asteroidCollision, this, null);

	    /*
	    if (cursors.left.isDown)
	    {
	        //  Move to the left
	        this.ship.body.velocity.x = -650;
	    }
	    else if (cursors.right.isDown)
	    {
	        //  Move to the right
	        this.ship.body.velocity.x = 650;
	    }

	    if (cursors.up.isDown)
	    {
	        // Move up
	        this.ship.body.velocity.y = -650;
	    }
	    else if (cursors.down.isDown)
	    {
	        // Move down
	        this.ship.body.velocity.y = 650;
	    }
	    */
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
