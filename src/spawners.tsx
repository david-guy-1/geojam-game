
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
        delay : 4000,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",0, 1, [], 'Basic Enemy','enemy1'], 
  
    "rapid_spawn" : [{
        delay : 2500,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",1, 0.8, ["base"], "Spawns enemies much faster", "enemy1"], 

    "rapid_spawn_2" : [{
        delay : 1500,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",1, 1.2, ["rapid_spawn"], "Spawns enemies much faster", "enemy1"], 


    "black hole layer" : [{
        delay : 6000,
        type : "bh layer",
        params : {"fire":4000,hp:2, strength:140, speed : 100, duration : 3000},
        x : () => -10,
        y : () => Math.random() * 100 + 100,
        loop:true
    },"bh layer",0,1.5, [] ,'Puts down black holes to suck you in','black_hole_layer' ], 

    "black hole layer 2" : [{
        delay : 4000,
        type : "bh layer",
        params : {"fire":3000,hp:2, strength:240, speed : 100, duration : 3000},
        x : () => -10,
        y : () => Math.random() * 100 + 100,
        loop:true
    },"bh layer",1,2, ["black hole layer"] ,'Makes stronger black holes','black_hole_layer' ], 


    "multi" : [{
        delay : 3400,
        type : "multi",
        params : {"fire":1500,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 0,0.9, [], "Shoots 3 bullets at once", "enemy2"],

    "multi 2" : [{
        delay : 2400,
        type : "multi",
        params : {"fire":1500,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 0,0.8, ["multi"], "Multi shooter spawns faster", "enemy2"],  

    "follow" : [{
        delay : 1500,
        type : "follow",
        params : {"fire":1600,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "follow", 0,1.6,[], "Shoots bullets that follow you", "enemy3"],


    "spewer" : [{
        delay : 1300,
        type : "spewer",
        params : {"fire":4300,"spread_amount":10, spread_angle : 0.1,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"spewer",0, 2,[],"Shoots 10 bullets at once, but slow fire rate"], 

    "spewer 2" : [{
        delay : 1300,
        type : "spewer",
        params : {"fire":2300,"spread_amount":10, spread_angle : 0.1,hp:2},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"spewer",1, 1.6,["spewer"],"Spewer rate of fire increased"], 


    "spawner":[
        {
                delay : 5000,
                type : "spawner1",
                params: {},
                paramsFn : function(){return {
                    direction : [Math.random() *2-1, 1],
                    speed:100,
                    time:1000,
                    delay:1000,
                    hp:5,
                    child_type: "enemy1",
                    child_params : {fire:1000, "hp":1}
                }},
                x : () => Math.random() * game_width,
                y : () => 0,
                loop:true
        },"spawner1", 0, 1.7, [], "Spawns enemies", "spawner1"
    ],

    "spawner 2":[
        {
                delay : 5000,
                type : "spawner1",
                params: {},
                paramsFn : function(){return {
                    direction : [Math.random() *2-1, 1],
                    speed:100,
                    time:1000,
                    delay:1000,
                    hp:5,
                    child_type: "multi",
                    child_params : {fire:1000, "hp":1}
                }},
                x : () => Math.random() * game_width,
                y : () => 0,
                loop:true
        },"spawner1", 1, 1.7, ["spawner"], "Spawner now spawns multishot enemies", "spawner1"
    ],


    "laser" : [{
        delay : 6000,
        type : "laser",
        params : {"delay":4000,hp:3},
        x : () => Math.random() * game_width,
        y : () => -10,
        loop:true
    },"laser",0,1, [], "Charges for a while then shoots lasers", "laser"], 

    "laser 2" : [{
        delay : 4000,
        type : "laser",
        params : {"delay":3000,hp:3},
        x : () => Math.random() * game_width,
        y : () => -10,
        loop:true
    },"laser",1,2, ["laser"], "Spawns faster and charge time decreased", "laser"], 

}
export default spawners