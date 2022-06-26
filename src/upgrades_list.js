// name, x, y, description, prerequisites

var upgrades = [
	// burst
	["main spread",[127,59,56,184],"Fire 3 bullets at once",[]],
        ["main rate",[56,184,196,184],"Fire more rapidly",[]],
        ["player speed",[196,184,127,59],"Ship moves faster",[]],

	// turret
	["bullet size",[385,41,306,105],"Bigger bullets",[]],
	
	
        ["main rate 2",[306,105,337,203],"Fire even more rapidly",["main rate"]],
        ["burst speed",[337,203,439,203],"Burst fire more often",["main spread", "main rate", "player speed"]],
        ["burst bullets",[439,203,464,105],"Burst fires more bullets",["main spread", "main rate", "player speed"]],
        ["invincibility",[464,105,385,41],"Invinciibility time after getting hit lasts longer",["main spread", "main rate", "player speed"]],

	// laser
        // JSON.stringify(x.map((x) => x[0]))
	//["main spread 2","main rate 2","burst speed","burst bullets","invincibility"]

	//["name", [], "desc", []]
	["main spread 2",[62,313,135,334],"Fire 5 bullets at once",["main spread", "burst speed"]],
	["main rate 3",[135,334,209,313],"Fires super fast",["main rate 2"]],
	["main spread 3",[209,313,189,383],"Fires 7 bullets at once",["main spread 2"]],
	["turret spawn",[189,383,209,456],"Drop turrets more often",["main spread 2","main rate 2","burst speed","burst bullets","invincibility"]],
	["turret delay",[209,456,135,440],"Turret has lower delay before firing",["main spread 2","main rate 2","burst speed","burst bullets","invincibility"]],
	["turret bullets",[135,440,62,456],"Turret shoots more bullets",["main spread 2","main rate 2","burst speed","burst bullets","invincibility"]],
	["burst speed 2",[62,456,83,383],"Burst fires even more often",["burst speed"]],
	["burst bullets 2",[83,383,62,313],"Burst fires even more bullets",["burst bullets"]],
	

    ["seeker bullets",[407,262,437,347],"Shoot bullets that seek out the enemy",["main spread 3"]],
	["burst speed 3",[437,347,531,347],"Shoots bursts even faster",["burst speed 2"]],
	["burst double",[531,347,455,400],"Shoots two bursts at once",["burst bullets 2"]],
	["turret spawn 2",[455,400,486,482],"Drop turrets even faster",["turret spawn"]],
	["turret bullets 2",[486,482,407,430],"Turret shoots even more bullets",["turret bullets"]],
	["bullet size 2",[407,430,336,482],"Bullet size is bigger",["bullet size"]],
	["player speed 2",[336,482,367,400],"Ship moves faster",["player speed"]],
	["laser duration",[367,400,286,347],"Laser stays on the screen for longer",["bullet size","main rate 3","main spread 3","turret spawn","turret delay","turret bullets","burst speed 2","burst bullets 2"]],
	["laser size",[286,347,382,347],"Laser is bigger",["bullet size","main rate 3","main spread 3","turret spawn","turret delay","turret bullets","burst speed 2","burst bullets 2"]],
	["laser rate",[382,347,407,262],"Fires lasers faster",["bullet size","main rate 3","main spread 3","turret spawn","turret delay","turret bullets","burst speed 2","burst bullets 2"]]
	// 

]

export default upgrades;
/*
function update(package){
	for (var i=0 ; i < package.length; i++){
		if( i == package.length - 1){
			var next_x = package[0][1][0]
			var next_y = package[0][1][1]
		} else {
			var next_x = package[i+1][1][0]
			var next_y = package[i+1][1][1]
		}
		package[i][1].push(next_x)
		package[i][1].push(next_y)
	}
}

*/