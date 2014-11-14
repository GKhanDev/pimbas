var game = new Phaser.Game(500, 400, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render});

function preload()
{
	//game.load.image("checker", "assets/checker.png");
	game.load.atlas('game', 'assets/data/game.png', 'assets/data/game.json');
	game.load.atlas('enemy', 'assets/data/enemy.png', 'assets/data/enemy.json');
	game.load.atlas('explosion', 'assets/data/explosion.png', 'assets/data/explosion.json')
	//game.load.atlasXML('enemy', 'assets/data/enemy.png', 'assets/data/enemy.xml');

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
var currentState;
var gameObjects;
function create()
{
	game.physics.startSystem(Phaser.Physics.ARCADE);	
	gameObjects = game.add.group();	

	enemy = game.add.sprite( game.world.centerX, game.world.centerY, 'enemy');

	game.physics.arcade.enable([enemy]);

	enemy.body.collideWorldBounds = true;
	enemy.animations.add('death', Phaser.Animation.generateFrameNames('enemyDeath_', 0, 15, '.png', 2), 12, false);
	enemy.animations.add('idle', Phaser.Animation.generateFrameNames('enemyIdle_',0,3,'.png',2).concat(Phaser.Animation.generateFrameNames('enemyIdle_',3,0,'.png',2)), 6, true);
	enemy.animations.play('idle');
    enemy.anchor.setTo(0.5,1);
    enemy.scale.setTo(2);
    enemy.scale.x *= -1;

	var explosion = game.add.sprite( game.world.centerX, 400, 'explosion');
	explosion.animations.add('explode').onComplete.add(onExplosionComplete,explosion);
	explosion.animations.play('explode', 30, true);
	explosion.anchor.setTo(0.5,1);
	explosion.scale.setTo(5);

	
	currentState = States.GAME;
}

function onExplosionComplete(_explosion)
{
	_explosion.kill();
}

function update()
{
	if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
		enemy.animations.play('death').onComplete.add(onEnemyDeath, this);
}

function onEnemyDeath()
{
	enemy.animations.play('idle');
}

function onPlayerHit(_ball, _player)
{	
	currentState = States.END;
	ball.kill();
	console.log('muriendo');
	player.animations.getAnimation('death').onComplete.add(onPlayerDeath, this);
	player.animations.play('death');
}

var title;
function onPlayerDeath()
{
	title = game.add.sprite(game.world.centerX, 150, 'game');
	title.animations.add('show', [2,3,4], 10, true);
	title.animations.play('show');	
	title.anchor.setTo(0.5, 0.5);
	title.scale.setTo(2);
	
	gameObjects.add(title);

	game.time.events.add(Phaser.Timer.SECOND * 2, onRestart, this);
}

function onRestart()
{
	gameObjects.destroy(true);
	create();
}

var canHit;
function onHitComplete()
{
	canHit = true;
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

var direction;
var win = false;
var winPosition = 1200;
var stopPosition = 1400;
/* function update()
{
	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
	{
		canHit = false;
		player.animations.play('hit');
	}
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
} */

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
	//game.debug.body(player);
 //    game.debug.body(enemy);
 //    if (meteorite != null)
 //    	game.debug.body(meteorite);

 //    var zone = game.camera.deadzone;
 //    game.context.fillStyle = 'rgba(255,0,0,0.6)';
 //    game.context.fillRect(zone.x, zone.y, zone.width, zone.height);

 //    game.debug.spriteInfo(enemy, 32, 32);
 //    game.debug.spriteInfo(player, 400, 32);
}
