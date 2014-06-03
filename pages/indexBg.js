var authPicColums = {
	/**
	 *  节假日图片
	 *  @example　'2011-10-01':'http://www.img.alipay.net/img/alipay1.png'
	 */
	holidays: {},
	/**
	 * 场景图片
	 * @example 'lab.alipay.com/user':'[http://www.img.alipay.net/img/alipay2.png,'我的支付宝']'
	 */
	scene: {},
	/**
	 * 时间图片
	 * @example 'http://www.img.alipay.net/img/alipay3.png'
	 */	
	hours: {},
	/**
	 * 随机图片
	 */
	random: [],
	/**
	 * 是否需要随机图片
	 */
	needRandom: true
};
authPicColums.holidays['10-01'] = ['https://i.alipayobjects.com/e/201309/19zI31wk3r_src.jpg', 'false'];
authPicColums.scene['shenghuo.alipay.com'] = ['https://i.alipayobjects.com/e/201309/15ib4GFevP.jpg', 'true'];
authPicColums.scene['robot.alipay.com/portal/'] = ['https://i.alipayobjects.com/e/201309/15i9idiBkF.jpg', 'true'];
authPicColums.hours['0'] = ['https://i.alipayobjects.com/e/201311/1V4o5xqtgr_src.jpg', 'false'];
authPicColums.hours['1'] = ['https://i.alipayobjects.com/e/201311/1V52qKurDp_src.jpg', 'false'];
authPicColums.hours['2'] = ['https://i.alipayobjects.com/e/201311/1V4nsyvMbt_src.jpg', 'false'];
authPicColums.hours['3'] = ['https://i.alipayobjects.com/e/201311/1V4o0zhQPN_src.jpg', 'false'];
authPicColums.random.push(['https://i.alipayobjects.com/e/201311/1V52qKurDp_src.jpg', 'false']);
authPicColums.random.push(['https://i.alipayobjects.com/e/201311/1V4nsyvMbt_src.jpg', 'false']);
authPicColums.random.push(['https://i.alipayobjects.com/e/201311/1V4o0zhQPN_src.jpg', 'false']);
authPicColums.random.push(['https://i.alipayobjects.com/e/201311/1V4o5xqtgr_src.jpg', 'false']);

define("authcenter/login/1.1.4/js/module/indexBg-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : indexBg.js
     *  @desc       : 1. 登录首页的背景图片功能
     *                2. 图片的自适应功能
     *  @example    :
     *  @create     : 2013.08 - 09
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.indexBg = function(options) {
        this.init();
        for (var i in options) {
            this[i] = options[i];
        }
        if (this.imgTarget.length < 1 || this.imgParent.length < 1 || !this.picArr || this.authCnt.length < 1) {
            return false;
        }
        this.bindEvent();
    };
    system.auth.indexBg.prototype = {
        imgTarget: null,
        imgParent: null,
        authCnt: null,
        /**
         *  实例化当前的时间
         */
        currentDate: "",
        /**
         *  实例化场景
         */
        scene: "",
        /**
         *  所有图片数组
         */
        picArr: null,
        /**
         *  是否需要随机图片
         */
        needRandom: true,
        /**
         *  筛选适合当前的图片
         */
        splitPic: function(picColums, currentDate, scene, needRandom) {
            //获取节日图片
            if (currentDate && picColums.holidays[currentDate]) {
                return picColums.holidays[currentDate];
            }
            //获取场景图片
            if (scene && picColums.scene[scene]) {
                return picColums.scene[scene];
            }
            if (needRandom && picColums.random.length > 0) {
                var item = Math.floor(Math.random() * picColums.random.length);
                return picColums.random[item];
            } else {
                //获取当前时间图片
                //00:00:00 - 05:59:59 为凌晨
                //06:00:00 - 11:59:59 为早晨
                //12:00:00 - 17:59:59 为下午
                //18:00:00 - 23:59:59 为晚上
                var d = new Date();
                var h = d.getHours();
                if (h >= 0 && h < 6) {
                    return picColums.hours[0];
                } else if (h >= 6 && h < 12) {
                    return picColums.hours[1];
                } else if (h >= 12 && h < 18) {
                    return picColums.hours[2];
                } else if (h >= 18 && h < 24) {
                    return picColums.hours[3];
                }
            }
        },
        imgFactory: function() {
            return function(url, ready, load, error) {
                var onready, width, height, nWidth, nHeight, img = new Image();
                img.src = url;
                if (img.complete) {
                    ready.call(img);
                    if (load) {
                        load.call(img);
                    }
                    return true;
                }
                width = img.width;
                height = img.height;
                img.onerror = function() {
                    if (error) {
                        error.call(img);
                    }
                    img = img.onload = img.onerror = null;
                };
                onready = function() {
                    nWidth = img.width;
                    nHeight = img.height;
                    if (nWidth !== width || nHeight !== height || nWidth * nHeight > 1024) {
                        ready.call(img);
                        onready.end = true;
                    }
                };
                onready();
                img.onload = function() {
                    if (!onready.end) {
                        onready();
                    }
                    if (load) {
                        load.call(img);
                    }
                    img = img.onload = img.onerror = null;
                };
            };
        }(),
        init: function() {
            this.imgTarget = $("#J-authcenter-bgImg");
            this.imgParent = $("#J-authcenter-bg");
            this.authCnt = $("#J-authcenter");
        },
        bindEvent: function() {
            var that = this;
            var imgObj = that.splitPic(that.picArr, that.currentDate, that.scene, that.needRandom);
            //图片的路径
            var imgSrc = imgObj[0];
            //是否为小图片
            var imgStat = imgObj[1];
            if (imgStat === "true") {
                that.imgFactory(imgSrc, function() {}, function() {
                    $(".authcenter-body").css({
                        backgroundImage: "url(" + imgSrc + ")"
                    });
                }, function() {});
            } else {
                //处理图片加载的核心
                that.imgFactory(imgSrc, function() {}, function() {
                    var imgWidth = this.width;
                    var imgHeight = this.height;
                    that.imgTarget.attr("src", this.src);
                    that.authCnt.removeClass("authcenter-nobg");
                    that.imgTarget.addClass("authcenter-bg-show");
                    that.resizeBg(imgWidth, imgHeight);
                    $(window).resize(function() {
                        that.resizeBg(imgWidth, imgHeight);
                    });
                }, function() {});
            }
        },
        resizeBg: function(iw, ih) {
            var that = this;
            var cw = $(window).width(), ch = $(window).height();
            if (ch < $(document.body).height()) {
                ch = $(document.body).height();
            }
            //设置窗口大小
            that.imgParent.css({
                width: cw + "px",
                height: ch + "px"
            });
            //浏览器 宽/高 比例 大于 图片宽/高
            if (cw / ch >= iw / ih) {
                var new_h = parseInt(cw / iw * ih, 10);
                var imgTop = parseInt((ch - new_h) / 2, 10);
                //也就是图片以浏览器的宽度为宽度，高度上垂直居中
                that.imgTarget.css({
                    width: cw + "px",
                    height: new_h + "px",
                    top: imgTop + "px",
                    left: ""
                });
            } else {
                var new_w = parseInt(ch / ih * iw, 10);
                var imgLeft = parseInt((cw - new_w) / 2, 10);
                //也就是说以浏览器高度为高度，水平居中
                that.imgTarget.css({
                    width: new_w + "px",
                    height: ch + "px",
                    top: "",
                    left: imgLeft + "px"
                });
            }
            //处理 IE 下的自适应功能
            var isIE = (window.navigator.userAgent || "").toLowerCase().indexOf("msie") !== -1;
            if (isIE) {
                /*
                 * 779 < 屏幕宽度 < 990
                 * 320 < 屏幕宽度 < 780
                 */
                if (779 < cw && cw < 990) {
                    that.authCnt.addClass("sl-ie");
                } else if (320 < cw && cw < 780) {
                    that.authCnt.addClass("sl-ie");
                    that.authCnt.addClass("sl-ie-min");
                } else {
                    that.authCnt.removeClass("sl-ie");
                    that.authCnt.removeClass("sl-ie-min");
                }
            }
        }
    };
});