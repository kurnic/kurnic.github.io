
var PLAYER_WIDTH = 48;
var PLAYER_HEIGHT = 48;

//var SCREEN_WIDTH = 640;
//var SCREEN_HEIGHT = 360;

var SCREEN_WIDTH = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var SCREEN_HEIGHT = (window.innerHeight > 0) ? window.innerHeight : screen.height;

if (SCREEN_WIDTH > 1300 || SCREEN_HEIGHT > 800 || SCREEN_WIDTH/SCREEN_HEIGHT > 2.2 || SCREEN_WIDTH/SCREEN_HEIGHT < 1.2) {
    SCREEN_WIDTH = 640;
    SCREEN_HEIGHT = 360;
} 

var MAX_TOASTS = 4;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    
    game.load.image('pixel', 'assets/pixel.png');
    
    game.load.image('background', 'assets/background.png');
    game.load.spritesheet('toaster', 'assets/toaster.png', 40, 34);
    game.load.spritesheet('zombie1', 'assets/zombie1.png', 29, 47);
    game.load.spritesheet('cat', 'assets/cat.png', 64, 64);
    game.load.spritesheet('toasts', 'assets/toasts.png', 21, 21);

    //Audio
    game.load.audio('preshoot', 'assets/toaster_push_down.mp3');
    game.load.audio('shoot', 'assets/toaster_pop_up.mp3');
}

var shakeWorld = 0;
var shakeForceBase = SCREEN_WIDTH/100;
var shakeForce = shakeForceBase;

var buildings;

var player;
var player_speed = 100 * (SCREEN_WIDTH / 640);
var player_speed_diagonal = player_speed * 0.75;
var player_prize = 0;
var player_hurt = 0;
var player_direction = 8;
var player_shooting_time = 20;
var player_shooting_cadence = 200;

var toasts;
var last_toast = 0;
var toast_speed = 3 / 640 * SCREEN_WIDTH;

var enemies;
var enemy_speed = 0.75 / 640 * SCREEN_WIDTH;
var enemy_speed_diagonal = enemy_speed * 0.75;

var enemy_x_min = 230 / 640 * SCREEN_WIDTH;
var enemy_x_max = 412 / 640 * SCREEN_WIDTH;
var enemy_y_min = 42 / 640 * SCREEN_HEIGHT;
var enemy_y_max = 236 / 640 * SCREEN_HEIGHT;

var cat;
var cat_direction = true;
var cat_speed = 2 / 640 * SCREEN_WIDTH;
var cat_limit_left = 460 / 640 * SCREEN_WIDTH;
var cat_limit_right = 1500 / 640 * SCREEN_WIDTH;

var cursors;

var score = 0;
var scoreText;

var audio_preshoot;
var audio_shoot;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // The background
    var bg = game.add.sprite(0, 0, 'background');
    bg.scale.setTo(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);

    // The buildings
    buildings = game.add.group();
    
    buildings.enableBody = true;
    
    var building = buildings.create(0, 0, 'pixel');
    building.scale.setTo(230 / 640 * SCREEN_WIDTH, 42 / 360 * SCREEN_HEIGHT);
    building.body.immovable = true;
    
    building = buildings.create(412 / 640 * SCREEN_WIDTH, 0, 'pixel');
    building.scale.setTo(230 / 640 * SCREEN_WIDTH, 42 / 360 * SCREEN_HEIGHT);
    building.body.immovable = true;
    
    building = buildings.create(0, 236 / 360 * SCREEN_HEIGHT, 'pixel');
    building.scale.setTo(230 / 640 * SCREEN_WIDTH, SCREEN_HEIGHT/2.77);
    building.body.immovable = true;
    
    building = buildings.create(412 / 640 * SCREEN_WIDTH, 236 / 360 * SCREEN_HEIGHT, 'pixel');
    building.scale.setTo(230 / 640 * SCREEN_WIDTH, SCREEN_HEIGHT/2.77);
    building.body.immovable = true;
    
    // The power-ups TODO

    // The player and its settings
    player = game.add.sprite(game.world.width/2, game.world.height/2, 'toaster');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
    
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
    enemies  = game.add.group();
    enemies.enableBody = true;
    
    //  Here we'll create 5 of them
    enemies.create(700 / 640 * SCREEN_WIDTH, 170 / 360 * SCREEN_HEIGHT, 'zombie1');
    enemies.create(1500 / 640 * SCREEN_WIDTH, 190 / 360 * SCREEN_HEIGHT, 'zombie1');
    enemies.create(2200 / 640 * SCREEN_WIDTH, 250 / 360 * SCREEN_HEIGHT, 'zombie1');
    enemies.create(2700 / 640 * SCREEN_WIDTH, 50 / 360 * SCREEN_HEIGHT, 'zombie1');
    enemies.create(3000 / 640 * SCREEN_WIDTH, 300 / 360 * SCREEN_HEIGHT, 'zombie1');
    enemies.create(4000 / 640 * SCREEN_WIDTH, 180 / 360 * SCREEN_HEIGHT, 'zombie1');
    enemies.create(-4000 / 640 * SCREEN_WIDTH, 180 / 360 * SCREEN_HEIGHT, 'zombie1');
    
    //We add the properties to the enemies
    for (var i = 0; i < enemies.children.length; i++)
    {
        enemies.children[i].anchor.setTo(0.5, 0.5);
        enemies.children[i].scale.setTo(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
        enemies.children[i].body.moves = false;
        enemies.children[i].animations.add('9', [0, 1], 3, true);
        enemies.children[i].animations.add('7', [2, 3], 3, true);
        enemies.children[i].animations.add('1', [4, 5], 3, true);
        enemies.children[i].animations.add('3', [6, 7], 3, true);
    }
    
    // The toasts
    toasts = game.add.group();
    toasts.enableBody = true;
    
        //  Here we'll create 4 of them
    for (var i = 0; i < MAX_TOASTS; i++)
    {
        //  Create a toast inside of the 'toasts' group
        var toast = toasts.create(-10000, -10000, 'toasts');
        toast.anchor.setTo(0.5, 0.5);
        toast.scale.setTo(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
        toast.body.moves = false;
        toast.enable = false;
    }

    // The cat
    cat = game.add.sprite(1200/ 640 * SCREEN_WIDTH, 240 / 360 * SCREEN_HEIGHT, 'cat');
    cat.scale.setTo(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
    cat.animations.add('walk', [0, 1, 2, 3], 10, true);
    cat.animations.play('walk');

    //  The score
    scoreText = game.add.text(10, 10, 'Score: 0');
    scoreText.fontSize = '32px';
    scoreText.fill = '#fff';
    scoreText.stroke = '#000';
    scoreText.strokeThickness = 5;
    scoreText.scale.setTo(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
    
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
    game.physics.arcade.collide(enemies, buildings);
    game.physics.arcade.collide(buildings, toasts, collisionBuildingToast, null, this);
    game.physics.arcade.collide(enemies, toasts, collisionEnemyToast, null, this);
    game.physics.arcade.collide(player, enemies, collisionEnemyPlayer, null, this);
    
    //Cat behavior
    if(cat_direction) {
        cat.x += cat_speed;
        if(cat.x > cat_limit_right) {
            cat_direction = false;
            cat.scale.set(-SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
        }
    }
    else {
        cat.x -= cat_speed;
        if(cat.x < cat_limit_left) {
            cat_direction = true;
            cat.scale.set(SCREEN_WIDTH/640, SCREEN_HEIGHT/360);
            cat.x -= cat.width;
        } 
    }
    
    //Player behavior
    if(player_prize != 0) {
        //Getting a prize
        player.animations.play('prize');
        player_prize--;
    }
    else if(player_hurt != 0) {
        //Hurting
        player.animations.play('hurt');
        player_hurt--;
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
            (game.input.activePointer.isDown && ( (game.input.activePointer.position.y < player.y-10|| game.input.activePointer.position.y >player.y+10) &&
            (game.input.activePointer.position.x < player.x-10 || game.input.activePointer.position.x  > player.x+10) ) )) {
                if (cursors.up.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.y < player.y-10)) {
                    player.body.velocity.y -= 75;
                }
                else {
                    player.body.velocity.y += 75;
                }
                if (cursors.left.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.x < player.x-10)) {
                    player.animations.play('walk');
                    player_direction = 4;
                    player.body.velocity.x -= player_speed_diagonal;
                }
                else {
                    player.animations.play('walk');
                    player_direction = 6;
                    player.body.velocity.x += player_speed_diagonal;
                }
            }
            else if (cursors.up.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.y < player.y-10) ) {
                player.animations.play('walk');
                player_direction = 8;
                player.body.velocity.y -= player_speed;
            }
            else if (cursors.down.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.y > player.y+10)) {
                player.animations.play('walk');
                player_direction = 2;
                player.body.velocity.y += player_speed;
            }
            else if (cursors.left.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.x < player.x-10)) {
                player.animations.play('walk');
                player_direction = 4;
                player.body.velocity.x -= player_speed;
            }
            else if (cursors.right.isDown || (game.input.activePointer.isDown && game.input.activePointer.position.x > player.x+10)) {
                player.animations.play('walk');
                player_direction = 6;
                player.body.velocity.x += player_speed;
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
    for (var i = 0; i < toasts.children.length; i++)
    {
        if(toasts.children[i].enabled) {
            //Move
            if(toasts.children[i].frame == 0) {
                toasts.children[i].y -= toast_speed;
            }
            else if(toasts.children[i].frame == 1) {
                toasts.children[i].y += toast_speed;
            }
            else if(toasts.children[i].frame == 2) {
                toasts.children[i].x += toast_speed;
            }
            else {
                toasts.children[i].x -= toast_speed;
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
    
    //Enemies behavior
    for (var i = 0; i < enemies.children.length; i++)
    {
        if(enemies.children[i].y > player.y+10) {
            if(enemies.children[i].x > player.x+10) {
                enemies.children[i].animations.play('7')
                if(!enemies.children[i].body.touching.left) enemies.children[i].x -= enemy_speed_diagonal;
                if(!enemies.children[i].body.touching.up) enemies.children[i].y -= enemy_speed_diagonal;
            }
            else if(enemies.children[i].x < player.x-10) {
                enemies.children[i].animations.play('9')
                if(!enemies.children[i].body.touching.right) enemies.children[i].x += enemy_speed_diagonal;
                if(!enemies.children[i].body.touching.up) enemies.children[i].y -= enemy_speed_diagonal;
            }
            else {
                if(!enemies.children[i].body.touching.up) enemies.children[i].y -= enemy_speed;
            }
        }
        else if(enemies.children[i].y < player.y-10) {
            if(enemies.children[i].x > player.x+10) {
                enemies.children[i].animations.play('1')
                if(!enemies.children[i].body.touching.left) enemies.children[i].x -= enemy_speed_diagonal;
                if(!enemies.children[i].body.touching.down) enemies.children[i].y += enemy_speed_diagonal;
            }
            else if(enemies.children[i].x < player.x-10) {
                enemies.children[i].animations.play('3')
                if(!enemies.children[i].body.touching.right) enemies.children[i].x += enemy_speed_diagonal;
                if(!enemies.children[i].body.touching.down) enemies.children[i].y += enemy_speed_diagonal;
            }
            else {
                if(!enemies.children[i].body.touching.down) enemies.children[i].y += enemy_speed;
            }
        }
        else {
            if(enemies.children[i].x > player.x+10) {
                enemies.children[i].animations.play('1')
                if(!enemies.children[i].body.touching.left) enemies.children[i].x -= enemy_speed;
            }
            else if(enemies.children[i].x < player.x-10) {
                enemies.children[i].animations.play('3')
                if(!enemies.children[i].body.touching.right) enemies.children[i].x += enemy_speed;
            }
        }
    }

}

function collisionBuildingToast (building, toast) {
    //"Destroy" the toast
    toast.enabled = false;
    toast.x = -10000;
    toast.y = -10000;
    
    //Shake screen
    shakeWorld = 3;
    shakeForce = shakeForceBase/2;
}

function collisionEnemyToast (enemy, toast) {
    //"Destroy" the enemy
    var rand_decision = game.rnd.integerInRange(0,3);
    switch(rand_decision) {
        case 0:
            enemy.x = -game.rnd.integerInRange(1,3)*SCREEN_WIDTH/2;
            enemy.y = game.rnd.integerInRange(enemy_y_min,enemy_y_max);
            break;
        case 1:
            enemy.x = game.rnd.integerInRange(2,4)*SCREEN_WIDTH/2;
            enemy.y = game.rnd.integerInRange(enemy_y_min,enemy_y_max);
            break; 
        case 2:
            enemy.x = game.rnd.integerInRange(enemy_x_min,enemy_x_max);
            enemy.y = -game.rnd.integerInRange(1,3)*SCREEN_HEIGHT/2;
            break;
        case 3:
            enemy.x = game.rnd.integerInRange(enemy_x_min,enemy_x_max);
            enemy.y = game.rnd.integerInRange(2,4)*SCREEN_HEIGHT/2;
            break;  
        default:
            break;
    }
    
    //"Destroy" the toast
    toast.enabled = false;
    toast.x = -10000;
    toast.y = -10000;
    
    //Shake screen
    shakeWorld = 5;
    shakeForce = shakeForceBase;
    
    // Add score
    addScore (10);
}

function collisionEnemyPlayer (player, enemy) {
    //"Destroy" the enemy
    var rand_decision = game.rnd.integerInRange(0,3);
    switch(rand_decision) {
        case 0:
            enemy.x = -game.rnd.integerInRange(1,3)*SCREEN_WIDTH/2;
            enemy.y = game.rnd.integerInRange(enemy_y_min,enemy_y_max);
            break;
        case 1:
            enemy.x = game.rnd.integerInRange(2,4)*SCREEN_WIDTH/2;
            enemy.y = game.rnd.integerInRange(enemy_y_min,enemy_y_max);
            break; 
        case 2:
            enemy.x = game.rnd.integerInRange(enemy_x_min,enemy_x_max);
            enemy.y = -game.rnd.integerInRange(1,3)*SCREEN_HEIGHT/2;
            break;
        case 3:
            enemy.x = game.rnd.integerInRange(enemy_x_min,enemy_x_max);
            enemy.y = game.rnd.integerInRange(2,4)*SCREEN_HEIGHT/2;
            break;  
        default:
            break;
    }
    
    //Shake screen
    shakeWorld = 4;
    shakeForce = shakeForceBase;
    
    //Hurt player
    player_hurt = 30;
}

function addScore (points) {
    //  Add and update the score
    score += points;
    scoreText.text = 'Score: ' + score;
}
