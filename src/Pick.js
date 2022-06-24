
import React from 'react';
class Pick extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.click = this.click.bind(this);
    }
    click(e){
        this.props.return_fn(this.props.game_state.next_pick_choices[e]);
    }
    render(){
        return <div>
            <h1> Pick a side</h1>
            <div style={{width:600, height:300, border:"1px solid black"}}>
                {this.props.game_state.next_pick_choices[0]}<br />
                <button onClick={function(){this.click(0)}.bind(this)}>Pick</button> 
            </div><br />
            <div style={{width:600, height:300, border:"1px solid black"}}>
            {this.props.game_state.next_pick_choices[1]}
            <button onClick={function(){this.click(1)}.bind(this)}>Pick</button> 
            </div>

        </div>
    }
}
export default Pick;