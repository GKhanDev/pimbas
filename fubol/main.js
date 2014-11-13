var game = new Phaser.Game(500, 400, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render});

function preload()
{
	//game.load.image("checker", "assets/checker.png");
	game.load.atlas('player', 'assets/data/player.png', 'assets/data/player.json');
	game.load.atlas('ball', 'assets/data/ball.png', 'assets/data/ball.json');
	game.load.atlas('game', 'assets/data/game.png', 'assets/data/game.json');
	game.load.image('goal', 'assets/data/goal.png');
	game.load.physics('goalShape', 'assets/data/goalShape.json');

	currentState = States.LOAD;
}

function resizePolygon(originalPhysicsKey, newPhysicsKey, shapeKey, scale)
{
	var newData = [];
	var data = this.game.cache.getPhysicsData(originalPhysicsKey, shapeKey);
	for (var i = 0; i < data.length; i++) {
		var vertices = [];
		for (var j = 0; j < data[i].shape.length; j += 2) {
			vertices[j] = data[i].shape[j] * scale;
			vertices[j+1] = data[i].shape[j+1] * scale;			
		}
		newData.push({shape : vertices});
	}
	var item = {};
	item[shapeKey] = newData;
	game.load.physics(newPhysicsKey, '', item);

	//debugPolygon(newPhysicsKey, shapeKey);
}

function debugPolygon(originalPhysicsKey, shapeKey)
{
	var data = this.game.cache.getPhysicsData(originalPhysicsKey, shapeKey);
	console.log('Data: ' + data.length);
	for (var i = 0; i < data.length; i++) {
		console.log('Vertices: ' + data[i].shape.length / 2);
		for (var j = 0; j < data[i].shape.length; j += 2) {
			console.log('Vert Data: ' + data[i].shape[j] + "," + data[i].shape[j+1]);
		}
	}
}

// function resizePolygon(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
//       newData = [];
//       $.each(game.cache._physics[originalPhysicsKey].data, function (key, values) {
//         $.eEach(values, function (key2, values2) {
//           shapeArray = [];
//           $.eEach(values2.shape, function (key3, values3) {
//             shapeArray.push(values3 * scale);
//           });
//           newData.push({shape: shapeArray});
//         });
//       });
//       var item = {};
//       item[shapeKey] = newData;
//       game.load.physics(newPhysicsKey, '', item);
// }

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
var gameObjects;
var goal;
function create()
{
	game.physics.startSystem(Phaser.Physics.P2JS);		
	gameObjects = game.add.group();

	goal = game.add.sprite(400, 400-55, 'goal');	
	player = game.add.sprite( 50, 400-60, 'player');
	player.scale.setTo(3);
	goal.scale.setTo(2);

	resizePolygon('goalShape', 'goalShapeNew', 'goal', 2);
	
	game.physics.p2.enable([player, goal], true);

	player.body.collideWorldBounds = true;
	player.body.fixedRotation = true;
	
	goal.body.clearShapes();
	goal.body.loadPolygon('goalShapeNew', 'goal');
	goal.body.kinematic = true;

	goal.body.onBeginContact.add(onGoalHit, this);

	gameObjects.add(goal);
	gameObjects.add(player);
		
	currentState = States.GAME;
    //ShowIntro();
}

function onGoalHit (body, shapeA, shapeB, equation) {

	//	The block hit something
	//	This callback is sent: the Body it collides with
	//	shapeA is the shape in the calling Body involved in the collision
	//	shapeB is the shape in the Body it hit
	//	equation is an array with the contact equation data in it
	
	currentState = States.END;
	//result = 'You last hit: ' + body.sprite.key;
}

var playerSpeed = 200;
function update()
{	
	player.body.setZeroVelocity();
	if (currentState == States.GAME) {
		if (game.input.keyboard.isDown(Phaser.Keyboard.D))
		{
			player.body.moveRight(playerSpeed);
		}
		if (game.input.keyboard.isDown(Phaser.Keyboard.A))
		{
			player.body.moveLeft(playerSpeed);
		}
	}
}

function onPlayerHit(_ball, _player)
{	
	currentState = States.END;
	ball.kill();
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
