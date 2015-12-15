RENAME_ME.MainMenu = function (game) {
};

RENAME_ME.MainMenu.prototype = {

	create: function () {
		/* if we decide to make main menu
		this.add.sprite(0,0,'mainMenuBG');

		this.playButton = this.add.button(400, 600, 'playButton', this.play, this, 'buttonOver', 'buttonOut', 'buttonOver');
		*/
		this.game.stage.backgroundColor = '#000000';

		this.play();
	},

	play: function() {
		this.state.start('Game');
	},

	update: function () {

	}
};
