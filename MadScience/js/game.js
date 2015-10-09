
var PLAYER_WIDTH = 48;
var PLAYER_HEIGHT = 48;

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 360;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    
    game.load.image('background', 'assets/background.png');
    game.load.spritesheet('toaster', 'assets/toaster.png', PLAYER_WIDTH, PLAYER_HEIGHT);

}

var player;
var player_direction = 8;
var player_shooting_time = 1;

var cursors;

var score = 0;
var scoreText;


function create() {

    //The background
    game.add.sprite(0, 0, 'background');

    // The player and its settings
    player = game.add.sprite(game.world.width/2, game.world.height/2, 'toaster');
    player.anchor.setTo(0.5, 0.5);

    //  Our two animations, walking left and right.
    player.animations.add('idle', [0, 1], 8, true);
    player.animations.add('walk', [2, 3], 8, true);
    player.animations.add('down', [4, 5], 8, false);
    player.animations.add('up', [6, 7], 8, false);
    player.animations.add('left', [8, 9], 8, false);
    player.animations.add('right', [10, 11], 8, false);

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
    

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
}

function update() {
    player_shooting_time++;
    if(player_shooting_time%200 > 20) {
        //Player control and movement
        if ((cursors.up.isDown||cursors.down.isDown) && (cursors.left.isDown||cursors.right.isDown)) {
            if (cursors.up.isDown) {
                player.y -= 0.75;
            }
            else {
                player.y += 0.75;
            }
            if (cursors.left.isDown) {
                player.animations.play('walk');
                player_direction = 4;
                player.x -= 0.75;
            }
            else {
                player.animations.play('walk');
                player_direction = 6;
                player.x += 0.75;
            }
        }
        else if (cursors.up.isDown) {
            player.animations.play('walk');
            player_direction = 8;
            player.y -=1;
        }
        else if (cursors.down.isDown) {
            player.animations.play('walk');
            player_direction = 2;
            player.y +=1;
        }
        else if (cursors.left.isDown) {
            player.animations.play('walk');
            player_direction = 4;
            player.x -=1;
        }
        else if (cursors.right.isDown) {
            player.animations.play('walk');
            player_direction = 6;
            player.x +=1;
        }
        else {
            player.animations.play('idle');
        }
    }
    else {
        //Automatic shooting
        if (player_direction == 8) {
            player.animations.play('up');
        }
        else if (player_direction == 2) {
            player.animations.play('down');
        }
        else if (player_direction == 4) {
            player.animations.play('left');
        }
        else {
            player.animations.play('right');
        }
    }
}


function addScore (points) {
    //  Add and update the score
    score += points;
    scoreText.text = 'Score: ' + score;
}
