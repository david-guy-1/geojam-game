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
        frameWidth: 120,
        frameHeight: 120,
        startFrame: 0,
        endFrame: 9
    },
    "enemy1_boom":{
            frameWidth: 40,
            frameHeight: 40,
            startFrame: 0,
            endFrame: 4
    },
    "multi_boom":{
            frameWidth: 40,
            frameHeight: 40,
            startFrame: 0,
            endFrame: 4
    },
    "follow_boom":{
        frameWidth: 40,
        frameHeight: 40,
        startFrame: 0,
        endFrame: 4
    },
    "turret_disappear":{
        frameWidth: 23,
        frameHeight: 23,
        startFrame: 0,
        endFrame: 4
}
}
export default spritesheets;