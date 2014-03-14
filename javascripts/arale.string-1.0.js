arale.module("arale.string",(function(){var _encodeUriRegExp=/^[a-zA-Z0-9\-_.!~*'()]*$/;
var _amperRe=/&/g;var _ltRe=/</g;var _gtRe=/>/g;var _quotRe=/\"/g;var _allRe=/[&<>\"]/;
var character={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"};var entity={quot:'"',lt:"<",gt:">"};
var CString=arale.dblPrototype("",function(strr){this.str=strr;this.length=strr.length
});arale.augment(CString,{trim:function(){var str=this.str.replace(/^\s+/,"");for(var i=str.length-1;
i>=0;i--){if(/\S/.test(str.charAt(i))){str=str.substring(0,i+1);break}}return str
},clean:function(){return this.trim(this.str.replace(/\s+/g," "))},camelCase:function(){var str=this.str.replace(/-\D/g,function(match){return match.charAt(1).toUpperCase()
});return str},hyphenate:function(){var str=this.str.replace(/[A-Z]/g,function(match){return("-"+match.charAt(0).toLowerCase())
});return str},escapeRegExp:function(){return this.str.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1")
},toInt:function(base){return parseInt(this.str,base||10)},toFloat:function(){return parseFloat(this.str)
},hexToRgb:function(array){var hex=this.str.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
return(hex)?$A(hex.slice(1)).hexToRgb(array):null},rgbToHex:function(array){var rgb=this.str.match(/\d{1,3}/g);
return(rgb)?$A(rgb).rgbToHex(array):null},parseColor:function(co){if(this.str.slice(0,4)=="rgb("){var color=this.rgbToHex()
}else{var color="#";if(this.str.slice(0,1)=="#"){if(this.str.length==4){for(var i=1;
i<4;i++){color+=(this.str.charAt(i)+this.str.charAt(i)).toLowerCase()}}if(this.str.length==7){color=this.str.toLowerCase()
}}}return(color.length==7?color:($S(co)||this.str))},stripScripts:function(option,override){var scripts="";
var text=this.str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,function(){scripts+=arguments[1];
return""});if(option===true){arale.exec(scripts)}else{if(typeof(option)=="function"){option.call(override,scripts,text)
}}return text},substitute:function(object,regexp){var str=this.str.replace(regexp||(/\$\{([^}]+)\}/mg),function(match,name){return(object[name]!=undefined)?object[name]:""
});return str},trimLeft:function(){return this.str.replace(/^[\s\xa0]+/,"")},trimRight:function(){return this.str.replace(/[\s\xa0]+$/,"")
},urlEncode:function(){this.str=String(this.str);if(!_encodeUriRegExp.test(this.str)){return encodeURIComponent(this.str)
}return this.str},urlDecode:function(){return decodeURIComponent(this.str.replace(/\+/g," "))
},escapeHTML:function(){if(!_allRe.test(this.str)){return this.str}if(this.str.indexOf("&")!=-1){this.str=this.str.replace(_amperRe,"&amp;")
}if(this.str.indexOf("<")!=-1){this.str=this.str.replace(_ltRe,"&lt;")}if(this.str.indexOf(">")!=-1){this.str=this.str.replace(_gtRe,"&gt;")
}if(this.str.indexOf('"')!=-1){this.str=this.str.replace(_quotRe,"&quot;")}return this.str
},unescapeHTML:function(){if(!this.trim().length){return this.str}return this.str.replace(/&([^;]+);/g,function(s,entity){switch(entity){case"amp":return"&";
case"lt":return"<";case"gt":return">";case"quot":return'"';default:if(entity.charAt(0)=="#"){var n=Number("0"+entity.substr(1));
if(!isNaN(n)){return String.fromCharCode(n)}}return s}})},contains:function(string,separator){return(separator)?(separator+this.str+separator).indexOf(separator+string+separator)>-1:this.str.indexOf(string)>-1
},rep:function(num,text){if(text){this.str=text}if(num<=0||!this.str){return""}var buf=[];
for(;;){if(num&1){buf.push(this.str)}if(!(num>>=1)){break}this.str+=this.str}return buf.join("")
},pad:function(size,ch,end){if(!ch){ch="0"}var out=String(this.str);var pad=this.rep(Math.ceil((size-out.length)/ch.length),ch);
return end?(out+pad):(pad+out)},capitalize:function(){var str=this.str.replace(/\b[a-z]/g,function(match){return match.toUpperCase()
});return str},ftoh:function(isTrim){var result="",str,c,isTrim=isTrim||"both";switch(isTrim){case"all":case"both":str=this.trim();
break;case"left":str=this.trimLeft();break;case"right":str=this.trimRight();break;
default:str=this.str}for(var i=0,len=str.length;i<len;i++){c=str.charCodeAt(i);if(c==12288){if(isTrim!="all"){result+=String.fromCharCode(c-12256)
}continue}if(c>65280&&c<65375){result+=String.fromCharCode(c-65248)}else{if(c==32&&isTrim=="all"){continue
}result+=String.fromCharCode(str.charCodeAt(i))}}return result}});CString.prototype.toString=function(){return this.str
};var StringFactory=function(strr){return new CString(strr)};StringFactory.fn=CString.prototype;
return StringFactory}),"$S");S=$S;