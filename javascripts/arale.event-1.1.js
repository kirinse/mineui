arale.module("arale.event.object",(function(arale){var doc=document,props="altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" ");
var EventObject=function(target,domEvent){this.currentTarget=target;this.originalEvent=domEvent||{};
if(domEvent&&domEvent.type){this.type=domEvent.type;this._fix()}else{this.type=domEvent;
this.target=target}};function returnFalse(){return false}function returnTrue(){return true
}arale.augment(EventObject,{_fix:function(event){var that=this,originalEvent=this.originalEvent,l=props.length,prop,ct=this.currentTarget,ownerDoc=(ct.nodeType===9)?ct:(ct.ownerDocument||doc);
while(l){prop=props[--l];that[prop]=originalEvent[prop]}if(!that.target){that.target=that.srcElement||doc
}if(that.target.nodeType===3){that.target=that.target.parentNode}if(!that.relatedTarget&&that.fromElement){that.relatedTarget=(that.fromElement===that.target)?that.toElement:that.fromElement
}if(that.pageX===undefined&&that.clientX!==undefined){var docEl=ownerDoc.documentElement,bd=ownerDoc.body;
that.pageX=that.clientX+(docEl&&docEl.scrollLeft||bd&&bd.scrollLeft||0)-(docEl&&docEl.clientLeft||bd&&bd.clientLeft||0);
that.pageY=that.clientY+(docEl&&docEl.scrollTop||bd&&bd.scrollTop||0)-(docEl&&docEl.clientTop||bd&&bd.clientTop||0)
}if(!that.which){that.which=(that.charCode)?that.charCode:that.keyCode}if(that.metaKey===undefined){that.metaKey=that.ctrlKey
}if(!that.which&&that.button!==undefined){that.which=(that.button&1?1:(that.button&2?3:(that.button&4?2:0)))
}},preventDefault:function(){this.isDefaultPrevented=returnTrue;var e=this.originalEvent;
if(!e){return}if(e.preventDefault){e.preventDefault()}else{e.returnValue=false}this.isDefaultPrevented=true
},stopPropagation:function(){this.isPropagationStopped=returnTrue;var e=this.originalEvent;
if(!e){return}if(e.stopPropagation){e.stopPropagation()}else{e.cancelBubble=true}},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=returnTrue;
this.stopPropagation()},halt:function(immediate){if(immediate){this.stopImmediatePropagation()
}else{this.stopPropagation()}this.preventDefault()},stopEvent:function(evt){this.stopPropagation();
this.preventDefault()},isDefaultPrevented:returnFalse,isPropagationStopped:returnFalse,isImmediatePropagationStopped:returnFalse});
return{getEventObject:function(target,event){return new EventObject(target,event)
}}})(arale),"$E");arale.module("arale.event.store",(function(arale){var array=arale.array,arr=Array.prototype;
var store=function(){this.targets={};this.handlers={}};arale.augment(store,{addHandler:function(id,type,fn){this._getHandlerList(id,type).push(fn);
return fn},_getHandlerList:function(id,type){var handlers=this.handlers;var handlersForId=handlers[id]||(handlers[id]={});
return(handlersForId[type]||(handlersForId[type]=[]))},removeHandler:function(id,type,fn){var handlers=this.handlers,shandler;
if(!handlers[id]){return}shandler=handlers[id];if(!shandler[type]){return}shandler[type]=$A(shandler[type]).filter(function(f){return f!=fn
});if(shandler[type].length===0){delete handlers[id][type]}},removeAllHandler:function(id,type){var handlers=this.handlers;
if(handlers[id]&&handlers[id][type]){handlers[id][type]=null;delete handlers[id][type]
}},invoke:function(id,type,e){var handlers=this.getHandlers(id,type),params=arr.slice.call(arguments,2);
$A(handlers).each(function(fn){arale.isFunction(fn)&&fn.apply(null,params)})},getHandlers:function(id,type){if(this.handlers[id]===undefined){return[]
}if(this.handlers[id][type]===undefined){return this.handlers[id][type]=[]}return this.handlers[id][type]
},getTarget:function(id){return this.targets[id]},setTarget:function(target){this.targets[id]=target
}});return{getStore:function(){return new store()}}})(arale),"$E");arale.module("arale.event.chain",(function(arale){var array=arale.array;
var Action=function(fn){this.handler=fn};arale.augment(Action,{fire:function(e){if(e&&e.originalEvent&&e.originalEvent.cancelBubble){return
}else{this.handler.call(null,e);if(this.parent){this.parent.fire(e)}}},setParent:function(action){this.parent=action
}});var Chain=function(fn){if(arale.isArray(fn)){var that=this,firstAction=fn.shift();
this.action=new Action(firstAction);$A(fn).each(function(action){that.addAction(action)
})}else{this.action=new Action(fn)}};arale.augment(Chain,{addAction:function(fn){var action=new Action(fn);
action.setParent(this.action);this.action=action},fire:function(e){var obj=$E.getEventObject(this.action,e);
this.action.fire.apply(this.action,[obj].concat(Array.prototype.slice.call(arguments)))
}});return{getChains:function(fn){if(arguments.length>1){return new Chain([].slice.call(arguments,0))
}return new Chain(fn)}}})(arale),"$E");arale.module("arale.event.core",(function(arale){var slice=Array.prototype.slice,array=arale.array,dom=arale.dom,store=arale.event.store.getStore(),doc=document;
var STORE_GUID="storeTargetId",SId=arale.now();var getId=function(target){return target[STORE_GUID]||(target[STORE_GUID]=(++SId))
};var allEvents="blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout  mouseenter mouseleave change select submit keydown keypress keyup error popstate";
var fixEvent=function(method){if(allEvents.indexOf(method)>-1){return"on"+method}return method
};var getDispatcher=function(store,source,method){var serId=getId(source);if(isElement(source)){return function(e){e=e||window.event;
var argums=slice.call(arguments,1);var params=[serId,method].concat(e,argums);params[2]=$E.getEventObject(source,params[2]);
store.invoke.apply(store,params)}}else{return function(){var c=arguments.callee,t=c.target,params=[serId,method].concat(slice.call(arguments));
var r=(t&&t.apply(null,arguments));store.invoke.apply(store,params);return r}}};var isElement=function(obj){return obj&&(obj.nodeType||obj.attachEvent||obj.addEventListener)
};var _topics={};var keys={BACKSPACE:8,TAB:9,CLEAR:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,META:arale.isSafari()?91:224,PAUSE:19,CAPS_LOCK:20,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,HELP:47,LEFT_WINDOW:91,RIGHT_WINDOW:92,SELECT:93,NUMPAD_0:96,NUMPAD_1:97,NUMPAD_2:98,NUMPAD_3:99,NUMPAD_4:100,NUMPAD_5:101,NUMPAD_6:102,NUMPAD_7:103,NUMPAD_8:104,NUMPAD_9:105,NUMPAD_MULTIPLY:106,NUMPAD_PLUS:107,NUMPAD_ENTER:108,NUMPAD_MINUS:109,NUMPAD_PERIOD:110,NUMPAD_DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,F13:124,F14:125,F15:126,NUM_LOCK:144,SCROLL_LOCK:145,copyKey:arale.isMac()?(arale.isSafari()?91:224):17};
var liveMap={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};
return{connect:function(obj,event,context,method){event=fixEvent(event);if(arale.isArray(obj)){var results=[],that=this;
var callback=arale.hitch(context,method);$A(obj).each(function(o){results.push(that._connect(o,event,callback))
});return results}else{var temp=arale.hitch(context,method);return this._connect(obj,event,temp)
}},on:function(){return this.connect.apply(this,arguments)},_connect:function(source,method,handler){source=arale.isString(source)?$(source):source;
if(source===null){return null}if(source.node){source=source.node}var f=source[method],d;
if(!f||!source[STORE_GUID]){d=source[method]=getDispatcher(store,source,method);d.target=f
}var serId=getId(source);store.addHandler(serId,method,handler);return[serId,method,handler]
},disConnect:function(handler){if(handler===null){return}if(arale.isArray(handler[0][0])){var that=this;
$A(handler).each(function(h){that._disConnect.apply(that,h)})}else{this._disConnect.apply(this,handler)
}},off:function(){this.disConnect.apply(this,arguments)},_disConnect:function(serId,method,handler){method=fixEvent(method);
store.removeHandler(serId,method,handler)},disAllConnect:function(obj,method){var serId=getId(obj);
if(obj.node){obj=obj.node;obj[method]=null}method=fixEvent(method);store.removeAllHandler(serId,method)
},subscribe:function(topic,context,method){var serId=getId(_topics),temp=arale.hitch(context,method);
return[serId,topic,store.addHandler(serId,topic,temp)]},unsubscribe:function(handler){if(handler){store.removeHandler.apply(store,handler)
}},publish:function(topic,args){var serId=getId(_topics);var f=store.getHandlers(serId,topic);
if(f){store.invoke.apply(store,[serId,topic].concat((args||[])))}},connectPublisher:function(topic,context,event){var pf=function(){$E.publish(topic,arguments)
};return this.connect(context,event,pf)},trigger:function(elem,type,data){type=fixEvent(type);
if(elem.node){elem=elem.node}var fn=getDispatcher(store,elem,type);var event=$E.getEventObject(elem,type);
fn.apply(null,[event].concat(data));var parent=elem.parentNode||elem.ownerDocument;
if(!event.isPropagationStopped()&&parent){$E.trigger(parent,type)}},delegate:function(domNode,eventType,handler,selector){if(domNode.node){domNode=domNode.node
}var that=this,newHandler=function(e){var params=that._getLiveHandlerParam(e,selector,domNode);
if(params){handler.apply(domNode,params)}};return $E.connect(domNode,eventType,newHandler)
},_getLiveHandlerParam:function(e,selector,domNode){var that=this;if(selector){var target=e.target;
var match=$A($$(selector,domNode)).some(function(node){var chain;if(target==node.node){return true
}chain=that._isInDomChain(target,node.node,domNode);return chain&&(target=chain)});
return match&&[target,e]}return[domNode,e]},_isInDomChain:function(target,parent,ancestor){if(target==ancestor){return false
}if(target==parent){return target}var i=0;while(target!=ancestor&&target!=null&&(i++<6)){target=target.parentNode;
if(target==parent){return target}}return false},live:function(domNode,eventType,handler,selector){var that=this;
if(domNode.node){domNode=domNode.node}var newHandler=function(e){e=e||window.event;
e=$E.getEventObject(domNode,e);var params=that._getLiveHandlerParam(e,selector,domNode);
if(params){handler.apply(domNode,params)}};if(domNode.addEventListener){domNode.addEventListener(eventType,newHandler,true)
}else{if(domNode.attachEvent){domNode.attachEvent("on"+liveMap[eventType],newHandler)
}else{return null}}},keys:keys,domReady:function(fn){var core=arale.event.core;if(core.domReady.loaded){fn();
return}core.domReady.observers=core.domReady.observers||[];var observers=core.domReady.observers;
observers[observers.length]=fn;if(core.domReady.callback){return}core.domReady.callback=function(){if(core.domReady.loaded){return
}core.domReady.loaded=true;if(core.domReady.timer){clearInterval(core.domReady.timer);
core.domReady.timer=null}for(var i=0,length=observers.length;i<length;i++){var fn=observers[i];
observers[i]=null;fn()}core.domReady.callback=core.domReady.observers=null};if(document.readyState&&(arale.browser.Engine.gecko||arale.browser.Engine.webkit)){core.domReady.timer=setInterval(function(){var state=document.readyState;
if(state=="loaded"||state=="complete"){core.domReady.callback()}},50)}else{if(document.readyState&&arale.browser.Engine.trident){var src=(window.location.protocol=="https:")?"://0":"javascript:void(0)";
document.write('<script type="text/javascript" defer="defer" src="'+src+'" onreadystatechange="if (this.readyState == \'complete\') $E.domReady.callback();"><\/script>')
}else{if(window.addEventListener){document.addEventListener("DOMContentLoaded",core.domReady.callback,false);
window.addEventListener("load",core.domReady.callback,false)}else{if(window.attachEvent){if(document.readyState=="complete"){core.domReady.callback();
return}window.attachEvent("onload",core.domReady.callback)}else{var fn=window.onload;
window.onload=function(){core.domReady.callback();if(fn){fn()}}}}}}}}})(arale),"$E");
E=$E;