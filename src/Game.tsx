import React from 'react';
import spritesheets from './spritesheets.tsx';
import purchasable_upgrades from "./purchaseable_upgrades.tsx";
import spawner_update from './interface spawner_update.tsx';
import spawners from "./spawners.tsx";
import Upgrade from './Upgrade';
import Pick from './Pick';
const itemPool = require("./itemPool.json");
const _ = require("lodash");
const Phaser = require("phaser");


/*
TODO: 

make upgrades spawn
make tutorial
add code for when/how pick a side works
make bosses
upgrades should be shapes instead of buttons
player bullet should be computed from upgrades
add health bar / penalty for getting hit
add temporary upgrades
pick a side should be indicated using a bar
upgrades + pick a side interface


*/

/*
process for adding a new enemy:
- draw it and draw it's explosion
- update images
- make a spawner for it
- in spawn_enemy function, add how it spawns 

default naming conventions: 
keys and file names are the same
explosion will be (type)_boom

*/
var dont_render_both = false;

var player:typeof Phaser.Game.image;
var items : typeof Phaser.Physics.Arcade.StaticGroup;
var enemies : typeof Phaser.Physics.Arcade.Group;
var bullets : typeof Phaser.Physics.Arcade.Group;
var player_bullets : typeof Phaser.Physics.Arcade.Group;
var bg : typeof Phaser.GameObjects.TileSprite;
var texts : {[key:string] : typeof Phaser.GameObjects.Text} = {};
var text_timers : {[key:string] : typeof Phaser.Time.TimerEvent} = {}


var spawn_timer : {[key:string] : typeof Phaser.Time.TimerEvent } = {};
var spawn_timer_priorities : {[key:string]:number} = {};

interface player_bullets_intervals{[key:string]:typeof Phaser.Time.TimerEvent}

// player bullets
var player_bullets_intervals :player_bullets_intervals= {};
var player_bullets_priorities : {[key:string]:number} = {};

// x, y, strength, image
var black_holes : {[key:string] : [number,number, number, typeof Phaser.Game.image]} = {};

interface game_state {  
    counter : number,
    bullets : number,
    upgrades : string[],
    spawners : string[],
    next_pick_time? : number,
    next_pick_time_so_far? : number,
    next_pick_choices? : string[],
    player_speed : number
}

var game_state : game_state =  {
    counter : 0,
    bullets : 0,
    upgrades : ["base"],
    spawners : ["laser"],
    player_speed : 500
}



var GameComponent : React.Component;
var game : typeof Phaser.Game;
var scene : typeof Phaser.Scene;

const game_width = 800;
const game_height = 600;
const fps = 60; 


var anims : any;

function preload (this:typeof Phaser.Game)
{   
    console.log("preload called")
    // load images

    for(var item of Object.keys(itemPool)){
        var item_ = itemPool[item]
        //console.log(item_.name);
        this.load.image(item_.name, "images/items/"+item_.image);
    }
    // load images and spritesheets
    /*

while(True):
	print("\tvar enemy_images : string[] = " + str(list(map(lambda x : x.replace(".png",""), (filter(lambda x : "png" in x, os.listdir("D:/Desktop/games/geo_game/public/images/enemies")))))))
	print("\tvar images : string[] = " + str(list(map(lambda x : x.replace(".png",""), (filter(lambda x : "png" in x, os.listdir("D:/Desktop/games/geo_game/public/images")))))))
	input("")

    */
	var enemy_images : string[] = ['black_hole_layer', 'enemy1', 'enemy2', 'enemy3', 'enemy4', 'laser', 'spawner1']
	var images : string[] = ['background', 'background2', 'black_hole', 'blank', 'bullet1', 'laser_bullet', 'laser_charged', 'pbullet1', 'pburst_bullet', 'player', 'playerup', 'player_upgraded', 'turret']
    
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



function collectItem(player : typeof Phaser.Game.image, item : typeof Phaser.GameObjects.GameObject){
    item.disableBody(true, true);
    game_state.counter += 1;
    if(game_state.counter ===  3){
        player.setTexture('playerup');
    }
    GameComponent.forceUpdate();

    
}

function play_animation_at_location(anim:string, x:number, y:number){
    var sprite = scene.add.sprite(x, y, "blank").play(anim);
    sprite.on("animationcomplete", function(this:any){this.destroy()}.bind(sprite));
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
        }
    }

    // destroy the bullet
    if(bullet_type === "pbullet1"){
        destroy_bullet(bullet);
    }
}
function hit_by_bullet(player : typeof Phaser.Game.image, bullet : typeof Phaser.GameObjects.GameObject){
    bullet.disableBody(true, true);
    game_state.bullets ++;
    GameComponent.forceUpdate();
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


function create(this:any)
{
    scene = game.scene.scenes[0];
    console.log("create called");
    bg= scene.add.tileSprite(game_width/2, game_height/2, game_width, game_height, "background");
    // slow update interval
    scene.time.addEvent({callback:slow_update, delay:1000, loop:true});
    // add items
    items = this.physics.add.staticGroup();
    items.create(400, 300, "blue key");
    items.create(700, 600, "green orb with ghost");
    items.create(700, 300, "red gem");
    set_pick_side();
    update_player_bullets_based_on_state();
    update_spawners_based_on_state();

    // add enemies
    enemies = this.physics.add.group();
    // add player
    player = this.physics.add.image(500,500,"player");
    // add collision
    this.physics.add.overlap(player, items, collectItem, null, this);
    // add bullets 
    bullets = this.physics.add.group();
    player_bullets = this.physics.add.group();
    this.physics.add.overlap(player, bullets, hit_by_bullet, null, this);
    this.physics.add.overlap(enemies, player_bullets, enemy_hit_by_bullet, function(enemy: typeof Phaser.GameObjects.GameObject, bullet: typeof Phaser.GameObjects.GameObject){
        return bullet.getData("type").indexOf(["pburst_bullet", "pturret"]) === -1;
    }, this);
    // add animations
    for(var item of Object.keys(spritesheets)){
        this.anims.create({key:item, 
        frames : item
        })
    }
    // 
    
}

function destroy_enemy(e : typeof Phaser.GameObjects.GameObject){
    var type:string = e.getData("type");
    if(e.getData("disable_default_explode") === undefined){
        play_animation_at_location(type + "_boom", e.x, e.y);
    } 
    
    e.getData("images").forEach((x:any) => x["image"].destroy());
    e.getData("timers").forEach((x : any) => x.remove());
    e.destroy();
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

function spawn_enemy(type:string, params : any,  x : number, y : number){
    // all enemies must have hp as a param
    if(params.hp === undefined){
        throw "spawn without hp";
    }
    // optionally set disable_tint, disable_hp_loss,  disable_death, disable_default_explode
    var images:typeof Phaser.Game.image[] = [];
    var timers:typeof Phaser.Time.TimerEvent[]= [];
    if(type === "enemy1"){
        // {fire :  rate of fire}
        var new_enemy = enemies.create(x, y, "enemy1");
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "bullet1", {speed:300}]}) );
        scene.physics.moveToObject(new_enemy, player, 100);
    } else if (type === "multi"){
        var new_enemy = enemies.create(x, y, "enemy2");
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "offset bullet", {speed:300, x : -100, y : 0}]}) );
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "offset bullet", {speed:300, x : 100, y : 0}]}) );
        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "offset bullet", {speed:300, x : 0, y : 0}]}) );
        
        scene.physics.moveToObject(new_enemy, player, 100);
    }
    else if (type === "follow"){
        // same params as enemy1
        var new_enemy = enemies.create(x, y, "enemy3");

        timers.push(scene.time.addEvent({delay :params.fire, loop: true, callback:shoot_bullet, args : [new_enemy, "follow bullet", {speed:400, follow_times : [1000, 2000, 3000, 4000]}]}) );

        scene.physics.moveTo(new_enemy, Math.random() * game_width ,Math.random() * game_height * 0.8, 100);

        timers.push(scene.time.addEvent({delay : 5000, callback:(x) => {x.setVelocityX(0); x.setVelocityY(0)}, args:[new_enemy] }));
    }
    else if (type === "spewer"){
        /* fire : rate of fire,
        spread_amount : number of bullets per shot
        spread_angle : angle between shots
        */
        var new_enemy = enemies.create(x, y, "enemy4");
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
                args : [params.spread_angle * i - params.spread_angle * params.spread_amount /2, new_enemy, player]
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

        */
        var new_enemy = enemies.create(x, y, "spawner1");   
        timers.push(scene.time.addEvent({delay : params.delay, loop:true, callback:function(e){spawn_enemy("enemy1", {fire:1000, "hp":1}, e.x, e.y)}, args : [new_enemy]}))
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
        // fire (firing speed) and strength and duration (strength  of black hole), speed
        var new_enemy = enemies.create(x, y, "black_hole_layer");
        new_enemy.setVelocityX(params.speed);
        timers.push(scene.time.addEvent({
            delay : params.fire,
             loop:true, 
             callback:function(e, strength, duration){
                add_black_hole(Math.random().toString(), e.x, e.y, strength, duration);

            }, 
            args : [new_enemy, params.strength, params.duration]}))
        
    }else if (type === "laser"){
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
                callback: (e) => shoot_bullet(e, "laser", {spread:50}),
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
    }else {
        throw "unknown type" + type;
    }
    new_enemy.setData("hp", params.hp);
    new_enemy.setData("max_hp", params.hp);

    new_enemy.setData("type", type);
    new_enemy.setData("images", images); // image, x ,y
    new_enemy.setData("timers", timers);
}

function shoot_bullet(enemy : typeof Phaser.GameObjects.GameObject, type:string, params:{[key:string] : any}){
    var timers : typeof Phaser.Time.TimerEvent[] = [];
    if(type === "bullet1"){
        // param : speed
        var bullet = bullets.create(enemy.x, enemy.y, "bullet1");
        scene.physics.moveToObject(bullet, player, params.speed);
    }
    else if(type === "fixed bullet"){
        // param : speed, x, y
        var bullet = bullets.create(enemy.x, enemy.y, "bullet1");
        scene.physics.moveTo(bullet, params.x, params.y, params.speed);
    }
    else if(type === "offset bullet"){
        //params = {x, y, speed} : the location (relative to player) to aim at.
        var bullet = bullets.create(enemy.x, enemy.y, "bullet1");
        scene.physics.moveTo(bullet, player.x+params.x, player.y + params.y, params.speed);
    }
    else if(type === "follow bullet"){
        //params : speed (number),  follow_times (list of numbers)
        var bullet = bullets.create(enemy.x, enemy.y, "bullet1");
        scene.physics.moveToObject(bullet, player, params.speed);
        for(var i of params.follow_times){
            timers.push(scene.time.addEvent({delay :i, callback: (x, s) => scene.physics.moveToObject(x, player, s), args : [bullet, params.speed]}) );
        }
        
    }
    else if (type === "laser"){
        // param is a number, representing spread
        var bullet = bullets.create(enemy.x + (Math.random()-0.5)*params["spread"],0, "laser_bullet");
        bullet.setVelocityY(2000);
        
    }
    bullet.setData("timers", timers);
    bullet.setData("type", type);
}

function player_shoot_bullet_up(type:string, params :{[key:string]:any}= {}, rotation:number=0){    
    // i (cos(x) + i sin(x) ) = -sin(x) + i cos(x)
    player_shoot_bullet(type,params, -Math.sin(rotation), -Math.cos(rotation) );
}

function player_shoot_bullet(type : string,params:{[key:string]:any}, x: number, y : number, start_x : number=player.x, start_y : number=player.y){ // x and y are direction, start_x and start_y are location of bulllet
    var angle : number = 0;
    var timers :typeof Phaser.Time.TimerEvent[] = [];
    if(x !== 0 || y !== 0){
        var angle : number = Math.atan2(y, x);        
    }
    
    if(type === "pbullet1"){
        // no params
        var bullet = player_bullets.create(start_x, start_y, "pbullet1");
        var bullet_speed = 1200;    
        bullet.setVelocityX(bullet_speed * Math.cos(angle));
        bullet.setVelocityY(bullet_speed * Math.sin(angle));
    }
    if(type === "pburst_bullet"){
        // number : number of bullets to explode into
        var bullet = player_bullets.create(start_x, start_y, "pburst_bullet");
        var bullet_speed = 300;
        bullet.setVelocityX(bullet_speed * Math.cos(angle));
        bullet.setVelocityY(bullet_speed * Math.sin(angle));
        //console.log(bullet);        
        timers.push(scene.time.addEvent({
            callback:function(bullet:typeof  Phaser.GameObjects.GameObject, number : number){
                var angle = 0;
                for(var i=0; i < number; i++){
                    
                    player_shoot_bullet("pbullet1",{}, Math.cos(angle), Math.sin(angle), bullet.x, bullet.y);
                    angle += Math.PI*2/number;
                }
                
                destroy_bullet(bullet);
            },
            args:[bullet, params.number],
            delay : 1000
        }))
    }
    if(type === "pturret"){
        // no params
        var bullet = player_bullets.create(start_x, start_y, "turret");
        bullet.setVelocityX(0);
        bullet.setVelocityY(0);
        var times:number= 0;
        for(var i = 3000; i < 6000; i+=100){
            
            timers.push(scene.time.addEvent({
                callback:player_shoot_bullet,
                args : ["pbullet1", {},Math.cos(times), -Math.sin(times), bullet.x, bullet.y],
                delay : i
            }));
            times += 0.52;
        }
        timers.push(scene.time.addEvent({
            callback:destroy_bullet,
            args:[bullet],
            delay:6100,
        }))
    }
    bullet.setData("timers", timers);
    bullet.setData("type", type);
}

function remove_player_bullet(name:string){
    if(player_bullets_intervals[name] === undefined){
        return;
    }
    player_bullets_intervals[name].remove();
    player_bullets_intervals[name] = undefined;
    delete player_bullets_priorities[name];
}
function remove_spawner(name : string){
    if(spawn_timer[name] === undefined){
        return
    }
    spawn_timer[name].remove();
    spawn_timer[name] = undefined;
    delete spawn_timer_priorities[name];
}
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

function update_spawners_based_on_state(){
    for(var item of game_state.spawners){
        update_spawners([spawners[item]]);
    }
}
function update_player_bullets_based_on_state(){
    // todo: in the future, we want to compute it here , (and wipe out all of the old timers, if needed), and replace them with new ones.


    // priority should be based on being recent, not strength 

    for(var item of game_state.upgrades){
        for(var upgrade of purchasable_upgrades[item]){
            update_player_bullets_helper(...upgrade);
        }
    }
}


function update_player_bullets(new_stuff:any){
    for(var thing of Object.keys(new_stuff)){
        // cancel the old intervals
        if(player_bullets_intervals[thing] !== undefined){
            player_bullets_intervals[thing].remove();
        }
        player_bullets_intervals[thing] = scene.time.addEvent(new_stuff[thing]);
    }
}


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
        if(en.getData("type") === "bh layer"){
            if(en.y > 790){
                destroy_enemy(en);
            }
        }
    }

    // pick side
    remove_text("next_pick");
    if(game_state.next_pick_time !== undefined){
        game_state.next_pick_time_so_far += 1;
        if(game_state.next_pick_time_so_far >= game_state.next_pick_time){
            GameComponent.setState({"display":"pick"});
        }

        if(game_state.next_pick_time - game_state.next_pick_time_so_far  <= 5){

            set_text("next_pick", game_width/2 - 40, 100, "Pick a side in " + (game_state.next_pick_time - game_state.next_pick_time_so_far ));
        } 
        GameComponent.forceUpdate();
    }

}

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
var update_turn = 0;
var x : any= undefined; 
function update(this:any)
{   
    if(x === undefined){
        x = setTimeout(() => console.log(update_turn), 10000);
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

        // scroll background
        bg.tilePositionY -= 1;
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

var keys : {[key:string]:any} = {};

function keydownEvent(e:KeyboardEvent){
    keys[e.key] = true;
}
function keyupEvent(e:KeyboardEvent){
    keys[e.key] = undefined;
}
function mouseMove(e:MouseEvent){
    keys["mouseX"]= e.offsetX;
    keys["mouseY"]=e.offsetY;
}


document.addEventListener("keydown", keydownEvent);
document.addEventListener("keyup", keyupEvent);
document.addEventListener("mousemove", mouseMove);
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

function set_pick_side(){
    game_state.next_pick_time = 200;
    game_state.next_pick_time_so_far = 0;
    game_state.next_pick_choices = ["multi", "spawner"]
}

class Game extends React.Component{
	game : any
	gameRef : any
    state : any
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

	}
    componentWillUnmount(){
        pause();
    }
    componentDidUpdate(){
        try{
            if(this.state.display === "game"){
                this.gameRef.current.appendChild(this.game.canvas);
            }
        } catch(e){
            ;
        }
    }
	componentDidMount(){
        try { 
            this.gameRef.current.appendChild(this.game.canvas);
            unpause();
        } catch(e){

        }
	}
    return_from_upgrades(e : Set<string> ){
        for(var item of e){
            if(game_state.upgrades.indexOf(item) === -1){
                game_state.upgrades.push(item);
            }
        }
        update_player_bullets_based_on_state();
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

	render():any{
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
        } else { 
            setTimeout(unpause, 700);
            return <div>
            {/*
            <button onClick={function(this:React.Component){this.setState({display:"upgrades"})}.bind(this)}>Upgrades</button>
            <button onClick={set_pick_side}>pick</button><br />
            
            */}
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
                <div style={{"position":"absolute", "top":100, "left":10}}ref={this.gameRef} id="game"></div>
            </div>
        }
	}
	
}



export default Game; 


