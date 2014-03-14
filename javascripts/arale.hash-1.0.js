arale.module("arale.hash",(function(){var CHash=arale.dblPrototype({},function(obj){this.obj=obj
});arale.augment(CHash,{each:function(fn,context){for(var key in this.obj){if(this.obj.hasOwnProperty(key)){fn.call(context,key,this.obj[key],this.obj)
}}},set:function(key,value){if(!this.obj[key]||this.obj.hasOwnProperty(key)){this.obj[key]=value
}return this},extend:function(properties){$H(properties||{}).each(function(key,value){this.set(key,value)
},this);return this},getLength:function(){var length=0;for(var key in this.obj){if(this.obj.hasOwnProperty(key)){length++
}}return length},has:function(key){return this.obj.hasOwnProperty(key)},keyOf:function(value){var keys=[];
for(var key in this.obj){if(this.obj.hasOwnProperty(key)&&this.obj[key]==value){keys.push(key)
}}return keys.length?keys:null},hasValue:function(value){return(this.keyOf(value)!==null)
},removeKey:function(key){if(this.obj.hasOwnProperty(key)){delete this.obj[key]}return this
},getKeys:function(){var keys=[];this.each(function(key,value){keys.push(key)});return keys
},getValues:function(){var values=[];this.each(function(key,value){values.push(value)
});return values},toQueryString:function(){var queryString=[];this.each(function(key,value){queryString.push(key+"="+value)
});return queryString.join("&")},sort:function(){var result={};var keys=this.getKeys();
keys.sort();for(var key;key=keys.shift();){result[key]=this.obj[key]}return $H(result)
}});CHash.prototype.toString=function(){var str=[];for(var key in this.obj){str.push(key+" : "+this.obj[key])
}return"{ "+str.join(",")+" }"};var HashFactory=function(obj){return new CHash(obj)
};HashFactory.fn=CHash.prototype;return HashFactory}),"$H");H=$H;