
import React from 'react';
import upgrades_list from "./upgrades_list";
import * as c from "./canvasDrawing.js";
import {game_width , game_height,game_box_top,  game_box_left, fps} from "./constants"

class Upgrade extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.lst = new Set();
        this.canvasRef = React.createRef();
        this.rightSideRef = React.createRef();
        this.rightSideRef2 = React.createRef();
        this.upgrades = [];
        this.current_selected = 0;
        while(this.props.game_state.upgrades.indexOf(upgrades_list[this.current_selected][0] ) !== -1){
            this.current_selected += 1
        }
        if(this.current_selected == upgrades_list.length){
            this.current_selected = 0;
        }
        this.handle_event = this.handle_event.bind(this);
        this.scroll_left = this.scroll_left.bind(this);
        this.scroll_right = this.scroll_right.bind(this);
        this.has_in_list = this.has_in_list.bind(this);
        
        this.buy = this.buy.bind(this);
        this.reset = this.reset.bind(this);
        this.go_back = this.go_back.bind(this);
        // return takes in a list
        
    }
    scroll_left(){
        var max = upgrades_list.length
        this.current_selected -= 1
        if(this.current_selected < 0){
            this.current_selected = max-1;
        }
        this.forceUpdate();
    }
    scroll_right(){
        var max = upgrades_list.length
        this.current_selected += 1
        if(this.current_selected >= max){
            this.current_selected = 0;
        }       
        this.forceUpdate();
    }
    buy(){
        var this_upgrades = this.props.game_state.upgrades
        var to_buy = upgrades_list[this.current_selected];
        var prereqs = to_buy[3];
        var can_buy = true;
        if(this.has_in_list(to_buy[0])){
            return;
        }
        for(var item of prereqs){
            if(!this.has_in_list(item)){
                can_buy = false;
                break;
            }
        }
        if(can_buy && this.upgrades.length + 1 <= this.props.game_state.counter){
            this.upgrades.push(to_buy[0]);
        }
        this.forceUpdate();
    }
    reset(){
        this.upgrades = [];
        this.forceUpdate();
    }
    handle_event(e){
        var max = upgrades_list.length
        if(e.code === "KeyQ"){
            this.scroll_left();
        }
        if(e.code === "KeyE"){
            this.scroll_right();
        }
        if(e.code === "KeyW"){  
            this.buy();
        }
        if(e.code === "Space"){  
            this.reset();
        }
        if(e.code === "Enter" || e.code === "NumpadEnter"){
            this.go_back();
        }
    }
    go_back(){
        this.props.return_fn(this.upgrades);
    }
    componentDidUpdate(){
        this.update_canvas();
    }
    componentDidMount(){
        this.update_canvas();
        document.addEventListener("keyup", this.handle_event);
    }
    componentWillUnmount(){
        document.removeEventListener("keyup", this.handle_event);
    }
    has_in_list(s){
        var this_upgrades = this.props.game_state.upgrades
        return this_upgrades.indexOf(s) !== -1 ||
        this.upgrades.indexOf(s) !== -1 
    }

    update_canvas(){
        var ctx=  this.canvasRef.current.getContext("2d");
       // ctx.clearRect(0,0,1000,1000);
        var this_upgrades = this.props.game_state.upgrades
        for(var upgrade of upgrades_list){
            var color ;
            if(upgrades_list[this.current_selected][0] === upgrade[0]){
                color = "red"
            }
            else if(this_upgrades.indexOf(upgrade[0]) !== -1 ){
                color = "blue" ;
            } else if(this.upgrades.indexOf(upgrade[0]) != -1){
                color = "yellow";
            } else {
                color = "white";
            }
            c.drawLine(ctx, upgrade[1][0], upgrade[1][1], upgrade[1][2], upgrade[1][3], color, 4)
        }
    }
    render(){

        // <button onClick={function(){}.bind(this)}> Go back </button><br />
        var right_width = 200;
        var right_bottom_offset = 200;
        var top_buttons_offset = 40;
        var selected = upgrades_list[this.current_selected]
        var selected_name = selected[0]
        var selected_desc = selected[2]
        var selected_prereqs = selected[3]
        var already_bought = false;
        if(this.has_in_list(selected_name)){
            var already_bought = true;
        }
        
        return <div>
            <div style={{"position":"absolute", "top":game_box_top-top_buttons_offset, left:game_box_left, width:game_width, height : top_buttons_offset}}>

                <button style={{height:top_buttons_offset}} onClick={this.scroll_left}>Left(Q)</button>
                <button style={{height:top_buttons_offset}} onClick={this.scroll_right}>Right(E)</button>
                <button style={{height:top_buttons_offset}} onClick={this.buy}>Buy(W)</button>
                <button style={{height:top_buttons_offset}} onClick={this.reset}>Reset(Space)</button>
                <button style={{height:top_buttons_offset}} onClick={this.go_back}>Back To Game(Enter)</button>
                

            </div>
            <img src="images/upgrades_bg.png"   width={game_width-right_width} height={game_height} style={{"position":"absolute", "top":game_box_top, left:game_box_left}}
            />

            <canvas ref={this.canvasRef} width={game_width-right_width} height={game_height} style={{"position":"absolute", "top":game_box_top, left:game_box_left}}> 
            </canvas>

        
            <div ref={this.rightSideRef} width={right_width} height={right_bottom_offset}  style={{"position":"absolute", "top":game_box_top, left:game_box_left+ game_width - right_width}}>
                You can buy {
                    this.props.game_state.counter - this.upgrades.length
                } more item(s).<br/>
                {
                    already_bought ? "Already Bought" : ""
                }

            </div>

            <div ref={this.rightSideRef2} width={right_width} height={game_height-right_bottom_offset}  style={{"position":"absolute", "top":game_box_top+right_bottom_offset, left:game_box_left+ game_width - right_width}}>
            <b> {selected_name}</b><br />
                {
                    selected_desc
                }<br />
                Prereqs : <br />
                <ul>{
                    selected_prereqs.map((x) => <li style={{color:this.has_in_list(x) ? "green" : "red"}}>{x}</li>)
                }</ul>
            </div>
        </div>
    }
}
export default Upgrade;