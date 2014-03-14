arale.declare("aralex.Switchable",[aralex.Widget],{auto:false,triggerId:null,triggerEvent:"click",currentTrigger:0,currentView:0,start:0,activeTriggerClass:"current",activeViewClass:"current",delay:5000,effect:"loop",direction:1,step:1,hoverStop:true,autoTimer:null,useCache:true,init:function(){if(this.useCache){this.cache={}
}},bind:function(){this.hoverStop&&this._hoverStop();this.triggerId&&this.bindTrigger()
},bindTrigger:function(id){id&&(this.triggerId=id);this._autoSwitchTrigger();var h=this._dl(this.triggerId,this.triggerEvent,function(t,i,e){this.switchView(this.getView(t,i))
});h&&this._connects.push(h)},_dl:function(ele,event,callback){ele=$(ele);var t=this;
var h=function(e){var index=-1,target=e.target;var b=$A(t._getChildren(ele)).some(function(v,i){target=v.node;
index=i;return $E._isInDomChain(e.target,v.node,ele.node)});if(b){callback.call(t,target,index,e)
}};return $E.connect(ele,event,h)},getView:function(ele,index){return index},getTrigger:function(target){return target
},_hoverStop:function(){var b=false;this.addEvent("mouseover",function(){if(this.auto){b=true;
this.stop()}});this.addEvent("mouseout",function(){if(b){b=false;this.play()}})},_autoSwitchTrigger:function(){var t=this;
return this.before("switchView",function(from,to){t.switchTrigger(t.getTrigger(to))
})},switchView:function(target){$E.publish(this._getEventTopic("switchView","before"),[this.currentView,target]);
var self=this;this.switchViewEffect(this.currentView,target,function(){$E.publish(self._getEventTopic("switchView","after"),[self.currentView,target]);
self.auto&&self._auto()});self.currentView=target;return this},switchViewEffect:function(from,to,callback){var views=this._getChildren(this.domNode);
var c=views[from],n=views[to],avc=this.activeViewClass;if(avc){c.removeClass(avc);
n.addClass(avc)}callback.apply(this)},switchTrigger:function(target){if(this.currentTrigger==target){return
}$E.publish(this._getEventTopic("switchTrigger","before"),[this.currentTrigger,target]);
var self=this;this.switchTriggerEffect(this.currentTrigger,target,function(){$E.publish(self._getEventTopic("switchTrigger","after"),[self.currentTrigger,target])
});this.currentTrigger=target;return this},switchTriggerEffect:function(from,to,callback){var triggers=this._getChildren(this.triggerId);
var c=triggers[from],n=triggers[to],atc=this.activeTriggerClass;c.removeClass(atc);
n.addClass(atc);callback.apply(this)},postCreate:function(){this.prepare();this.defaultFn("switchTrigger");
this.defaultFn("switchView");if(this.auto){this.play()}},prepare:function(){this.currentView=this.currentTrigger=this.start;
$A(this._getChildren(this.domNode)).each(function(v,i){if(i!=this.currentView){this.activeViewClass&&v.removeClass(this.activeViewClass)
}else{this.activeViewClass&&v.addClass(this.activeViewClass)}},this);this.triggerId&&this.activeTriggerClass&&$A(this._getChildren(this.triggerId)).each(function(v,i){if(i!=this.currentTrigger){v.removeClass(this.activeTriggerClass)
}else{v.addClass(this.activeTriggerClass)}},this)},next:function(step){step=step||1;
var target=this.currentView+step;return this.validIndex_(target)?this.switchView(target):this
},validIndex_:function(target){return(target>=0&&target<=this._getChildren(this.domNode).length-1)
},previous:function(step){step=step||1;var target=this.currentView-step;return this.validIndex_(target)?this.switchView(target):this
},play:function(){this.auto=true;return this._auto()},stop:function(){clearTimeout(this.autoTimer);
this.autoTimer=null;this.auto=false;return this},_auto:function(){var t=this;clearTimeout(this.autoTimer);
this.autoTimer=setTimeout(function(){t.switchView(t.getNextAutoView())},t.delay);
return this},getNextAutoView:function(){var i=this.currentView+this.direction*this.step,b=this._checkViewValid(i);
if(b){return i}switch(this.effect){case"loop":return Math.abs(Math.abs(i)-this._getChildren(this.domNode).length);
case"back":this.direction*=(-1);return this.getNextAutoView();default:break}},_checkViewValid:function(i){if(i<0){return false
}var arr=this._getChildren(this.domNode);if(i>=arr.length){return false}return true
},_getChildren:function(e){e=$(e);if(this.useCache){var b=this.cache[e.attr("id")]||(this.cache[e.attr("id")]=e.nodes());
return b}return e.nodes()},destroy:function(){this.parent(arguments);clearTimeout(this.autoTimer)
}});