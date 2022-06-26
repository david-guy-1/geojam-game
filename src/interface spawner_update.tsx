/*
delay : amount of time between spawns
type : type of enemy to spawn
params : params to spawn with, ignored if paramsFn is defined
paramsFn : 
x and y : where to spawn, arg is params
repeat : number of times to spawn
loop : if we should spawn multiple times or just once.

string : key in spawners list
number : priority (if two spawners with the same key exist, the one with lower priority, or older one if same priorty, is removed. )
number : difficulty 
string[] : prerequisites 
string : description
second string : image name to display, matches enemies.create in spawner
*/
interface spawner_update [{
        delay : number,
        type :string,
        params:any,
        paramsFn? : () => any
        x: (a:any) => number,
        y: (a:any) => number,
        repeat? : number,
        loop : boolean
    }, string, number,number, string[], string? , string? ]

export default spawner_update;