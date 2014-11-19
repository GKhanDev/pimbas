var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'Ilegal');

//INITIALIZE HERE THE CANVAS AND OTHER STUFFS LIKE DEVICE TYPE AND RESOLUTION
var Boot = function(game){};
Boot.prototype = {
	preload: function() {
		this.load.image('preloaderBg', 'assets/preload/loading-bg.png');
		this.load.image('preloaderBar', 'assets/preload/loading-bar.png');
	},
	create: function() {
		console.log("Arranco Boot");
		this.input.maxPointers = 1;
		this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.setScreenSize(true);

		this.stage.backgroundColor = '#16181a';

		this.state.start('Preloader');
	},
	update: function() {

	}
};

//PRELOAD HERE ASSETS
var Preloader = function(game){};
Preloader.prototype = {
	preload: function() {
		this.preloadBg = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBg');
		this.preloadBg.anchor.setTo(0.5,0.5);
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5,0.5);
		this.load.setPreloadSprite(this.preloadBar);

		this.load.audio('sound', 'assets/data/sound.ogg');
	},
	create: function() {
		console.log("Arranco Preloader");
		this.state.start('Game');
	}
};

//PUT HERE THE GAME!
var Game = function(game){};
Game.prototype = {
	preload: function() {
		//game.load.image("checker", "assets/checker.png");
		game.load.atlas('game', 'assets/data/game.png', 'assets/data/game.json');
	},
	create: function() {
		game.physics.startSystem(Phaser.Physics.ARCADE);	
		gameObjects = game.add.group();
			
		var title = game.add.sprite(game.world.centerX, 150, 'game');
		title.animations.add('show', [2,3,4], 10, true);
		title.animations.play('show');	
		title.anchor.setTo(0.5, 0.5);
		title.scale.setTo(2);

		music_main = this.add.audio("sound");
		music_main.play();

		gameObjects.add(title);
		console.log("GOs " + gameObjects.length);

		//game.state.start("Scene2");
	},
	update: function() {

	}
};

var Scene2 = function(game) {};
Scene2.prototype = {
	create : function() {
		console.log("Escena 2");
	}
};

game.state.add("Boot", Boot);
game.state.add("Preloader", Preloader);
game.state.add("Game", Game);
game.state.add("Scene2", Scene2);
game.state.start("Boot");

//var gameObjects;









