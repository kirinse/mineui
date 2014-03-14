arale.declare("aralex.slider.ScrollSlider",[aralex.Switchable],{type:"scrollX",duration:500,auto:true,capacity:1,effect:"loop",switchViewEffect:function(from,to,callback){if(from==to){callback();
return}var views=this._getChildren(this.domNode);this._currentAnim&&this._currentAnim.clearSubjects();
var that=this;this._currentAnim=new $Animator({duration:that.duration,interval:20,onComplete:function(){callback.apply(this)
}});var anim=this._currentAnim;var prop=this.type=="scrollY"?"top":"left";anim.addCSSMotion(this.domNode.node,prop+":-"+views[to].node.startPos+"px");
anim.play()},prepare:function(){this.currentView=this.currentTrigger=this.start;var eles=this._getChildren(this.domNode);
var _w=0,prop,style={position:"relative"};if(this.type=="scrollX"){prop="width";style.left=0
}else{if(this.type=="scrollY"){prop="height";style.top=0}}for(var i=0,l=eles.length;
i<l;i++){eles[i].node.startPos=_w;var s=$Node(eles[i]).getStyle(prop);var t=s?$S(s).toInt():$Node(eles[i]).getViewportSize()[prop];
_w+=t}style[prop]=_w+"px";this.domNode.setStyle(style);this.domNode.setStyle(this.type=="scrollX"?"left":"top",-eles[this.start].node.startPos+"px");
this.parent(arguments)},next:function(step){if(this.effect=="persistent"){step=step||1;
var target=this.currentView+step;if(this.validIndex_(this.currentView+step+this.capacity-1)){return this.switchView(target)
}else{this._dealPersistentEffect(1);return this.next(step)}}else{return this.parent(arguments)
}},previous:function(step){if(this.effect=="persistent"){step=step||1;var target=this.currentView-step;
if(this.validIndex_(target)){return this.switchView(target)}else{this._dealPersistentEffect(-1);
return this.previous(step)}}else{return this.parent(arguments)}},getNextAutoView:function(){if(this.effect=="persistent"){var target=this.currentView+this.direction*this.step,b=this.validIndex_(this.direction>0?(target+this.capacity-1):target);
if(b){return target}this._dealPersistentEffect(this.direction);return this.getNextAutoView()
}else{return this.parent(arguments)}},_dealPersistentEffect:function(direction){direction=direction||this.direction;
this.useCache=false;var children=this._getChildren(this.domNode);if(direction>0){var toBeMoved=children.slice(this.currentView),pos="top";
for(var i=toBeMoved.length-1;i>=0;i--){toBeMoved[i].inject(this.domNode,pos)}}else{var toBeMoved=children.slice(0,this.currentView+this.capacity),pos="bottom";
for(var i=0,l=toBeMoved.length;i<l;i++){toBeMoved[i].inject(this.domNode,pos)}}this.start=direction>0?0:children.length-this.capacity;
this.prepare()}});