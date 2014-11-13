var game = new Phaser.Game(800, 400, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render});

function preload()
{
	game.load.image("checker", "assets/checker.png");
	game.load.atlas('player', 'assets/data/player.png', 'assets/data/player.json');
	game.load.atlas('enemy', 'assets/data/enemy.png', 'assets/data/enemy.json');
	game.load.atlas('game', 'assets/data/game.png', 'assets/data/game.json');
	game.load.atlas('meteorite', 'assets/data/meteorite.png', 'assets/data/meteorite.json');

	currentState = States.LOAD;
}

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

var player;
var enemy;
var platform;
var currentState;
var gameObjects;
function create()
{
	//game.add.tileSprite(0, 0, 1920, 400, 'checker');
	game.world.setBounds(0, 0, 1920, 400);
	game.physics.startSystem(Phaser.Physics.ARCADE);	
	
	gameObjects = game.add.group();

	platform = game.add.tileSprite(0, 400-32, 1920, 32, 'game', 1);
	gameObjects.add(platform);
	var separation = 150;
	for (var i = 0; i < 20; i++) {
		gameObjects.create(i * separation, 400 - 48, 'game', 0);
		//game.add.sprite(i * separation, 400 - 48, 'game', 0);
	}

	player = game.add.sprite( 50, 400-80, 'player');
	enemy = game.add.sprite(50, 400-182, 'enemy');

	gameObjects.add(player);
	gameObjects.add(enemy);

	game.physics.arcade.enable([player, enemy, platform]);

	player.body.collideWorldBounds = true;
	player.animations.add('walk', [12, 13, 14, 15], 10, true);
    player.animations.add('surprise', [11], 1, false);
    player.animations.add('idle', [7], 1, false);
    player.animations.add('idleStay', [8, 9, 10], 3, false);
    player.animations.add('death', [0,1,2,3,4,5,6], 5, false);
    player.animations.play('idle');
    player.anchor.setTo(0.5,1);
    player.body.setSize(28, 47, 0, 0);
    player.body.gravity.y = 1500;
    player.body.maxVelocity.y = 500;
    player.x = 300;
    player.y = 400 - 35;

    enemy.body.collideWorldBounds = true;
   	enemy.animations.add('idle', [1], 1, false);
    enemy.animations.add('show', [2, 3], 1, true).onLoop.add(onEnemyShowLooped, this);
    enemy.animations.add('walk', [4, 5, 6, 7], 4, true);
    enemy.animations.add('death', [0], 1, false); 
    enemy.animations.play('idle');
    enemy.anchor.setTo(0.5,1);
    enemy.body.setSize(50, 100, 0, 0);
    enemy.x = 186/2;
    enemy.y = 400 - 32;

    platform.body.immovable = true;  

    game.camera.follow(player);

    game.camera.deadzone = new Phaser.Rectangle(game.width/2, 0, 1, 400);
    
    enemyShowCounts = 2;
    win = false;
    ShowIntro();
}

var playerSpeed = 150;
var jumpSpeed = 400;
var lastDirection = 0;
var velocity = new Phaser.Point();

function ShowIntro()
{
	enemy.animations.play('show');
	currentState = States.START;
}

function onEnemyShowLooped()
{
	enemyShowCounts--;
	if (enemyShowCounts <= 0) {
		enemy.animations.play('idle');
		player.animations.play('surprise');
		game.time.events.add(Phaser.Timer.SECOND * 1, startGame, this);
	}	
}

var enemyShowCounts = 3;
function startGame()
{
	player.animations.play('idle');
	enemy.animations.play('walk');
	currentState = States.GAME;
}

function winGame()
{
	win = true;
	enemy.body.velocity.x = 0;
	enemy.animations.play('idle');	
}

function showOutro()
{
	currentState = States.WIN;
	player.body.velocity.x = 0;
	player.animations.play('idle');
	velocity.setTo(0);	

	meteorite = game.add.sprite((player.x + game.width / 2) - 50, 35, 'meteorite');
	game.physics.arcade.enable(meteorite);

	meteorite.body.collideWorldBounds = true;
	meteorite.animations.add('show',[0, 1,2,3,4,5,6,7,8,9], 5, true); 
    meteorite.animations.play('show');
    meteorite.body.setSize(20, 20, 0, 0);

	gameObjects.add(meteorite);
	
	game.time.events.add(Phaser.Timer.SECOND * 1, onShowOutro, this);
}

var meteorite;
var meteoriteSpeed = 200;
function onShowOutro()
{
	currentState = States.FINISH;

	direction = new Phaser.Point(player.x - meteorite.x, (player.y - 32) - meteorite.y);
	direction = Phaser.Point.normalize(direction);

	enemy.animations.play('death');
	player.animations.play('idleStay');
}

function onPlayerCollide(_meteorite, _player)
{
	currentState = States.RESTART;
	meteorite.kill();

	player.body.velocity.setTo(0);
	player.animations.getAnimation('death').onComplete.add(onPlayerDeath, this);
	player.animations.play('death');
}

var title;
function onPlayerDeath()
{
	title = game.add.sprite((player.x) - 50, 150, 'game');
	title.animations.add('show', [2,3,4], 10, true);
	title.animations.play('show');	
	title.anchor.setTo(0.5, 0.5);
	title.scale.setTo(2);
	
	gameObjects.add(title);

	game.time.events.add(Phaser.Timer.SECOND * 3, onRestart, this);
}

function onRestart()
{
	gameObjects.destroy(true);

	// if (meteorite != null)
		// meteorite.destroy();
	// if (player != null)
		// player.destroy();
	// if (enemy != null)
		// enemy.destroy();
	// if (title != null)
		// title.destroy();

	create();
}

var direction;

var win = false;
var winPosition = 1200;
var stopPosition = 1400;
function update()
{
	game.physics.arcade.collide(player, platform, stepOnPlatform, null, this);
	game.physics.arcade.collide(enemy, player, onPlayerReached, null, this);

	if (currentState == States.FINISH)
	{
		meteorite.body.velocity.x = direction.x * meteoriteSpeed;
		meteorite.body.velocity.y = direction.y * meteoriteSpeed;		
		game.physics.arcade.collide(meteorite, player, onPlayerCollide, null, this);
	}

	if (currentState == States.GAME) 
	{
		if (player.x >= winPosition)
		{
			winGame();
		}

		if (player.x >= stopPosition)
		{
			showOutro();
			return;
		}

		player.body.velocity.x = 0;
		velocity.setTo(0);

		// if (game.input.keyboard.isDown(Phaser.Keyboard.A))
	 //    {
	 //        velocity.x = -1;
	 //    }
	   	if (game.input.keyboard.isDown(Phaser.Keyboard.D))
	    {
	        velocity.x = 1;
	    }
	    // if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
	    // 	velocity.y = 1; 
	    // }
	    // if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
	    // 	velocity.y = -1;
	    // }    

	    if (velocity.x != 0)
	    {
		    if (velocity.x > 0)
		    {
		    	player.animations.play('walk');
		    	if (player.scale.x < 0)
		   			flip();
		    	lastDirection = 0;
		    }
		   	else if (velocity.x < 0)
		   	{
		   		player.animations.play('walk');
		   		if (player.scale.x > 0)
		   			flip();
		   		lastDirection = 1;
		   	}
		}
		// else
		// {
		// 	if (velocity.y > 0)
		//     {
		//     	player.animations.play((lastDirection == 0) ? 'walk' : 'walk');
		//     }
		//    	else if (velocity.y < 0)
		//    	{
		//    		player.animations.play((lastDirection == 0) ? 'walk' : 'walk');
		//    	}
		// }
		
		velocity = Phaser.Point.normalize(velocity);
		velocity.x *= playerSpeed;
		player.body.velocity.x = velocity.x;

		if(!win)
			enemy.body.velocity.x = playerSpeed;

	   	if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && onFloor) {
	   		onFloor = false;
	   		player.body.velocity.y = -jumpSpeed;
	    } else{
	    	if (velocity.x == 0)
		    {
		        //  Stand still
		        player.animations.play('idle');
		    }
	    }
	}
}

function onPlayerReached(_enemy, _player)
{
	console.log('asd');
	currentState = States.END;
	player.kill();
	enemy.body.velocity.setTo(0);
	enemy.animations.play('idle');
	onPlayerDeath();
}

var onFloor = false;
function stepOnPlatform(_player, _platform)
{
	player.body.velocity.y = 0;
	onFloor = true;
}

function flip()
{
	player.scale.x *= -1;
}

function render() {
	// game.debug.body(player);
 //    game.debug.body(enemy);
 //    if (meteorite != null)
 //    	game.debug.body(meteorite);

 //    var zone = game.camera.deadzone;
 //    game.context.fillStyle = 'rgba(255,0,0,0.6)';
 //    game.context.fillRect(zone.x, zone.y, zone.width, zone.height);

 //    game.debug.spriteInfo(enemy, 32, 32);
 //    game.debug.spriteInfo(player, 400, 32);
}
