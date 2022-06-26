

function type_assert(object, type_check){
    if(typeof type_check === "string"){
        if(typeof object != type_check){
            console.log(object);
            console.log(type_check);
            throw "type doesn't match"
        }
    }

    if(typeof type_check === "object"){
        if(typeof object !== "object"){
            console.log(object);
            console.log(type_check);
            throw "object is not an object";
        }
        for(var key of Object.keys(type_check)){
            if(type_check[key] === "exists"){
                if(object[key] === undefined){
                    console.log(object);
                    console.log(key)
                    throw "object doesn't have key"
                }
            }

            if(type_check[key] === "string"){
                if(typeof object[key] !== "string"){
                    console.log(object);
                    console.log(key)
                    throw "not a string"
                }
            }
            if(type_check[key] === "number"){
                if(typeof object[key] !== "number"){
                    console.log(object);
                    console.log(key)
                    throw "not a number"
                }
            }
            if(type_check[key] === "object"){
                if(typeof object[key] !== "object"){
                    console.log(object);
                    console.log(key)
                    throw "not an object"
                }
            }            
            if(typeof type_check[key] === "object"){
                type_assert(object[key], type_check[key] )
            }            
       }
    }
}

export default type_assert;