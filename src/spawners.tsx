
import spawner_update from './interface spawner_update.tsx';

const game_width= 800;

interface spawners {
    [key: string]:spawner_update[]

}

// keys in spawn_timer dict is (key here)_(index)
var spawners:spawners= {
    "base" : [[{
        delay : 1000,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"base",0]], 
    "rapid_spawn" : [[{
        delay : 1000,
        type : "enemy1",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },"rapid_spawn",0]], 
    "multi" : [[{
        delay : 1000,
        type : "multi",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "multi", 0]],
    "follow" : [[{
        delay : 1000,
        type : "follow",
        params : {"fire":1000,hp:1},
        x : () => Math.random() * game_width,
        y : () => 0,
        loop:true
    },
    "follow", 0]],
    "spawner":[
        [{
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
        },"spawner1", 1]
    ]
}
export default spawners