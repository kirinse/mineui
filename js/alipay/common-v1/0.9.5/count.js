define("alipay/common-v1/0.9.5/count",["gallery/jquery/1.7.2/jquery"],function(e,t,n){function u(){return i||(i=r('<span class="global-toplink-msgCount"></span>').addClass("fn-hide").appendTo(s)),i}var r=e("gallery/jquery/1.7.2/jquery"),i,s=r("#global-header-msg .global-toplink-msg"),o={count:0,setCount:function(e){this.count=e,e>99&&(e="99+"),e==0?s.removeClass("global-toplink-msg-active"):s.addClass("global-toplink-msg-active"),u().html(e).removeClass("fn-hide")},getCount:function(){return this.count},hideCount:function(){s.removeClass("global-toplink-msg-active"),u().addClass("fn-hide")}};n.exports=o});
