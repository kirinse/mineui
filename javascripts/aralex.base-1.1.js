arale.declare("aralex.View",null,{show:function(){this.domNode&&$Node(this.domNode).setStyle("display","block")
},hide:function(){this.domNode&&$Node(this.domNode).setStyle("display","none")}});
arale.declare("aralex.Widget",null,{id:null,domNode:null,init:function(params){},create:function(params){arale.mixin(this,params,true);
this._connects=[];this.actionFilters={};this.beforeCreate.apply(this,arguments);this.initDom.apply(this,arguments);
this.bind.apply(this,arguments);this.postCreate();this._created=true},beforeCreate:function(){},initDom:function(){if(this.id){this.domNode=$(this.id)
}},postCreate:function(){},bind:function(){},addEvent:function(eventType,handler,selector){var handler=$E.delegate(this.domNode,eventType,arale.hitch(this,handler),selector);
this._connects.push(handler)},aroundFn:function(fn){var that=this;var tracer={before:function(){$E.publish(that._getEventTopic(fn,"before"),[].slice.call(arguments))
},after:function(){$E.publish(that._getEventTopic(fn,"after"),[].slice.call(arguments))
}};$Aspect.advise(this,fn,tracer);this.defaultFn(fn)},defaultFn:function(fn){var b="before"+$S(fn).capitalize();
var a="after"+$S(fn).capitalize();this[b]&&this.before(fn,this[b]);this[a]&&this.after(fn,this[a]);
var that=this;var tracer={around:function(){var checkFuncs;if(checkFuncs=that.getActionFilters_(fn)){for(var e in checkFuncs){var isValid=checkFuncs[e];
if(arale.isFunction(isValid)&&!isValid.apply(that,arguments)){return}}}return arale.aspect.proceed.apply(null,arguments)
}};$Aspect.advise(this,fn,tracer)},addActionFilter:function(fn,filter){var id=arale.getUniqueId();
(this.actionFilters[fn]||(this.actionFilters[fn]={}))[id]=filter;return[fn,id]},getActionFilters_:function(fn){return this.actionFilters[fn]
},removeActionFilter:function(handler){if(arale.isArray(handler)){var fn=handler[0],id=handler[1];
if(fn&&arale.isNumber(id)&&arale.isObject(this.actionFilters[fn])){delete this.actionFilters[fn][id]
}}},_getEventTopic:function(fn,phase){return this.declaredClass+"/"+(this.id||1)+"/"+fn+"/"+phase
},before:function(fn,callback){return $E.subscribe(this._getEventTopic(fn,"before"),arale.hitch(this,callback))
},after:function(fn,callback){return $E.subscribe(this._getEventTopic(fn,"after"),arale.hitch(this,callback))
},rmFn:function(handler){$E.unsubscribe(handler)},attr:function(key,value){if((key in this)&&value!==undefined){return(this[key]=value)
}return this[key]},destroy:function(){$A(this._connects).each(function(handler){$E.disConnect(handler)
})}});arale.declare("aralex.TplWidget",aralex.Widget,{onlyWidget:false,srcId:null,parentId:null,data:null,templatePath:null,tmpl:null,tmplReg:/<script\s+type=\"text\/html"\s+id=\"([^"]+)\"[^>]*>([\s\S]*?)<\/script>/g,templateString:null,isUrlDecode:true,initDom:function(){this.tmpl={};
this._initParent();if(!this.id){this._initWidgetId.apply(this,arguments)}if(!this.domNode){this._initDomNode.apply(this,arguments)
}},_initParent:function(){this.parentNode=this.parentId?$(this.parentId):$(document.body)
},_initWidgetId:function(params){if(this.srcId){this.id=this.srcId;return}if(this.domNode){this.id=$(this.domNode).attr("id")
}else{this.id=arale.getUniqueId(this.declaredClass.replace(/\./g,"_"))}},_initDomNode:function(params){this._initTmpl();
this._mixinProperties();this.domNode=$Node($D.toDom(this.templateString));this.domNode.attr("id",this.id);
if(this.srcId){$(this.srcId).replace(this.domNode)}else{this.domNode.inject(this.parentNode.node,"bottom")
}if(this.data){this.renderData(this.data)}},_mixinProperties:function(){this.templateString=$S(this.templateString).substitute(this)
},_initTmpl:function(){var that=this;if(!this.templateString){this.templateString=$Ajax.text(this.templatePath)
}else{if(this.isUrlDecode){this.templateString=$S(this.templateString).urlDecode()
}}var num=0,defaultTmpl;this.templateString=this.templateString.replace(this.tmplReg,function(tmpl,id,tmplContent){that.tmpl[id]=tmplContent;
num++;defaultTmpl=id;return""});if(num==1){this.defaultTmpl=defaultTmpl}},renderData:function(data,tmplId,isReplace){var that=this;
if(tmplId){this._fillTpl(data,tmplId,isReplace)}else{$H(this.tmpl).each(function(tmplId,tmpl,isReplace){that._fillTpl(data,tmplId)
})}},_fillTpl:function(data,tmplId,isReplace){var html=this.getTmplHtml(data,tmplId);
if(isReplace){var id=$(this._getTmplId(tmplId)).attr("id");var node=$D.toDom(html);
$Node(node).attr("id",id);$D.replace($Node(node).node,node)}else{$(this._getTmplId(tmplId)).setHtml(html)
}},_getTmplId:function(tmplId){if(this.onlyWidget){return tmplId}else{return this.id+"_"+tmplId
}},getTmplHtml:function(data,tmplId){var tmpl=this.tmpl[tmplId];return arale.tmpl(tmpl,data,this)
}});