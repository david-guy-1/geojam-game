
import React from 'react';
import purchasable_upgrades from './purchaseable_upgrades.tsx'
class Upgrade extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.lst = new Set();
    }
    render(){
        var st = this.props.game_state ;
        var options = Object.keys(purchasable_upgrades).filter((x) => st.upgrades.indexOf(x) === -1);
        
        return <div>
            <button onClick={function(){this.props.return_fn(this.lst)}.bind(this)}> Go back </button><br />

            {
                function(){
                    var output = [];
                    for(var opt of options){
                        output.push(<><button onClick={
                            function(){
                                var component = this[0];
                                var opt = this[1]
                                if(component.lst.has(opt)){
                                    component.lst.delete(opt);
                                }else{
                                    component.lst.add(opt);
                                }
                                component.forceUpdate();
                            }.bind([this, opt])
                        }>{opt} {this.lst.has(opt) ? "(remove)" : "(add)"  }</button><br /></>)
                    }
                    return output;
                }.bind(this)()
            }
        </div>
    }
}
export default Upgrade;