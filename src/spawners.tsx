
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
    },"base",0, desc, im_name], 

*/
var spawners:spawners= {
    "base" : [{
        delay : 1000,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",0, 'Basic Enemy','enemy1'], 
    "black hole layer" : [{
        delay : 6000,
        type : "bh layer",
        params : {"fire":4000,hp:2, strength:240, speed : 100, duration : 3000},
        x : () => -10,
        y : () => Math.random() * 100 + 100,
        loop:true
    },"bh layer",0, 'Puts down black holes to suck you in','black_hole_layer' ], 

    "rapid_spawn" : [{
        delay : 500,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",1, "Spawns enemies much faster", "enemy1"], 
    "multi" : [{
        delay : 1400,
        type : "multi",
        params : {"fire":1500,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 0, "Shoots 3 bullets at once", "enemy2"],
    "follow" : [{
        delay : 1500,
        type : "follow",
        params : {"fire":1600,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "follow", 0, "Shoots bullets that follow you", "enemy3"],
    "spewer" : [{
        delay : 1300,
        type : "spewer",
        params : {"fire":4300,"spread_amount":10, spread_angle : 0.1,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"spewer",0, "Shoots 10 bullets at once, but slow fire rate"], 


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
                }},
                x : () => Math.random() * game_width,
                y : () => 0,
                loop:true
        },"spawner1", 1, "Spawns enemies", "spawner1"
    ],
    "laser" : [{
        delay : 6000,
        type : "laser",
        params : {"delay":4000,hp:3},
        x : () => Math.random() * game_width,
        y : () => -10,
        loop:true
    },"laser",0, "charges for a while then shoots lasers", "laser"], 
}
export default spawners