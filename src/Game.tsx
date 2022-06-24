import React from 'react';
const itemPool = require("./itemPool.json");
const _ = require("lodash");
const Phaser = require("phaser");

var player:typeof Phaser.Game.image;
var items : typeof Phaser.Physics.Arcade.StaticGroup;
var enemies : typeof Phaser.Physics.Arcade.Group;
var dummies : typeof Phaser.Physics.Arcade.Group;
var bullets : typeof Phaser.Physics.Arcade.Group;
var player_bullets : typeof Phaser.Physics.Arcade.Group;
var bg : typeof Phaser.GameObjects.TileSprite;
var spawn_timer : typeof Phaser.Time.TimerEvent[] = [];
interface player_bullets_intervals{[key:string]:typeof Phaser.Time.TimerEvent}

// player bullets
var player_bullets_intervals :player_bullets_intervals= {};
var player_bullets_priorities : {[key:string]:number} = {};

var cursors:any;


interface spritesheet {
    [key: string]: {
        frameWidth : number, 
        frameHeight : number, 
        startFrame : number, 
        endFrame : number, 
    }
}
var spritesheets:spritesheet = {
    "spawner1_boom":{
        frameWidth: 200,
        frameHeight: 200,
        startFrame: 0,
        endFrame: 9
    },"enemy1_boom":{
            frameWidth: 40,
            frameHeight: 40,
            startFrame: 0,
            endFrame: 4
    },"turret_disappear":{
        frameWidth: 23,
        frameHeight: 23,
        startFrame: 0,
        endFrame: 4
}
}

// key = upgrade name , value : things we apply to update_player_bullets_helper (name ,type,params, delay, rotation, priority)
interface purchasable_upgrades {
    [key: string]: [string, string ,{[key:string]:any},number, number?, number?][]
}

var purchasable_upgrades:purchasable_upgrades= {
    "turret" : [["pturret", "pturret",{},4000, 0]],
    "burst" : [["pburst_bullet","pburst_bullet",{number:5},3000, 0]],
    "burst 2" : [["pburst_bullet","pburst_bullet",{number:10},1200, 0, 1]],
    "spread shot":[["pbullet1", "pbullet1",{}, 400,0,1],["pbullet1_2", "pbullet1",{}, 400, 0.5],["pbullet1_3", "pbullet1",{}, 400, -0.5]]
    
}

interface game_state {  
    counter : number,
    bullets : number
    upgrades : string[]
}

var game_state : game_state =  {
    counter : 0,
    bullets : 0,
    upgrades : ["turret"],
}


var GameComponent : React.Component;
var game : typeof Phaser.Game;
var scene : typeof Phaser.Scene;

const game_width = 800;
const game_height = 600;
const player_speed = 500;

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
    this.load.image("player", "images/player.png" );
    this.load.image("playerup", "images/playerup.png" );
    this.load.image("enemy1", "images/enemies/enemy1.png");
    this.load.image("bullet1", "images/bullet1.png");
    this.load.image("pbullet1", "images/pbullet1.png");
    this.load.image("pburst_bullet", "images/pburst_bullet.png");
    this.load.image("background", "images/background.png");
    this.load.image("blank", "images/blank.png");

    this.load.image("turret", "images/turret.png");
    this.load.image("spawner1", "images/enemies/spawner1.png");
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
    var enemy_type:string = enemy.getData("type");
    var bullet_type:string = bullet.getData("type");
    if(enemy_type === "enemy1"){
        destroy_enemy(enemy);
    }
    if(enemy_type === "spawner1"){
        console.log("hit");
        enemy.setData("hp",enemy.getData("hp")-1 );
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
        
        if(hp === 0){
            destroy_enemy(enemy);
        }

        
    }
    if(enemy.getData("disable_tint") === undefined){
        var hp:number = enemy.getData("hp")
        var max_hp:number = enemy.getData("max_hp")
        enemy.tint = Math.floor(hp*256/max_hp)*256+Math.floor(hp*256/max_hp)*65536+Math.floor(hp*256/max_hp);
    }
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


function  create (this:any)
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
    // define player bullets
    bullets = this.physics.add.group();
    // add dummy objects for animations
    dummies = this.physics.add.group();
    // add enemies
    enemies = this.physics.add.group();
    spawn_enemy("spawner1",{"direction" : [Math.random() * 800, Math.random()* 300], "speed" : 40, time : 5000},-100, -100);
    // add player
    player = this.physics.add.image(500,500,"player");
    // add collision
    this.physics.add.overlap(player, items, collectItem, null, this);
    // add bullets 
    bullets = this.physics.add.group();
    player_bullets = this.physics.add.group();
    this.physics.add.overlap(player, bullets, hit_by_bullet, null, this);
    this.physics.add.overlap(enemies, player_bullets, enemy_hit_by_bullet, function(enemy: typeof Phaser.GameObjects.GameObject, bullet: typeof Phaser.GameObjects.GameObject){
        return bullet.getData("type") !== "pburst_bullet";
    }, this);
    // add collision for enemy
    //this.physics.add.overlap(player, enemies, enemy_touch_object, null, this);  

    // add animations
    for(var item of Object.keys(spritesheets)){
        this.anims.create({key:item, 
        frames : item
        })
    }
    // add player bullets
    update_player_bullets_helper("pbullet1", "pbullet1",{}, 500, 0);
}

function destroy_enemy(e : typeof Phaser.GameObjects.GameObject){
    var type:string = e.getData("type");
    if(type === "enemy1"){
        play_animation_at_location("enemy1_boom", e.x, e.y);
    }
    else if(type === "spawner1"){
        play_animation_at_location("spawner1_boom", e.x, e.y);
    }
    e.getData("images").forEach((x:any) => x["image"].destroy());
    e.getData("timers").forEach((x : any) => x.remove());
    e.destroy();
}
function destroy_bullet(bullet : typeof Phaser.GameObjects.GameObject){
    var type:string = bullet.getData("type");
    if(type === "pburst_bullet"){
        bullet.getData("explode").remove();
    }
    else if(type === "pturret"){
        play_animation_at_location("turret_disappear", bullet.x, bullet.y)
    }
    bullet.destroy();
}
function spawn_enemy(type:string, params : any,  x : number, y : number){
    var images:typeof Phaser.Game.image[] = [];
    var timers:typeof Phaser.Time.TimerEvent[]= [];
    if(type === "enemy1"){
        var new_enemy = enemies.create(x, y, "enemy1");
        new_enemy.setData("hp", 1);
        new_enemy.setData("max_hp", 1);
        timers.push(scene.time.addEvent({delay : 1000, loop: true, callback:shoot_bullet, args : [new_enemy, "bullet1"]}) );
    }
    else if (type === "spawner1"){
        var new_enemy = enemies.create(x, y, "spawner1");
        new_enemy.setData("hp", 5);
        new_enemy.setData("max_hp", 5);
        // spawn enemies
        timers.push(scene.time.addEvent({delay : 1000, loop:true, callback:function(e){spawn_enemy("enemy1", {}, e.x, e.y)}, args : [new_enemy]}))
        console.log(params.target);
        // move in that direction
        scene.physics.moveTo( new_enemy, params.direction[0]-x, params.direction[1]-y, params.speed);
        // stop when enough time passes
        
        var timer=  scene.time.addEvent({
            delay : params.time, 
            callback: function(e){e.setVelocityX(0); e.setVelocityY(0)}, 
            args : [new_enemy]
        })
        timers.push(timer);
    }else {
        throw "unknown type" + type;
    }
    new_enemy.setData("type", type);
    new_enemy.setData("images", images); // image, x ,y
    new_enemy.setData("timers", timers);
}
function shoot_bullet(enemy : typeof Phaser.GameObjects.GameObject, type:string){
    if(type === "bullet1"){
        var bullet = bullets.create(enemy.x, enemy.y, "bullet1");
        scene.physics.moveToObject(bullet, player, 300);
    }
    bullet.setData("type", type);
}

function player_shoot_bullet_up(type:string, params :{[key:string]:any}= {}, rotation:number=0){    
    // i (cos(x) + i sin(x) ) = -sin(x) + i cos(x)
    player_shoot_bullet(type,params, -Math.sin(rotation), -Math.cos(rotation) );
}

function player_shoot_bullet(type : string,params:{[key:string]:any}, x: number, y : number, start_x : number=player.x, start_y : number=player.y){ // x and y are direction, start_x and start_y are location of bulllet
    var angle : number = 0;
    if(x != 0 || y != 0){
        var angle : number = Math.atan2(y, x);        
    }
    
    if(type === "pbullet1"){
        var bullet = player_bullets.create(start_x, start_y, "pbullet1");
        var bullet_speed = 1200;    
        bullet.setVelocityX(bullet_speed * Math.cos(angle));
        bullet.setVelocityY(bullet_speed * Math.sin(angle));
    }
    if(type === "pburst_bullet"){
        var bullet = player_bullets.create(start_x, start_y, "pburst_bullet");
        var bullet_speed = 300;
        bullet.setVelocityX(bullet_speed * Math.cos(angle));
        bullet.setVelocityY(bullet_speed * Math.sin(angle));
        //console.log(bullet);        
        bullet.setData("explode", scene.time.addEvent({
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
        var bullet = player_bullets.create(start_x, start_y, "turret");
        bullet.setVelocityX(0);
        bullet.setVelocityY(0);
        var times:number= 0;
        for(var i = 3000; i < 6000; i+=100){
            
            scene.time.addEvent({
                callback:player_shoot_bullet,
                args : ["pbullet1", {},Math.cos(times), -Math.sin(times), bullet.x, bullet.y],
                delay : i
            })
            times += 0.52;
        }
        scene.time.addEvent({
            callback:destroy_bullet,
            args:[bullet],
            delay:6100,

        })
    }
    bullet.setData("type", type);
}
function remove_player_bullet(name:string){
    if(player_bullets_intervals[name] == undefined){
        return;
    }
    player_bullets_intervals[name].remove();
    player_bullets_intervals[name] = undefined;
}

function update_player_bullets_helper(name : string, type : string, params:{[key:string]:any}, delay : number, rotation : number = 0, priority = 0){
    if(player_bullets_priorities[name] === undefined || player_bullets_priorities[name] < priority){
        player_bullets_priorities[name] = priority;
        update_player_bullets({
            [name]:{
                delay : delay,
                loop:true,
                callback:player_shoot_bullet_up,
                args:[type,params, rotation]
            }
        })
    }
}

function update_player_bullets(new_stuff:any){
    console.log(new_stuff);
    for(var thing of Object.keys(new_stuff)){
        // cancel the old intervals
        if(player_bullets_intervals[thing] !== undefined){
            player_bullets_intervals[thing].remove();
        }
        player_bullets_intervals[thing] = scene.time.addEvent(new_stuff[thing]);
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
    }
    // upgrades
    for(var item of game_state.upgrades){
        purchasable_upgrades[item].forEach((x) => 
            update_player_bullets_helper(...x)
        );
    }
}
function update (this:any)
{   
    // enemies
    for(var item of enemies.children.entries){
        push_in(item)
        for(var image of item.getData("images")){
           // console.log(item.x + image.x);
            console.log(item.y)
            console.log(image.y)
            console.log(image.key);
            image.image.setX(item.x + image.x);
            image.image.setY(item.y + image.y);
            image.image.depth = 1;
        }
    }
    for(var item of bullets.children.entries){
        if(out_of_bounds(item)){
            item.destroy();
        }
    }
    // scroll background
    bg.tilePositionY -= 1;
    // destroy all old bullets
    for(var item of player_bullets.children.entries){
        if(out_of_bounds(item)){
            destroy_bullet(item);
        }
    }
    push_in(player);
    if(keys["mouseX"] != undefined && keys["mouseY"] != undefined){
        var distance = Phaser.Math.Distance.Between(player.x, player.y, keys["mouseX"], keys["mouseY"] );
        if(distance > 5){
            scene.physics.moveTo(player, keys["mouseX"], keys["mouseY"], 300);
        } else{
            scene.physics.moveTo(player, keys["mouseX"], keys["mouseY"], 0, 0);
    //        player.y = keys.mouseY;
//            scene.physics.moveTo(player, keys["mouseX"], keys["mouseY"], 10);
        }
    }

    
}

var keys : any = {};

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
        scene.time.paused = true;
    }
}

function unpause(){
    if(scene !== undefined){
        scene.physics.resume();
        scene.time.paused = false;
    } 
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
            physics: {
                default: 'arcade',
                arcade: {
                    fixedStep : true,
                    debug: false,
                    fps: 30
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



	}
    componentWillUnmount(){
        pause();
    }
    componentDidUpdate(){
        if(this.state.display === "game"){
            this.gameRef.current.appendChild(this.game.canvas);
        }
    }
	componentDidMount(){
		this.gameRef.current.appendChild(this.game.canvas);
        unpause();
	}
	render():any{
        if(this.state.display !== "game"){
            pause();
            var buttonObj = <button onClick={function(this:React.Component){this.setState({display:"game"})}.bind(this)}>Back</button>

            if(this.state.display == "upgrades"){
                return (<>
                    {buttonObj}<br />
                    Upgrades <br />
                    {
                        function(this:React.Component){ 
                            var output:Object[] = [];
                            for(var item of Object.keys (purchasable_upgrades)){
                                // if this upgrade is not already there
                                if(game_state.upgrades.indexOf(item) === -1){
                                    output.push(<button onClick={function(this:[string, React.Component]){game_state.upgrades.push(this[0]);
                                    this[1].forceUpdate();
                                }.bind([item, this])}>{item}</button>)
                                }
                                
                            }
                            return output;
                        }.bind(this)()
                    }
                    
                </>) as any
            }
        } else { 
            unpause();
            return <div>
            <button onClick={function(this:React.Component){this.setState({display:"upgrades"})}.bind(this)}>Upgrades</button>
            {game_state.counter} items collected, {game_state.bullets} bullet hits
                <div ref={this.gameRef} id="game"></div>
            </div>
        }
	}
	
}


export default Game; 


