arale.module("arale.array",function(){var CArray=arale.dblPrototype(Array.prototype,function(obj){this.arr=obj
});arale.augment(CArray,{each:function(callback,bind){var target=this.arr;if(Array.prototype.forEach){return[].forEach.call(target,callback,bind)
}for(var length=target.length,i=0;i<length;i++){callback.call(bind,target[i],i,target)
}},every:function(callback,bind){var target=this.arr;if(Array.prototype.every){return[].every.call(target,callback,bind)
}for(var i=0,l=target.length;i<l;i++){if(!callback.call(bind,target[i],i,target)){return false
}}return true},filter:function(callback,bind){var result=[];this.each(function(item,index){if(callback.call(bind,item,index)){result.push(item)
}});return result},clean:function(){var fn=function(obj){return(obj!=undefined)};
return this.filter(fn)},map:function(callback,bind){var result=[],i=0;this.each(function(item,index){result[i++]=callback.call(bind,item,index)
});return result},some:function(callback,bind){var target=this.arr;if(Array.prototype.some){return[].some.call(target,callback,bind)
}for(var l=target.length,i=0;i<l;i++){if(callback.call(bind,target[i],i,target)){return true
}}return false},associate:function(keys){keys&&(keys=keys.arr||keys);var obj={},vals=this;
vals.each(function(item,index){if(keys[index]&&item){obj[keys[index]]=item}});return obj
},indexOf:function(item,from){var arr=this.arr,len=arr.length;i=(from<0)?Math.max(0,len+from):from||0;
for(;i<len;i++){if(arr[i]===item){return i}}return -1},contains:function(item,from){return this.indexOf(item,from)!==-1
},extend:function(array){array=array.arr||array;for(var i=0,j=array.length;i<j;i++){this.arr.push(array[i])
}return this.arr},last:function(){return(this.arr&&this.arr[this.arr.length-1])||null
},random:function(){return(this.arr&&this.arr[arale.$random(0,this.arr.length-1)])||null
},include:function(item){if(!this.contains(item)){this.arr.push(item)}return this.arr
},combine:function(array){var arr=[],that=this;$A(array).each(function(item){arr=that.include(item)
});return arr},erase:function(item){var arr=this.arr;this.each(function(member,index){if(member===item){arr.splice(index,1)
}});return arr},empty:function(){this.arr.length=0;return this.arr},flatten:function(){return this.inject([],function(array,item){if(item instanceof Array){return array.concat($A(item).flatten())
}array.push(item);return array})},hexToRgb:function(array){if(this.arr.length!==3){return null
}var rgb=this.map(function(value){if(value.length===1){value+=value}return $S(value).toInt(16)
});return(array)?rgb:"rgb("+rgb+")"},rgbToHex:function(array){if(this.arr.length<3){return null
}if(this.arr.length===4&&this.arr[3]===0&&!array){return"transparent"}var hex=[];
for(var i=0;i<3;i++){var bit=(this.arr[i]-0).toString(16);hex.push((bit.length==1)?"0"+bit:bit)
}return(array)?hex:"#"+hex.join("")},inject:function(memo,iterator,context){this.each(function(value,index){memo=iterator.call(context,memo,value,index)
});return memo},remove:function(item){var index=this.indexOf(item);if(index>-1){this.arr.splice(index,1)
}}});CArray.prototype.toString=function(){return this.arr.toString()};CArray.prototype.valueOf=function(){return this.arr.valueOf()
};var ArrayFactory=function(arr){if(arr.arr){return arr}return new CArray(arr)};ArrayFactory.fn=CArray.prototype;
return ArrayFactory},"$A");A=$A;