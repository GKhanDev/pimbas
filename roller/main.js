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

		this.stage.backgroundColor = '#000000';

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

		this.load.atlas('timon', 'assets/data/timon.png?v=1', 'assets/data/timon.json?v=1');
		this.load.atlas('game', 'assets/data/game.png?v=1', 'assets/data/game.json?v=1');
		this.load.atlas('player', 'assets/data/player.png?v=2', 'assets/data/player.json?v=2');
		this.load.atlas('car', 'assets/data/car.png?v=1', 'assets/data/car.json?v=1');		
		this.load.image('street', 'assets/data/street.png');
		this.load.image('cruce', 'assets/data/cruce.png');
		this.load.image('semaforo', 'assets/data/semaforo.png')
	},
	create: function() {
		console.log("Arranco Preloader");
		this.state.start('Game');
	}
};	

//PUT HERE THE GAME!
var Game = function(game){};
Game.prototype = {
	preload: function() {},
	create: function() {
		this.world.setBounds(0, 0, 2560, 480);
		this.physics.startSystem(Phaser.Physics.ARCADE);

		gameObjects = this.add.group();

		street = this.add.tileSprite(0,0,1280,480,'street');
		cruce = this.add.sprite(1280, 0, 'cruce');
		street2 = this.add.tileSprite(1920,0,640,480,'street');

		semaforo = this.add.sprite(1130, 330, 'semaforo');	
		semaforo.anchor.setTo(0,1);

		player = this.add.sprite(100,470,'player');
		player.anchor.setTo(0,1);
		player.animations.add('playerMoving', Phaser.Animation.generateFrameNames('playerMovement', 0, 5, '.png', 2), 4, true);
		player.animations.add('playerFallin', Phaser.Animation.generateFrameNames('playerFallin', 0, 3, '.png', 2), 2, false).onComplete.add(this.onPlayerDie, this);
		player.animations.play('playerMoving');

		car = this.add.sprite(1280, 460, 'car');
		car.anchor.setTo(0,1);
		car.scale.setTo(1.3,1.3);
		car.animations.add('openDoor', Phaser.Animation.generateFrameNames('carDoor', 0, 1,'.png', 2), 1, false);		

		this.physics.arcade.enable([player, car, semaforo]);

		player.body.setSize(70, 90, 40, -30);
		semaforo.body.setSize(50,90, 0, 60);
		car.body.setSize(50, 100, 150, -50);
		
		gameObjects.add(street);
		gameObjects.add(street2);
		gameObjects.add(cruce);
		gameObjects.add(semaforo);
		gameObjects.add(car);
		gameObjects.add(player);

		car.body.immovable = true; 
		semaforo.body.immovable = true;

		this.camera.follow(player);
		this.camera.deadzone = new Phaser.Rectangle(this.width/2, 0, 1, 480);

		playerSpeed = 6;
		spaceButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);		

		playerSpeed = 300;

		currentState = States.GAME;

		//this.state.start("SceneGameOver");
	},
	onPlayerDie: function()
	{
		console.log('la palmo');
		player.body.velocity.x = 0;
		currentState = States.FINISH;
		game.time.events.add(Phaser.Timer.SECOND * 2, this.finishGame, this);
	},
	render: function() {
		//game.debug.body(player);
 		//game.debug.body(car);
 		game.debug.body(semaforo);
	},
	update: function()
	{
		if (currentState == States.GAME) {
			this.physics.arcade.collide(player, semaforo, this.onTrigger, null, player);
			this.physics.arcade.collide(player, car, this.onDoorHitted, null, player);

			player.body.velocity.x = 0;
			velocity.setTo(0);

		   	if (game.input.keyboard.isDown(Phaser.Keyboard.D))
		    {
		        velocity.x = 1;
		    }	   
			
			velocity = Phaser.Point.normalize(velocity);
			velocity.x *= playerSpeed;
			player.body.velocity.x = velocity.x;
		}

		if (currentState == States.END)
		{
			console.log('acelerando');
			player.body.velocity.x = 0;
			velocity.setTo(0);
			velocity.x = 1;
			velocity = Phaser.Point.normalize(velocity);
			velocity.x *= playerSpeed;
			player.body.velocity.x = velocity.x;
		}
	},
	onTrigger: function(player)
	{
		console.log('trigger');
		semaforo.body.enable = false;
		car.animations.play('openDoor');
	},
	onDoorHitted: function(player)
	{
		console.log('se la puso');
		car.body.enable = false;
		playerSpeed = 400;
		player.animations.play('playerFallin');
		currentState = States.END;
	},
	finishGame: function()
	{
		this.state.start('SceneGameOver');
	}
};

var States = 
{
    LOAD:0,
    START:1,
    GAME:2,
    WIN:3,
    END:4,
    FINISH:5,
    RESTART:6
};
var currentState;

var playerSpeed = 150;
var velocity = new Phaser.Point();

var SceneGameOver = function(game){};
SceneGameOver.prototype	= {
	preload: function() {},
	create: function() {
		this.world.setBounds(0, 0, 640, 480);

		title = game.add.sprite(game.world.centerX, 130, 'game');
		title.animations.add('show', [2,3,4], 10, true);
		title.animations.play('show');	
		title.anchor.setTo(0.5, 0.5);
		title.scale.setTo(2);

		console.log('game over!?=');

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