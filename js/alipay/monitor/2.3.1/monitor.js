define("alipay/monitor/2.3.1/monitor",["arale/detector/1.2.1/detector","arale/events/1.1.0/events"],function(a,b,c){function d(a){return Object.prototype.toString.call(a)}function e(){for(var a,b={},c=0,d=arguments.length;d>c;c++){a=arguments[c];for(var e in a)j(a,e)&&(b[e]=a[e])}return b}function f(){return(""+Math.random()).slice(-6)}function g(a){if(void 0===a||"string"!=typeof a)return"";var b=a.length,c=a.indexOf(";jsessionid=");0>c&&(c=b);var d=a.indexOf("/min/?");d>=0&&(d=a.indexOf("?",d)),0>d&&(d=b);var e=a.indexOf("#");0>e&&(e=b);var f=a.indexOf("??");f=a.indexOf("?",0>f?0:f+2),0>f&&(f=b);var g=Math.min(c,d,e,f);return 0>g?a:a.substr(0,g)}function h(a){return String(a).replace(/(?:\r\n|\r|\n)/g,"<CR>")}function i(a){if("[object Object]"!==Object.prototype.toString.call(a))return"";var b=[];for(var c in a)if(j(a,c))if("[object Array]"===d(a[c]))for(var e=0,f=a[c].length;f>e;e++)b.push(c+"="+encodeURIComponent(h(a[c][e])));else b.push(c+"="+encodeURIComponent(h(a[c])));return b.join("&")}function j(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function k(a,b,c){if(c||(c=function(){}),!b)return c();var d=i(b),e=a+(a.indexOf("?")<0?"?":"&")+d;if(e.length>z)return c();var f=new Image(1,1);f.onload=f.onerror=f.onabort=function(){c(),f.onload=f.onerror=f.onabort=null,f=null},f.src=e}function l(){if(!C){var a=p._DATAS.shift();if(a){C=!0,"jserror"===a.profile&&(a.file=g(a.file));var b=e(B,a);b.rnd=f();var c=t.trigger(a.profile,b);return(c=t.trigger("*",b)&&c)?(k(y,b,function(){C=!1,l()}),void 0):(C=!1,l())}}}var m=window,n=m.document,o=m.location,p=m.monitor,q=a("arale/detector/1.2.1/detector"),r=a("arale/events/1.1.0/events");p||(p={}),p._DATAS||(p._DATAS=[]),p._EVENTS||(p._EVENTS=[]);var s=p._EVENTS,t=new r;p.on=function(a,b){t.on(a,b)};for(var u=0,v=s.length;v>u;u++)p.on(s[u][0],s[u][1]);var w="2.0",x=String(o.protocol).toLowerCase();"https:"!==x&&(x="http:");var y=x+"//magentmng.alipay.com/m.gif",z=q.engine.trident?2083:8190,A=g(o.href),B={url:A,ref:g(n.referrer)||"-",clnt:q.device.name+"/"+q.device.fullVersion+"|"+q.os.name+"/"+q.os.fullVersion+"|"+q.browser.name+"/"+q.browser.fullVersion+"|"+q.engine.name+"/"+q.engine.fullVersion+(q.browser.compatible?"|c":""),v:w},C=!1,D=p._DATAS.push;p._DATAS.push=function(){D.apply(p._DATAS,arguments),l()},l(),m.monitor=p,c.exports=p});