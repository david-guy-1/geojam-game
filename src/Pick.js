
import spawners from './spawners.tsx';
import React from 'react';
class Pick extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.click = this.click.bind(this);
        this.handle_event = this.handle_event.bind(this);
    }
    click(e){
        this.props.return_fn(this.props.game_state.next_pick_choices[e]);
    }
    handle_event(e){
        if(e.code === "KeyQ"){
            this.click(0);
        }
        if(e.code === "KeyE"){
            this.click(1);
        }
    }
    componentDidMount(){
        document.addEventListener("keyup", this.handle_event);
    }
    componentWillUnmount(){
        document.removeEventListener("keyup", this.handle_event);
    }

    render(){
        var choices  = this.props.game_state.next_pick_choices;
        var data = [spawners[choices[0]], spawners[choices[1]]]
        return <div>
            <h1> Pick a side</h1>
            <div style={{width:600, height:300, border:"1px solid black"}}><br />
                <button onClick={function(){this.click(0)}.bind(this)}>Pick (Q)</button>
                <img src={"images/enemies/" + data[0][4]+".png" }/>  <br />
                {data[0][3]}
            </div><br />
            <div style={{width:600, height:300, border:"1px solid black"}}>
            <button onClick={function(){this.click(1)}.bind(this)}>Pick (E)</button> 
            <img src={"images/enemies/" + data[1][4]+".png" }/><br />
                {data[1][3]}
            </div>

        </div>
    }
    
}
export default Pick;