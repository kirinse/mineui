/** begin ---index.js---*/
/**
 * 支付宝首页静态化之后js
 * @author　long.qi
 */
//注册命名空间
arale.namespace('alipay.index');
/**
 * 工具类
 * 提供一些最基本的方法
 */
alipay.index.utils = {
	imgAttr:["src","class","id","width","height","alt"],
    /**
     * 将noscript的地址转化为图片
     */ 
    makePic:function(img,callback){
        var html_ = img.attr('innerHTML'),
            img_ = null,
			recordAttr = "";
        if (html_) {
            img_ = D.toDom(S(html_).unescapeHTML());
			img_ = $(img_);
        } else {
            img_ = document.createElement('IMG');
			img_ = $(img_);
			for(var i=0;i < alipay.index.utils.imgAttr.length;i++){
				recordAttr = alipay.index.utils.imgAttr[i];
				if(img.attr("data-"+recordAttr)!=""){
					img_.attr(recordAttr,img.attr("data-"+recordAttr));
				}
			}
        }
        img_.inject(img,'before');
        callback && callback(img);        
    },
    /**
     * 设置cookie
     * @param {String} name 设置cookie的name
     * @param {String} value 设置对应name的value
     */
    setCookie:function(name,value,Days){
        var Days = Days || 4; 
        var exp  = new Date();    
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    },
    /**
     * 获取cookie
     * @param {String} name 
     */
    getCookie:function(name){
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        if(arr != null) return unescape(arr[2]); 
        return null;
    },
    /**
     * 收起动画
     */
    slideUp:function(el,d,func){
        var height=300;
        (function(){
            if(height>0){
                height=height-30;
                el&&el.setStyle('height',height+'px');
                var timeId=setTimeout(arguments.callee,d);
            }else{
                func();
                clearTimeout(timeId);
            }
        })();
    }

};

/** end ---index.js---*/
/** begin ---modules/adjust.js---*/
/**
 * 首页自适应模块
 * 包含登录之后头部账户名的替换　登录后iframe的显示　明星用户高度的自适应
 * @author long.qi
 */
alipay.index.adjust = {
	/**
	 * 调整头部账户名
	 * @param {String} rname　姓名
	 * @param {String} logoutUrl 退出地址
	 * @param {String} scImg 安全相关图片
	 * @param {String} scText 安全提示文案
	 */
	headLogin:function(rname,logoutUrl,scImg,scText){
		var headLogin = $('headLogin');
		if(rname){
			//登陆注册改成姓名
			$$('.topmenu-item-first')[0].node.innerHTML = '<a href="https://lab.alipay.com/user/i.htm" title="进入我的支付宝">'+rname+'</a>';	
			//加退出
			var str = "";
			if(!logoutUrl || logoutUrl.indexOf('login/logout.htm') < 0){
				logoutUrl = logoutUrl+'/login/logout.htm';
			}
			str = '<li class="topmenu-item"><a seed="logout" href="'+logoutUrl+'">退出</a></li>';
			str = D.toDom(str);
			$(str).inject($$('.topmenu-item-dropdown')[0],'after');
		}
	},
	/**
	 * 展示登录,隐藏loading
	 */
	showLoginRecord:0,
	showLogin:function(){
		if(alipay.index.adjust.showLoginRecord == 0){
			if(!arale.isIE()){
				$('loginIframe') && $('loginIframe').node.contentDocument && $$('.alieditContainer',$($('loginIframe').node.contentDocument))[0] && $$('.alieditContainer',$($('loginIframe').node.contentDocument))[0].setStyle("visibility","hidden");
				$('loginIframe') && $('loginIframe').setStyle("opacity","0");	
				$('loginIframe') && $('loginIframe').removeClass('fn-hide');
				++alipay.index.adjust.showLoginRecord;
			}else{
				$('loginLoading') && $('loginLoading').dispose();
				$('loginIframe') && $('loginIframe').setStyle("height","297px");
				$('loginIframe') && $('loginIframe').removeClass('fn-hide');
			}
		}else{
			$('loginLoading') && $('loginLoading').dispose();
			$('loginIframe') && $('loginIframe').removeClass('fn-hide');	
		}
	},
	/**
	 * 明星用户的调整
	 * @param {Number} error 误差
	 */
	heightAdjust:function(error){
	},
	iframeAdjust:function(adjustNum){
		$("loginIframe").setStyle("top",adjustNum+"px");
	}
};

/** end ---modules/adjust.js---*/
/** begin ---modules/lazyload.js---*/
/**
 * 图片的延时加载
 * @param {Array}　imgs　需要进行lazyload的图片
 * @param {Number} num 一次处理的图片数
 * @param {Number} time 进行分次处理的时间间隔
 * @param {Object} callback　回调函数
 * @author　long.qi
 */
alipay.index.lazyload = function(imgs,callback,num,time){
    //参数初始化
    num = num || 10;
    time = time || 100;
    //图片的处理
    var makePics = function(imgs){
        A(imgs).each(function(img,index){
            img && alipay.index.utils.makePic(img,callback.doing);
        });
    };
    //考虑到图片可能会较多,需要对图片进行分批处理
    var length = imgs.length,
        l = Math.ceil(length/num),
        j = 0;
    for(var k =0 ;k<l;k++){
        (function(i){
            var start = i*num,end=(i+1)*num;
            end = (end<length)?end:length;
            setTimeout(function(){
                makePics(imgs.slice(start,end));
                j++;
                if(j==l){
                    callback && callback.done();
                }
            },time*i);
        })(k);
    }
};

/** end ---modules/lazyload.js---*/
/** begin ---modules/lazyloadBanner.js---*/
/**
 * 图片的延时加载
 * @param {Array}　imgs　需要进行lazyload的图片
 * @author　bingye.yu
 */
alipay.index.lazyloadBanner = function(eles){
	if(!arale.isIE6()){
		A(eles).each(function(ele){
			ele.addClass(ele.attr("data-class"));
		});
	}
};

/** end ---modules/lazyloadBanner.js---*/
/** begin ---modules/randomCor.js---*/
/**
 * 合作商随机展示
 * @param {Array} pics 图片数组
 * @param {arale.node} el 需要设置图片的元素
 * @param {String} defaultPic　默认图片地址
 * @author　long.qi
 */
alipay.index.randomBank = function(pics,el,defaultPic){
    if(!el) return ;
    //需要提供容错机制在没有图片时照常显示
    if(pics && pics.length){
        defaultPic = pics[Math.floor(pics.length * Math.random())];
    }
    el.attr('class',defaultPic);
};

/** end ---modules/randomCor.js---*/
/** begin ---modules/banner.js---*/
/**
 * 顶部秒杀大神banner
 * @param {Number} cookieDays　cookie保存时间
 * @param {Number} animTime 动画时间间隔
 * @author　long.qi
 */
alipay.index.banner = function(cookieDays,animTime){
    var utils = alipay.index.utils;
    //判断是否为第一次
    var isFirstShow=parseInt(utils.getCookie('indexBannerIsShow')||0),
        bannerCnt=$('indexBanner'),
        expandBanner=$$('.banner-expand')[0],
        foldBanner=$$('.banner-fold')[0];
    //已经展现过那么直接展现小图
    if(isFirstShow){
        if(!foldBanner) return;
        foldBanner.removeClass('fn-hide');
    }
    //展现大图
    else{
        if(!expandBanner) return;
        expandBanner.removeClass('fn-hide');
        utils.setCookie('indexBannerIsShow',1,cookieDays);
        //5秒之后收起大图
        setTimeout(function(){
            utils.slideUp(expandBanner,100,function(){
                expandBanner.addClass('fn-hide');
                foldBanner.removeClass('fn-hide');
            });
        },animTime);
    }
};

/** end ---modules/banner.js---*/
/** begin ---modules/nav.js---*/
/**
 * 导航模块
 * @author　zhanxin.lin
 */
alipay.index.nav = function(){
	// 顶部下拉
	var topMenuDropdown = $("J-topmenu-dropdown");
	E.on(topMenuDropdown, 'mouseover', function(e){
		topMenuDropdown.addClass("topmenu-item-dropdown-hover");
	});
	E.on(topMenuDropdown, 'mouseout', function(e){
		topMenuDropdown.removeClass("topmenu-item-dropdown-hover");
	});
	// 导航下拉
	var navItem = $$("#J-nav .nav-item");
	A(navItem).each(function(item, index) {
		E.on(item, 'mouseover', function(e){
			item.addClass("nav-item-hover");
			$$(".nav-item-link", item)[0].addClass("nav-item-link-active");
			if($$(".angle", item)[0]) {
				$$(".angle", item)[0].setStyle({"display":"block"});
	        	$$(".nav-item-sub", item)[0].setStyle({"display":"block"});
	        }
		});
		E.on(item, 'mouseout', function(e){
			item.removeClass("nav-item-hover");
			$$(".nav-item-link", item)[0].removeClass("nav-item-link-active");
			if($$(".angle", item)[0]) {
				$$(".angle", item)[0].setStyle({"display":"none"});
	        	$$(".nav-item-sub", item)[0].setStyle({"display":"none"})
	        }
		});
	}); 
};


/** end ---modules/nav.js---*/
/** begin ---modules/scroller.js---*/
/**
 *@description 公司公告
 *@author bingye.yu
 **/
alipay.index.scroller = function(){
    //公司公告,scroll
	if($$("#J-views li")[0] && $$("#J-views li").length > 2){
    var newScroll = new aralex.slider.ScrollSlider({
        id: 'J-views',
		type: 'scrollY',
        delay: 8000,
		capacity:2,
        effect: 'persistent'
    });
	}
};

/** end ---modules/scroller.js---*/
/** begin ---modules/bannerSlider.js---*/
/**
 * 首页Banner图片轮转效果
 * @author　展新(zhanxin.lin@alipay.com)
 * @date: 2012.10
 * @update: 添加动态更新延时加载图片入口 count @ 2012.12.12
 */
alipay.index.bannerSlider = function(count) {
	/**
	 * delayTime 预加载延时时间
	 */
	if(typeof count == "undefined") {
		var delayTime = 1000;
	} else {
		var delayTime = count;
	}
	/**s
	 * 图片预加载函数
	 */
	var imgReady = (function () {
		var list = [], intervalId = null,
	
		// 用来执行队列
		tick = function () {
			var i = 0;
			for (; i < list.length; i++) {
				list[i].end ? list.splice(i--, 1) : list[i]();
			};
			!list.length && stop();
		},
	
		// 停止所有定时器队列
		stop = function () {
			clearInterval(intervalId);
			intervalId = null;
		};
	
		return function (url, ready, load, error) {
			var onready, width, height, newWidth, newHeight,
				img = new Image();
			
			img.src = url;
	
			// 如果图片被缓存，则直接返回缓存数据
			if (img.complete) {
				ready.call(img);
				load && load.call(img);
				return;
			};
			
			width = img.width;
			height = img.height;
			
			// 加载错误后的事件
			img.onerror = function () {
				error && error.call(img);
				onready.end = true;
				img = img.onload = img.onerror = null;
			};
			
			// 图片尺寸就绪
			onready = function () {
				newWidth = img.width;
				newHeight = img.height;
				if (newWidth !== width || newHeight !== height ||
					// 如果图片已经在其他地方加载可使用面积检测
					newWidth * newHeight > 1024
				) {
					ready.call(img);
					onready.end = true;
				};
			};
			onready();
			
			// 完全加载完毕的事件
			img.onload = function () {
				// onload在定时器时间差范围内可能比onready快
				// 这里进行检查并保证onready优先执行
				!onready.end && onready();
			
				load && load.call(img);
				
				// IE gif动画会循环执行onload，置空onload即可
				img = img.onload = img.onerror = null;
			};
			
			// 加入队列中定期执行
			if (!onready.end) {
				list.push(onready);
				// 无论何时只允许出现一个定时器，减少浏览器性能损耗
				if (intervalId === null) intervalId = setInterval(tick, 40);
			};
		};
	})();
	
	/**
	 * 执行图片轮转
	 */
	var useAmin, bannerId;
	bannerId = $("banner");
	if(typeof bannerId.node.attributes['data-banner'] != "undefined" && bannerId.node.attributes['data-banner'] != "") {
		useAmin = bannerId.node.attributes['data-banner'].value;
		if(useAmin == "true") {
			useAmin = true;
		} else {
			useAmin = false;
		}
	} else {
		useAmin = true;
	}
	 
	if (!useAmin || (arale.isIE() && arale.browser.Engine.ie < 10)) {
		var slider = $$("#banner .slide");
		var bg = $$("#banner .bg");
		var txt = $$("#banner .txt");
		var url = [];
		for(var i = 0; i < slider.length; i ++) {
			if(typeof slider[i].node.attributes['data-iebg'] != "undefined" && slider[i].node.attributes['data-iebg'] != "") {
				var p = slider[i].node.attributes['data-iebg'].value;
				url.push(p);
			}
		}		
     	Loader.use('aralex.slider.FadeSlider', function() {
        	var fs = new aralex.slider.FadeSlider({
	          id: "J-slide",
	          triggerId: "J-slide-number",
	          triggerEvent: "click",
	          activeTriggerClass: 'slide-number-active',
	          delay: 8000
	    });   
        fs.stop();
        imgReady(url[0], function() {
        	bg[0].setStyle({"backgroundImage": "url(" + url[0] + ")"});
        	txt[0].setStyle({ "top":"50px"});
        }, function() {
        	fs.play();
        	//第一张图片下载完之后，预加载其他图片
        	setTimeout(function() {
        		if(arale.isIE() && arale.browser.Engine.ie < 10) {
        			for(var i = 1; i < slider.length; i ++) {
        				bg[i].setStyle({"backgroundImage": "url(" + url[i] + ")"});
        				txt[i].setStyle({ "top":"50px" });
        			}
        		} else {
        			for(var i = 1; i < slider.length; i ++) {
        				bg[i].setStyle({"backgroundImage": "url(" + url[i] + ")", "opacity": 1});
        				txt[i].setStyle({ "opacity": 1, "left": 0, "top":"50px"});
        			}
        		}
        	}, delayTime);
        }, function() {}); 
  
        E.on($$('#J-slide-number a'), 'click', function(e){
	       e.preventDefault();
	    }); 
      });
    } else {
    	/**
    	 * 对于高级浏览器的动画效果功能
    	 */
    	var sliderBanner = {
			banner: document.getElementById('banner'),
			triggers: $$('#J-slide-number a'),
			slider: $$('#banner .slide'),
			bg: $$('#banner .bg'),
			pic: $$('#banner .pic'),
			txt: $$('#banner .txt'),
			length: $$('#banner .slide').length,
			bgArr: [],
			picArr: [],
			txtArr: [],
			picAmin: [],
			txtAmin: [],
			index: 1,
			SLIDE: null,
			/**
			 * 通过data-获取值
			 */
			getDataValue: function(name, num, data) {	
				if(typeof name[num].node.attributes[data] != "undefined" && name[num].node.attributes[data] != "") {
					return value = name[num].node.attributes[data].value;
				} else {
					return value = "";
				}
			},
			/**
			 * 获取图片
			 */
			getImage: function(item, itemArr, num) {
				var that = this;
				imgReady(itemArr[num], function () {
					//图片READY的时候，就设置CSS，使图片能够渐进加载
					item[num].setStyle({"backgroundImage": "url(" + itemArr[num] + ")"});
				}, function() {
					//图片完全加载，触发下面的函数
					item[num].setAttributes({"data-load":"true"});
					if(that.getDataValue(that.bg, num, 'data-load') == "true" && that.getDataValue(that.pic, num, 'data-load') == "true" && that.getDataValue(that.txt, num, 'data-load') == "true") {
	        			that.slider[num].setAttributes({"data-load":"true"});
	        			//预加载接下来的图片，需要数据依靠	
        				setTimeout(function(){
        					that.loadNextImg(num);
        				}, delayTime);	
	        		
	        		}         		
				}, function() {});
			},
			/**
			 * 获取下一组图片
			 */
			getNextimg: function(item, itemArr, num) {
				imgReady(itemArr[num], function() {}, function() {
				} , function() {} );		
			},
			/**
			 * 预加载
			 */
			loadNextImg: function(num) {
				if(num < this.length -1) {
					if(this.getDataValue(this.slider, num + 1, 'data-load') == "false") {
						this.getNextimg(this.bg, this.bgArr, num + 1);
			   			this.getNextimg(this.pic, this.picArr, num + 1);
		    			this.getNextimg(this.txt, this.txtArr, num + 1); 
	    			}
				}
			},
			slideTo: function(number) {
				this.index = parseInt(number);
				if(this.getDataValue(this.slider, this.index -1, 'data-load') == "false") {
		        	this.getImage(this.bg, this.bgArr, this.index - 1);
			   		this.getImage(this.pic, this.picArr, this.index - 1);
		    		this.getImage(this.txt, this.txtArr, this.index - 1);   		 
		    	} 
		        this.banner.className = 'slide-' + number;      
		        for (i = 0; i < this.length; i++) {
		        	this.txt[i].removeClass('anim-'+this.txtAmin[i]+'-over');
					this.pic[i].removeClass('anim-'+this.picAmin[i]+'-over');
		            this.triggers[i].removeClass('slide-number-active');
		        }
		        this.txt[this.index - 1].addClass('anim-'+this.txtAmin[this.index - 1]+'-over');
				this.pic[this.index - 1].addClass('anim-'+this.picAmin[this.index - 1]+'-over');
		        this.triggers[this.index - 1].addClass('slide-number-active');
			},
			/**
			 * 执行自动轮播定时器
			 */
			interVal: function() {
				var that = this;
				if(that.getDataValue(that.slider, that.index - 1, 'data-load') == "true") {
					if (that.index >= that.length) that.index = 0;
					that.index++;
	            	that.slideTo(that.index);
				}
			},
			/**
			 * 清除轮播定时器
			 */
			clearInterVal: function() {
				var that = this;
				clearInterval(that.SLIDE);
			},
			/**
			 * 初始化
			 */
			init: function() {
				var that = this, SLIDE;
				for (var j = 0; j < that.length; j ++ ){
		        	that.bgArr.push(that.getDataValue(that.slider, j, 'data-bg'));
		        	that.picArr.push(that.getDataValue(that.slider, j, 'data-pic'));
		        	that.txtArr.push(that.getDataValue(that.slider, j, 'data-txt'))
		        	that.picAmin.push(that.getDataValue(that.pic, j, 'data-anim'));
		        	that.txtAmin.push(that.getDataValue(that.txt, j, 'data-anim'));
	        	}
	        	//点击事件
				for(i=0; i < that.triggers.length; i ++) {
					var item = that.triggers[i];
		          	item.click(function(e) {
		            	e.preventDefault();
		            	that.slideTo(e.target.innerHTML);
		          	});
				}
				that.SLIDE = setInterval(function() {that.interVal()}, 8000);
				//鼠标经过则不进行图片轮转
		        E.on(that.banner, 'mouseover', function() {
		          that.clearInterVal();
		        });
		        //鼠标离开则自动轮播
		        E.on(that.banner, 'mouseout', function() {
		          that.SLIDE = setInterval(function() {that.interVal()}, 8000);
		        }); 
		        //执行第一张图片轮播
		        that.slideTo(that.index);
			}
		}
		//初始化
		sliderBanner.init();
	}
	
}

/** end ---modules/bannerSlider.js---*/
/**Last Changed Author: zhanxin.lin--Last Changed Date: Mon Oct 22 11:40:11 CST 2012**/
/**alipay.alipayIndexSimple.main-1.4**/
/** CurrentDeveloper: linzhanxin**/
/** DeployDate: Thu Dec 13 16:40:41 CST 2012**/
