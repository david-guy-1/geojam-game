interface spawner_update [{
        delay : number,
        type :string,
        params:any,
        paramsFn? : () => any
        x: (a:any) => number,
        y: (a:any) => number,
        repeat? : number,
        loop : boolean
    }, string, number]

export default spawner_update;