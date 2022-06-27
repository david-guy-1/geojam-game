
import { game_height } from './constants';
import spawner_update from './interface spawner_update.tsx';

const game_width= 800;

interface spawners {
    [key: string]:spawner_update

}

// keys in spawn_timer dict is (key here)_(index)

/*
copy and paste the following
    "base" : [{
        delay : 1000,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",0, diff, preq, desc, im_name], 

*/
var spawners:spawners= {
    "base" : [{
        delay : 1500,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",0, 1, [], 'Basic Enemy','enemy1'], 
  
    "rapid_spawn" : [{
        delay : 1200,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",1, 0.8, ["base"], "Spawns enemies much faster", "enemy1"], 

    "rapid_spawn_2" : [{
        delay : 1000,
        type : "enemy1",
        params : {"fire":1000,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",2, 1.2, ["rapid_spawn"], "Spawns enemies much faster and they take 2 hits to kill", "enemy1"], 


    "multi" : [{
        delay : 1500,
        type : "multi",
        params : {"fire":1500,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 0,0.9, [], "Shoots 3 bullets at once", "enemy2"],

    "multi 2" : [{
        delay : 1100,
        type : "multi",
        params : {"fire":1500,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 1,0.8, ["multi"], "Multi shooter spawns faster, and takes 2 hits to kill", "enemy2"],  

    "multi 3" : [{
        delay : 700,
        type : "multi",
        params : {"fire":1000,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 2,1.3, ["multi 2"], "Multi shooter spawns even faster and also shoots faster", "enemy2"],  

    "follow" : [{
        delay : 1500,
        type : "follow",
        params : {"fire":1600,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "follow", 0,1,[], "Shoots bullets that follow you", "enemy3"],

    "follow 2" : [{
        delay : 1200,
        type : "follow",
        params : {"fire":1300,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "follow", 1,1,["follow"], "Follow-bullet enemies spawn faster and shoot faster, and take 2 hits to kill", "enemy3"],

    "follow 3" : [{
        delay : 1000,
        type : "follow",
        params : {"fire":1200,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "follow", 2,1.6,["follow 2"], "Follow-bullet enemies spawn faster, shoot faster", "enemy3"],


    
    "black hole layer" : [{
        delay : 3000,
        type : "bh layer",
        params : {"fire":4000,hp:2, strength:140, speed : 100, duration : 3000, bomb_radius : 75},
        x : () => -10,
        y : () => Math.random() * 100 + 100,
        loop:true
    },"bh layer",0,1.2, [] ,'Throws bombs that explode on you, and puts down black holes to suck you in','black_hole_layer' ], 

    "black hole layer 2" : [{
        delay : 2000,
        type : "bh layer",
        params : {"fire":3000,hp:2, strength:240, speed : 100, duration : 3000, bomb_radius : 125},
        x : () => -10,
        y : () => Math.random() * 100 + 100,
        loop:true
    },"bh layer",1,2, ["black hole layer"] ,'Makes stronger black holes and bombs','black_hole_layer' ], 




    "spewer" : [{
        delay : 1100,
        type : "spewer",
        params : {"fire":3300,"spread_amount":10, spread_angle : 0.1,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"spewer",0, 1.8,[],"Shoots 10 bullets at once, but slow fire rate", "spewer"], 

    "spewer 2" : [{
        delay : 800,
        type : "spewer",
        params : {"fire":2300,"spread_amount":10, spread_angle : 0.1,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"spewer",1, 0.5,["spewer"],"Spewer rate of fire increased", "spewer"], 

    "spewer 3" : [{
        delay : 800,
        type : "spewer",
        params : {"fire":2300,"spread_amount":10, spread_angle : 0.1,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"spewer",2, 1,["spewer 2"],"Spewer has 2 hp", "spewer"], 



    "spawner":[
        {
                delay : 4000,
                type : "spawner1",
                params: {},
                paramsFn : function(){return {
                    direction : [Math.random() *2-1, 1],
                    speed:100,
                    time:1000,
                    delay:1000,
                    hp:3,
                    child_type: "enemy1",
                    child_params : {fire:1000, "hp":1}
                }},
                x : () => Math.random() * game_width,
                y : () => 0,
                loop:true
        },"spawner1", 0, 2.3, [], "Spawns enemies", "spawner1"
    ],

    "spawner 2":[
        {
                delay : 4000,
                type : "spawner1",
                params: {},
                paramsFn : function(){return {
                    direction : [Math.random() *2-1, 1],
                    speed:100,
                    time:1000,
                    delay:700,
                    hp:3,
                    child_type: "enemy1",
                    child_params : {fire:1000, "hp":1}
                }},
                x : () => Math.random() * game_width,
                y : () => 0,
                loop:true
        },"spawner1", 1, 2.3, ["spawner"], "Spawns enemies faster", "spawner1"
    ],


    "spawner 3":[
        {
                delay : 3000,
                type : "spawner1",
                params: {},
                paramsFn : function(){return {
                    direction : [Math.random() *2-1, 1],
                    speed:100,
                    time:1000,
                    delay:700,
                    hp:3,
                    child_type: "multi",
                    child_params : {fire:1000, "hp":1}
                }},
                x : () => Math.random() * game_width,
                y : () => 0,
                loop:true
        },"spawner1", 2, 0.8, ["spawner 2"], "Spawner now spawns multishot enemies", "spawner1"
    ],


    "laser" : [{
        delay : 1200,
        type : "laser",
        params : {"delay":4000,hp:3},
        x : () => Math.random() * game_width,
        y : () => -10,
        loop:true
    },"laser",0,1, [], "Charges for a while then shoots lasers", "laser"], 

    "laser 2" : [{
        delay : 900,
        type : "laser",
        params : {"delay":3000,hp:3},
        x : () => Math.random() * game_width,
        y : () => -10,
        loop:true
    },"laser",1,0.4, ["laser"], "Spawns faster and charge time decreased", "laser"], 

    "laser 3" : [{
        delay : 700,
        type : "laser",
        params : {"delay":1000,hp:3},
        x : () => Math.random() * game_width,
        y : () => -10,
        loop:true
    },"laser",2,0.4, ["laser 2"], "Spawns even faster", "laser"], 



    "strafe" :  [{
        delay : 2500,
        type : "strafe",
        params : {"fire":1000,hp:2,speed:100},
        x : () => game_width-50,
        y : () => Math.random() * 100+100,
        loop:true
    },"strafe",0, 1, [], "Moves back and forth at the top", "strafe"], 

    "strafe 2" :  [{
        delay : 1500,
        type : "strafe",
        params : {"fire":600,hp:3,speed:200},
        x : () => game_width-50,
        y : () => Math.random() * 100+100,
        loop:true
    },"strafe",1, 0.4, ["strafe"], "Strafer moves faster and shoots more often, and takes 3 hits to kill", "strafe"], 

    "strafe 3" :  [{
        delay : 800,
        type : "strafe",
        params : {"fire":400,hp:3,speed:200},
        x : () => game_width-50,
        y : () => Math.random() * 100+100,
        loop:true
    },"strafe",2, 0.9, ["strafe 2"], "Strafer spawn time decreased and they fire faster", "strafe"],


    "energy_ball_thrower" :  [{
        delay : 2000,
        type : "energy_ball_thrower",
        params : {"fire":1000,hp:1,speed:200,number_of_bullets:6},
        x : () => -50,
        y : () => Math.random() * 100+100,
        loop:true
    },"energy_ball_thrower",0, 1.3, [], "Throws energy balls that explode", "energy_ball_thrower"], 

    "energy_ball_thrower 2" :  [{
        delay : 1500,
        type : "energy_ball_thrower",
        params : {"fire":700,hp:2,speed:200,number_of_bullets:10},
        x : () => -50,
        y : () => Math.random() * 100+100,
        loop:true
    },"energy_ball_thrower",1, 0.7, ["energy_ball_thrower"], "Energy balls come faster and explode into more bullets. Thrower also takes 2 hits to kill", "energy_ball_thrower"], 

    "energy_ball_thrower 3" :  [{
        delay : 1000,
        type : "energy_ball_thrower",
        params : {"fire":500,hp:3,speed:200,number_of_bullets:20},
        x : () => -50,
        y : () => Math.random() * 100+100,
        loop:true
    },"energy_ball_thrower",2, 1.2, ["energy_ball_thrower 2"], "Energy balls come even faster and explode into more bullets. Also they now have 3 hp", "energy_ball_thrower"], 


    "wall" :  [{
        delay : 4500,
        type : "wall",
        params : {hp:15},
        x : () => 400,
        y : () => 200 + Math.random() * 70,
        loop:true
    },"wall",0, 1.4, [], "Wall doesn't attack, but it blocks your bullets ", "wall_mini"], 

    "wall 2" :  [{
        delay : 4000,
        type : "wall",
        params : {hp:25},
        x : () => 400,
        y : () => 200 + Math.random() * 70,
        loop:true
    },"wall",1, 0.7, ["wall"], "Wall has higher HP now ", "wall_mini"], 

    "from below" :  [{
        delay : 2500,
        type : "enemy1",
        params : {hp:1, "fire" : 1000},
        x : () => Math.random() * game_width,
        y : () => game_height,
        loop:true
    },"from below",0, 1.4, [], "Spwans from below", "enemy1"], 
    
    "from below 2" :  [{
        delay : 2000,
        type : "multi",
        params : {hp:2, "fire" : 900},
        x : () => Math.random() * game_width,
        y : () => game_height,
        loop:true
    },"from below",1 , 0.7, ["from below", "multi"], "multishots come from below", "enemy2"], 
    
    "from below 3" :  [{
        delay : 2000,
        type : "spewer",
        params : {hp:3, "fire" : 900, spread_amount : 5, spread_angle : 0.2},
        x : () => Math.random() * game_width,
        y : () => game_height,
        loop:true
    },"from below",2 , 1, ["from below 2", "spewer"], "Hard to kill spewers come from below", "enemy3"],

    "from below 4" :  [{
        delay : 2000,
        type : "spewer",
        params : {hp:4, "fire" : 900, spread_amount : 12, spread_angle : 0.2},
        x : () => Math.random() * game_width,
        y : () => game_height,
        loop:true
    },"from below",3 , 1, ["from below 3"], "Spewers shoot even faster!", "enemy3"],

    
}
export default spawners