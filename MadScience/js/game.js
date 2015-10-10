
var PLAYER_WIDTH = 48;
var PLAYER_HEIGHT = 48;

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 360;

var MAX_TOASTS = 4;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    
    game.load.image('pixel', 'assets/pixel.png');
    
    game.load.image('background', 'assets/background.png');
    game.load.spritesheet('toaster', 'assets/toaster.png', 40, 34);
    game.load.spritesheet('cat', 'assets/cat.png', 64, 64);
    game.load.spritesheet('toasts', 'assets/toasts.png', 21, 21);

    //Audio
    game.load.audio('preshoot', 'assets/toaster_push_down.mp3');
    game.load.audio('shoot', 'assets/toaster_pop_up.mp3');
}

var shakeWorld = 0;
var shakeForce = 5;

var buildings;

var player;
var player_prize = false;
var player_hurt = false;
var player_direction = 8;
var player_shooting_time = 20;
var player_shooting_cadence = 200;

var toasts;
var last_toast = 0;

var cat;
var cat_direction = true;

var cursors;

var score = 0;
var scoreText;

var audio_preshoot;
var audio_shoot;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // The background
    game.add.sprite(0, 0, 'background');

    // The buildings
    buildings = game.add.group();
    
    buildings.enableBody = true;
    
    var building = buildings.create(0, 0, 'pixel');
    building.scale.setTo(230,42);
    building.body.immovable = true;
    
    building = buildings.create(412, 0, 'pixel');
    building.scale.setTo(230,42);
    building.body.immovable = true;
    
    building = buildings.create(0, 236, 'pixel');
    building.scale.setTo(230,130);
    building.body.immovable = true;
    
    building = buildings.create(412, 236, 'pixel');
    building.scale.setTo(230,130);
    building.body.immovable = true;
    
    // The power-ups TODO

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
    
    player.animations.play('idle');
    
    // The enemies TODO
    
    // The toasts
    toasts = game.add.group();
    toasts.enableBody = true;
    
        //  Here we'll create 4 of them
    for (var i = 0; i < MAX_TOASTS; i++)
    {
        //  Create a toast inside of the 'toasts' group
        var toast = toasts.create(-10000, -10000, 'toasts');
        toast.anchor.setTo(0.5, 0.5);
        toast.body.moves = false;
        toast.enable = false;
    }

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
    
    //  Our keyboard controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    //Audio
    audio_preshoot = game.add.audio('preshoot');
    audio_shoot = game.add.audio('shoot');
}

function update() {
    if (shakeWorld > 0) {
        var rand1 = game.rnd.integerInRange(-shakeForce,shakeForce);
        var rand2 = game.rnd.integerInRange(-shakeForce,shakeForce);
        game.world.setBounds(rand1, rand2, game.width + rand1, game.height + rand2);
        shakeWorld--;
        if (shakeWorld == 0) {
            game.world.setBounds(0, 0, game.width,game.height); // normalize after shake?
        }
    }
    
    game.physics.arcade.collide(player, buildings);
    game.physics.arcade.collide(buildings, toasts, collisionBuildingToast, null, this);
    
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
    
    //Player behavior
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
        player_shooting_time = (player_shooting_time + 1)%player_shooting_cadence;
        
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        if(player_shooting_time == player_shooting_cadence-60)audio_preshoot.play();
        if(player_shooting_time == player_shooting_cadence-10)audio_shoot.play();
        
        if(player_shooting_time > 20) {
            //Player control and movement (I swear this started as something clean...)
            if (((cursors.up.isDown||cursors.down.isDown) && (cursors.left.isDown||cursors.right.isDown)) || 
            (game.input.activePointer.isDown && ( (game.input.activePointer.position.y < 100 || game.input.activePointer.position.y > SCREEN_HEIGHT-100) &&
            (game.input.activePointer.position.x < 150 || game.input.activePointer.position.x  > SCREEN_WIDTH-150) ) )) {
                if (cursors.up.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.y < 100)) {
                    player.body.velocity.y -= 75;
                }
                else {
                    player.body.velocity.y += 75;
                }
                if (cursors.left.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.x < 150)) {
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
            else if (cursors.up.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.y < 100) ) {
                player.animations.play('walk');
                player_direction = 8;
                player.body.velocity.y -=100;
            }
            else if (cursors.down.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.y > SCREEN_HEIGHT-100)) {
                player.animations.play('walk');
                player_direction = 2;
                player.body.velocity.y +=100;
            }
            else if (cursors.left.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.x < 150)) {
                player.animations.play('walk');
                player_direction = 4;
                player.body.velocity.x -=100;
            }
            else if (cursors.right.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.x > SCREEN_WIDTH-150)) {
                player.animations.play('walk');
                player_direction = 6;
                player.body.velocity.x +=100;
            }
            else {
                player.animations.play('idle');
            }
        }
        else if(player_shooting_time == 0) {
            //Automatic shooting
            toasts.children[last_toast].enabled = true;
            
            if (player_direction == 8) {
                player.animations.play('up');
                toasts.children[last_toast].frame = 0;
                toasts.children[last_toast].x = player.x;
                toasts.children[last_toast].y = player.y-10;
                toasts.children[last_toast].body.velocity.y = -100;
            }
            else if (player_direction == 2) {
                player.animations.play('down');
                toasts.children[last_toast].frame = 1;
                toasts.children[last_toast].x = player.x;
                toasts.children[last_toast].y = player.y+10;
            }
            else if (player_direction == 6) {
                player.animations.play('right');
                toasts.children[last_toast].frame = 2;
                toasts.children[last_toast].x = player.x+10;
                toasts.children[last_toast].y = player.y;
            }
            else {
                player.animations.play('left');
                toasts.children[last_toast].frame = 3;
                toasts.children[last_toast].x = player.x-10;
                toasts.children[last_toast].y = player.y;
            }
            
            last_toast = (last_toast+1)%MAX_TOASTS;
        }
    }
    
    //Toasts behavior
    for (var i = 0; i < MAX_TOASTS; i++)
    {
        if(toasts.children[i].enabled) {
            //Move
            if(toasts.children[i].frame == 0) {
                toasts.children[i].y -= 2;
            }
            else if(toasts.children[i].frame == 1) {
                toasts.children[i].y += 2;
            }
            else if(toasts.children[i].frame == 2) {
                toasts.children[i].x += 2;
            }
            else {
                toasts.children[i].x -= 2;
            }
            
            //Check if they are still in the scene
            if(toasts.children[i].x < -20 || toasts.children[i].x > SCREEN_WIDTH+20 || toasts.children[i].y <  -20 || toasts.children[i].y > SCREEN_HEIGHT+20) {
                //"Destroy" the toast
                toasts.children[i].enabled = false;
                toasts.children[i].x = -10000;
                toasts.children[i].y = -10000;
            }
        }
    }

}

function collisionBuildingToast (building, toast) {
    //"Destroy" the toast
    toast.enabled = false;
    toast.x = -10000;
    toast.y = -10000;
    shakeWorld = 5;
}

function addScore (points) {
    //  Add and update the score
    score += points;
    scoreText.text = 'Score: ' + score;
}
