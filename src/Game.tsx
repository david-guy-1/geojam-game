import React from 'react';
import spritesheets from './spritesheets.tsx';
import spawner_update from './interface spawner_update.tsx';
import spawners from "./spawners.tsx";
import Upgrade from './Upgrade';
import Pick from './Pick';
import anime from "animejs/lib/anime.es.js"
import type_assert from './type_assert';
import {game_width , game_height,game_box_top,  game_box_left, fps, max_hp, health_spawn, explosion_spawn} from "./constants"
import upgrades from "./upgrades_list"
import Phaser from 'phaser';
const itemPool = require("./itemPool.json");
const _ = require("lodash");


/*
TODO: 

make upgrades spawn (done)
make tutorial (done)
add code for when/how pick a side works (done) 
make bosses 
upgrades should be shapes instead of buttons
player bullet should be computed from upgrades
add health bar / penalty for getting hit
add temporary upgrades
pick a side should be indicated using a bar (done) 
upgrades + pick a side interface 

// Preload and Create 
// Utility functions (collectItem, play animations, pause, unpause, push in, out of bounds , assert)
// Functions involving enemies
// Functions involving black holes
// Functions involving bullets (both player and enemy, except enemy-hit-by-bullet)
// Functions involving player bullet timers
// Functions involving enemy spawners
// Functions involving picking a side and upgrades
// Functions involving bosses
// Functions involving displaying text
// Functions involving updating



process for adding a new enemy:
- draw it and draw it's explosion
- update images
- make a spawner for it (REMEMBER KEY AND PRIORITY)
- in spawn_enemy function, add how it spawns 

default naming conventions: 
keys and file names are the same
explosion will be (type)_boom

*/
var dont_render_both = false;


// game constants 






var GameComponent : Game;
var game : typeof Phaser.Game;
var scene : typeof Phaser.Scene;

var player:Phaser.Physics.Arcade.Image;
var items : typeof Phaser.Physics.Arcade.Group;
var enemies : typeof Phaser.Physics.Arcade.Group;
var bosses : typeof Phaser.Physics.Arcade.Group;
var bullets : typeof Phaser.Physics.Arcade.Group;
var player_bullets : typeof Phaser.Physics.Arcade.Group;
var bg : typeof Phaser.GameObjects.TileSprite;


//spawn timers
var spawn_timer : {[key:string] : typeof Phaser.Time.TimerEvent } = {};
var spawn_timer_priorities : {[key:string]:number} = {};

interface player_bullets_intervals{[key:string]:typeof Phaser.Time.TimerEvent}
// player bullets
var player_bullets_intervals :player_bullets_intervals= {};
var player_bullets_priorities : {[key:string]:number} = {};
// black holes x, y, strength, image
var black_holes : {[key:string] : [number,number, number, Phaser.Physics.Arcade.Image]} = {};

//text
var texts : {[key:string] : typeof Phaser.GameObjects.Text} = {};
var text_timers : {[key:string] : typeof Phaser.Time.TimerEvent} = {}

//images

var sc_images : {[key:string] : Phaser.Physics.Arcade.Image} = {};
var sc_images_timers : {[key:string] : typeof Phaser.Time.TimerEvent} = {}

var powerup_timer = undefined;
var explosion_timer = undefined;

interface game_state {  
    counter : number,
    bullets : number,
    upgrades : string[],
    spawners : string[],
    health : number
    invtime : number 

    next_pick_time? : number,
    next_pick_time_so_far? : number,
    next_pick_choices? : string[],
    
    player_speed : number,
    upgrade_times : number[],

    pick_side_prioritize_new : boolean[]
    pick_side_index : number,
    pick_side_times : number [],

    boss_name : string
    boss_health ? : number
    boss_max_health ? : number
    boss_spawning_in ?: number
    boss_spawning_in_so_far ?: number

    free_play_time ?: number
}


// GAME STATE 


var game_state : game_state =  {
    counter : 0,
    bullets : 0,
    health : max_hp,
    invtime : 700,

    upgrades : ["base"],
    spawners : ["base"],
    player_speed : 500,
    /*
    prod values

    upgrade_times : [5, 25, 35, 55],
    pick_side_index : 0,
    pick_side_times : [20, 30, 40, 50, 60, 70],
    pick_side_prioritize_new : [true, true, false , false, false],
    boss_name : "Blue Wave"
    */

    upgrade_times : [5, 25, 35, 55],
    pick_side_index : 0,
    pick_side_times : [20, 30,40, 50, 60, 70],
    pick_side_prioritize_new : [true, true, false , false, false],
    boss_name : "Blue Wave"

}








var anims : any;

/* --------------------------------------------------------
// Preload and Create 
 ---------------------------------------------------------*/


function preload (this:typeof Phaser.Game)
{   
    console.log("preload called")
    // load images

    for(var item of Object.keys(itemPool)){
        var item_ = itemPool[item]
        //console.log(item_.name);
      //  this.load.image(item_.name, "images/items/"+item_.image);
    }
    // load images and spritesheets
    /*

while(True):
	print("\tvar enemy_images : string[] = " + str(list(map(lambda x : x.replace(".png",""), (filter(lambda x : "png" in x, os.listdir("D:/Desktop/games/geo_game/public/images/enemies")))))))
	print("\tvar images : string[] = " + str(list(map(lambda x : x.replace(".png",""), (filter(lambda x : "png" in x, os.listdir("D:/Desktop/games/geo_game/public/images")))))))
	input("")

    */

	var enemy_images : string[] = ['black_hole_layer', 'Blue Wave', 'boss_weak_spot', 'enemy1', 'enemy2', 'enemy3', 'energy_ball_thrower', 'laser', 'Oblivion', 'shark_left', 'shark_right', 'spawner1', 'spewer', 'strafe', 'Sunshine', 'wall', 'wall_mini']
	var images : string[] = ['background', 'background2', 'black_hole', 'blank', 'bomb', 'bullet1', 'energy_ball', 'explosion', 'health', 'invulnerable_overlay', 'laser_bullet', 'laser_charged', 'pbullet1', 'pbullet2', 'pbullet3', 'pburst_bullet', 'player', 'playerup', 'player_indicator', 'player_laser_bullet', 'player_laser_bullet_2', 'player_upgraded', 'shark warning', 'small_bh', 'sphere_of_darkness', 'strafe_bullet', 'strafe_bullet_dark', 'sunshine_bullet', 'sunshine_bullet_small', 'sunshine_safe_spot', 'sunshine_warning', 'turret', 'upgrade', 'upgrades_bg', 'wide_bullet']






    
    for(var item of images){
        this.load.image(item, "images/" + item+".png");
    }
    
    for(var item of enemy_images){
        this.load.image(item, "images/enemies/" + item+".png");
    }
    for(var sheet of Object.keys(spritesheets)){
        this.load.spritesheet(sheet, `images/sheets/${sheet}.png`, spritesheets[sheet]);
    }

}


function create(this:any)
{
    console.log(Object.keys(spawners).length);
    scene = game.scene.scenes[0];
    console.log("create called");
    bg= scene.add.tileSprite(game_width/2, game_height/2, game_width, game_height, "background");
    // slow update interval
    scene.time.addEvent({callback:slow_update, delay:1000, loop:true});
    // add items

    items = this.physics.add.group();
/*
    items.create(400, 300, "blue key");
    items.create(700, 600, "green orb with ghost");
    items.create(700, 300, "red gem");
*/


    
    // tutorial text
    scene.time.addEvent({
        callback:set_text,
        delay : 1000,
        args : ["tut1", 300, 200,"Mouse to move, shooting is automatic",3000]
    });

    // sync with the very first upgrade
    scene.time.addEvent({
        callback:function(){
            set_text("tut1", 200, 200,"Collect these items!",3000)
            set_text("tut2", 170, 300,"Upgrades",3000)
            set_text("tut3", 320, 300,"Healing",3000)
            set_text("tut4", 430, 300,"Explosive bullets",3000);
            set_image("tut5", 200, 350, "upgrade",3000);
            set_image("tut6", 350, 350, "health",3000);
            set_image("tut7", 500, 350, "explosion",3000);
        },
        delay : 5000,
        args : []
    });

    
    /*

    scene.time.addEvent({
        callback:shoot_bullet,
        delay : 5000,
        args : [undefined, "localized explosion", {
            number_of_rings : 5,
            bullets_per_ring : 16,
            delay : 400,
            speed : 300,
            expire_time : 180,
            image:"sunshine_bullet"
        }, 500, 500]
    });

*/
    scene.time.addEvent({
        callback:set_text,
        delay : 10000,
        args : ["tut1", 100, 200,"Pick a side when the bar at the top fills up",3000]
    });
    

    // add enemies
    enemies = this.physics.add.group();
    bosses = this.physics.add.group();
    // add player
    player = this.physics.add.image(500,500,"player");
    player.setDepth(999);
    // add collision

    this.physics.add.overlap(player, items, collectItem,null , this);
    // add bullets 
    bullets = this.physics.add.group();
    player_bullets = this.physics.add.group();
    this.physics.add.overlap(player, bullets, hit_by_bullet, () => player.getData("inv") !== true, this);
    this.physics.add.overlap(enemies, player_bullets, enemy_hit_by_bullet, function(enemy: typeof Phaser.GameObjects.GameObject, bullet: typeof Phaser.GameObjects.GameObject){
        // should collide
        var bullet_type = bullet.getData("type") 
        var enemy_type = enemy.getData("type");
        if( bullet_type === "pbullet1" || bullet_type === "seeker"){
            return true;
        }
        if(bullet_type === "laser"){
            return bullet.getData("tagged").indexOf(enemy) === -1 ;
        }
        return false;
    }, this);
    // add animations
    for(var item of Object.keys(spritesheets)){
        this.anims.create({key:item, 
        frames : item
        })
    }
    // 

    /* 
    // prod values are : 

    update_player_bullets_based_on_state();
    set_pick_side_from_state();
    set_upgrades_from_state();
    update_spawners_based_on_state();
    */

    update_player_bullets_based_on_state();
    set_pick_side_from_state();
    set_upgrades_from_state();
    update_spawners_based_on_state();

    // powerup and explosion timers
    powerup_timer = scene.time.addEvent({
        callback : drop_upgrade,
        delay : health_spawn,
        args:["health"],
        loop:true,
    })
    explosion_timer = scene.time.addEvent({
        callback : drop_upgrade,
        delay : explosion_spawn,
        args:["explosion"],
        loop:true,
    })
    
}



/* --------------------------------------------------------
// Utility functions (collectItem, play animations, pause, unpause, push in, out of bounds )
 ---------------------------------------------------------*/

 function collectItem(player : Phaser.Physics.Arcade.Image, item : typeof Phaser.GameObjects.GameObject){
    var type = item.getData("type")
    
    if(type === "upgrade"){
        game_state.counter += 1;
    }else if(type === "health" && game_state.health < 1000){
        game_state.health = Math.min(game_state.health + 13, max_hp)
        GameComponent.set_size(GameComponent.healthRef.current, game_state.health/max_hp);
    }else if(type === "explosion"){
        player_shoot_bullet("pburst_bullet", {
            "speed":0,
            "number":50,
            "child_speed":1000,
            "time":0
        },0,0,player.x, player.y)
    }
    item.destroy();

    GameComponent.forceUpdate();

    
}

function play_animation_at_location(anim:string, x:number, y:number){
    var sprite = scene.add.sprite(x, y, "blank").play(anim);
    sprite.on("animationcomplete", function(this:any){this.destroy()}.bind(sprite));
}

function pause(){
    if(scene !== undefined){
        scene.physics.pause();
        scene.scene.pause("default");
    }
}

function unpause(){
    if(scene !== undefined){
        scene.physics.resume();
        scene.scene.resume("default");
    } 
}

function push_in(item: typeof Phaser.GameObjects.GameObject | typeof Phaser.GameObjects.Image){
    if(item.x < 0){
        item.x = 0;
    }
    if(item.x > game_width){
        item.x = game_width;
    }
    if(item.y < 0){
        item.y = 0;
    }
    if(item.y > game_height){
        item.y = game_height;
    }
}
function out_of_bounds(s:any){
    return s.x < 0 || s.y < 0 || s.x > game_width || s.y > game_height;
}

function reset(){ 
    var game_state : game_state =  {
        counter : 0,
        bullets : 0,
        health : max_hp,
        invtime : 700,
    
        upgrades : ["base"],
        spawners : ["base"],
        player_speed : 500,
        upgrade_times : [5, 25, 35, 55],
        pick_side_index : 0,
        pick_side_times : [20, 30,40, 50, 60, 70],
        pick_side_prioritize_new : [true, true, false , false, false],
        boss_name : "Blue Wave"
    
    }

    Object.keys(spawn_timer).forEach((x) => spawn_timer[x].remove());
    
    Object.keys(player_bullets_intervals).forEach((x) => player_bullets_intervals[x].remove());
    powerup_timer.remove();
    explosion_timer.remove();
    scene.scene.restart()
}

function start_free_play(){
    game_state.next_pick_time = undefined;
    game_state.next_pick_time_so_far= undefined;
    game_state.next_pick_choices = undefined; 
    game_state.free_play_time = 0;
    if(powerup_timer !== undefined){
        powerup_timer.remove();
        powerup_timer = undefined;
    }
    for(var item of Object.keys(spawners)){
        if(game_state.spawners.indexOf(item) === -1){
            game_state.spawners.push(item);
            console.log(item)
        }
    }
    update_spawners_based_on_state();
}

/* --------------------------------------------------------
// Functions involving enemies
 ---------------------------------------------------------*/

 function spawn_enemy(type:string, params : any,  x : number, y : number){
    // all enemies must have hp as a param
    type_assert(params, {hp : "number"});

    // optionally set disable_tint, disable_hp_loss,  disable_death, disable_default_explode
    var images:typeof Phaser.GameObjects.Image[] = [];
    var timers:typeof Phaser.Time.TimerEvent[]= [];
    if(type === "enemy1"){
        // {fire :  rate of fire}
        type_assert(params, {fire : "number"});

        var new_enemy = enemies.create(x, y, "enemy1");
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "bullet1", {speed:300}]}) );
        scene.physics.moveToObject(new_enemy, player, 100);
    } else if (type === "multi"){
        // fire : rate of fire 
        type_assert(params, {fire : "number"});

        var new_enemy = enemies.create(x, y, "enemy2");
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "offset bullet", {speed:300, x : -100, y : 0}]}) );
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "offset bullet", {speed:300, x : 100, y : 0}]}) );
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "offset bullet", {speed:300, x : 0, y : 0}]}) );
        
        scene.physics.moveToObject(new_enemy, player, 100);
    }
    else if (type === "follow"){
        // same params as enemy1
        type_assert(params, {fire : "number"});
        
        var new_enemy = enemies.create(x, y, "enemy3");

        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "follow bullet", {speed:400, follow_times : [1000, 2000, 3000, 4000]}], startAt : Math.random()*params.fire}) );

        scene.physics.moveTo(new_enemy, Math.random() * game_width ,Math.random() * game_height * 0.8, 100);

        timers.push(scene.time.addEvent({delay : 5000, callback:(x) => {x.setVelocityX(0); x.setVelocityY(0)}, args:[new_enemy] }));
    }
    else if (type === "spewer"){
        /* fire : rate of fire,
        spread_amount : number of bullets per shot
        spread_angle : angle between shots
        */
        type_assert(params, {fire : "number",
    "spread_amount" : "number", "spread_angle" : "number"});

        var new_enemy = enemies.create(x, y, "spewer");
        for(var i = 0; i < params.spread_amount ; i++){
            timers.push(scene.time.addEvent({
                delay : params.fire,
                loop:true,
                callback: function(angle, source, dest){
                    var x = dest.x - source.x;
                    var y = -(dest.y - source.y);
                    //rotate by angle
                    // (x+iy)(cos t + i sin(t))
                    // = x cos(t) - y sin(t)
                    // + i (x sin(t) + y cos(t))
                    var newX = x*Math.cos(angle) - y * Math.sin(angle);
                    var newY = x*Math.sin(angle) + y * Math.cos(angle);
                    shoot_bullet(source, "fixed bullet",{x : source.x + newX, y : -newY+ source.y, speed : 350})
                },
                args : [params.spread_angle * i - params.spread_angle * params.spread_amount /2, new_enemy, player],
                startAt : Math.random()*params.fire
            }))
        }

        scene.physics.moveTo(new_enemy, Math.random() * game_width ,Math.random() * game_height * 0.8, 100);
        
        timers.push(scene.time.addEvent({delay : 5000, callback:(x) => {x.setVelocityX(0); x.setVelocityY(0)}, args:[new_enemy] }));


    }

    else if (type === "spawner1"){ 
        /*
            direction[number, number] (where to go)
            speed : how fast to go there
            time : how long to move for 
            delay : delay between spawning enemies
            child_type : 
            child_params : child's params

        */
        type_assert(params, {direction :["number", "number"], speed : "number", time : "number", delay : "number", child_type : "string",  child_params : "object"});

        var new_enemy = enemies.create(x, y, "spawner1");   
        timers.push(scene.time.addEvent({delay : params.delay, loop:true, callback:function(e,child_type, child_params){spawn_enemy(child_type, child_params, e.x, e.y)}, args : [new_enemy,params.child_type, params.child_params]}))
        // move in that direction
        console.log([params.direction[0], params.direction[1]])
        scene.physics.moveTo( new_enemy, params.direction[0]+x, params.direction[1]+y, params.speed);
        // stop when enough time passes
        
        var timer=  scene.time.addEvent({
            delay : params.time, 
            callback: function(e){e.setVelocityX(0); e.setVelocityY(0)}, 
            args : [new_enemy]
        })
        timers.push(timer);
    } else if (type === "bh layer"){
        // fire (firing speed) and strength and duration (strength  of black hole), speed, bomb_radius
        type_assert(params, {
            fire : "number", strength : "number", duration : "number", speed : "number", "bomb_radius": "number"});
 
        var new_enemy = enemies.create(x, y, "black_hole_layer");
        new_enemy.setData("id", Math.random().toString());
        new_enemy.setVelocityX(params.speed);
        timers.push(scene.time.addEvent({
            delay : params.fire,
             loop:true, 
             callback:function(e, strength, duration){
                add_black_hole(Math.random().toString(), e.x, e.y, strength, duration);
                
            }, 
            args : [new_enemy, params.strength, params.duration]}))
        
        timers.push(scene.time.addEvent({
            delay : params.fire,
            startAt : 2000,
                loop:true, 
                callback:function(e){
                    set_image(e.getData("id") + "bh layer bomb", player.x, player.y,"bomb", 2000 )
                    e.setData("bomb location", [player.x, player.y])
            }, 
            args : [new_enemy]}))
        
        timers.push(scene.time.addEvent({
            delay : params.fire,
                loop:true, 
                callback:function(e , radius){
                    var [x,y] = e.getData("bomb location")
                    shoot_bullet(new_enemy, "localized explosion", {
                        "number_of_rings" : 5,
                        "bullets_per_ring" : 12,
                        "delay" : 100,
                        "speed" : 800,
                        //"expire_time": 1000
                    }, x, y)
            }, 
            args : [new_enemy, params.bomb_radius]}))
    
                
    }else if (type === "laser"){
        type_assert(params, {
            delay : "number"});

        // only one param, which is delay. 
        var new_enemy = enemies.create(x, y, "laser");
        new_enemy.setVelocityY(10);
        // warning
        timers.push(scene.time.addEvent({
            callback: (e) => enemy_add_image("warn", "laser_charged", e, 0, 30),
            delay : params.delay - 2000,
            args : [new_enemy]
        }))
        // fire
        for(var i=0; i < 20; i++){
            timers.push(scene.time.addEvent({
                callback: (e) => shoot_bullet(e, "laser", {},e.x + Math.random() * 50 - 25, 0),
                delay : params.delay + i*100,
                args : [new_enemy]
            }))
        }
        // destroy
        timers.push(scene.time.addEvent({
            callback: (e) => destroy_enemy(e),
            delay : params.delay + 21*100,
            args : [new_enemy]
        }))
    }else if (type === "weak spot"){
        // parent is just the boss
        type_assert(params, {
            parent : "object"});

        var new_enemy = enemies.create(x, y, "boss_weak_spot");
        new_enemy.setData("disable_default_explode",true)
        new_enemy.setData("parent" ,params.parent);

    }
    else if (type === "strafe"){
        //fire, speed
        type_assert(params, {
            fire : "number", speed:"number"});

        var new_enemy = enemies.create(x, y, "strafe");
        new_enemy.setVelocityX(-params.speed);
        timers.push(scene.time.addEvent({
            callback: (e) => shoot_bullet(e, "customizable",{"end_x" : e.x, "end_y":900,speed:params.speed,image:'strafe_bullet'},e.x, e.y),
            delay : params.fire,
            args : [new_enemy],
            startAt : Math.random()*params.fire,
            loop : true
        }))        
        new_enemy.setData("speed",params.speed);
    }
    else if (type === "energy_ball_thrower"){
        //fire, speed
        type_assert(params, {
            fire : "number", speed:"number",number_of_bullets : "number"});

        var new_enemy = enemies.create(x, y, "energy_ball_thrower");
        new_enemy.setVelocityX(params.speed);
        // shoot energy balls
        timers.push(scene.time.addEvent({
            callback: (e,number_of_bullets) => shoot_bullet(e, "energy ball",{speed:700,explode_delay : (game_height - e.y)/700 *Math.random() * 900 , "explode_number" : number_of_bullets},e.x, e.y),
            delay : params.fire,
            args : [new_enemy,params.number_of_bullets]
        }))        
        // move to random location
        timers.push(scene.time.addEvent({
            callback : (e) => scene.physics.moveTo(e, Math.random() * game_width, Math.random() * 300 + 75, e.getData("speed")), args :[new_enemy], delay : 3000, loop : true
        }))
        new_enemy.setData("speed",params.speed);
    } else if(type === "wall"){
         // no params except HP
         var new_enemy = enemies.create(x, y,"wall");
    }
    
    else {
        throw "unknown type" + type;
    }
    new_enemy.setData("hp", params.hp);
    new_enemy.setData("max_hp", params.hp);

    new_enemy.setData("type", type);
    new_enemy.setData("images", images); // image, x ,y
    new_enemy.setData("timers", timers);
}


function enemy_hit_by_bullet(enemy : typeof Phaser.Game.GameObject, bullet : typeof Phaser.GameObjects.GameObject){
    if(!enemy.active || !bullet.active){
        return; 
    }
    var enemy_type:string = enemy.getData("type");
    var bullet_type:string = bullet.getData("type");
    if(enemy.getData("hp") === undefined || enemy.getData("max_hp") === undefined ){
        window.e = enemy;
        throw "enemy has no hp or max_hp";
    }

    if(enemy.getData("disable_hp_loss") === undefined){
        enemy.setData("hp",enemy.getData("hp")-1 );
    }
    var enemy_destroyed:boolean = false;

    if(enemy.getData("disable_death") === undefined){
        if(enemy.getData("hp") === 0){
            // weak spot

            if(enemy.getData("type") === "weak spot"){
                enemy.getData("parent").setData("weak spot spawned", false);
                game_state.boss_health -= 1;
                GameComponent.set_size(GameComponent.bossRef.current, game_state.boss_health/game_state.boss_max_health);
                if(game_state.boss_health === 0){
                    boss_defeated(game_state.boss_name);
                }
            }

            destroy_enemy(enemy);
            enemy_destroyed = true; 
        }
    }

    // tint the enemy based on hp.
    if(!enemy.destroyed && enemy.getData("disable_tint") === undefined){
        var hp:number = enemy.getData("hp")
        var max_hp:number = enemy.getData("max_hp")
        var ratio = hp / max_hp;
        ratio = 0.5 + ratio/2;
        enemy.tint = Math.floor(ratio*256)*256+Math.floor(ratio*256)*65536+Math.floor(ratio*256);
    }


    // anything special happens here (none of this is called if the enemy is destroyed)
    if(!enemy.destroyed){
        if(enemy_type === "spawner1"){
            var hp:number = enemy.getData("hp")
            // enemy images example
            /*
            if(hp === 4){        
                enemy_add_image("thing3", "purple orb with ghost", enemy, 10, 100); 
                enemy_add_image("thing2", "red spiked key", enemy, 10, 0);
                enemy_add_image("thing1", "blue spiked key", enemy, 100);   
            }
            if(hp === 3){
                enemy_remove_image(enemy, "thing3")
            }
            if(hp === 2){
                enemy_remove_image(enemy, "thing2")
            }
            if(hp === 1){
                enemy_remove_image(enemy, "thing1")
            }
            */
        }
    }

    // destroy the bullet
    if(bullet_type === "pbullet1"){
        destroy_bullet(bullet);
    }
    // for lasers, add to list
    if(bullet_type === "laser"){
        bullet.getData("tagged").push(enemy);
    }
}

function enemy_add_image(key : string, image : string, enemy : typeof Phaser.GameObjects.GameObject, x=0, y=0){
    enemy.getData("images").push({
        key : key,
        image:scene.physics.add.image(enemy.x+x, enemy.y+y, image),
        x:x,
        y:y
    });

}
function enemy_remove_image(enemy : typeof Phaser.GameObjects.GameObject, key:string){
    var lst = enemy.getData("images");
    for(var i:number=lst.length-1; i>= 0 ; i--){
        var image = enemy.getData("images")[i];
        if(image.key === key){
            image.image.destroy();
            enemy.getData("images").splice(i, 1);
        }
    }
}

function destroy_enemy(e : typeof Phaser.GameObjects.GameObject){
    var type:string = e.getData("type");
    if(e.getData("disable_default_explode") === undefined){
        play_animation_at_location(type + "_boom", e.x, e.y);
    } 
    if(e.getData("type") === "bh layer"){
        remove_image(e.getData("id") + "bh layer bomb");
    }
    e.getData("images").forEach((x:any) => x["image"].destroy());
    e.getData("timers").forEach((x : any) => x.remove());
    e.destroy();
}

/* --------------------------------------------------------
// Functions involving black holes
 ---------------------------------------------------------*/



 function add_black_hole(key, x, y, strength, duration){
    var bh_img = scene.physics.add.image(x,y,"black_hole");
    black_holes[key] = [x, y, strength, bh_img];
    scene.time.addEvent({callback:remove_black_hole, delay:duration, args:[key]});
}
function remove_black_hole(key){
    if(black_holes[key] !== undefined){
        black_holes[key][3].destroy();
        delete black_holes[key];
    }
}

/* --------------------------------------------------------
// Functions involving bullets (both player and enemy, except enemy-hit-by-bullet)
 ---------------------------------------------------------*/

function shoot_bullet(enemy : typeof Phaser.GameObjects.GameObject, type:string, params:{[key:string] : any},start_x ?: number, start_y ?: number, destroy_in? : number){
    if(start_x === undefined){
        start_x = enemy.x;
    }
    if(start_y === undefined){
        start_y = enemy.y
    }
    var timers : typeof Phaser.Time.TimerEvent[] = [];
    if(type === "bullet1"){
        // param : speed (optional image)
        type_assert(params, {"speed" : "number"});

        var bullet = bullets.create(start_x, start_y, params.image === undefined ? "bullet1" : params.image);
        scene.physics.moveToObject(bullet, player, params.speed);
    }
    else if(type === "fixed bullet"){
        // param : speed, x, y (optional image)
        type_assert(params, {"speed" : "number","x" : "number","y" : "number"});

        var bullet = bullets.create(start_x, start_y, params.image === undefined ? "bullet1" : params.image);
        scene.physics.moveTo(bullet, params.x, params.y, params.speed);
    }

    else if(type === "offset bullet"){
        //params = {x, y, speed} : the location (relative to player) to aim at. (optional image)
        type_assert(params, {"speed" : "number","x" : "number","y" : "number"});

        var bullet = bullets.create(start_x, start_y, params.image === undefined ? "bullet1" : params.image);
        scene.physics.moveTo(bullet, player.x+params.x, player.y + params.y, params.speed);
    }
    else if(type === "localized explosion"){
        // params : number of rings, bullets per ring, delay between rings,speed (optional image, expire time), 
        type_assert(params, {"number_of_rings" : "number", "bullets_per_ring" : "number", "delay" : "number", "speed":"number"})
        var bullet = bullets.create(start_x, start_y, "blank");
        var image = params.image === undefined ? "bullet1" : params.image;
        for(var i=0; i < params.number_of_rings; i++){
            var delay = params.delay * i;
            var angle = 0;
            for(var j=0; j < params.bullets_per_ring; j++){
                // fire the bullet
                timers.push(scene.time.addEvent({
                    callback: function(enemy, angle, start_x, start_y, params, image){
                        shoot_bullet(enemy,"fixed bullet",{"speed":params.speed, x:start_x + Math.cos(angle), y: start_y + Math.sin(angle), "image":image}, start_x, start_y, params.expire_time)
                    },
                    delay : delay,
                    args : [enemy, angle, start_x, start_y, params, image]
                }))
                angle += Math.PI * 2 / params.bullets_per_ring
            }
        }
    }
    else if(type === "follow bullet"){
        //params : speed (number),  follow_times (list of numbers) (optional image)
        type_assert(params, {"speed" : "number", "follow_times" : "object"});

        var bullet = bullets.create(start_x,start_y, params.image === undefined ? "bullet1" : params.image);
        scene.physics.moveToObject(bullet, player, params.speed);
        for(var i of params.follow_times){
            timers.push(scene.time.addEvent({delay :i, callback: (x, s) => scene.physics.moveToObject(x, player, s), args : [bullet, params.speed]}) );
        }
        
    }
    else if (type === "laser"){
        // no params
        var bullet = bullets.create(start_x ,start_y, "laser_bullet");
        bullet.setVelocityY(2000);
        
    } else if(type === "energy ball"){
        //speed, explode_delay, explode_number  
        type_assert(params, {"speed" : "number", "explode_delay" : "number", "explode_number" : "number"});
        
        var bullet = bullets.create(start_x,start_y, "energy_ball");
        bullet.setVelocityY(params.speed);
        timers.push(scene.time.addEvent({
            callback : function(bullet,params){
                var angle = 0;
                for(var i=0; i < params.explode_number; i++){
                    shoot_bullet(bullet, "fixed bullet", {speed : 400, x : bullet.x + Math.cos(angle), y : bullet.y + Math.sin(angle)})
                    angle += Math.PI*2 / params.explode_number;
                }
                destroy_bullet(bullet);
            },
            delay : params.explode_delay,
            args : [bullet, params]
        }))
    }
    else if (type === "customizable"){
        // bullet that shoots other bullets
        // end_x, end_y, delay, speed, child_type, child_params, image
        type_assert(params, {"end_x" : "number","end_y" : "number","speed" : "number","image" : "string"})
        if(params.child_type !== undefined){
            type_assert(params, {"child_type" : "string","delay" : "number", "child_params" : "object"});
        }
        var bullet = bullets.create(start_x,start_y, params.image);
        if(params.child_type !== undefined){
            timers.push(scene.time.addEvent({
            callback:function(params,bullet){
                shoot_bullet(bullet,params.child_type,params.child_params);
            },
            delay:params.delay,
            args:[params,bullet],
            loop : true
            }))
        }
        scene.physics.moveTo(bullet, params.end_x, params.end_y, params.speed);

    }
    if(destroy_in !== undefined){
        timers.push(scene.time.addEvent({
            callback:(e) => destroy_bullet(e),
            delay:destroy_in,
            args:[bullet]
        }))
    }
    bullet.setData("timers", timers);
    bullet.setData("type", type);
}

function player_shoot_bullet_up(type:string, params :{[key:string]:any}= {}, rotation:number=0){    
    // i (cos(x) + i sin(x) ) = -sin(x) + i cos(x)
    player_shoot_bullet(type,params, -Math.sin(rotation), -Math.cos(rotation) );
}

function player_shoot_bullet(type : string,params:{[key:string]:any}, x: number, y : number, start_x : number=player.x, start_y : number=player.y, image?: string){ // x and y are direction, start_x and start_y are location of bulllet
    var angle : number = 0;
    var timers :typeof Phaser.Time.TimerEvent[] = [];
    if(x !== 0 || y !== 0){
        var angle : number = Math.atan2(y, x);        
    }
    
    if(type === "pbullet1"){
        // bullet speed
        type_assert(params , {speed : "number"})
        var bullet = player_bullets.create(start_x, start_y, image !== undefined ? image : "pbullet1");
        var bullet_speed = params.speed;    
        bullet.setVelocityX(bullet_speed * Math.cos(angle));
        bullet.setVelocityY(bullet_speed * Math.sin(angle));
    }
    if(type === "pburst_bullet"){
        // number : number of bullets to explode into
        // time : when to explode 
        // speed : number (this bullet's speed, not child's)
        // child_speed : number
        // optional child_image for child
        type_assert(params, {"speed":"number", "number" : "number", "time" : "number"});
        
        var bullet = player_bullets.create(start_x, start_y, image !== undefined ? image :  "pburst_bullet");
        bullet.setVelocityX(params.speed * Math.cos(angle));
        bullet.setVelocityY(params.speed * Math.sin(angle));
        //console.log(bullet);        
        timers.push(scene.time.addEvent({
            callback:function(bullet:typeof  Phaser.GameObjects.GameObject, number : number, image ?: string, child_speed : number = 1000){
                var angle = 0;
                for(var i=0; i < number; i++){
                    
                    player_shoot_bullet("pbullet1",{speed:child_speed}, Math.cos(angle), Math.sin(angle), bullet.x, bullet.y,image);
                    angle += Math.PI*2/number;
                }
                
                destroy_bullet(bullet);
            },
            args:[bullet, params.number, params.child_image, params.child_speed],
            delay : params.time
        }))
    }
    if(type === "pturret"){
        // delay (how long to wait) , bullets (number of bullets), angle (how much to rotate)
        // optional child_image for child
        // and child_speed 
        type_assert(params, {"delay":"number", "bullets" : "number", "angle":"number"});

        var bullet = player_bullets.create(start_x, start_y,image !== undefined ? image :  "turret" );
        bullet.setVelocityX(0);
        bullet.setVelocityY(0);
        var times:number= 0;
        for(var i = 0; i < params.bullets; i++){
            var delay = params.delay + 100*i;
            timers.push(scene.time.addEvent({
                callback:player_shoot_bullet,
                args : ["pbullet1", {speed : params.child_speed !== undefined ? params.child_speed : 1000},Math.cos(times), -Math.sin(times), bullet.x, bullet.y, params.child_image],
                delay : delay
            }));
            times += params.angle;
        }
        timers.push(scene.time.addEvent({
            callback:destroy_bullet,
            args:[bullet],
            delay:params.delay + 100*params.bullets + 100,
        }))
    }
    if(type === "laser"){
        // only param is duration
        type_assert(params, {"duration" : "number"});
        var bullet = player_bullets.create(start_x, start_y, image !== undefined ? image : "player_laser_bullet");
        bullet.setData("tagged", []);
        timers.push(scene.time.addEvent({
            callback:destroy_bullet,
            args : [bullet],
            delay : params.duration
        }))
    }
    if(type === "seeker"){
    // bullet speed
        type_assert(params , {speed : "number"})
        var bullet = player_bullets.create(start_x, start_y, image !== undefined ? image : "pbullet1");
        var bullet_speed = params.speed;    
        bullet.setVelocityX(bullet_speed * Math.cos(angle));
        bullet.setVelocityY(bullet_speed * Math.sin(angle));
        bullet.setData("target", undefined);
        bullet.setData("speed", params.speed);
    }
    bullet.setData("timers", timers);
    bullet.setData("type", type);
}



function hit_by_bullet(player : Phaser.Physics.Arcade.Image, bullet : typeof Phaser.GameObjects.GameObject){
    
    if(player.getData("inv") === true){
        console.log("this should never happen");
        return;
    }
    bullet.disableBody(true, true);
    game_state.health --;
    player.setData("inv", true)
    set_text("inv", game_width/2 - 100, game_height-30,"You got hit! (invulnerable) ", game_state.invtime);
    set_image("inv", game_width/2, game_height/2, "invulnerable_overlay",game_state.invtime);
    console.log("player invulerable")
    scene.time.addEvent({
        callback : () => {
            player.setData("inv", false);
            console.log("player no longer invulnerable")
        },
        delay : game_state.invtime,
    })
    game_state.bullets ++;
    GameComponent.set_size(GameComponent.healthRef.current, game_state.health / max_hp);
    
    if(game_state.health === 0){
        GameComponent.setState({display : "lose"})
    }
    GameComponent.forceUpdate();
}


// same code for player and enemy bullets
function destroy_bullet(bullet : typeof Phaser.GameObjects.GameObject){
    var type:string = bullet.getData("type");
    if(type === "pturret"){
        play_animation_at_location("turret_disappear", bullet.x, bullet.y)
    }
    bullet.getData("timers").forEach((x) => x.remove());
    bullet.destroy();
}

/* --------------------------------------------------------
// Functions involving player bullet timers
 ---------------------------------------------------------*/

 // update which bullets the players can shoot
function update_player_bullets_helper(name : string, type : string, params:{[key:string]:any} , paramsFn? : () => any , delay : number = 0, rotation : number = 0, priority = 0){
    if(player_bullets_priorities[name] === undefined || player_bullets_priorities[name] < priority){
        player_bullets_priorities[name] = priority;
        update_player_bullets({
            [name]:{
                delay : delay,
                loop:true,
                callback:function(type, params, paramsFn, rotation){
                    if(paramsFn !== undefined){
                        params = paramsFn();
                    }
                    player_shoot_bullet_up(type, params, rotation)
                },
                args:[type,params,paramsFn, rotation]
            }
        })
    }
}

function update_player_bullets(new_stuff:any){
    /*
        keys are strings, objects are object that scene.time.addEvent accepts
    */
    for(var thing of Object.keys(new_stuff)){
        // cancel the old intervals
        if(player_bullets_intervals[thing] !== undefined){
            remove_player_bullet(thing);
        }
        player_bullets_intervals[thing] = scene.time.addEvent(new_stuff[thing]);
    }
}

function update_player_bullets_based_on_state(){


    //debug


    
    var delay = 1000;
     
    // pturret

 

    var ups = game_state.upgrades;

    if(ups.indexOf("seeker bullets") !== -1){
        update_player_bullets({"seeker":{
            callback : function(player){
                player_shoot_bullet("seeker", {speed:700 }, 0, -1, player.x, player.y)
            },
            args : [player],
            delay : 1000,
            loop:true
        }}) ; 
    }
   
    if(ups.indexOf("invincibility") !== -1){
        game_state.invtime = 1100;
    }
    

    
    var bullet_img = "pbullet1"
    // bullet size
    if(ups.indexOf("bullet size") !== -1){
        bullet_img = "pbullet2"
    }
    if(ups.indexOf("bullet size 2") !== -1){
        bullet_img = "pbullet3"
    }   

    if(ups.indexOf("player speed") !== -1){
        game_state.player_speed = 700;
    }       

    if(ups.indexOf("player speed 2") !== -1){
        game_state.player_speed = 900;
    }       

    // main 
    var n_shots =1;
    var delay = 700;

    // shots
    if(ups.indexOf("main spread") !== -1){
        n_shots = 3;
    }
    if(ups.indexOf("main spread 2") !== -1){
        n_shots = 5;
    }
    if(ups.indexOf("main spread 3") !== -1){
        n_shots = 7;
    }
    // rate 
    if(ups.indexOf("main rate") !== -1){
        delay -= 200;
    }
    if(ups.indexOf("main rate 2") !== -1){
        delay -= 100;
    }
    if(ups.indexOf("main rate 3") !== -1){
        delay -= 100;
    }

    update_player_bullets({"main":{
        callback : function(player, n_shots, bullet_img){
            var start = {7 : -3, 5 : -2, 3 : -1, 1 : 0}[n_shots]
            for(var i=0; i < n_shots; i++){
                player_shoot_bullet("pbullet1", {speed : 1000},  start + i, -3, player.x, player.y,bullet_img)
            }
        },
        args : [player, n_shots, bullet_img],
        delay : delay,
        loop:true
    }})

    //burst 
    var burst_rate = 1000;
    var burst_bullets = 6;
    if(ups.indexOf("burst speed") !== -1){
        burst_rate -= 200;
    }    
    if(ups.indexOf("burst speed 2") !== -1){
        burst_rate -= 100;
    }    
    if(ups.indexOf("burst speed 3") !== -1){
        burst_rate -= 100;
    }    
    if(ups.indexOf("burst bullets") !== -1){
        burst_bullets = 10
    }    
    if(ups.indexOf("burst bullets 2") !== -1){
        burst_bullets = 14
    }    
    
    if(ups.indexOf("main spread") !== -1 &&
    ups.indexOf("main rate") !== -1 &&
    ups.indexOf("player speed") !== -1 
    ){
        update_player_bullets({"burst":{
            callback : function(player, burst_rate, burst_bullets, bullet_img){
                player_shoot_bullet("pburst_bullet", {speed : 700, time : 400, number : burst_bullets, child_speed : 1000, child_image : bullet_img}, 0,-1, player.x, player.y)
            },
            args : [player, burst_rate, burst_bullets,bullet_img],
            delay : burst_rate,
            loop:true
        }}) 

        if(ups.indexOf("burst double") !== -1){
            update_player_bullets({"burst 2":{
                callback : function(player, burst_rate, burst_bullets, bullet_img){
                    player_shoot_bullet("pburst_bullet", {speed : 1000, time : 400, number : burst_bullets, child_speed : 1000, child_image : bullet_img}, Math.random()-0.5,-1, player.x, player.y)
                },
                args : [player, burst_rate, burst_bullets,bullet_img],
                delay : burst_rate,
                loop:true
            }})             
        }    

    }
    // turret
    if(ups.indexOf("bullet size") !== -1 &&
    ups.indexOf("main rate 2") !== -1 &&
    ups.indexOf("burst speed") !== -1 &&
    ups.indexOf("burst bullets") !== -1 &&
    ups.indexOf("invincibility") !== -1 
    ){
        var turret_delay = 2300;
        var turret_bullets = 20;
        var turret_int_delay = 5000;

        if(ups.indexOf("turret spawn") !== -1){
            turret_delay -= 400;
        }    
        if(ups.indexOf("turret delay") !== -1){
            turret_int_delay -= 800;
        }    
        if(ups.indexOf("turret bullets") !== -1){
            turret_bullets += 6;
        }    
        if(ups.indexOf("turret spawn 2") !== -1){
            turret_delay -= 400;
        }    
        if(ups.indexOf("turret bullets 2") !== -1){
            turret_bullets += 6;
        }    

        update_player_bullets({"turret":{
            callback : function(player,turret_delay,turret_bullets,turret_int_delay,bullet_img){
                player_shoot_bullet("pturret", {bullets:turret_bullets, angle : 0.4,delay : turret_int_delay, child_image : bullet_img }, 0, 0, player.x, player.y)
            },
            args : [player,turret_delay,turret_bullets,turret_int_delay,bullet_img],
            delay : turret_delay,
            loop:true
        }})        
    }

    if(
        _.every(['main spread 2', 'main rate 3', 'player speed 2', 'turret spawn', 'turret delay', 'turret bullets', 'burst speed 2', 'burst bullets 2'], (x) => ups.indexOf(x) !== -1)
    ){
        var laser_delay = 1500;
        var laser_duration = 400;
        var laser_image = "player_laser_bullet";

        if(ups.indexOf("laser rate") !== -1){
            laser_delay -= 300;
        }    
        if(ups.indexOf("laser duration") !== -1){
            laser_duration += 300;
        }    
        if(ups.indexOf("laser size") !== -1){
            laser_image = "player_laser_bullet_2";
        }  

        update_player_bullets({"laser":{
                callback : (player, duration, image) => player_shoot_bullet("laser", {duration : duration}, 0, 0, player.x, player.y-350 , image),
                args : [player, laser_duration ,laser_image],
                delay : laser_delay,
                loop:true
            }
        })
    }

/*
    update_player_bullets({"laser":{
            callback : (player) => player_shoot_bullet("laser", {duration : 200}, 0, 0, player.x, player.y-350 , "player_laser_bullet"),
            args : [player],
            delay : 2000,
            loop:true
        }
    })

    */
}

function remove_player_bullet(name:string){
    if(player_bullets_intervals[name] === undefined){
        return;
    }
    player_bullets_intervals[name].remove();
    player_bullets_intervals[name] = undefined;
    delete player_bullets_priorities[name];
}

/* --------------------------------------------------------
// Functions involving enemy spawners
 ---------------------------------------------------------*/

//object, keys are strings, values are [, priority]
function update_spawners(new_stuff : spawner_update[]){
    for(var item of new_stuff){
        // cancel the old intervals
        var updateTimer = item[0];
        var key = item[1];
        var prio :number = item[2];
        if(spawn_timer[key] === undefined || spawn_timer_priorities[key] < prio){//if should update
            if(spawn_timer[key] !== undefined){
                spawn_timer[key].remove();
            }
            var object:any = updateTimer;
            object.callback = function(type, x, y, params, paramsFn){
                var x_val = x(params);
                var y_val = y(params);
                if(paramsFn !== undefined){
                    params = paramsFn();
                }
                spawn_enemy(type, params, x_val, y_val);
            }
            object.args = [object.type, object.x, object.y, object.params, object.paramsFn];
            spawn_timer[key] = scene.time.addEvent(object);
            spawn_timer_priorities[key] = prio
        }

    }
}

function update_spawners_based_on_state(){
    for(var item of game_state.spawners){
        update_spawners([spawners[item]]);
    }
}


function remove_spawner(name : string){
    if(spawn_timer[name] === undefined){
        return
    }
    spawn_timer[name].remove();
    spawn_timer[name] = undefined;
    delete spawn_timer_priorities[name];
}

/* --------------------------------------------------------
// Functions involving picking a side and upgrades
 ---------------------------------------------------------*/

function set_pick_side(time : number, choices : string[]){
    game_state.next_pick_time = time;
    game_state.next_pick_time_so_far = 0;
    game_state.next_pick_choices = choices 
}

// call this function from returning to base
//this is called AFTER incrementing game state's index
//but that call is for the NEXT pick
function set_pick_side_from_state(){
    // find valid choices
    var prioritize_new = game_state.pick_side_prioritize_new[game_state.pick_side_index];
    console.log(prioritize_new);
    var valid_choices : string[] = Object.keys(spawners);
    valid_choices = valid_choices.filter((x) => game_state.spawners.indexOf(x) === -1);
    valid_choices = valid_choices.filter(function(x){
        return _.every(spawners[x][4], (y) => game_state.spawners.indexOf(y) !== -1)
    })
    
    // choose the two with the lowest difficulty
    valid_choices = _.sortBy(valid_choices, function(name) {
        if(prioritize_new && game_state.spawners.indexOf(spawners[name][1]) === -1){
            return spawners[name][3] - 999
        }
        return spawners[name][3]
    
    });

    if(valid_choices.length >= 2){
        var time :number = 0
        if(game_state.pick_side_index === 0){
            time = game_state.pick_side_times[0]; 
        } else {
            time = game_state.pick_side_times[game_state.pick_side_index] - game_state.pick_side_times[game_state.pick_side_index-1]
        }
        set_pick_side(time, [valid_choices[0], valid_choices[1]]);
    }
}

function drop_upgrade(type){
    console.log(type);
    var item = items.create(Math.random() * game_width, -10, type);
    item.setData("type", type)
    item.setVelocityY(50);

}

function set_upgrades_from_state(){
    for(var item of game_state.upgrade_times){
        scene.time.addEvent({
            callback:drop_upgrade,
            delay:item *1000,
            args : ["upgrade"]
        })
    }
}

/* --------------------------------------------------------
// Functions involving bosses
 ---------------------------------------------------------*/

// 
function prepare_spawn_boss(name : string){
    // remove all spawners
    for(var item of Object.keys(spawn_timer)){
        remove_spawner(item);
    }
    if(powerup_timer !== undefined){
        powerup_timer.remove();
    }
    if(explosion_timer !== undefined){
        explosion_timer.remove();
    }


    set_text("boss_text", 300, 200, "Boss approaching : " + name, 5000);
    set_text("boss_text_2", 300, 300, "Weak spot", 5000);
    set_image("boss_weak_spot", 200, 300, "boss_weak_spot", 5000)
    if(name === "Sunshine"){
        set_text("boss_text_3", 300, 500, "Safe spot", 5000);
        set_image("boss_safe_spot", 200, 500, "sunshine_safe_spot", 5000)
    }
    if (name === "Oblivion"){
        set_text("boss_text_3", 300, 500, "Run away!", 5000);
        set_image("boss_safe_spot", 200, 500, "shark warning", 5000)
    }
}

function spawn_boss(name : string){
    var images:Phaser.Physics.Arcade.Image[] = [];
    var timers:typeof Phaser.Time.TimerEvent[]= [];
    GameComponent.set_size(GameComponent.bossRef.current, 1);
    // common to all bosses

    var boss = bosses.create(game_width/2, -100, name);
    boss.setVelocityY(80);
    boss.setData("weak spot spawned", false);
    // set health and max_health
    // define a function on_spawn, called when the boss arrives, and 
    var on_spawn : (e : typeof Phaser.Game.GameObject) => void = (e) => {};

    if(name === "Blue Wave"){
        game_state.boss_health = 10;
        game_state.boss_max_health=10;

        var on_spawn = function(boss){
            var timers = boss.getData("timers")
            /* copy and paste the below code

            timers.push(scene.time.addEvent({
                callback : function(boss){

                },
                delay : ? ,
                args : [boss],
                loop : true
            }))

            */

            // 3 cannon attack
            
            // 3 seconds of intense firing every 6 seconds
            for(var i=0; i < 30; i++){
                timers.push(scene.time.addEvent({
                    callback : function(boss){
                        var x_vals = [352,416,487]
                        var y_vals = [161,157,162]
                        for(var i=0; i < 3; i++) {
                            shoot_bullet(boss, "fixed bullet", {x : boss.x - 400 + x_vals[i] , y : 999, speed  : 400 + Math.random() * 100}, boss.x - 400 + x_vals[i], boss.y - 100 + y_vals[i] )
                        }
                    },
                    delay : 6000,
                    startAt : 150 *i,
                    args : [boss],
                    loop : true
                }))
            }
            // spawn enemies
            
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var x_vals = [131,419,696]
                    var y_vals = [78,71,78]
                    var choice = Math.floor(Math.random() * 3)
                    var xc = x_vals[choice];
                    var yc = y_vals[choice];
                    spawn_enemy("multi", {hp:1, fire:800}, xc, yc);
                },
                delay : 3750 ,
                args : [boss],
                loop : true
            }))

            // spawn bullets that shoot other bullets
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    shoot_bullet(boss, "energy ball", {
                        speed : 400,
                        explode_delay : 800,
                        explode_number : 7}, 191, 121)

                    shoot_bullet(boss, "energy ball", {
                            speed : 400,
                            explode_delay : 800,
                            explode_number : 7}, 628, 121)             
                },
                delay : 2541 ,
                args : [boss],
                loop : true
            }))
        }
    }

    if(name === "Sunshine"){
        game_state.boss_health = 25;
        game_state.boss_max_health=25;
        on_spawn = function(boss){
            var timers = boss.getData("timers")

            /* copy and paste the below code

            timers.push(scene.time.addEvent({
                callback : function(boss){

                },
                delay : ? ,
                args : [boss],
                loop : true
            }))

            */
            // main cannons
            var x = [153,261,546,636]
            var y = [79, 84,76,79];
            for(var i=0; i < 4; i++){
                timers.push(scene.time.addEvent({
                    callback : function(boss,x,y){
                        shoot_bullet(boss, "bullet1", {speed:500, image:"sunshine_bullet"},x,y);
                    },
                    delay : 1200 ,
                    startAt : 300*i,
                    args : [boss, x[i], y[i]],
                    loop : true
                }))
            }
            // spawns multi
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    spawn_enemy("multi", {hp:3, fire:1000},400,78);
                },
                delay : 1500 ,
                args : [boss],
                loop : true
            }))
            // spawns  follow
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    spawn_enemy("follow", {hp:3, fire:1000},400,78);
                },
                delay : 1500 ,
                args : [boss],
                loop : true,
                startAt : 750
            }))
            //spawns lasers
            
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    spawn_enemy("laser", {hp:3, delay:1000},Math.random() * game_width,0);
                },
                delay : 1500 ,
                args : [boss],
                loop : true
            }))

            //sunshine bombs warning
            for(var i=0; i < 4; i++){
                timers.push(scene.time.addEvent({
                    callback : function(boss, i){
                        var x=  Math.random() *(game_width - 200) + 100
                        var y = Math.random() * (game_height - 300) + 300
                        boss.setData("bomb" + i, [x,y])
                        set_image("warning"+i , x,y,"sunshine_warning",3000)
                    },
                    delay : 7000 ,
                    startAt : 2500,
                    args : [boss, i],
                    loop : true
                }))
            }
            //sunshine bombs
            for(var i=0; i < 4; i++){
                timers.push(scene.time.addEvent({
                    callback : function(boss, i){
                        var [x, y] = boss.getData("bomb" + i)
                        shoot_bullet(boss, "localized explosion", {
                            number_of_rings : 5,
                            bullets_per_ring : 16,
                            delay : 400,
                            speed : 300,
                            expire_time : 180,
                            image:"sunshine_bullet"
                        }, x, y);
                    },
                    delay : 7000 ,
                    args : [boss, i],
                    loop : true
                }))
            }
            //sunshine safe spot
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var x=  Math.random() *game_width
                    boss.setData("safe spot", x)
                    var im = set_image("sunshine_safe_spot" , x,game_height /2,"sunshine_safe_spot",3000);
                    sc_images["sunshine_safe_spot"].setScale(4,game_height / 50);
                },
                delay : 10000 ,
                startAt : 3000,
                args : [boss],
                loop : true
            }))
            // lasers
            for(var i=0; i < 100; i++){
                var x_val = Math.random()*game_width;
                timers.push(scene.time.addEvent({
                    callback : function(boss, x_val){
                        var x= boss.getData("safe spot");
                        if(Math.abs(x_val - x) > 100){
                            shoot_bullet(boss, "laser", {}, x_val, 46)
                        }
                    },
                    delay : 10000 ,
                    startAt : 10*i,
                    args : [boss,x_val],
                    loop : true
                }))

            }
        }
    }
    if(name === "Oblivion"){
        game_state.boss_health =45;
        game_state.boss_max_health=45;
        on_spawn = function(boss){
            var timers = boss.getData("timers")
            
            /* copy and paste the below code

            timers.push(scene.time.addEvent({
                callback : function(boss){

                },
                delay : ? ,
                args : [boss],
                loop : true
            }))

            */

            // main bullets

            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var x = Math.random() * game_width;
                    for (var x_v of [x-65, x, x+65]){
                        shoot_bullet(boss,"fixed bullet" ,{"x" : x_v, "y" : 900, "image" : "strafe_bullet_dark", "speed":400},x_v, 100)
                    }
                },
                delay : 750 ,
                args : [boss],
                loop : true
            }))
            // left sharks warning
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var yv = Math.random() * game_height*(2/3) + game_height*(1/3) 
                    boss.setData("left_sharks" , yv);
                    set_image("left shark", 50, yv, "shark warning", 2000)
                },
                delay : 18000,
                startAt : 3000,
                args : [boss],
                loop : true
            }))
            // left shark
            for(var i=0; i<10; i++){
                timers.push(scene.time.addEvent({
                    callback : function(boss){
                        var yv = boss.getData("left_sharks")
                        shoot_bullet(boss, "fixed bullet" , {"speed" : 2000, x : game_width+100, y:yv, image:"shark_left"}, 1, yv)
                    },
                    delay : 18000,
                    startAt : i*100,
                    args : [boss],
                    loop : true
                }))
            }
            // right sharks warning

            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var yv = Math.random() * game_height*(2/3) + game_height*(1/3)
                    boss.setData("right_sharks" , yv);
                    set_image("right shark", game_width - 50, yv, "shark warning", 2000)
                },
                delay : 18000,
                startAt : 12000,
                args : [boss],
                loop : true
            }))
            // right shark
            for(var i=0; i<10; i++){
                timers.push(scene.time.addEvent({
                    callback : function(boss){
                        var yv = boss.getData("right_sharks")
                        shoot_bullet(boss, "fixed bullet" , {"speed" : 2000, x : -100, y:yv, image:"shark_right"}, game_width-1, yv)
                    },
                    delay : 18000,
                    startAt : i*100 + 9000,
                    args : [boss],
                    loop : true
                }))
            }
            // spwan multis
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var xv = [202,398,597];
                    var yv = [91,69,93]
                    for(var i=0; i<3; i++){
                        var x = xv[i];
                        var y = yv[i];
                        spawn_enemy("multi", {fire:1000,"hp":5}, x, y)
                    }
                },
                delay : 7000 ,
                args : [boss],
                loop : true,
                startAt : 3000
            }))
            //spawn black hole

            timers.push(scene.time.addEvent({
                callback : function(boss){
                    add_black_hole("boss", 400, 20, 240, 2000)
                },
                delay : 7000 ,
                args : [boss],
                loop : true
            }))
            //spawn spewer

            timers.push(scene.time.addEvent({
                callback : function(boss){
                    spawn_enemy("spewer",{"fire": 930, spread_amount:12,spread_angle:0.2,"hp":5}, 400, 147)
                },
                delay : 7000 ,
                args : [boss],
                loop : true
            }))

            // shoot follow bullet
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var xs = [302, 474]
                    var ys = [94,94]
                    for(var i=0; i < 2; i++){
                        shoot_bullet(boss, "follow bullet", {"speed":300, "follow_times":[500,1000,1500,2000,2500,3000], "image":"sphere_of_darkness"}, xs[i], ys[i])
                    }
                },
                delay : 2400 ,
                args : [boss],
                loop : true
            }))
            // shoot regular bullets
            timers.push(scene.time.addEvent({
                callback : function(boss){
                    var xs = [302, 474]
                    var ys = [94,94]
                    for(var i=0; i < 2; i++){
                        shoot_bullet(boss, "bullet1", {"speed":900, image : "small_bh"},xs[i], ys[i])
                    }
                },
                delay : 400 ,
                args : [boss],
                loop : true
            }))
        }
    }
    // stop moving
    timers.push(
        scene.time.addEvent({
            delay : 3000, 
            callback: function(e, on_spawn){
                e.setVelocityX(0);
                e.setVelocityY(0);

                boss.getData("timers").push(
                    scene.time.addEvent({
                        delay : 1000, 
                        callback: function(e){
                            if(e.getData("weak spot spawned")){
                                return; 
                            }
                            spawn_enemy("weak spot", {"parent":e, "hp":1}, Math.random() * game_width, Math.random() * 300);
                            e.setData("weak spot spawned", true);
                        }, 
                        args : [boss],
                        loop:true,
                    })
                )
                on_spawn(boss);

                }, 
            args : [boss, on_spawn]
        })
    )

    boss.setData("type", name);
    boss.setData("images", images); // image, x ,y
    boss.setData("timers", timers);


}

// last pick, spawn boss
function spawn_boss_from_state(){
    
    var time = game_state.pick_side_times[game_state.pick_side_times.length-1] - game_state.pick_side_times[game_state.pick_side_times.length-2]
                
    scene.time.addEvent({
        callback:prepare_spawn_boss,
        delay : time * 1000,
        args : [game_state.boss_name]
    })

    scene.time.addEvent({
        callback:spawn_boss,
        delay : (time+10) * 1000,
        args : [game_state.boss_name]
    })
    game_state.boss_spawning_in = time;
    game_state.boss_spawning_in_so_far =0;
}

function boss_defeated(name : string ){

    powerup_timer = scene.time.addEvent({
        callback : drop_upgrade,
        delay : health_spawn,
        args:["health"],
        loop:true
    })
    explosion_timer = scene.time.addEvent({
        callback : drop_upgrade,
        delay : explosion_spawn,
        args:["explosion"],
        loop:true
    })
    


    console.log("boss defeated");
    if(game_state.boss_name === "Blue Wave"){
        game_state.upgrade_times = [1,18, 36, 45, 64, 82, 114, 137]
        game_state.pick_side_index = 0;
        game_state.pick_side_times = [10, 20, 30, 40, 60, 85, 110, 130, 150, 170]
        game_state.pick_side_prioritize_new = [false, false, false, true, true, false, false, false];
        game_state.boss_name = "Sunshine"
        
    }

    else if(game_state.boss_name === "Sunshine"){
        game_state.upgrade_times = [18, 36, 57, 64, 82, 100, 121]
        game_state.pick_side_index = 0;
        game_state.pick_side_times = [20, 30, 40, 60, 70, 85, 110, 130, 150, 170, 190, 200, 220]
        game_state.pick_side_prioritize_new = [true, false, false, true, true, false];
        game_state.boss_name = "Oblivion"
    }
    else if(game_state.boss_name === "Oblivion"){
        GameComponent.setState({display : "win"});
    }


    game_state.boss_health = undefined;
    game_state.boss_max_health = undefined;
    game_state.boss_spawning_in_so_far = undefined;
    game_state.boss_spawning_in = undefined;
    set_pick_side_from_state();
    update_spawners_based_on_state();
    set_upgrades_from_state();
    // play an animation if possible
    bosses.children.entries.forEach(function(e){
        e.getData("images").forEach((x:any) => x["image"].destroy());
        e.getData("timers").forEach((x : any) => x.remove());
        e.destroy();
    })

}


/* --------------------------------------------------------
// Functions involving displaying text
 ---------------------------------------------------------*/



function set_text(key:string, x:number, y:number, text:string, time?:number){
    if(texts[key] !== undefined){
        remove_text(key);
    }
    texts[key] = scene.add.text(x, y, text);
    if(time !== undefined){
        text_timers[key] = scene.time.addEvent({callback:remove_text, args:[key], delay : time});
    }
}
function remove_text(key:string){
    if(texts[key] !== undefined){
        texts[key].destroy();
        delete texts[key];
    }
    if(text_timers[key] !== undefined){
        text_timers[key].remove();
        delete text_timers[key];
    }

}

function set_image(key:string, x:number, y:number, image:string, time?:number){
    if(sc_images[key] !== undefined){
        remove_image(key);
    }
    sc_images[key] = scene.add.image(x, y, image);
    if(time !== undefined){
        sc_images_timers[key] = scene.time.addEvent({callback:remove_image, args:[key], delay : time});
    }
}
function remove_image(key:string){
    if(sc_images[key] !== undefined){
        sc_images[key].destroy();
        delete sc_images[key];
    }
    if(sc_images_timers[key] !== undefined){
        sc_images_timers[key].remove();
        delete sc_images_timers[key];
    }

}


/* --------------------------------------------------------
// Functions involving updating (increments pick side)
 ---------------------------------------------------------*/

function slow_update(){ // called every second
    // make enemies follow player

    for(var en of enemies.children.entries  ){
        if(en.getData("type") === "enemy1"){
            if( Phaser.Math.Distance.Between(en.x, en.y , player.x , player.y) < 200){
                en.setVelocityX(0);
                en.setVelocityY(0);
            } else {
                scene.physics.moveToObject(en, player, 100);
            }
        }
        //destroy old black hole layers
        if(en.getData("type") === "bh layer"){
           // console.log(en.x);
            if(en.x > game_width  - 50){
                destroy_enemy(en);
            }
        }
        if(en.getData("type") === "strafe"){
            if(en.x > game_width - 50){
                en.setVelocityX(-en.getData("speed"));
            } else if(en.x < 50){
                en.setVelocityX(en.getData("speed"));
            }

        }
    }
    // items that move too far down should stop moving

    for(var item of items.children.entries){
        if(item.y > game_height - 100){
            item.setVelocity(0,0);
        }
    }
    // pick side
    remove_text("next_pick");
    if(game_state.next_pick_time !== undefined){
        GameComponent.set_color(GameComponent.progressRef.current, "green");
        game_state.next_pick_time_so_far += 1;
        if(game_state.next_pick_time_so_far >= game_state.next_pick_time){
            GameComponent.setState({"display":"pick"});
        }

        if(game_state.next_pick_time - game_state.next_pick_time_so_far  <= 5){

            set_text("next_pick", game_width/2 - 40, 100, "Pick a side in " + (game_state.next_pick_time - game_state.next_pick_time_so_far ));
        } 
        var progress = game_state.next_pick_time_so_far/game_state.next_pick_time
        GameComponent.set_size(GameComponent.progressRef.current, progress);
        
    }
    if(game_state.boss_spawning_in !== undefined){
        game_state.boss_spawning_in_so_far += 1;
        GameComponent.set_color(GameComponent.progressRef.current, "red");
        var progress = game_state.boss_spawning_in_so_far/game_state.boss_spawning_in
        GameComponent.set_size(GameComponent.progressRef.current, progress);
        if(game_state.boss_spawning_in_so_far === game_state.boss_spawning_in){
            GameComponent.set_size(GameComponent.progressRef.current, 0);
            game_state.boss_spawning_in = undefined;
        }
    }
    GameComponent.forceUpdate();

}


var update_turn = 0;
var x : any= undefined; 
function update(this:any)
{   
    if(x === undefined){
        x = setTimeout(() => console.log(update_turn), 10000);
    }
    if(game_state.free_play_time !== undefined){
        game_state.free_play_time += 1;
    }
    update_turn += 1;
    const frames_per_check = 2
    if(update_turn % frames_per_check === 0){

        // enemies images
        for(var item of enemies.children.entries){
            push_in(item)
            for(var image of item.getData("images")){
                image.image.setX(item.x + image.x);
                image.image.setY(item.y + image.y);
                image.image.depth = 1;
            }
        }
        // destroy bad bullets
        for(var item of bullets.children.entries){
            if(out_of_bounds(item)){
                destroy_bullet(item);
            }
        }
        for(var item of player_bullets.children.entries){
            if(out_of_bounds(item)){
                destroy_bullet(item);
            }
        }
        for(var item of player_bullets.children.entries){
            if(item.getData("type") === "seeker"){
                if(item.getData("target") === undefined || !item.getData("target").active ){
                    // seek a new enemy
                    item.setData("target", undefined);
                    var min_dist : number|undefined = undefined;
                    var min_target :typeof Phaser.GameObjects.GameObject|undefined = undefined;
                    for(var enemy of enemies.children.entries){
                        var dy = enemy.y - item.y;
                        var dx = enemy.x - item.x;
                        var sqd = dy*dy + dx*dx ;
                        if(min_dist === undefined || sqd < min_dist){
                            min_dist = sqd;
                            min_target = enemy;
                        }
                    }
                    if(min_target === undefined){
                        item.setVelocity(0, 0);
                    } else {
                        scene.physics.moveToObject(item, min_target, item.getData("speed"));
                    }
                }
            }
        }
        

        // scroll background
        if(game_state.boss_max_health === undefined){        
            bg.tilePositionY -= 1;
        }
        // move player
        push_in(player);
        // player moves to mouse
        var vx :number = 0;
        var vy :number = 0;

        if(keys["mouseX"] !== undefined && keys["mouseY"] !== undefined){
            // get angle 
            var mouse_vect=  new Phaser.Math.Vector2(keys["mouseX"] - player.x, keys["mouseY"] - player.y);
            var distance = mouse_vect.length();
            if(distance < 0.001){
                // nothing to do
                ;  
            } else {
                mouse_vect.normalize();
                var speed = game_state.player_speed;
                // for each black hole , take the cosine with the player to mouse vector , and project it.
                for(var bh of Object.keys(black_holes)){
                    var this_black_hole = black_holes[bh];
                    var bh_vect = new Phaser.Math.Vector2(this_black_hole[0] - player.x, this_black_hole[1] - player.y);
                    bh_vect.normalize();
                    speed += this_black_hole[2] * bh_vect.dot(mouse_vect);
                }
          //     console.log([speed, fps, speed/fps, distance])
                speed *= frames_per_check;
                if(speed/fps > distance/2.1){
                    player.setX(keys["mouseX"]);
                    player.setY(keys["mouseY"]);
                } else {
                    player.setX(player.x + mouse_vect.x * speed/fps);
                    player.setY(player.y + mouse_vect.y * speed/fps);
                }
            }
        }    
    }
}

/* --------------------------------------------------------
// Event listeners
 ---------------------------------------------------------*/



var keys : {[key:string]:any} = {};

function keydownEvent(e:KeyboardEvent){
    keys[e.key] = true;
}
function keyupEvent(e:KeyboardEvent){
    keys[e.key] = undefined;
    if(e.key === "c"){
        GameComponent.unpause_animation();
    }
}
function mouseMove(e:MouseEvent){
    if(document.getElementById("game") !== null && document.getElementById("game").contains(e.target)){
        keys["mouseX"]= e.offsetX;
        keys["mouseY"]=e.offsetY;
    }
}


document.addEventListener("keydown", keydownEvent);
document.addEventListener("keyup", keyupEvent);

document.addEventListener("mousemove", mouseMove);




/* --------------------------------------------------------
// Component
 ---------------------------------------------------------*/



class Game extends React.Component{
	game : any
	gameRef : any
    state : any
    progressRef : any
    bossRef : any
    buttonRef:any[]
    healthRef : any
    animating : boolean
	constructor(props:any){ 
		super(props);
		var config = {
			type: Phaser.AUTO,
			width: game_width,
			height: game_height,
			parent : null,
			scene: {
				preload: preload,
				create: create,
				update: update
			},
            fps : {
                min : fps,
                target : fps
            },
            render : {
                powerPreference : "low-power"
            },
            physics: {
                default: 'arcade',
                arcade: {
                    fixedStep : true,
                    debug: false,
                    fps: fps
                }
            },


		};
        this.state = {"display" : "game"};
		this.gameRef = React.createRef();
		this.bossRef = React.createRef();
		this.progressRef = React.createRef();
		this.healthRef = React.createRef();
        this.buttonRef =[React.createRef(),React.createRef(),React.createRef(),React.createRef() ];
        this.animating = false;
        // if the game is not made yet, make it. 
        if(game ===  undefined){
            this.game = new Phaser.Game(config);
            game = this.game;
        }else{
            this.game = game;
        }
        
        GameComponent = this;
        this.return_from_upgrades = this.return_from_upgrades.bind(this);
        this.return_from_pick = this.return_from_pick.bind(this);
        this.return_from_win = this.return_from_win.bind(this);
        this.return_from_loss = this.return_from_loss.bind(this);
	}
    componentWillUnmount(){
        pause();
    }
    set_color(bar, color){
        if(bar !== null){
            bar.style["background-color"] = color;
        }       
    }
    set_size(bar, amount){
        if(bar !== null){
            bar.style.width = Math.floor(game_width * amount) + "px";
        }
    }
    unpause_animation(){
        if(this.animating === false){
            this.buttonRef[0].current.style.display = "initial"; 
            this.buttonRef[1].current.style.display = "initial"; 
            this.buttonRef[2].current.style.display = "initial"; 
            this.buttonRef[3].current.style.display = "initial"; 
            this.animating =  true;
            console.log("animating true");
            //top left
            var x1 = anime({
                targets: this.buttonRef[0].current,
                translateX : player.x+25,
                translateY: player.y-25,
                easing: 'linear',
                duration:600,
                scale: {
                    value: 0.3,
                    easing: 'linear'
                },
                
                complete : function(){
                    this.buttonRef[0].current.style.display = "none"; 
                }.bind(this)
            });
            x1.finished.then(function()
            {this.reverse();
            this.play();
            return this.finished;
            }.bind(x1)).then(function(){setTimeout(function(){this.animating = false; console.log("animating false")}.bind(this), 100)}.bind(this));

            //bottom left
            var x2 = anime({
                targets: this.buttonRef[1].current,
                translateX : player.x+25,
                translateY: player.y-25-game_height,
                easing: 'linear',
                duration:600,
                scale: {
                    value: 0.3,
                    easing: 'linear'
                },
                
                complete : function(){
                 this.buttonRef[1].current.style.display = "none"; 
                }.bind(this)
            });

            x2.finished.then(function()
            {this.reverse();
            this.play();
            return x.finished;
            }.bind(x2))

            //top right
            var x3 = anime({
                targets: this.buttonRef[2].current,
                translateX : player.x+25 - game_width,
                translateY: player.y-25,
                easing: 'linear',
                duration:600,
                scale: {
                    value: 0.3,
                    easing: 'linear'
                },
                
                complete : function(){
                 this.buttonRef[2].current.style.display = "none"; 
                }.bind(this)
            });
            x3.finished.then(function()
            {this.reverse();
            this.play();
            return x.finished;
            }.bind(x3))
            
            //bottom right
            var x4 = anime({
                targets: this.buttonRef[3].current,
                translateX : player.x+25 - game_width,
                translateY: player.y-25 - game_height,
                easing: 'linear',
                duration:600,
                scale: {
                    value: 0.3,
                    easing: 'linear'
                },
                
                complete : function(){
                 this.buttonRef[3].current.style.display = "none"; 
                }.bind(this)
            });
            x4.finished.then(function()
            {this.reverse();
            this.play();
            return x.finished;
            }.bind(x4))


        }
    }

    componentDidUpdate(){
        try{
            if(this.state.display === "game"){
                this.gameRef.current.appendChild(this.game.canvas);
            }

            // unpausing
            if(this.state.display === "game" && scene !== undefined && scene.scene.isPaused()){
                this.unpause_animation();
            } 
            // set health bar
            this.set_size(this.healthRef.current, game_state.health/max_hp);


        } catch(e){
            console.log(e);
        }
    }
	componentDidMount(){
        try { 
            this.gameRef.current.appendChild(this.game.canvas);
            unpause();
        } catch(e){
            console.log(e);
        }
	}
    return_from_upgrades(e : string[] ){
        for(var item of e){
            if(game_state.upgrades.indexOf(item) === -1 && game_state.counter > 0){
                game_state.upgrades.push(item);
                game_state.counter -= 1; 
            }
        }
        update_player_bullets_based_on_state();
        //
        game_state.pick_side_index ++;
        if(game_state.pick_side_index === game_state.pick_side_times.length-1){
            spawn_boss_from_state();

        } else {
            set_pick_side_from_state();
        }
        console.log(JSON.stringify(game_state))

        this.setState({"display" : "game"});
    }
    return_from_pick(e : string){
        game_state.spawners.push(e);
        update_spawners_based_on_state();
        game_state.next_pick_time = undefined;
        game_state.next_pick_time_so_far = undefined;
        game_state.next_pick_choices = undefined;
        this.setState({"display" : "upgrades"});
    }
    return_from_win(){
        start_free_play();
        game_state.health = max_hp;
        this.setState({display : "game"});
    }
    return_from_loss(){
        game_state.health = 99999;
        this.setState({display : "game"});
    }
	render():any{
        // remove this when uploading to itch.
        if(dont_render_both == false){
            dont_render_both = true; 
            return <></>;
        }
        
        if(this.state.display !== "game"){
            pause();
            

            if(this.state.display === "upgrades"){
                return <Upgrade return_fn={this.return_from_upgrades} game_state={game_state}/>
            }
            if(this.state.display === "pick"){
                return <Pick return_fn={this.return_from_pick} game_state={game_state}/>
            }
            if(this.state.display === "win"){
                return <>
                <div style={{"position":"absolute", "top":100, "left":100, width:game_width, height:game_height}}>
                    <h1>You win!</h1><br/>
                    <h3>Bullet hits : {game_state.bullets}</h3><br />
                    Unfortunately, I don't have anything to give you, except for  a sense of pride and accomplishment<br />
                    But if you want to keep playing, you can continue in free play mode. <br />
                    <button style={{height:40, fontSize : 20}}onClick={reset}>Play again</button>
                    <button style={{height:40, fontSize : 20}}onClick={this.return_from_win}>Continue in Free Play (no more picking a side)</button>

                </div>
                </>
            }
            if(this.state.display === "lose"){
                return <>
                <div style={{"position":"absolute", "top":100, "left":100, width:game_width, height:game_height}}>
                    <h1>Oops</h1><br/>
                    {
                        function(){
                            if(game_state.free_play_time !== undefined) {
                                return <h3>You lasted {Math.floor(game_state.free_play_time/60) } seconds in free play mode. Congratulations!</h3>
                            }
                        return <h3> Try to not get hit by so many bullets, ok?</h3>
                        }.bind(this)()
                    }
                    <h3>Bullet hits : {game_state.bullets}</h3><br />
                    <button style={{height:40, fontSize : 20}}onClick={reset}>Play again</button>
                    {function(){
                        if(game_state.free_play_time === undefined){
                        return <button style={{height:40, fontSize : 20}}onClick={this.return_from_loss}>Continue with infinite HP</button>
                    }
                    }.bind(this)()
                    }
                </div>
                </>
            }
        } else { 
            if(scene !== undefined && scene.scene.isPaused()){
                setTimeout(unpause, 700);
            }
            return <div>
           
            <button onClick={function(this:React.Component){this.setState({display:"upgrades"})}.bind(this)}>Upgrades</button>
            
            
            
            <button onClick={reset}>Restart scene</button> <br />
            Next side pick : {
                function(){
                    if(game_state.next_pick_time !== undefined){
                        return game_state.next_pick_time - game_state.next_pick_time_so_far
                    } else {
                        return ""
                    }
                }()
            }<br /> 

            
            {game_state.counter} items collected, {game_state.bullets} bullet hits
            <div style={{"position":"absolute", "top":100, "left":100}}ref={this.gameRef} id="game"></div>

            <div style={{position:"absolute", top:60, left:100, "background-color":"#ccffcc",height:20, width:game_width}} ref={this.healthRef}></div>
            <div style={{position:"absolute", top:80, left:100, "background-color":"red",height:20}} ref={this.bossRef}></div>
            <div style={{position:"absolute", top:80, left:100, "background-color":"green",height:20}} ref={this.progressRef}></div>
                
            <img src="images/player_indicator.png" ref={this.buttonRef[0]} id="abc" style={{ display:"none", position:"absolute", top:game_box_top, left:game_box_left}} />
            <img src="images/player_indicator.png" ref={this.buttonRef[1]} id="abc" style={{ display:"none", position:"absolute", top:game_box_top+game_height, left:game_box_left}} />
            <img src="images/player_indicator.png" ref={this.buttonRef[2]} id="abc" style={{ display:"none", position:"absolute", top:game_box_top, left:game_box_left+game_width}} />
            <img src="images/player_indicator.png" ref={this.buttonRef[3]} id="abc" style={{ display:"none", position:"absolute", top:game_box_top+game_height, left:game_box_left+game_width}} />
            </div>
        }
	}
	
}



export default Game; 


