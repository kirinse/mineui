arale.namespace("alipay.index");
alipay.index.utils={
  imgAttr:"src,class,id,width,height,alt".split(","),
  makePic:function(a,e){
    var b=a.attr("innerHTML"),c=null,f="";
    if(b)
      c=D.toDom(S(b).unescapeHTML()),c=$(c);
    else{
      c=document.createElement("IMG");
      c=$(c);
      for(b=0;b<alipay.index.utils.imgAttr.length;b++)
        f=alipay.index.utils.imgAttr[b],""!=a.attr("data-"+f)&&c.attr(f,a.attr("data-"+f))
    }
    c.inject(a,"before");
    e&&e(a)
  },
  setCookie:function(a,e,b){
    var b=b||4,c=new Date;
    c.setTime(c.getTime()+864E5*b);
    document.cookie=a+"="+escape(e)+";expires="+c.toGMTString()
  },
  getCookie:function(a){
    a=document.cookie.match(RegExp("(^| )"+a+"=([^;]*)(;|$)"));
    return null!=a?unescape(a[2]):null
  },
  slideUp:function(a,e,b){
    var c=300;
    (function(){
      if(0<c){
        c-=30;
        a&&a.setStyle("height",c+"px");
        var f=setTimeout(arguments.callee,e)
      }
      else
        b(),clearTimeout(f)
    })()
  }
};

alipay.index.adjust={
  headLogin:function(a,e){
    $("headLogin");
    if(a){
      $$(".topmenu-item-first")[0].node.innerHTML='<a href="https://lab.alipay.com/user/i.htm" title="\u8fdb\u5165\u6211\u7684\u652f\u4ed8\u5b9d">'+a+"</a>";
      var b="";
      if(!e||0>e.indexOf("login/logout.htm"))
        e+="/login/logout.htm";
      b=D.toDom('<li class="topmenu-item"><a seed="logout" href="'+e+'">\u9000\u51fa</a></li>');
      $(b).inject($$(".topmenu-item-dropdown")[0],"after")
    }
  },
  showLoginRecord:0,
  showLogin:function(){
    0==alipay.index.adjust.showLoginRecord?
arale.isIE()?($("loginLoading")&&$("loginLoading").dispose(),$("loginIframe")&&$("loginIframe").setStyle("height","297px"),$("loginIframe")&&$("loginIframe").removeClass("fn-hide")):($("loginIframe")&&$("loginIframe").node.contentDocument&&$$(".alieditContainer",$($("loginIframe").node.contentDocument))[0]&&$$(".alieditContainer",$($("loginIframe").node.contentDocument))[0].setStyle("visibility","hidden"),$("loginIframe")&&$("loginIframe").setStyle("opacity","0"),$("loginIframe")&&$("loginIframe").removeClass("fn-hide"),
++alipay.index.adjust.showLoginRecord):($("loginLoading")&&$("loginLoading").dispose(),$("loginIframe")&&$("loginIframe").removeClass("fn-hide"))
  },
  heightAdjust:function(){},
  iframeAdjust:function(a){
    $("loginIframe").setStyle("top",a+"px")
  }
};

alipay.index.lazyload=function(a,e,b,c){
  for(var b=b||10,c=c||100,f=function(h){A(h).each(function(h){h&&alipay.index.utils.makePic(h,e.doing)})},g=a.length,j=Math.ceil(g/b),d=0,h=0;h<j;h++)(function(h){var o=h*b,k=(h+1)*b,k=k<g?k:g;setTimeout(function(){f(a.slice(o,k));d++;d==j&&e&&e.done()},c*h)})(h)
};

alipay.index.lazyloadBanner=function(a){
  arale.isIE6()||A(a).each(function(a){a.addClass(a.attr("data-class"))})
};

alipay.index.randomBank=function(a,e,b){
  e&&(a&&a.length&&(b=a[Math.floor(a.length*Math.random())]),e.attr("class",b))
};

alipay.index.banner=function(a,e){
  var b=alipay.index.utils,c=parseInt(b.getCookie("indexBannerIsShow")||0);
  $("indexBanner");
  var f=$$(".banner-expand")[0],g=$$(".banner-fold")[0];
  c?g&&g.removeClass("fn-hide"):f&&(f.removeClass("fn-hide"),b.setCookie("indexBannerIsShow",1,a),setTimeout(function(){b.slideUp(f,100,function(){f.addClass("fn-hide");g.removeClass("fn-hide")})},e))
};

alipay.index.nav=function(){
  var a=$("J-topmenu-dropdown");
  E.on(a,"mouseover",function(){
    a.addClass("topmenu-item-dropdown-hover")
  });
  E.on(a,"mouseout",function(){
    a.removeClass("topmenu-item-dropdown-hover")
  });
  var e=$$("#J-nav .nav-item");
  A(e).each(function(a){
    E.on(a,"mouseover",function(){
      a.addClass("nav-item-hover");
      $$(".nav-item-link",a)[0].addClass("nav-item-link-active");
      $$(".angle",a)[0]&&($$(".angle",a)[0].setStyle({display:"block"}),$$(".nav-item-sub",a)[0].setStyle({display:"block"}))
    });
    E.on(a,"mouseout",function(){
      a.removeClass("nav-item-hover");
      $$(".nav-item-link",a)[0].removeClass("nav-item-link-active");
      $$(".angle",a)[0]&&($$(".angle",a)[0].setStyle({display:"none"}),$$(".nav-item-sub",a)[0].setStyle({display:"none"}))
    })
  })
};

alipay.index.scroller=function(){
  $$("#J-views li")[0]&&2<$$("#J-views li").length&&new aralex.slider.ScrollSlider({id:"J-views",type:"scrollY",delay:8E3,capacity:2,effect:"persistent"})
};

alipay.index.bannerSlider=function(a){var e="undefined"==typeof a?1E3:a,b=function(){var h=[],a=null,b=function(){for(var b=0;b<h.length;b++)h[b].end?h.splice(b--,1):h[b]();h.length||(clearInterval(a),a=null)};return function(c,e,d,f){var g,j,n,l,m,i=new Image;i.src=c;i.complete?(e.call(i),d&&d.call(i)):(j=i.width,n=i.height,i.onerror=function(){f&&f.call(i);g.end=!0;i=i.onload=i.onerror=null},g=function(){l=i.width;m=i.height;if(l!==j||m!==n||1024<l*m)e.call(i),g.end=!0},g(),i.onload=function(){!g.end&&
g();d&&d.call(i);i=i.onload=i.onerror=null},g.end||(h.push(g),null===a&&(a=setInterval(b,40))))}}(),a=$("banner");"undefined"!=typeof a.node.attributes["data-banner"]&&""!=a.node.attributes["data-banner"]?(a=a.node.attributes["data-banner"].value,a="true"==a?!0:!1):a=!0;if(!a||arale.isIE()&&10>arale.browser.Engine.ie){for(var c=$$("#banner .slide"),f=$$("#banner .bg"),g=$$("#banner .txt"),j=[],d=0;d<c.length;d++)"undefined"!=typeof c[d].node.attributes["data-iebg"]&&""!=c[d].node.attributes["data-iebg"]&&
j.push(c[d].node.attributes["data-iebg"].value);Loader.use("aralex.slider.FadeSlider",function(){var a=new aralex.slider.FadeSlider({id:"J-slide",triggerId:"J-slide-number",triggerEvent:"click",activeTriggerClass:"slide-number-active",delay:8E3});a.stop();b(j[0],function(){f[0].setStyle({backgroundImage:"url("+j[0]+")"});g[0].setStyle({top:"50px"})},function(){a.play();setTimeout(function(){if(arale.isIE()&&arale.browser.Engine.ie<10)for(var a=1;a<c.length;a++){f[a].setStyle({backgroundImage:"url("+
j[a]+")"});g[a].setStyle({top:"50px"})}else for(a=1;a<c.length;a++){f[a].setStyle({backgroundImage:"url("+j[a]+")",opacity:1});g[a].setStyle({opacity:1,left:0,top:"50px"})}},e)},function(){});E.on($$("#J-slide-number a"),"click",function(a){a.preventDefault()})})}else({banner:document.getElementById("banner"),triggers:$$("#J-slide-number a"),slider:$$("#banner .slide"),bg:$$("#banner .bg"),pic:$$("#banner .pic"),txt:$$("#banner .txt"),length:$$("#banner .slide").length,bgArr:[],picArr:[],txtArr:[],
picAmin:[],txtAmin:[],index:1,SLIDE:null,getDataValue:function(a,b,c){return typeof a[b].node.attributes[c]!="undefined"&&a[b].node.attributes[c]!=""?value=a[b].node.attributes[c].value:value=""},getImage:function(a,c,d){var f=this;b(c[d],function(){a[d].setStyle({backgroundImage:"url("+c[d]+")"})},function(){a[d].setAttributes({"data-load":"true"});if(f.getDataValue(f.bg,d,"data-load")=="true"&&f.getDataValue(f.pic,d,"data-load")=="true"&&f.getDataValue(f.txt,d,"data-load")=="true"){f.slider[d].setAttributes({"data-load":"true"});
setTimeout(function(){f.loadNextImg(d)},e)}},function(){})},getNextimg:function(a,c,d){b(c[d],function(){},function(){},function(){})},loadNextImg:function(a){if(a<this.length-1&&this.getDataValue(this.slider,a+1,"data-load")=="false"){this.getNextimg(this.bg,this.bgArr,a+1);this.getNextimg(this.pic,this.picArr,a+1);this.getNextimg(this.txt,this.txtArr,a+1)}},slideTo:function(a){this.index=parseInt(a);if(this.getDataValue(this.slider,this.index-1,"data-load")=="false"){this.getImage(this.bg,this.bgArr,
this.index-1);this.getImage(this.pic,this.picArr,this.index-1);this.getImage(this.txt,this.txtArr,this.index-1)}this.banner.className="slide-"+a;for(d=0;d<this.length;d++){this.txt[d].removeClass("anim-"+this.txtAmin[d]+"-over");this.pic[d].removeClass("anim-"+this.picAmin[d]+"-over");this.triggers[d].removeClass("slide-number-active")}this.txt[this.index-1].addClass("anim-"+this.txtAmin[this.index-1]+"-over");this.pic[this.index-1].addClass("anim-"+this.picAmin[this.index-1]+"-over");this.triggers[this.index-
1].addClass("slide-number-active")},interVal:function(){if(this.getDataValue(this.slider,this.index-1,"data-load")=="true"){if(this.index>=this.length)this.index=0;this.index++;this.slideTo(this.index)}},clearInterVal:function(){clearInterval(this.SLIDE)},init:function(){for(var a=this,b=0;b<a.length;b++){a.bgArr.push(a.getDataValue(a.slider,b,"data-bg"));a.picArr.push(a.getDataValue(a.slider,b,"data-pic"));a.txtArr.push(a.getDataValue(a.slider,b,"data-txt"));a.picAmin.push(a.getDataValue(a.pic,b,
"data-anim"));a.txtAmin.push(a.getDataValue(a.txt,b,"data-anim"))}for(d=0;d<a.triggers.length;d++)a.triggers[d].click(function(b){b.preventDefault();a.slideTo(b.target.innerHTML)});a.SLIDE=setInterval(function(){a.interVal()},8E3);E.on(a.banner,"mouseover",function(){a.clearInterVal()});E.on(a.banner,"mouseout",function(){a.SLIDE=setInterval(function(){a.interVal()},8E3)});a.slideTo(a.index)}}).init()};
