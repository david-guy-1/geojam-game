import React from 'react';
import Game from "./Game";
const _ = require("lodash");
const Phaser = require("phaser");

interface display_state {
	"display" : string
}
class Display extends React.Component{
	state : display_state
	gameRef : Object;
	constructor(props:any){
		super(props);
		this.state={display : "game"}
		this.click = this.click.bind(this);
		this.gameRef = React.createRef();
	}
	click(){
		this.setState({display : this.state.display === "game" ? "options" : "game"})
	}
	
	render(){
		return <div>
			<button onClick={this.click}>Switch</button> 
		{function(this:Display){
			if(this.state.display === "game"){
				return <div>
				<Game />
				</div>
			} else if (this.state.display === "options"){
				return <div> abc</div>
			}
		}.bind(this)()}
		</div>
	}
	
}


export default Display; 
