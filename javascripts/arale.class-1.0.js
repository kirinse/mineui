arale.module("arale.declare",function(){var a=arale,contextStack=[];var safeMixin=function(){var baseClass=arguments[0],clazzs=[].slice.call(arguments,1);
for(var i=0,len=clazzs.length;i<len;i++){var clazz=clazzs[i];a._mixin(baseClass.prototype,clazz.prototype)
}};var getPpFn=function(couns,fn,fnName){var superCouns=couns.superCouns,superProto=superCouns.prototype;
if(fn!==superProto[fnName]){return superProto[fnName]}else{return getPpFn(superCouns,fn,fnName)
}};var getFnName=function(couns,fn){if(fn.fnName){return fn.fnName}var fnName=$H(couns.prototype).keyOf(fn);
if(fnName==null){return getFnName(couns.superCouns,fn)}fn.fnName=fnName;return fnName
};var ConstructorFactory=function(className,parents,proto){var current=a.namespace(className),parent=null;
var couns=function(){this.declaredClass=className;this.init&&this.init.apply(this,arguments);
this.create&&this.create.apply(this,arguments)};if(parents&&arale.isArray(parents)){parent=parents.shift()
}else{parent=parents}parent&&a.inherits(couns,parent);a.augment(couns,proto);couns.prototype.parent=function(){var couns=this.constructor;
var fn=arguments[0].callee;var fnName=getFnName(couns,fn);fn=getPpFn(couns,fn,fnName);
return fn.apply(this,arguments[0])};if(parents&&parents.length>0){safeMixin.apply(null,[couns].concat(parents))
}current._parentModule[current._moduleName]=couns};return ConstructorFactory},"$Declare");