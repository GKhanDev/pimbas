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
		//this.scale.pageAlignHorizontally = true;
		//this.scale.pageAlignVertically = true;
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

		this.load.atlas('timon', 'assets/data/timon.png', 'assets/data/timon.json');
		this.load.atlas('game', 'assets/data/game.png', 'assets/data/game.json');
		this.load.atlas('river', 'assets/data/river.png', 'assets/data/river.json');
		this.load.atlas('dogs', 'assets/data/dogs.png', 'assets/data/dogs.json');
		this.load.atlas('plane', 'assets/data/plane.png', 'assets/data/plane.json');
		this.load.atlas('player', 'assets/data/player.png?v=1', 'assets/data/player.json?v=1');
		this.load.atlas('titles', 'assets/data/titles.png?v=1', 'assets/data/titles.json?v=1');
		this.load.atlas('explosion', 'assets/data/explosion.png?v=1', 'assets/data/explosion.json?v=1');
		this.load.image('grass', 'assets/data/grass.png');
		this.load.image('city', 'assets/data/city.png');
		this.load.image('cityLarge', 'assets/data/cityLarge.png');
		this.load.image('building', 'assets/data/building.png');
		this.load.image('room', 'assets/data/room.png');
		this.load.image('guide', 'assets/data/guide.png');
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
		
	},
	create: function() {
		//Create
		gameObjects4 = this.add.group();
		gameObjects3 = this.add.group();
		gameObjects2 = this.add.group();
		gameObjects = this.add.group();		

		staticGameObjects = this.add.group();
		guide = this.add.sprite(0,0,'guide');
		staticGameObjects.add(guide);

		playerSpeed = 6;

		spaceButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		this.create1();	
		//this.create2();
		//this.create3();
		//this.create4();
	},
	create1: function()
	{
		grass = this.add.sprite(0,0,'grass');			
		river = this.add.sprite(0,0,'river');
		river.animations.add('flow');
		river.animations.play('flow', 8, true);

		player = this.add.sprite(0,0,'player');
		player.animations.add('riverIdle', Phaser.Animation.generateFrameNames('playerRiverIdle', 0, 3, '.png', 2), 4, true);
		player.animations.add('riverCrossing', Phaser.Animation.generateFrameNames('playerRiverCrossing', 0, 3, '.png', 2), 4, true);
		player.animations.play('riverIdle');

		title = this.add.sprite(200,10,'titles');
		title.animations.add('titleScene1', Phaser.Animation.generateFrameNames('titleScene1', 0, 1, '.png', 2), 8, true);
		title.animations.play('titleScene1');

		gameObjects.add(grass);
		gameObjects.add(river);
		gameObjects.add(player);
		gameObjects.add(title);

		initialPos = new Phaser.Point(0,0);
		targetPos = new Phaser.Point(100,100);
		direction = new Phaser.Point();
		
		//Add key event!		
		spaceButton.onDown.add(this.onWalk, this);		
	},
	onWalk: function() {
		player.animations.play('riverCrossing');

		Phaser.Point.subtract(targetPos, initialPos, direction);
		Phaser.Point.normalize(direction, direction);
		player.x += direction.x * playerSpeed;
		player.y += direction.y * playerSpeed;
		
		if (player.x >= targetPos.x && player.y >= targetPos.y)
		{
			player.x = targetPos.x;
			player.y = targetPos.y;
			console.log("LLegue!");
			spaceButton.onDown.removeAll();
			player.animations.play('riverIdle');
			title.destroy();

			this.time.events.removeAll();			
			this.time.events.add(Phaser.Timer.SECOND * 2, this.completeScene1, this);
		} else {
			this.time.events.removeAll();			
			this.time.events.add(Phaser.Timer.SECOND, this.resetAnimation, this);
		}
	},
	resetAnimation: function() {
		player.animations.play('riverIdle');	
		this.time.events.removeAll();	
	},
	completeScene1: function() {
		this.create2();
	},
	create2: function() {
		city = this.add.tileSprite(0,0,640,240,'city');	

		player2 = this.add.sprite(120,130,'player');
		player2.animations.add('dogIdle', Phaser.Animation.generateFrameNames('playerDogIdle', 0, 1, '.png', 2), 2, true);
		player2.animations.add('dogRunning', Phaser.Animation.generateFrameNames('playerDogRunning', 0, 3, '.png', 2), 4, true);
		player2.animations.play('dogIdle');	

		dogs = this.add.sprite(1,120,'dogs');
		dogs.animations.add('attack');
		dogs.animations.play('attack', 6, true);

		title = this.add.sprite(200,10,'titles');
		title.animations.add('titleScene1', Phaser.Animation.generateFrameNames('titleScene1', 0, 1, '.png', 2), 8, true);
		title.animations.play('titleScene1');

		gameObjects2.add(city);
		gameObjects2.add(player2);
		gameObjects2.add(dogs);	
		gameObjects2.add(title);

		spaceButton.onDown.add(this.onRun, this);

		gameObjects2.x = this.world.centerX;
	},
	onRun: function()
	{
		player2.animations.play('dogRunning');
		city.x -= playerSpeed;	
		if (city.x <= -240)
		{
			console.log("LLegue2!");
			spaceButton.onDown.removeAll();
			player2.animations.play('dogIdle');
			title.destroy();

			this.time.events.removeAll();			
			this.time.events.add(Phaser.Timer.SECOND * 2, this.completeScene2, this);
		} else {
			this.time.events.removeAll();			
			this.time.events.add(Phaser.Timer.SECOND*0.25, this.resetAnimation2, this);
		}
	},
	resetAnimation2: function()
	{
		player2.animations.play('dogIdle');	
		this.time.events.removeAll();
	},
	completeScene2: function() {
		this.create3();
	},
	create3: function() {
		room = this.add.sprite(0,0,'room');	

		player3 = this.add.sprite(120,150,'player');
		player3.animations.add('cleanIdle', Phaser.Animation.generateFrameNames('playerCleanIdle', 0, 1, '.png', 2), 2, true);
		player3.animations.add('cleanCleaning', Phaser.Animation.generateFrameNames('playerCleanClean', 0, 1, '.png', 2), 4, true);
		player3.animations.play('cleanIdle');	

		title = this.add.sprite(200,10,'titles');
		title.animations.add('titleScene1', Phaser.Animation.generateFrameNames('titleScene1', 0, 1, '.png', 2), 8, true);
		title.animations.play('titleScene1');

		gameObjects3.add(room);
		gameObjects3.add(player3);
		gameObjects3.add(title);

		spaceButton.onDown.add(this.onClean, this);
		totalClean = 0;

		gameObjects3.y = this.world.centerY;
	},
	onClean: function() {
		player3.animations.play('cleanCleaning');
		totalClean += playerSpeed;
		if (totalClean >= 240)
		{
			console.log("LLegue3!");
			spaceButton.onDown.removeAll();
			player3.animations.play('cleanIdle');
			title.destroy();

			this.time.events.removeAll();			
			this.time.events.add(Phaser.Timer.SECOND * 2, this.completeScene3, this);
		} else {
			this.time.events.removeAll();			
			this.time.events.add(Phaser.Timer.SECOND*0.25, this.resetAnimation3, this);
		}
	},
	resetAnimation3: function()
	{
		player3.animations.play('cleanIdle');	
		this.time.events.removeAll();
	},
	completeScene3: function() {
		this.create4();
	},
	create4: function() {
		cityLarge = this.add.sprite(0,0,'cityLarge');
		building = this.add.sprite(0,0,'building');	

		plane = this.add.sprite(350,100,'plane');
		plane.animations.add('flying');
		plane.animations.play('flying', 12, true);		

		gameObjects4.add(cityLarge);
		gameObjects4.add(building);
		gameObjects4.add(plane);		
		
		gameObjects4.y = this.world.centerY;
		gameObjects4.x = this.world.centerX;

		this.time.events.removeAll();			
		this.time.events.loop(Phaser.Timer.SECOND * 0.15, this.onFly, this);
	},
	onFly: function() {
		plane.x -= playerSpeed;
		if (plane.x <= 190)
		{
			console.log("LLegue4!");
			explosion = this.add.sprite(plane.x, plane.y+20, 'explosion');
			explosion.anchor.setTo(0.5,1);
			gameObjects4.add(explosion);
			explosion.animations.add('explode');
			explosion.animations.play('explode', 30, false).onComplete.add(this.onExplosionComplete, explosion);

			this.add.tween(plane).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
			this.add.tween(building).to( {x: 10}, 1000, Phaser.Easing.Bounce.InOut, true, 0, true);
			this.add.tween(building).to( {y: 240}, 2000, Phaser.Easing.Bounce.InOut, true, 1000).onComplete.add(this.onBuildingCollapse, this);

			this.time.events.removeAll();			
		}
	},
	onExplosionComplete: function(explosion) {
		explosion.kill();
	},
	onBuildingCollapse: function() {
		this.time.events.add(Phaser.Timer.SECOND * 0.5, this.completeScene4, this);
	},
	completeScene4: function() {
		this.time.events.removeAll();
		this.state.start("SceneGameOver");
	},
};

var SceneGameOver = function(game){};
SceneGameOver.prototype	= {
	preload: function() {},
	create: function() {
		title = game.add.sprite(game.world.centerX, 130, 'game');
		title.animations.add('show', [2,3,4], 10, true);
		title.animations.play('show');	
		title.anchor.setTo(0.5, 0.5);
		title.scale.setTo(2);

		timon = game.add.sprite(game.world.centerX, 450, 'timon');
		timon.anchor.setTo(0.5, 1);
		timon.animations.add('show');
		timon.animations.play('show', 12, false);
		timon.scale.setTo(2);
	},
	update: function() {},
};


game.state.add("Boot", Boot);
game.state.add("Preloader", Preloader);
game.state.add("Game", Game);
game.state.add("SceneGameOver", SceneGameOver);
game.state.start("Boot");

//var gameObjects;









