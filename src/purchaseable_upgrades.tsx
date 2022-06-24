interface purchasable_upgrades {
    [key: string]: [string, string ,{[key:string]:any}, (() => any)? , number?, number?, number?][]
}
// key = upgrade name , value : things we apply to update_player_bullets_helper 


// type declaration is : function update_player_bullets_helper(name : string, type : string, params:{[key:string]:any} , paramsFn? : () => any , delay : number = 0, rotation : number = 0, priority = 0){

var purchasable_upgrades:purchasable_upgrades= {
    "base":[["pbullet1", "pbullet1",{}, undefined, 500, 0]],
    "turret" : [["pturret", "pturret",{},undefined, 4000, 0]],
    "burst" : [["pburst_bullet","pburst_bullet",{number:5},undefined, 3000, 0]],
    "burst 2" : [["pburst_bullet","pburst_bullet",{number:10},undefined, 1200, 0, 1]],
    "spread shot":[["pbullet1", "pbullet1",{}, undefined, 400,0,1],["pbullet1_2", "pbullet1",{},undefined,  400, 0.5],["pbullet1_3", "pbullet1",{},undefined,  400, -0.5]]
    
}
export default purchasable_upgrades