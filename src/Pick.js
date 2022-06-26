
import spawners from './spawners.tsx';
import React from 'react';
import {game_width , game_height,game_box_top,  game_box_left, fps} from "./constants"
import upgrades from "./upgrades_list"
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
        var dist = this.props.game_state.pick_side_times.length - this.props.game_state.pick_side_index-2;
        return <div>
            <h1> Pick a side ({dist} pick(s) to boss)</h1>
            <div style={{width:280, height:560, border:"1px solid black", position :"absolute", top:game_box_top, left:game_box_left,padding:10,backgroundColor : "#ccccff"}}><br />
                <button onClick={function(){this.click(0)}.bind(this)}>Pick (Q)</button>
                <img src={"images/enemies/" + data[0][6]+".png" }/>  <br />
                {data[0][5]}
            </div>
            <div style={{width:280, height:560, border:"1px solid black", position :"absolute", top:game_box_top, left:game_box_left+300,padding:10, backgroundColor : "#ffcccc"}}>
            <button onClick={function(){this.click(1)}.bind(this)}>Pick (E)</button> 
            <img src={"images/enemies/" + data[1][6]+".png" }/><br />
                {data[1][5]}
            </div>

        </div>
    }
    
}
export default Pick;