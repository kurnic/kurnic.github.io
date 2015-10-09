
var PLAYER_WIDTH = 48;
var PLAYER_HEIGHT = 48;

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 360;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    
    game.load.image('background', 'assets/background.png');
    game.load.spritesheet('toaster', 'assets/toaster.png', PLAYER_WIDTH, PLAYER_HEIGHT);
    game.load.spritesheet('cat', 'assets/cat.png', 64, 64);

    //Audio
    game.load.audio('preshoot', 'assets/toaster_push_down.mp3');
    game.load.audio('shoot', 'assets/toaster_pop_up.mp3');
}

var player;
var player_prize = false;
var player_hurt = false;
var player_direction = 8;
var player_shooting_time = 1;

var cat;
var cat_direction = true;

var cursors;

var score = 0;
var scoreText;

var audio_preshoot;
var audio_shoot;

function create() {

    //The background
    game.add.sprite(0, 0, 'background');

    // The player and its settings
    player = game.add.sprite(game.world.width/2, game.world.height/2, 'toaster');
    player.anchor.setTo(0.5, 0.5);
    
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    //  Our animations
    player.animations.add('idle', [0, 1], 8, true);
    player.animations.add('walk', [2, 3], 8, true);
    player.animations.add('down', [4, 5], 8, false);
    player.animations.add('up', [6, 7], 8, false);
    player.animations.add('left', [8, 9], 8, false);
    player.animations.add('right', [10, 11], 8, false);
    player.animations.add('hurt', [12, 13], 8, false);
    player.animations.add('prize', [14, 15], 8, false);

    // The cat
    cat = game.add.sprite(1200, 240, 'cat');
    cat.animations.add('walk', [0, 1, 2, 3], 10, true);
    cat.animations.play('walk');

    //  The score
    scoreText = game.add.text(10, 10, 'Score: 0');
    scoreText.fontSize = '32px';
    scoreText.fill = '#fff';
    scoreText.stroke = '#000';
    scoreText.strokeThickness = 5;
    
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    //Audio
    audio_preshoot = game.add.audio('preshoot');
    audio_shoot = game.add.audio('shoot');

    game.sound.setDecodedCallback([ audio_preshoot, audio_shoot], update, this);
}

function update() {
    //Cat behavior
    if(cat_direction) {
        cat.x += 2;
        if(cat.x > 1500) {
            cat_direction = false;
            cat.scale.set(-1,1);
        }
    }
    else {
        cat.x -= 2;
        if(cat.x < 460) {
            cat_direction = true;
            cat.scale.set(1,1);
            cat.x -= 64;
        } 
    }
    
    if(player_prize) {
        //Getting a prize
        player.animations.play('prize');
    }
    else if(player_hurt) {
        //Hurting
        player.animations.play('hurt');
    }
    else {
        //Normal playing
        player_shooting_time++;
        
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        if(player_shooting_time%200 == 140)audio_preshoot.play();
        if(player_shooting_time%200 == 190)audio_shoot.play();
        
        if(player_shooting_time%200 > 20) {
            //Player control and movement
            if ((cursors.up.isDown||cursors.down.isDown) && (cursors.left.isDown||cursors.right.isDown)) {
                if (cursors.up.isDown) {
                    player.body.velocity.y -= 75;
                }
                else {
                    player.body.velocity.y += 75;
                }
                if (cursors.left.isDown) {
                    player.animations.play('walk');
                    player_direction = 4;
                    player.body.velocity.x -= 75;
                }
                else {
                    player.animations.play('walk');
                    player_direction = 6;
                    player.body.velocity.x += 75;
                }
            }
            else if (cursors.up.isDown) {
                player.animations.play('walk');
                player_direction = 8;
                player.body.velocity.y -=100;
            }
            else if (cursors.down.isDown) {
                player.animations.play('walk');
                player_direction = 2;
                player.body.velocity.y +=100;
            }
            else if (cursors.left.isDown) {
                player.animations.play('walk');
                player_direction = 4;
                player.body.velocity.x -=100;
            }
            else if (cursors.right.isDown) {
                player.animations.play('walk');
                player_direction = 6;
                player.body.velocity.x +=100;
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

    addScore (1);
}


function addScore (points) {
    //  Add and update the score
    score += points;
    scoreText.text = 'Score: ' + score;
}
