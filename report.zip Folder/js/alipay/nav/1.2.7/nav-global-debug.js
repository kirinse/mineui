define("alipay/nav/1.2.7/nav-global-debug", [ "$-debug", "./widget/abtest-debug", "./component/top-debug", "arale/popup/1.1.5/popup-debug", "arale/overlay/1.1.3/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "./widget/component-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug", "alipay/message-panel/1.0.1/message-panel-debug", "gallery/handlebars/1.0.2/runtime-debug", "./widget/account-debug", "./widget/count-debug", "./tpl/component-top-debug.tpl", "./tpl/widget-help-debug.tpl", "./tpl/widget-more-debug.tpl", "./tpl/widget-account-debug.tpl", "./component/common-debug", "arale/cookie/1.0.2/cookie-debug", "./tpl/component-common-debug.tpl", "./widget/cmstpl-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var abtest = require("./widget/abtest-debug");
    var top = require("./component/top-debug");
    var common = require("./component/common-debug");
    var cmsTpl = require("./widget/cmstpl-debug");
    exports.init = function(data) {
        $.extend(data, cmsTpl);
        // abtest 最后返回 type，a 或者 b
        abtest(data, function(type) {
            top[type](data).appendTo(data.container);
            common[type](data).appendTo(data.container);
            window.Tracker && Tracker.calc("TTI-global-nav", new Date() - window._to.start);
        });
    };
});

define("alipay/nav/1.2.7/widget/abtest-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), aburl = window.location.href;
    // 用于ab版本判定的url
    module.exports = function(data, callback) {
        // 为了方便开发和测试直接查看B版，允许参数或者Cookie中指定_ABTEST_TARGET_参数
        var target_regex = "_ABTEST_TARGET_=([AB])";
        var has_target = window.location.search.match(target_regex) || document.cookie.match(target_regex);
        if (has_target instanceof Array) {
            callback(has_target[1] === "A" ? "a" : "b");
            return;
        }
        /* 如果 abtest 开关为关闭 或者 用户未登录，直接渲染A版不请求
     * 这个判断要放在_ABTEST_TARGET_之后，因为在不开启abtest的情况下
     * 也是允许使用_ABTEST_TARGET_来访问的
     */
        if (!data.abtestEnabled || data.userName === "") {
            callback("a");
            return;
        }
        aburl = (data.pageAbsUrl || aburl).split("?").shift();
        // 先检查由session返回的ABTest数据，session只返回符合B版的url列表，以逗号分隔
        if (data.abtest && data.abtest.length > 0) {
            // 都不匹配则渲染A版
            var version = "a";
            $(data.abtest.split(",")).each(function(i, e) {
                if (aburl.indexOf(e) > -1) {
                    // 匹配包含，渲染B版
                    version = "b";
                    return;
                }
            });
            callback(version);
            return;
        }
        // 请求导航服务器
        $.ajax({
            url: data.uninavServer + "/nav/getNavData.json",
            dataType: "jsonp",
            jsonp: "_callback",
            timeout: 3e3,
            // 3s 超时
            data: {
                navType: data.abtestType,
                referer: aburl,
                abtest: true,
                // 是否加载abtest数据 -> 是
                loadData: false
            },
            success: function(res) {
                // json 中有明确反馈，直接根据反馈渲染A版或B版
                if (res.stat && res.stat === "fail" && Tracker && Tracker.click) {
                    // 发送fail埋点
                    Tracker.click("uninav-abtest-json-fail");
                    callback("a");
                    return;
                }
                callback(res.abtestInfo && res.abtestInfo === "B" ? "b" : "a");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // 所有错误都渲染a版
                if (Tracker && Tracker.click) {
                    // 向服务器发送json请求错误错误埋点
                    Tracker.click("uninav-abtest-json-" + textStatus);
                }
                callback(a);
            }
        });
    };
});

define("alipay/nav/1.2.7/component/top-debug", [ "$-debug", "arale/popup/1.1.5/popup-debug", "arale/overlay/1.1.3/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "alipay/nav/1.2.7/widget/component-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug", "alipay/message-panel/1.0.1/message-panel-debug", "gallery/handlebars/1.0.2/runtime-debug", "alipay/nav/1.2.7/widget/account-debug", "alipay/nav/1.2.7/widget/count-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Popup = require("arale/popup/1.1.5/popup-debug");
    var Component = require("alipay/nav/1.2.7/widget/component-debug");
    var MessagePanel = require("alipay/message-panel/1.0.1/message-panel-debug");
    var Account = require("alipay/nav/1.2.7/widget/account-debug");
    var Count = require("alipay/nav/1.2.7/widget/count-debug");
    var topTpl = require("alipay/nav/1.2.7/tpl/component-top-debug.tpl");
    var helpTpl = require("alipay/nav/1.2.7/tpl/widget-help-debug.tpl");
    var moreTpl = require("alipay/nav/1.2.7/tpl/widget-more-debug.tpl");
    var accountTpl = require("alipay/nav/1.2.7/tpl/widget-account-debug.tpl");
    // A 版
    exports.a = function(model) {
        return new TopComponent({
            className: "global-top-a",
            model: model
        }).after("appendTo", function() {
            this.initMessage();
            this.initHelp();
            this.initAccount();
            this.initMore();
        }).render();
    };
    // B 版
    exports.b = function(model) {
        var el = exports.a(model);
        el.element.removeClass("global-top-a").addClass("global-top-b");
        return el;
    };
    var TopComponent = Component.extend({
        attrs: {
            template: topTpl
        },
        render: function() {
            var model = this.get("model");
            // 显示淘宝和阿里助手
            // 切换个人和商户
            model.showOtherLogin = model.showTaobaoLogin || model.showAlibabaLogin;
            model.showSwitch = model.showMerchant || model.showPersonal;
            model.showOtherLoginLast = model.showOtherLogin && !model.showSwitch;
            model.showSwitchLast = model.showMerchant || model.showPersonal;
            model.showMobileLast = !model.showOtherLogin && !model.showSwitch;
            // 账户头像
            model.portraitPath = model.portraitPath ? model.tfsImageServer + model.portraitPath : "";
            this.set("model", model);
            return TopComponent.superclass.render.call(this);
        },
        // 初始化消息浮层
        initMessage: function() {
            var that = this, model = this.get("model");
            if (model.isLogin && model.msgSwitch && model.needLoadMsg !== "N" && !model.msgHide) {
                var message = new MessagePanel({
                    trigger: that.find("#globalMsg"),
                    personalServer: model.personalServer,
                    couriercoreServer: model.couriercoreServer,
                    align: {
                        baseElement: ".global-top-right",
                        selfXY: [ "100%", 0 ],
                        baseXY: [ "100%+10", "100%" ]
                    }
                });
                message.on("messageChange", function(data) {
                    var count;
                    if (data.total > 99) {
                        count = "99+";
                    } else if (data.total <= 0) {
                        count = "";
                    } else {
                        count = data.total;
                    }
                    that.find("#globalMsg .global-msg-count").html(count);
                    that.find("#globalMsg")[data.unread ? "addClass" : "removeClass"]("global-msg-active");
                    that.find("#globalMsg a")[data.unread ? "addClass" : "removeClass"]("message-clock-animate");
                });
            }
        },
        // 初始化帮助浮层
        initHelp: function() {
            new Popup({
                trigger: this.find("#globalHelp"),
                parentNode: this.element,
                width: "140px",
                effect: "fade",
                duration: 150,
                beforeShow: function() {
                    this.get("trigger").addClass("global-top-item-hover");
                },
                afterHide: function() {
                    this.get("trigger").removeClass("global-top-item-hover");
                },
                template: helpTpl,
                align: {
                    baseXY: [ "100%", "100%" ],
                    selfXY: [ "100%", 0 ]
                }
            });
        },
        // 初始化账户浮层
        initAccount: function() {
            new Account({
                trigger: this.find("#globalUser"),
                parentNode: this.element,
                width: "230px",
                effect: "fade",
                duration: 150,
                zIndex: 100,
                beforeShow: function() {
                    this.get("trigger").addClass("global-top-item-hover");
                },
                afterHide: function() {
                    this.get("trigger").removeClass("global-top-item-hover");
                },
                template: accountTpl,
                model: this.get("model"),
                align: {
                    baseXY: [ "100%", "100%" ],
                    selfXY: [ "100%", 0 ]
                }
            });
        },
        // 初始化更多菜单
        initMore: function() {
            new Popup({
                trigger: this.find("#globalMore"),
                parentNode: this.element,
                width: "140px",
                effect: "fade",
                duration: 150,
                beforeShow: function() {
                    this.get("trigger").addClass("global-top-item-hover");
                },
                afterHide: function() {
                    this.get("trigger").removeClass("global-top-item-hover");
                },
                template: moreTpl,
                align: {
                    baseXY: [ "100%", "100%" ],
                    selfXY: [ "100%", 0 ]
                }
            });
        }
    });
});

define("arale/popup/1.1.5/popup-debug", [ "$-debug", "arale/overlay/1.1.3/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Overlay = require("arale/overlay/1.1.3/overlay-debug");
    // Popup 是可触发 Overlay 型 UI 组件
    var Popup = Overlay.extend({
        attrs: {
            // 触发元素
            trigger: {
                value: null,
                // required
                getter: function(val) {
                    return $(val);
                }
            },
            // 触发类型
            triggerType: "hover",
            // or click or focus
            // 触发事件委托的对象
            delegateNode: {
                value: null,
                getter: function(val) {
                    return $(val);
                }
            },
            // 默认的定位参数
            align: {
                value: {
                    baseXY: [ 0, "100%" ],
                    selfXY: [ 0, 0 ]
                },
                setter: function(val) {
                    if (!val) {
                        return;
                    }
                    if (val.baseElement) {
                        this._specifiedBaseElement = true;
                    } else if (this.activeTrigger) {
                        // 若给的定位元素未指定基准元素
                        // 就给一个...
                        val.baseElement = this.activeTrigger;
                    }
                    return val;
                },
                getter: function(val) {
                    // 若未指定基准元素，则按照当前的触发元素进行定位
                    return $.extend({}, val, this._specifiedBaseElement ? {} : {
                        baseElement: this.activeTrigger
                    });
                }
            },
            // 延迟触发和隐藏时间
            delay: 70,
            // 是否能够触发
            // 可以通过set('disabled', true)关闭
            disabled: false,
            // 基本的动画效果，可选 fade|slide
            effect: "",
            // 动画的持续时间
            duration: 250
        },
        setup: function() {
            Popup.superclass.setup.call(this);
            this._bindTrigger();
            this._blurHide(this.get("trigger"));
            // 默认绑定activeTrigger为第一个元素
            // for https://github.com/aralejs/popup/issues/6
            this.activeTrigger = this.get("trigger").eq(0);
            // 当使用委托事件时，_blurHide 方法对于新添加的节点会失效
            // 这时需要重新绑定
            var that = this;
            if (this.get("delegateNode")) {
                this.before("show", function() {
                    that._relativeElements = that.get("trigger");
                    that._relativeElements.push(that.element);
                });
            }
        },
        render: function() {
            Popup.superclass.render.call(this);
            // 通过 template 生成的元素默认也应该是不可见的
            // 所以插入元素前强制隐藏元素，#20
            this.element.hide();
            return this;
        },
        show: function() {
            if (this.get("disabled")) {
                return;
            }
            return Popup.superclass.show.call(this);
        },
        // triggerShimSync 为 true 时
        // 表示什么都不做，只是触发 hide 的 before/after 绑定方法
        hide: function(triggerShimSync) {
            if (!triggerShimSync) {
                return Popup.superclass.hide.call(this);
            }
            return this;
        },
        _bindTrigger: function() {
            var triggerType = this.get("triggerType");
            if (triggerType === "click") {
                this._bindClick();
            } else if (triggerType === "focus") {
                this._bindFocus();
            } else {
                // 默认是 hover
                this._bindHover();
            }
        },
        _bindClick: function() {
            var that = this;
            bindEvent("click", this.get("trigger"), function(e) {
                // this._active 这个变量表明了当前触发元素是激活状态
                if (this._active === true) {
                    that.hide();
                } else {
                    // 将当前trigger标为激活状态
                    makeActive(this);
                    that.show();
                }
            }, this.get("delegateNode"), this);
            // 隐藏前清空激活状态
            this.before("hide", function() {
                makeActive();
            });
            // 处理所有trigger的激活状态
            // 若 trigger 为空，相当于清除所有元素的激活状态
            function makeActive(trigger) {
                if (that.get("disabled")) {
                    return;
                }
                that.get("trigger").each(function(i, item) {
                    if (trigger == item) {
                        item._active = true;
                        // 标识当前点击的元素
                        that.activeTrigger = $(item);
                    } else {
                        item._active = false;
                    }
                });
            }
        },
        _bindFocus: function() {
            var that = this;
            bindEvent("focus", this.get("trigger"), function() {
                // 标识当前点击的元素
                that.activeTrigger = $(this);
                that.show();
            }, this.get("delegateNode"), this);
            bindEvent("blur", this.get("trigger"), function() {
                setTimeout(function() {
                    !that._downOnElement && that.hide();
                    that._downOnElement = false;
                }, that.get("delay"));
            }, this.get("delegateNode"), this);
            // 为了当input blur时能够选择和操作弹出层上的内容
            this.delegateEvents("mousedown", function(e) {
                this._downOnElement = true;
            });
        },
        _bindHover: function() {
            var trigger = this.get("trigger");
            var delegateNode = this.get("delegateNode");
            var delay = this.get("delay");
            var showTimer, hideTimer;
            var that = this;
            // 当 delay 为负数时
            // popup 变成 tooltip 的效果
            if (delay < 0) {
                this._bindTooltip();
                return;
            }
            bindEvent("mouseenter", trigger, function() {
                clearTimeout(hideTimer);
                hideTimer = null;
                // 标识当前点击的元素
                that.activeTrigger = $(this);
                showTimer = setTimeout(function() {
                    that.show();
                }, delay);
            }, delegateNode, this);
            bindEvent("mouseleave", trigger, leaveHandler, delegateNode, this);
            // 鼠标在悬浮层上时不消失
            this.delegateEvents("mouseenter", function() {
                clearTimeout(hideTimer);
            });
            this.delegateEvents("mouseleave", leaveHandler);
            function leaveHandler(e) {
                clearTimeout(showTimer);
                showTimer = null;
                if (that.get("visible")) {
                    hideTimer = setTimeout(function() {
                        that.hide();
                    }, delay);
                }
            }
        },
        _bindTooltip: function() {
            var trigger = this.get("trigger");
            var delegateNode = this.get("delegateNode");
            var that = this;
            bindEvent("mouseenter", trigger, function() {
                // 标识当前点击的元素
                that.activeTrigger = $(this);
                that.show();
            }, delegateNode, this);
            bindEvent("mouseleave", trigger, function() {
                that.hide();
            }, delegateNode, this);
        },
        _onRenderVisible: function(val, originVal) {
            // originVal 为 undefined 时不继续执行
            if (val === !!originVal) {
                return;
            }
            var fade = this.get("effect").indexOf("fade") !== -1;
            var slide = this.get("effect").indexOf("slide") !== -1;
            var animConfig = {};
            slide && (animConfig.height = val ? "show" : "hide");
            fade && (animConfig.opacity = val ? "show" : "hide");
            // 需要在回调时强制调一下 hide
            // 来触发 iframe-shim 的 sync 方法
            // 修复 ie6 下 shim 未隐藏的问题
            // visible 只有从 true 变为 false 时，才调用这个 hide
            var that = this;
            var hideComplete = val ? function() {
                that.trigger("animated");
            } : function() {
                // 参数 true 代表只是为了触发 shim 方法
                that.hide(true);
                that.trigger("animated");
            };
            if (fade || slide) {
                this.element.stop(true, true).animate(animConfig, this.get("duration"), hideComplete).css({
                    visibility: "visible"
                });
            } else {
                this.element[val ? "show" : "hide"]();
            }
        }
    });
    module.exports = Popup;
    // 一个绑定事件的简单封装
    function bindEvent(type, element, fn, delegateNode, context) {
        var hasDelegateNode = delegateNode && delegateNode[0];
        context.delegateEvents(hasDelegateNode ? delegateNode : element, hasDelegateNode ? type + " " + element.selector : type, function(e) {
            fn.call(e.currentTarget, e);
        });
    }
});

define("arale/overlay/1.1.3/overlay-debug", [ "$-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), Position = require("arale/position/1.0.1/position-debug"), Shim = require("arale/iframe-shim/1.0.2/iframe-shim-debug"), Widget = require("arale/widget/1.1.1/widget-debug");
    // Overlay
    // -------
    // Overlay 组件的核心特点是可定位（Positionable）和可层叠（Stackable）
    // 是一切悬浮类 UI 组件的基类
    var Overlay = Widget.extend({
        attrs: {
            // 基本属性
            width: null,
            height: null,
            zIndex: 99,
            visible: false,
            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [ 0, 0 ],
                // 基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [ 0, 0 ]
            },
            // 父元素
            parentNode: document.body
        },
        show: function() {
            // 若从未渲染，则调用 render
            if (!this.rendered) {
                this.render();
            }
            this.set("visible", true);
            return this;
        },
        hide: function() {
            this.set("visible", false);
            return this;
        },
        setup: function() {
            var that = this;
            // 加载 iframe 遮罩层并与 overlay 保持同步
            this._setupShim();
            // 窗口resize时，重新定位浮层
            this._setupResize();
            // 统一在显示之后重新设定位置
            this.after("show", function() {
                that._setPosition();
            });
        },
        destroy: function() {
            // 销毁两个静态数组中的实例
            erase(this, Overlay.allOverlays);
            erase(this, Overlay.blurOverlays);
            return Overlay.superclass.destroy.call(this);
        },
        // 进行定位
        _setPosition: function(align) {
            // 不在文档流中，定位无效
            if (!isInDocument(this.element[0])) return;
            align || (align = this.get("align"));
            // 如果align为空，表示不需要使用js对齐
            if (!align) return;
            var isHidden = this.element.css("display") === "none";
            // 在定位时，为避免元素高度不定，先显示出来
            if (isHidden) {
                this.element.css({
                    visibility: "hidden",
                    display: "block"
                });
            }
            Position.pin({
                element: this.element,
                x: align.selfXY[0],
                y: align.selfXY[1]
            }, {
                element: align.baseElement,
                x: align.baseXY[0],
                y: align.baseXY[1]
            });
            // 定位完成后，还原
            if (isHidden) {
                this.element.css({
                    visibility: "",
                    display: "none"
                });
            }
            return this;
        },
        // 加载 iframe 遮罩层并与 overlay 保持同步
        _setupShim: function() {
            var shim = new Shim(this.element);
            // 在隐藏和设置位置后，要重新定位
            // 显示后会设置位置，所以不用绑定 shim.sync
            this.after("hide _setPosition", shim.sync, shim);
            // 除了 parentNode 之外的其他属性发生变化时，都触发 shim 同步
            var attrs = [ "width", "height" ];
            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    this.on("change:" + attr, shim.sync, shim);
                }
            }
            // 在销魂自身前要销毁 shim
            this.before("destroy", shim.destroy, shim);
        },
        // resize窗口时重新定位浮层，用这个方法收集所有浮层实例
        _setupResize: function() {
            Overlay.allOverlays.push(this);
        },
        // 除了 element 和 relativeElements，点击 body 后都会隐藏 element
        _blurHide: function(arr) {
            arr = $.makeArray(arr);
            arr.push(this.element);
            this._relativeElements = arr;
            Overlay.blurOverlays.push(this);
        },
        // 用于 set 属性后的界面更新
        _onRenderWidth: function(val) {
            this.element.css("width", val);
        },
        _onRenderHeight: function(val) {
            this.element.css("height", val);
        },
        _onRenderZIndex: function(val) {
            this.element.css("zIndex", val);
        },
        _onRenderAlign: function(val) {
            this._setPosition(val);
        },
        _onRenderVisible: function(val) {
            this.element[val ? "show" : "hide"]();
        }
    });
    // 绑定 blur 隐藏事件
    Overlay.blurOverlays = [];
    $(document).on("click", function(e) {
        hideBlurOverlays(e);
    });
    // 绑定 resize 重新定位事件
    var timeout;
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    Overlay.allOverlays = [];
    $(window).resize(function() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(function() {
            var winNewWidth = $(window).width();
            var winNewHeight = $(window).height();
            // IE678 莫名其妙触发 resize 
            // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
            if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
                $(Overlay.allOverlays).each(function(i, item) {
                    // 当实例为空或隐藏时，不处理
                    if (!item || !item.get("visible")) {
                        return;
                    }
                    item._setPosition();
                });
            }
            winWidth = winNewWidth;
            winHeight = winNewHeight;
        }, 80);
    });
    module.exports = Overlay;
    // Helpers
    // -------
    function isInDocument(element) {
        return $.contains(document.documentElement, element);
    }
    function hideBlurOverlays(e) {
        $(Overlay.blurOverlays).each(function(index, item) {
            // 当实例为空或隐藏时，不处理
            if (!item || !item.get("visible")) {
                return;
            }
            // 遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理
            for (var i = 0; i < item._relativeElements.length; i++) {
                var el = $(item._relativeElements[i])[0];
                if (el === e.target || $.contains(el, e.target)) {
                    return;
                }
            }
            // 到这里，判断触发了元素的 blur 事件，隐藏元素
            item.hide();
        });
    }
    // 从数组中删除对应元素
    function erase(target, array) {
        for (var i = 0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                return array;
            }
        }
    }
});

define("arale/position/1.0.1/position-debug", [ "$-debug" ], function(require, exports) {
    // Position
    // --------
    // 定位工具组件，将一个 DOM 节点相对对另一个 DOM 节点进行定位操作。
    // 代码易改，人生难得
    var Position = exports, VIEWPORT = {
        _id: "VIEWPORT",
        nodeType: 1
    }, $ = require("$-debug"), isPinFixed = false, ua = (window.navigator.userAgent || "").toLowerCase(), isIE6 = ua.indexOf("msie 6") !== -1;
    // 将目标元素相对于基准元素进行定位
    // 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
    Position.pin = function(pinObject, baseObject) {
        // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
        pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);
        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        var pinElement = $(pinObject.element);
        if (pinElement.css("position") !== "fixed" || isIE6) {
            pinElement.css("position", "absolute");
            isPinFixed = false;
        } else {
            // 定位 fixed 元素的标志位，下面有特殊处理
            isPinFixed = true;
        }
        // 将位置属性归一化为数值
        // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
        //    否则获取的宽高有可能不对
        posConverter(pinObject);
        posConverter(baseObject);
        var parentOffset = getParentOffset(pinElement);
        var baseOffset = baseObject.offset();
        // 计算目标元素的位置
        var top = baseOffset.top + baseObject.y - pinObject.y - parentOffset.top;
        var left = baseOffset.left + baseObject.x - pinObject.x - parentOffset.left;
        // 定位目标元素
        pinElement.css({
            left: left,
            top: top
        });
    };
    // 将目标元素相对于基准元素进行居中定位
    // 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
    Position.center = function(pinElement, baseElement) {
        Position.pin({
            element: pinElement,
            x: "50%",
            y: "50%"
        }, {
            element: baseElement,
            x: "50%",
            y: "50%"
        });
    };
    // 这是当前可视区域的伪 DOM 节点
    // 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
    Position.VIEWPORT = VIEWPORT;
    // Helpers
    // -------
    // 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }
    function normalize(posObject) {
        posObject = toElement(posObject) || {};
        if (posObject.nodeType) {
            posObject = {
                element: posObject
            };
        }
        var element = toElement(posObject.element) || VIEWPORT;
        if (element.nodeType !== 1) {
            throw new Error("posObject.element is invalid.");
        }
        var result = {
            element: element,
            x: posObject.x || 0,
            y: posObject.y || 0
        };
        // config 的深度克隆会替换掉 Position.VIEWPORT, 导致直接比较为 false
        var isVIEWPORT = element === VIEWPORT || element._id === "VIEWPORT";
        // 归一化 offset
        result.offset = function() {
            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isPinFixed) {
                return {
                    left: 0,
                    top: 0
                };
            } else if (isVIEWPORT) {
                return {
                    left: $(document).scrollLeft(),
                    top: $(document).scrollTop()
                };
            } else {
                return getOffset($(element)[0]);
            }
        };
        // 归一化 size, 含 padding 和 border
        result.size = function() {
            var el = isVIEWPORT ? $(window) : $(element);
            return {
                width: el.outerWidth(),
                height: el.outerHeight()
            };
        };
        return result;
    }
    // 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
    function posConverter(pinObject) {
        pinObject.x = xyConverter(pinObject.x, pinObject, "width");
        pinObject.y = xyConverter(pinObject.y, pinObject, "height");
    }
    // 处理 x, y 值，都转化为数字
    function xyConverter(x, pinObject, type) {
        // 先转成字符串再说！好处理
        x = x + "";
        // 处理 px
        x = x.replace(/px/gi, "");
        // 处理 alias
        if (/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi, "0%").replace(/center/gi, "50%").replace(/(?:bottom|right)/gi, "100%");
        }
        // 将百分比转为像素值
        if (x.indexOf("%") !== -1) {
            //支持小数
            x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
                return pinObject.size()[type] * (d / 100);
            });
        }
        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = new Function("return " + x)();
            } catch (e) {
                throw new Error("Invalid position value: " + x);
            }
        }
        // 转回为数字
        return numberize(x);
    }
    // 获取 offsetParent 的位置
    function getParentOffset(element) {
        var parent = element.offsetParent();
        // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        if (parent[0] === document.documentElement) {
            parent = $(document.body);
        }
        // 修正 ie6 下 absolute 定位不准的 bug
        if (isIE6) {
            parent.css("zoom", 1);
        }
        // 获取 offsetParent 的 offset
        var offset;
        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent[0] === document.body && parent.css("position") === "static") {
            offset = {
                top: 0,
                left: 0
            };
        } else {
            offset = getOffset(parent[0]);
        }
        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize(parent.css("border-top-width"));
        offset.left += numberize(parent.css("border-left-width"));
        return offset;
    }
    function numberize(s) {
        return parseFloat(s, 10) || 0;
    }
    function toElement(element) {
        return $(element)[0];
    }
    // fix jQuery 1.7.2 offset
    // document.body 的 position 是 absolute 或 relative 时
    // jQuery.offset 方法无法正确获取 body 的偏移值
    //   -> http://jsfiddle.net/afc163/gMAcp/
    // jQuery 1.9.1 已经修正了这个问题
    //   -> http://jsfiddle.net/afc163/gMAcp/1/
    // 这里先实现一份
    // 参照 kissy 和 jquery 1.9.1
    //   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366 
    //   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28
    function getOffset(element) {
        var box = element.getBoundingClientRect(), docElem = document.documentElement;
        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || document.body.clientLeft || 0),
            top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || document.body.clientTop || 0)
        };
    }
});

define("arale/iframe-shim/1.0.2/iframe-shim-debug", [ "$-debug", "arale/position/1.0.1/position-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Position = require("arale/position/1.0.1/position-debug");
    var isIE6 = (window.navigator.userAgent || "").toLowerCase().indexOf("msie 6") !== -1;
    // target 是需要添加垫片的目标元素，可以传 `DOM Element` 或 `Selector`
    function Shim(target) {
        // 如果选择器选了多个 DOM，则只取第一个
        this.target = $(target).eq(0);
    }
    // 根据目标元素计算 iframe 的显隐、宽高、定位
    Shim.prototype.sync = function() {
        var target = this.target;
        var iframe = this.iframe;
        // 如果未传 target 则不处理
        if (!target.length) return this;
        var height = target.outerHeight();
        var width = target.outerWidth();
        // 如果目标元素隐藏，则 iframe 也隐藏
        // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
        // http://api.jquery.com/hidden-selector/
        if (!height || !width || target.is(":hidden")) {
            iframe && iframe.hide();
        } else {
            // 第一次显示时才创建：as lazy as possible
            iframe || (iframe = this.iframe = createIframe(target));
            iframe.css({
                height: height,
                width: width
            });
            Position.pin(iframe[0], target[0]);
            iframe.show();
        }
        return this;
    };
    // 销毁 iframe 等
    Shim.prototype.destroy = function() {
        if (this.iframe) {
            this.iframe.remove();
            delete this.iframe;
        }
        delete this.target;
    };
    if (isIE6) {
        module.exports = Shim;
    } else {
        // 除了 IE6 都返回空函数
        function Noop() {}
        Noop.prototype.sync = function() {
            return this;
        };
        Noop.prototype.destroy = Noop;
        module.exports = Noop;
    }
    // Helpers
    // 在 target 之前创建 iframe，这样就没有 z-index 问题
    // iframe 永远在 target 下方
    function createIframe(target) {
        var css = {
            display: "none",
            border: "none",
            opacity: 0,
            position: "absolute"
        };
        // 如果 target 存在 zIndex 则设置
        var zIndex = target.css("zIndex");
        if (zIndex && zIndex > 0) {
            css.zIndex = zIndex - 1;
        }
        return $("<iframe>", {
            src: "javascript:''",
            // 不加的话，https 下会弹警告
            frameborder: 0,
            css: css
        }).insertBefore(target);
    }
});

define("arale/widget/1.1.1/widget-debug", [ "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "$-debug", "./daparser-debug", "./auto-render-debug" ], function(require, exports, module) {
    // Widget
    // ---------
    // Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理。
    // Widget 组件具有四个要素：描述状态的 attributes 和 properties，描述行为的 events
    // 和 methods。Widget 基类约定了这四要素创建时的基本流程和最佳实践。
    var Base = require("arale/base/1.1.1/base-debug");
    var $ = require("$-debug");
    var DAParser = require("./daparser-debug");
    var AutoRender = require("./auto-render-debug");
    var DELEGATE_EVENT_NS = ".delegate-events-";
    var ON_RENDER = "_onRender";
    var DATA_WIDGET_CID = "data-widget-cid";
    // 所有初始化过的 Widget 实例
    var cachedInstances = {};
    var Widget = Base.extend({
        // config 中的这些键值会直接添加到实例上，转换成 properties
        propsInAttrs: [ "initElement", "element", "events" ],
        // 与 widget 关联的 DOM 元素
        element: null,
        // 事件代理，格式为：
        //   {
        //     'mousedown .title': 'edit',
        //     'click {{attrs.saveButton}}': 'save'
        //     'click .open': function(ev) { ... }
        //   }
        events: null,
        // 属性列表
        attrs: {
            // 基本属性
            id: null,
            className: null,
            style: null,
            // 默认模板
            template: "<div></div>",
            // 默认数据模型
            model: null,
            // 组件的默认父节点
            parentNode: document.body
        },
        // 初始化方法，确定组件创建时的基本流程：
        // 初始化 attrs --》 初始化 props --》 初始化 events --》 子类的初始化
        initialize: function(config) {
            this.cid = uniqueCid();
            // 初始化 attrs
            var dataAttrsConfig = this._parseDataAttrsConfig(config);
            Widget.superclass.initialize.call(this, config ? $.extend(dataAttrsConfig, config) : dataAttrsConfig);
            // 初始化 props
            this.parseElement();
            this.initProps();
            // 初始化 events
            this.delegateEvents();
            // 子类自定义的初始化
            this.setup();
            // 保存实例信息
            this._stamp();
            // 是否由 template 初始化
            this._isTemplate = !(config && config.element);
        },
        // 解析通过 data-attr 设置的 api
        _parseDataAttrsConfig: function(config) {
            var element, dataAttrsConfig;
            if (config) {
                element = config.initElement ? $(config.initElement) : $(config.element);
            }
            // 解析 data-api 时，只考虑用户传入的 element，不考虑来自继承或从模板构建的
            if (element && element[0] && !AutoRender.isDataApiOff(element)) {
                dataAttrsConfig = DAParser.parseElement(element);
            }
            return dataAttrsConfig;
        },
        // 构建 this.element
        parseElement: function() {
            var element = this.element;
            if (element) {
                this.element = $(element);
            } else if (this.get("template")) {
                this.parseElementFromTemplate();
            }
            // 如果对应的 DOM 元素不存在，则报错
            if (!this.element || !this.element[0]) {
                throw new Error("element is invalid");
            }
        },
        // 从模板中构建 this.element
        parseElementFromTemplate: function() {
            this.element = $(this.get("template"));
        },
        // 负责 properties 的初始化，提供给子类覆盖
        initProps: function() {},
        // 注册事件代理
        delegateEvents: function(element, events, handler) {
            // widget.delegateEvents()
            if (arguments.length === 0) {
                events = getEvents(this);
                element = this.element;
            } else if (arguments.length === 1) {
                events = element;
                element = this.element;
            } else if (arguments.length === 2) {
                handler = events;
                events = element;
                element = this.element;
            } else {
                element || (element = this.element);
                this._delegateElements || (this._delegateElements = []);
                this._delegateElements.push($(element));
            }
            // 'click p' => {'click p': handler}
            if (isString(events) && isFunction(handler)) {
                var o = {};
                o[events] = handler;
                events = o;
            }
            // key 为 'event selector'
            for (var key in events) {
                if (!events.hasOwnProperty(key)) continue;
                var args = parseEventKey(key, this);
                var eventType = args.type;
                var selector = args.selector;
                (function(handler, widget) {
                    var callback = function(ev) {
                        if (isFunction(handler)) {
                            handler.call(widget, ev);
                        } else {
                            widget[handler](ev);
                        }
                    };
                    // delegate
                    if (selector) {
                        $(element).on(eventType, selector, callback);
                    } else {
                        $(element).on(eventType, callback);
                    }
                })(events[key], this);
            }
            return this;
        },
        // 卸载事件代理
        undelegateEvents: function(element, eventKey) {
            if (!eventKey) {
                eventKey = element;
                element = null;
            }
            // 卸载所有
            // .undelegateEvents()
            if (arguments.length === 0) {
                var type = DELEGATE_EVENT_NS + this.cid;
                this.element && this.element.off(type);
                // 卸载所有外部传入的 element
                if (this._delegateElements) {
                    for (var de in this._delegateElements) {
                        if (!this._delegateElements.hasOwnProperty(de)) continue;
                        this._delegateElements[de].off(type);
                    }
                }
            } else {
                var args = parseEventKey(eventKey, this);
                // 卸载 this.element
                // .undelegateEvents(events)
                if (!element) {
                    this.element && this.element.off(args.type, args.selector);
                } else {
                    $(element).off(args.type, args.selector);
                }
            }
            return this;
        },
        // 提供给子类覆盖的初始化方法
        setup: function() {},
        // 将 widget 渲染到页面上
        // 渲染不仅仅包括插入到 DOM 树中，还包括样式渲染等
        // 约定：子类覆盖时，需保持 `return this`
        render: function() {
            // 让渲染相关属性的初始值生效，并绑定到 change 事件
            if (!this.rendered) {
                this._renderAndBindAttrs();
                this.rendered = true;
            }
            // 插入到文档流中
            var parentNode = this.get("parentNode");
            if (parentNode && !isInDocument(this.element[0])) {
                // 隔离样式，添加统一的命名空间
                // https://github.com/aliceui/aliceui.org/issues/9
                var outerBoxClass = this.constructor.outerBoxClass;
                if (outerBoxClass) {
                    var outerBox = this._outerBox = $("<div></div>").addClass(outerBoxClass);
                    outerBox.append(this.element).appendTo(parentNode);
                } else {
                    this.element.appendTo(parentNode);
                }
            }
            return this;
        },
        // 让属性的初始值生效，并绑定到 change:attr 事件上
        _renderAndBindAttrs: function() {
            var widget = this;
            var attrs = widget.attrs;
            for (var attr in attrs) {
                if (!attrs.hasOwnProperty(attr)) continue;
                var m = ON_RENDER + ucfirst(attr);
                if (this[m]) {
                    var val = this.get(attr);
                    // 让属性的初始值生效。注：默认空值不触发
                    if (!isEmptyAttrValue(val)) {
                        this[m](val, undefined, attr);
                    }
                    // 将 _onRenderXx 自动绑定到 change:xx 事件上
                    (function(m) {
                        widget.on("change:" + attr, function(val, prev, key) {
                            widget[m](val, prev, key);
                        });
                    })(m);
                }
            }
        },
        _onRenderId: function(val) {
            this.element.attr("id", val);
        },
        _onRenderClassName: function(val) {
            this.element.addClass(val);
        },
        _onRenderStyle: function(val) {
            this.element.css(val);
        },
        // 让 element 与 Widget 实例建立关联
        _stamp: function() {
            var cid = this.cid;
            (this.initElement || this.element).attr(DATA_WIDGET_CID, cid);
            cachedInstances[cid] = this;
        },
        // 在 this.element 内寻找匹配节点
        $: function(selector) {
            return this.element.find(selector);
        },
        destroy: function() {
            this.undelegateEvents();
            delete cachedInstances[this.cid];
            // For memory leak
            if (this.element && this._isTemplate) {
                this.element.off();
                // 如果是 widget 生成的 element 则去除
                if (this._outerBox) {
                    this._outerBox.remove();
                } else {
                    this.element.remove();
                }
            }
            this.element = null;
            Widget.superclass.destroy.call(this);
        }
    });
    // For memory leak
    $(window).unload(function() {
        for (var cid in cachedInstances) {
            cachedInstances[cid].destroy();
        }
    });
    // 查询与 selector 匹配的第一个 DOM 节点，得到与该 DOM 节点相关联的 Widget 实例
    Widget.query = function(selector) {
        var element = $(selector).eq(0);
        var cid;
        element && (cid = element.attr(DATA_WIDGET_CID));
        return cachedInstances[cid];
    };
    Widget.autoRender = AutoRender.autoRender;
    Widget.autoRenderAll = AutoRender.autoRenderAll;
    Widget.StaticsWhiteList = [ "autoRender" ];
    module.exports = Widget;
    // Helpers
    // ------
    var toString = Object.prototype.toString;
    var cidCounter = 0;
    function uniqueCid() {
        return "widget-" + cidCounter++;
    }
    function isString(val) {
        return toString.call(val) === "[object String]";
    }
    function isFunction(val) {
        return toString.call(val) === "[object Function]";
    }
    // Zepto 上没有 contains 方法
    var contains = $.contains || function(a, b) {
        //noinspection JSBitwiseOperatorUsage
        return !!(a.compareDocumentPosition(b) & 16);
    };
    function isInDocument(element) {
        return contains(document.documentElement, element);
    }
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }
    var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/;
    var EXPRESSION_FLAG = /{{([^}]+)}}/g;
    var INVALID_SELECTOR = "INVALID_SELECTOR";
    function getEvents(widget) {
        if (isFunction(widget.events)) {
            widget.events = widget.events();
        }
        return widget.events;
    }
    function parseEventKey(eventKey, widget) {
        var match = eventKey.match(EVENT_KEY_SPLITTER);
        var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid;
        // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
        var selector = match[2] || undefined;
        if (selector && selector.indexOf("{{") > -1) {
            selector = parseExpressionInEventKey(selector, widget);
        }
        return {
            type: eventType,
            selector: selector
        };
    }
    // 解析 eventKey 中的 {{xx}}, {{yy}}
    function parseExpressionInEventKey(selector, widget) {
        return selector.replace(EXPRESSION_FLAG, function(m, name) {
            var parts = name.split(".");
            var point = widget, part;
            while (part = parts.shift()) {
                if (point === widget.attrs) {
                    point = widget.get(part);
                } else {
                    point = point[part];
                }
            }
            // 已经是 className，比如来自 dataset 的
            if (isString(point)) {
                return point;
            }
            // 不能识别的，返回无效标识
            return INVALID_SELECTOR;
        });
    }
    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined
    function isEmptyAttrValue(o) {
        return o == null || o === undefined;
    }
});

define("arale/widget/1.1.1/daparser-debug", [ "$-debug" ], function(require, exports) {
    // DAParser
    // --------
    // data api 解析器，提供对单个 element 的解析，可用来初始化页面中的所有 Widget 组件。
    var $ = require("$-debug");
    // 得到某个 DOM 元素的 dataset
    exports.parseElement = function(element, raw) {
        element = $(element)[0];
        var dataset = {};
        // ref: https://developer.mozilla.org/en/DOM/element.dataset
        if (element.dataset) {
            // 转换成普通对象
            dataset = $.extend({}, element.dataset);
        } else {
            var attrs = element.attributes;
            for (var i = 0, len = attrs.length; i < len; i++) {
                var attr = attrs[i];
                var name = attr.name;
                if (name.indexOf("data-") === 0) {
                    name = camelCase(name.substring(5));
                    dataset[name] = attr.value;
                }
            }
        }
        return raw === true ? dataset : normalizeValues(dataset);
    };
    // Helpers
    // ------
    var RE_DASH_WORD = /-([a-z])/g;
    var JSON_LITERAL_PATTERN = /^\s*[\[{].*[\]}]\s*$/;
    var parseJSON = this.JSON ? JSON.parse : $.parseJSON;
    // 仅处理字母开头的，其他情况转换为小写："data-x-y-123-_A" --> xY-123-_a
    function camelCase(str) {
        return str.toLowerCase().replace(RE_DASH_WORD, function(all, letter) {
            return (letter + "").toUpperCase();
        });
    }
    // 解析并归一化配置中的值
    function normalizeValues(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var val = data[key];
                if (typeof val !== "string") continue;
                if (JSON_LITERAL_PATTERN.test(val)) {
                    val = val.replace(/'/g, '"');
                    data[key] = normalizeValues(parseJSON(val));
                } else {
                    data[key] = normalizeValue(val);
                }
            }
        }
        return data;
    }
    // 将 'false' 转换为 false
    // 'true' 转换为 true
    // '3253.34' 转换为 3253.34
    function normalizeValue(val) {
        if (val.toLowerCase() === "false") {
            val = false;
        } else if (val.toLowerCase() === "true") {
            val = true;
        } else if (/\d/.test(val) && /[^a-z]/i.test(val)) {
            var number = parseFloat(val);
            if (number + "" === val) {
                val = number;
            }
        }
        return val;
    }
});

define("arale/widget/1.1.1/auto-render-debug", [ "$-debug" ], function(require, exports) {
    var $ = require("$-debug");
    var DATA_WIDGET_AUTO_RENDERED = "data-widget-auto-rendered";
    // 自动渲染接口，子类可根据自己的初始化逻辑进行覆盖
    exports.autoRender = function(config) {
        return new this(config).render();
    };
    // 根据 data-widget 属性，自动渲染所有开启了 data-api 的 widget 组件
    exports.autoRenderAll = function(root, callback) {
        if (typeof root === "function") {
            callback = root;
            root = null;
        }
        root = $(root || document.body);
        var modules = [];
        var elements = [];
        root.find("[data-widget]").each(function(i, element) {
            if (!exports.isDataApiOff(element)) {
                modules.push(element.getAttribute("data-widget").toLowerCase());
                elements.push(element);
            }
        });
        if (modules.length) {
            seajs.use(modules, function() {
                for (var i = 0; i < arguments.length; i++) {
                    var SubWidget = arguments[i];
                    var element = $(elements[i]);
                    // 已经渲染过
                    if (element.attr(DATA_WIDGET_AUTO_RENDERED)) continue;
                    var config = {
                        initElement: element,
                        renderType: "auto"
                    };
                    // data-widget-role 是指将当前的 DOM 作为 role 的属性去实例化，默认的 role 为 element
                    var role = element.attr("data-widget-role");
                    config[role ? role : "element"] = element;
                    // 调用自动渲染接口
                    SubWidget.autoRender && SubWidget.autoRender(config);
                    // 标记已经渲染过
                    element.attr(DATA_WIDGET_AUTO_RENDERED, "true");
                }
                // 在所有自动渲染完成后，执行回调
                callback && callback();
            });
        }
    };
    var isDefaultOff = $(document.body).attr("data-api") === "off";
    // 是否没开启 data-api
    exports.isDataApiOff = function(element) {
        var elementDataApi = $(element).attr("data-api");
        // data-api 默认开启，关闭只有两种方式：
        //  1. element 上有 data-api="off"，表示关闭单个
        //  2. document.body 上有 data-api="off"，表示关闭所有
        return elementDataApi === "off" || elementDataApi !== "on" && isDefaultOff;
    };
});

define("arale/base/1.1.1/base-debug", [ "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "./aspect-debug", "./attribute-debug" ], function(require, exports, module) {
    // Base
    // ---------
    // Base 是一个基础类，提供 Class、Events、Attrs 和 Aspect 支持。
    var Class = require("arale/class/1.1.0/class-debug");
    var Events = require("arale/events/1.1.0/events-debug");
    var Aspect = require("./aspect-debug");
    var Attribute = require("./attribute-debug");
    module.exports = Class.create({
        Implements: [ Events, Aspect, Attribute ],
        initialize: function(config) {
            this.initAttrs(config);
            // Automatically register `this._onChangeAttr` method as
            // a `change:attr` event handler.
            parseEventsFromInstance(this, this.attrs);
        },
        destroy: function() {
            this.off();
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            // Destroy should be called only once, generate a fake destroy after called
            // https://github.com/aralejs/widget/issues/50
            this.destroy = function() {};
        }
    });
    function parseEventsFromInstance(host, attrs) {
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                var m = "_onChange" + ucfirst(attr);
                if (host[m]) {
                    host.on("change:" + attr, host[m]);
                }
            }
        }
    }
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }
});

define("arale/base/1.1.1/aspect-debug", [], function(require, exports) {
    // Aspect
    // ---------------------
    // Thanks to:
    //  - http://yuilibrary.com/yui/docs/api/classes/Do.html
    //  - http://code.google.com/p/jquery-aop/
    //  - http://lazutkin.com/blog/2008/may/18/aop-aspect-javascript-dojo/
    // 在指定方法执行前，先执行 callback
    exports.before = function(methodName, callback, context) {
        return weave.call(this, "before", methodName, callback, context);
    };
    // 在指定方法执行后，再执行 callback
    exports.after = function(methodName, callback, context) {
        return weave.call(this, "after", methodName, callback, context);
    };
    // Helpers
    // -------
    var eventSplitter = /\s+/;
    function weave(when, methodName, callback, context) {
        var names = methodName.split(eventSplitter);
        var name, method;
        while (name = names.shift()) {
            method = getMethod(this, name);
            if (!method.__isAspected) {
                wrap.call(this, name);
            }
            this.on(when + ":" + name, callback, context);
        }
        return this;
    }
    function getMethod(host, methodName) {
        var method = host[methodName];
        if (!method) {
            throw new Error("Invalid method name: " + methodName);
        }
        return method;
    }
    function wrap(methodName) {
        var old = this[methodName];
        this[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var beforeArgs = [ "before:" + methodName ].concat(args);
            // prevent if trigger return false
            if (this.trigger.apply(this, beforeArgs) === false) return;
            var ret = old.apply(this, arguments);
            var afterArgs = [ "after:" + methodName, ret ].concat(args);
            this.trigger.apply(this, afterArgs);
            return ret;
        };
        this[methodName].__isAspected = true;
    }
});

define("arale/base/1.1.1/attribute-debug", [], function(require, exports) {
    // Attribute
    // -----------------
    // Thanks to:
    //  - http://documentcloud.github.com/backbone/#Model
    //  - http://yuilibrary.com/yui/docs/api/classes/AttributeCore.html
    //  - https://github.com/berzniz/backbone.getters.setters
    // 负责 attributes 的初始化
    // attributes 是与实例相关的状态信息，可读可写，发生变化时，会自动触发相关事件
    exports.initAttrs = function(config) {
        // initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
        var attrs = this.attrs = {};
        // Get all inherited attributes.
        var specialProps = this.propsInAttrs || [];
        mergeInheritedAttrs(attrs, this, specialProps);
        // Merge user-specific attributes from config.
        if (config) {
            mergeUserValue(attrs, config);
        }
        // 对于有 setter 的属性，要用初始值 set 一下，以保证关联属性也一同初始化
        setSetterAttrs(this, attrs, config);
        // Convert `on/before/afterXxx` config to event handler.
        parseEventsFromAttrs(this, attrs);
        // 将 this.attrs 上的 special properties 放回 this 上
        copySpecialProps(specialProps, this, attrs, true);
    };
    // Get the value of an attribute.
    exports.get = function(key) {
        var attr = this.attrs[key] || {};
        var val = attr.value;
        return attr.getter ? attr.getter.call(this, val, key) : val;
    };
    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    exports.set = function(key, val, options) {
        var attrs = {};
        // set("key", val, options)
        if (isString(key)) {
            attrs[key] = val;
        } else {
            attrs = key;
            options = val;
        }
        options || (options = {});
        var silent = options.silent;
        var override = options.override;
        var now = this.attrs;
        var changed = this.__changedAttrs || (this.__changedAttrs = {});
        for (key in attrs) {
            if (!attrs.hasOwnProperty(key)) continue;
            var attr = now[key] || (now[key] = {});
            val = attrs[key];
            if (attr.readOnly) {
                throw new Error("This attribute is readOnly: " + key);
            }
            // invoke setter
            if (attr.setter) {
                val = attr.setter.call(this, val, key);
            }
            // 获取设置前的 prev 值
            var prev = this.get(key);
            // 获取需要设置的 val 值
            // 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
            // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
            if (!override && isPlainObject(prev) && isPlainObject(val)) {
                val = merge(merge({}, prev), val);
            }
            // set finally
            now[key].value = val;
            // invoke change event
            // 初始化时对 set 的调用，不触发任何事件
            if (!this.__initializingAttrs && !isEqual(prev, val)) {
                if (silent) {
                    changed[key] = [ val, prev ];
                } else {
                    this.trigger("change:" + key, val, prev, key);
                }
            }
        }
        return this;
    };
    // Call this method to manually fire a `"change"` event for triggering
    // a `"change:attribute"` event for each changed attribute.
    exports.change = function() {
        var changed = this.__changedAttrs;
        if (changed) {
            for (var key in changed) {
                if (changed.hasOwnProperty(key)) {
                    var args = changed[key];
                    this.trigger("change:" + key, args[0], args[1], key);
                }
            }
            delete this.__changedAttrs;
        }
        return this;
    };
    // for test
    exports._isPlainObject = isPlainObject;
    // Helpers
    // -------
    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;
    /**
   * Detect the JScript [[DontEnum]] bug:
   * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
   * made non-enumerable as well.
   * https://github.com/bestiejs/lodash/blob/7520066fc916e205ef84cb97fbfe630d7c154158/lodash.js#L134-L144
   */
    /** Detect if own properties are iterated after inherited properties (IE < 9) */
    var iteratesOwnLast;
    (function() {
        var props = [];
        function Ctor() {
            this.x = 1;
        }
        Ctor.prototype = {
            valueOf: 1,
            y: 1
        };
        for (var prop in new Ctor()) {
            props.push(prop);
        }
        iteratesOwnLast = props[0] !== "x";
    })();
    var isArray = Array.isArray || function(val) {
        return toString.call(val) === "[object Array]";
    };
    function isString(val) {
        return toString.call(val) === "[object String]";
    }
    function isFunction(val) {
        return toString.call(val) === "[object Function]";
    }
    function isWindow(o) {
        return o != null && o == o.window;
    }
    function isPlainObject(o) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor
        // property. Make sure that DOM nodes and window objects don't
        // pass through, as well
        if (!o || toString.call(o) !== "[object Object]" || o.nodeType || isWindow(o)) {
            return false;
        }
        try {
            // Not own constructor property must be Object
            if (o.constructor && !hasOwn.call(o, "constructor") && !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }
        var key;
        // Support: IE<9
        // Handle iteration over inherited properties before own properties.
        // http://bugs.jquery.com/ticket/12199
        if (iteratesOwnLast) {
            for (key in o) {
                return hasOwn.call(o, key);
            }
        }
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in o) {}
        return key === undefined || hasOwn.call(o, key);
    }
    function isEmptyObject(o) {
        if (!o || toString.call(o) !== "[object Object]" || o.nodeType || isWindow(o) || !o.hasOwnProperty) {
            return false;
        }
        for (var p in o) {
            if (o.hasOwnProperty(p)) return false;
        }
        return true;
    }
    function merge(receiver, supplier) {
        var key, value;
        for (key in supplier) {
            if (supplier.hasOwnProperty(key)) {
                value = supplier[key];
                // 只 clone 数组和 plain object，其他的保持不变
                if (isArray(value)) {
                    value = value.slice();
                } else if (isPlainObject(value)) {
                    var prev = receiver[key];
                    isPlainObject(prev) || (prev = {});
                    value = merge(prev, value);
                }
                receiver[key] = value;
            }
        }
        return receiver;
    }
    var keys = Object.keys;
    if (!keys) {
        keys = function(o) {
            var result = [];
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        };
    }
    function mergeInheritedAttrs(attrs, instance, specialProps) {
        var inherited = [];
        var proto = instance.constructor.prototype;
        while (proto) {
            // 不要拿到 prototype 上的
            if (!proto.hasOwnProperty("attrs")) {
                proto.attrs = {};
            }
            // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
            copySpecialProps(specialProps, proto.attrs, proto);
            // 为空时不添加
            if (!isEmptyObject(proto.attrs)) {
                inherited.unshift(proto.attrs);
            }
            // 向上回溯一级
            proto = proto.constructor.superclass;
        }
        // Merge and clone default values to instance.
        for (var i = 0, len = inherited.length; i < len; i++) {
            merge(attrs, normalize(inherited[i]));
        }
    }
    function mergeUserValue(attrs, config) {
        merge(attrs, normalize(config, true));
    }
    function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop) {
        for (var i = 0, len = specialProps.length; i < len; i++) {
            var key = specialProps[i];
            if (supplier.hasOwnProperty(key)) {
                receiver[key] = isAttr2Prop ? receiver.get(key) : supplier[key];
            }
        }
    }
    var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
    var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;
    function parseEventsFromAttrs(host, attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var value = attrs[key].value, m;
                if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
                    host[m[1]](getEventName(m[2]), value);
                    delete attrs[key];
                }
            }
        }
    }
    // Converts `Show` to `show` and `ChangeTitle` to `change:title`
    function getEventName(name) {
        var m = name.match(EVENT_NAME_PATTERN);
        var ret = m[1] ? "change:" : "";
        ret += m[2].toLowerCase() + m[3];
        return ret;
    }
    function setSetterAttrs(host, attrs, config) {
        var options = {
            silent: true
        };
        host.__initializingAttrs = true;
        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                if (attrs[key].setter) {
                    host.set(key, config[key], options);
                }
            }
        }
        delete host.__initializingAttrs;
    }
    var ATTR_SPECIAL_KEYS = [ "value", "getter", "setter", "readOnly" ];
    // normalize `attrs` to
    //
    //   {
    //      value: 'xx',
    //      getter: fn,
    //      setter: fn,
    //      readOnly: boolean
    //   }
    //
    function normalize(attrs, isUserValue) {
        var newAttrs = {};
        for (var key in attrs) {
            var attr = attrs[key];
            if (!isUserValue && isPlainObject(attr) && hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
                newAttrs[key] = attr;
                continue;
            }
            newAttrs[key] = {
                value: attr
            };
        }
        return newAttrs;
    }
    function hasOwnProperties(object, properties) {
        for (var i = 0, len = properties.length; i < len; i++) {
            if (object.hasOwnProperty(properties[i])) {
                return true;
            }
        }
        return false;
    }
    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
    function isEmptyAttrValue(o) {
        return o == null || // null, undefined
        (isString(o) || isArray(o)) && o.length === 0 || // '', []
        isEmptyObject(o);
    }
    // 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
    function isEqual(a, b) {
        if (a === b) return true;
        if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
          // Strings, numbers, dates, and booleans are compared by value.
            case "[object String]":
            // Primitives and their corresponding object wrappers are
            // equivalent; thus, `"5"` is equivalent to `new String("5")`.
            return a == String(b);

          case "[object Number]":
            // `NaN`s are equivalent, but non-reflexive. An `equal`
            // comparison is performed for other numeric values.
            return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;

          case "[object Date]":
          case "[object Boolean]":
            // Coerce dates and booleans to numeric primitive values.
            // Dates are compared by their millisecond representations.
            // Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;

          // RegExps are compared by their source patterns and flags.
            case "[object RegExp]":
            return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;

          // 简单判断数组包含的 primitive 值是否相等
            case "[object Array]":
            var aString = a.toString();
            var bString = b.toString();
            // 只要包含非 primitive 值，为了稳妥起见，都返回 false
            return aString.indexOf("[object") === -1 && bString.indexOf("[object") === -1 && aString === bString;
        }
        if (typeof a != "object" || typeof b != "object") return false;
        // 简单判断两个对象是否相等，只判断第一层
        if (isPlainObject(a) && isPlainObject(b)) {
            // 键值不相等，立刻返回 false
            if (!isEqual(keys(a), keys(b))) {
                return false;
            }
            // 键相同，但有值不等，立刻返回 false
            for (var p in a) {
                if (a[p] !== b[p]) return false;
            }
            return true;
        }
        // 其他情况返回 false, 以避免误判导致 change 事件没发生
        return false;
    }
});

define("arale/class/1.1.0/class-debug", [], function(require, exports, module) {
    // Class
    // -----------------
    // Thanks to:
    //  - http://mootools.net/docs/core/Class/Class
    //  - http://ejohn.org/blog/simple-javascript-inheritance/
    //  - https://github.com/ded/klass
    //  - http://documentcloud.github.com/backbone/#Model-extend
    //  - https://github.com/joyent/node/blob/master/lib/util.js
    //  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js
    // The base Class implementation.
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o);
        }
    }
    module.exports = Class;
    // Create a new Class.
    //
    //  var SuperPig = Class.create({
    //    Extends: Animal,
    //    Implements: Flyable,
    //    initialize: function() {
    //      SuperPig.superclass.initialize.apply(this, arguments)
    //    },
    //    Statics: {
    //      COLOR: 'red'
    //    }
    // })
    //
    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent;
            parent = null;
        }
        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;
        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            parent.apply(this, arguments);
            // Only call initialize in self constructor.
            if (this.constructor === SubClass && this.initialize) {
                this.initialize.apply(this, arguments);
            }
        }
        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent, parent.StaticsWhiteList);
        }
        // Add instance properties to the subclass.
        implement.call(SubClass, properties);
        // Make subclass extendable.
        return classify(SubClass);
    };
    function implement(properties) {
        var key, value;
        for (key in properties) {
            value = properties[key];
            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }
    // Create a sub Class based on `Class`.
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;
        return Class.create(properties);
    };
    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }
    // Mutators define special properties.
    Class.Mutators = {
        Extends: function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);
            // Keep existed properties.
            mix(proto, existed);
            // Enforce the constructor to be what we expect.
            proto.constructor = this;
            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;
            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype;
        },
        Implements: function(items) {
            isArray(items) || (items = [ items ]);
            var proto = this.prototype, item;
            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },
        Statics: function(staticProperties) {
            mix(this, staticProperties);
        }
    };
    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {}
    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ? function(proto) {
        return {
            __proto__: proto
        };
    } : function(proto) {
        Ctor.prototype = proto;
        return new Ctor();
    };
    // Helpers
    // ------------
    function mix(r, s, wl) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            if (s.hasOwnProperty(p)) {
                if (wl && indexOf(wl, p) === -1) continue;
                // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
                if (p !== "prototype") {
                    r[p] = s[p];
                }
            }
        }
    }
    var toString = Object.prototype.toString;
    var isArray = Array.isArray || function(val) {
        return toString.call(val) === "[object Array]";
    };
    var isFunction = function(val) {
        return toString.call(val) === "[object Function]";
    };
    var indexOf = Array.prototype.indexOf ? function(arr, item) {
        return arr.indexOf(item);
    } : function(arr, item) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    };
});

define("arale/events/1.1.0/events-debug", [], function() {
    // Events
    // -----------------
    // Thanks to:
    //  - https://github.com/documentcloud/backbone/blob/master/backbone.js
    //  - https://github.com/joyent/node/blob/master/lib/events.js
    // Regular expression used to split event strings
    var eventSplitter = /\s+/;
    // A module that can be mixed in to *any object* in order to provide it
    // with custom events. You may bind with `on` or remove with `off` callback
    // functions to an event; `trigger`-ing an event fires all callbacks in
    // succession.
    //
    //     var object = new Events();
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    function Events() {}
    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    Events.prototype.on = function(events, callback, context) {
        var cache, event, list;
        if (!callback) return this;
        cache = this.__events || (this.__events = {});
        events = events.split(eventSplitter);
        while (event = events.shift()) {
            list = cache[event] || (cache[event] = []);
            list.push(callback, context);
        }
        return this;
    };
    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    Events.prototype.off = function(events, callback, context) {
        var cache, event, list, i;
        // No events, or removing *all* events.
        if (!(cache = this.__events)) return this;
        if (!(events || callback || context)) {
            delete this.__events;
            return this;
        }
        events = events ? events.split(eventSplitter) : keys(cache);
        // Loop through the callback list, splicing where appropriate.
        while (event = events.shift()) {
            list = cache[event];
            if (!list) continue;
            if (!(callback || context)) {
                delete cache[event];
                continue;
            }
            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }
        return this;
    };
    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    Events.prototype.trigger = function(events) {
        var cache, event, all, list, i, len, rest = [], args, returned = {
            status: true
        };
        if (!(cache = this.__events)) return this;
        events = events.split(eventSplitter);
        // Fill up `rest` with the callback arguments.  Since we're only copying
        // the tail of `arguments`, a loop is much faster than Array#slice.
        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i];
        }
        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            // Copy callback lists to prevent modification.
            if (all = cache.all) all = all.slice();
            if (list = cache[event]) list = list.slice();
            // Execute event callbacks.
            callEach(list, rest, this, returned);
            // Execute "all" callbacks.
            callEach(all, [ event ].concat(rest), this, returned);
        }
        return returned.status;
    };
    // Mix `Events` to object instance or Class function.
    Events.mixTo = function(receiver) {
        receiver = receiver.prototype || receiver;
        var proto = Events.prototype;
        for (var p in proto) {
            if (proto.hasOwnProperty(p)) {
                receiver[p] = proto[p];
            }
        }
    };
    // Helpers
    // -------
    var keys = Object.keys;
    if (!keys) {
        keys = function(o) {
            var result = [];
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        };
    }
    // Execute callbacks
    function callEach(list, args, context, returned) {
        var r;
        if (list) {
            for (var i = 0, len = list.length; i < len; i += 2) {
                r = list[i].apply(list[i + 1] || context, args);
                // trigger will return false if one of the callbacks return false
                r === false && returned.status && (returned.status = false);
            }
        }
    }
    return Events;
});

define("alipay/nav/1.2.7/widget/component-debug", [ "$-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Base = require("arale/base/1.1.1/base-debug");
    var Templatable = require("arale/templatable/0.9.2/templatable-debug");
    var Component = Base.extend({
        Implements: Templatable,
        attrs: {
            data: {}
        },
        render: function() {
            var html = this.compile();
            this.element = $("<div> " + html + "</div>").addClass(this.get("className"));
            return this;
        },
        appendTo: function(selector) {
            this.element.appendTo(selector);
            return this;
        },
        find: function(selector) {
            return this.element.find(selector);
        }
    });
    module.exports = Component;
});

define("arale/templatable/0.9.2/templatable-debug", [ "$-debug", "gallery/handlebars/1.0.2/handlebars-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Handlebars = require("gallery/handlebars/1.0.2/handlebars-debug");
    var compiledTemplates = {};
    // 提供 Template 模板支持，默认引擎是 Handlebars
    module.exports = {
        // Handlebars 的 helpers
        templateHelpers: null,
        // Handlebars 的 partials
        templatePartials: null,
        // template 对应的 DOM-like object
        templateObject: null,
        // 根据配置的模板和传入的数据，构建 this.element 和 templateElement
        parseElementFromTemplate: function() {
            // template 支持 id 选择器
            var t, template = this.get("template");
            if (/^#/.test(template) && (t = document.getElementById(template.substring(1)))) {
                template = t.innerHTML;
                this.set("template", template);
            }
            this.templateObject = convertTemplateToObject(template);
            this.element = $(this.compile());
        },
        // 编译模板，混入数据，返回 html 结果
        compile: function(template, model) {
            template || (template = this.get("template"));
            model || (model = this.get("model")) || (model = {});
            if (model.toJSON) {
                model = model.toJSON();
            }
            // handlebars runtime，注意 partials 也需要预编译
            if (isFunction(template)) {
                return template(model, {
                    helpers: this.templateHelpers,
                    partials: precompile(this.templatePartials)
                });
            } else {
                var helpers = this.templateHelpers;
                var partials = this.templatePartials;
                var helper, partial;
                // 注册 helpers
                if (helpers) {
                    for (helper in helpers) {
                        if (helpers.hasOwnProperty(helper)) {
                            Handlebars.registerHelper(helper, helpers[helper]);
                        }
                    }
                }
                // 注册 partials
                if (partials) {
                    for (partial in partials) {
                        if (partials.hasOwnProperty(partial)) {
                            Handlebars.registerPartial(partial, partials[partial]);
                        }
                    }
                }
                var compiledTemplate = compiledTemplates[template];
                if (!compiledTemplate) {
                    compiledTemplate = compiledTemplates[template] = Handlebars.compile(template);
                }
                // 生成 html
                var html = compiledTemplate(model);
                // 卸载 helpers
                if (helpers) {
                    for (helper in helpers) {
                        if (helpers.hasOwnProperty(helper)) {
                            delete Handlebars.helpers[helper];
                        }
                    }
                }
                // 卸载 partials
                if (partials) {
                    for (partial in partials) {
                        if (partials.hasOwnProperty(partial)) {
                            delete Handlebars.partials[partial];
                        }
                    }
                }
                return html;
            }
        },
        // 刷新 selector 指定的局部区域
        renderPartial: function(selector) {
            if (this.templateObject) {
                var template = convertObjectToTemplate(this.templateObject, selector);
                if (template) {
                    if (selector) {
                        this.$(selector).html(this.compile(template));
                    } else {
                        this.element.html(this.compile(template));
                    }
                } else {
                    this.element.html(this.compile());
                }
            } else {
                var all = $(this.compile());
                var selected = all.find(selector);
                if (selected.length) {
                    this.$(selector).html(selected.html());
                } else {
                    this.element.html(all.html());
                }
            }
            return this;
        }
    };
    // Helpers
    // -------
    var _compile = Handlebars.compile;
    Handlebars.compile = function(template) {
        return isFunction(template) ? template : _compile.call(Handlebars, template);
    };
    // 将 template 字符串转换成对应的 DOM-like object
    function convertTemplateToObject(template) {
        return isFunction(template) ? null : $(encode(template));
    }
    // 根据 selector 得到 DOM-like template object，并转换为 template 字符串
    function convertObjectToTemplate(templateObject, selector) {
        if (!templateObject) return;
        var element;
        if (selector) {
            element = templateObject.find(selector);
            if (element.length === 0) {
                throw new Error("Invalid template selector: " + selector);
            }
        } else {
            element = templateObject;
        }
        return decode(element.html());
    }
    function encode(template) {
        return template.replace(/({[^}]+}})/g, "<!--$1-->").replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g, " data-templatable-$1=$2$3$2");
    }
    function decode(template) {
        return template.replace(/(?:<|&lt;)!--({{[^}]+}})--(?:>|&gt;)/g, "$1").replace(/data-templatable-/gi, "");
    }
    function isFunction(obj) {
        return typeof obj === "function";
    }
    function precompile(partials) {
        if (!partials) return {};
        var result = {};
        for (var name in partials) {
            var partial = partials[name];
            result[name] = isFunction(partial) ? partial : Handlebars.compile(partial);
        }
        return result;
    }
});

define("gallery/handlebars/1.0.2/handlebars-debug", [], function(require, exports, module) {
    /*

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
    // lib/handlebars/browser-prefix.js
    var Handlebars = {};
    (function(Handlebars, undefined) {
        // lib/handlebars/base.js
        Handlebars.VERSION = "1.0.0-rc.4";
        Handlebars.COMPILER_REVISION = 3;
        Handlebars.REVISION_CHANGES = {
            1: "<= 1.0.rc.2",
            // 1.0.rc.2 is actually rev2 but doesn't report it
            2: "== 1.0.0-rc.3",
            3: ">= 1.0.0-rc.4"
        };
        Handlebars.helpers = {};
        Handlebars.partials = {};
        var toString = Object.prototype.toString, functionType = "[object Function]", objectType = "[object Object]";
        Handlebars.registerHelper = function(name, fn, inverse) {
            if (toString.call(name) === objectType) {
                if (inverse || fn) {
                    throw new Handlebars.Exception("Arg not supported with multiple helpers");
                }
                Handlebars.Utils.extend(this.helpers, name);
            } else {
                if (inverse) {
                    fn.not = inverse;
                }
                this.helpers[name] = fn;
            }
        };
        Handlebars.registerPartial = function(name, str) {
            if (toString.call(name) === objectType) {
                Handlebars.Utils.extend(this.partials, name);
            } else {
                this.partials[name] = str;
            }
        };
        Handlebars.registerHelper("helperMissing", function(arg) {
            if (arguments.length === 2) {
                return undefined;
            } else {
                throw new Error("Could not find property '" + arg + "'");
            }
        });
        Handlebars.registerHelper("blockHelperMissing", function(context, options) {
            var inverse = options.inverse || function() {}, fn = options.fn;
            var type = toString.call(context);
            if (type === functionType) {
                context = context.call(this);
            }
            if (context === true) {
                return fn(this);
            } else if (context === false || context == null) {
                return inverse(this);
            } else if (type === "[object Array]") {
                if (context.length > 0) {
                    return Handlebars.helpers.each(context, options);
                } else {
                    return inverse(this);
                }
            } else {
                return fn(context);
            }
        });
        Handlebars.K = function() {};
        Handlebars.createFrame = Object.create || function(object) {
            Handlebars.K.prototype = object;
            var obj = new Handlebars.K();
            Handlebars.K.prototype = null;
            return obj;
        };
        Handlebars.logger = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 3,
            methodMap: {
                0: "debug",
                1: "info",
                2: "warn",
                3: "error"
            },
            // can be overridden in the host environment
            log: function(level, obj) {
                if (Handlebars.logger.level <= level) {
                    var method = Handlebars.logger.methodMap[level];
                    if (typeof console !== "undefined" && console[method]) {
                        console[method].call(console, obj);
                    }
                }
            }
        };
        Handlebars.log = function(level, obj) {
            Handlebars.logger.log(level, obj);
        };
        Handlebars.registerHelper("each", function(context, options) {
            var fn = options.fn, inverse = options.inverse;
            var i = 0, ret = "", data;
            if (options.data) {
                data = Handlebars.createFrame(options.data);
            }
            if (context && typeof context === "object") {
                if (context instanceof Array) {
                    for (var j = context.length; i < j; i++) {
                        if (data) {
                            data.index = i;
                        }
                        ret = ret + fn(context[i], {
                            data: data
                        });
                    }
                } else {
                    for (var key in context) {
                        if (context.hasOwnProperty(key)) {
                            if (data) {
                                data.key = key;
                            }
                            ret = ret + fn(context[key], {
                                data: data
                            });
                            i++;
                        }
                    }
                }
            }
            if (i === 0) {
                ret = inverse(this);
            }
            return ret;
        });
        Handlebars.registerHelper("if", function(context, options) {
            var type = toString.call(context);
            if (type === functionType) {
                context = context.call(this);
            }
            if (!context || Handlebars.Utils.isEmpty(context)) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        });
        Handlebars.registerHelper("unless", function(context, options) {
            return Handlebars.helpers["if"].call(this, context, {
                fn: options.inverse,
                inverse: options.fn
            });
        });
        Handlebars.registerHelper("with", function(context, options) {
            if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
        });
        Handlebars.registerHelper("log", function(context, options) {
            var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
            Handlebars.log(level, context);
        });
        // lib/handlebars/compiler/parser.js
        /* Jison generated parser */
        var handlebars = function() {
            var parser = {
                trace: function trace() {},
                yy: {},
                symbols_: {
                    error: 2,
                    root: 3,
                    program: 4,
                    EOF: 5,
                    simpleInverse: 6,
                    statements: 7,
                    statement: 8,
                    openInverse: 9,
                    closeBlock: 10,
                    openBlock: 11,
                    mustache: 12,
                    partial: 13,
                    CONTENT: 14,
                    COMMENT: 15,
                    OPEN_BLOCK: 16,
                    inMustache: 17,
                    CLOSE: 18,
                    OPEN_INVERSE: 19,
                    OPEN_ENDBLOCK: 20,
                    path: 21,
                    OPEN: 22,
                    OPEN_UNESCAPED: 23,
                    OPEN_PARTIAL: 24,
                    partialName: 25,
                    params: 26,
                    hash: 27,
                    DATA: 28,
                    param: 29,
                    STRING: 30,
                    INTEGER: 31,
                    BOOLEAN: 32,
                    hashSegments: 33,
                    hashSegment: 34,
                    ID: 35,
                    EQUALS: 36,
                    PARTIAL_NAME: 37,
                    pathSegments: 38,
                    SEP: 39,
                    $accept: 0,
                    $end: 1
                },
                terminals_: {
                    2: "error",
                    5: "EOF",
                    14: "CONTENT",
                    15: "COMMENT",
                    16: "OPEN_BLOCK",
                    18: "CLOSE",
                    19: "OPEN_INVERSE",
                    20: "OPEN_ENDBLOCK",
                    22: "OPEN",
                    23: "OPEN_UNESCAPED",
                    24: "OPEN_PARTIAL",
                    28: "DATA",
                    30: "STRING",
                    31: "INTEGER",
                    32: "BOOLEAN",
                    35: "ID",
                    36: "EQUALS",
                    37: "PARTIAL_NAME",
                    39: "SEP"
                },
                productions_: [ 0, [ 3, 2 ], [ 4, 2 ], [ 4, 3 ], [ 4, 2 ], [ 4, 1 ], [ 4, 1 ], [ 4, 0 ], [ 7, 1 ], [ 7, 2 ], [ 8, 3 ], [ 8, 3 ], [ 8, 1 ], [ 8, 1 ], [ 8, 1 ], [ 8, 1 ], [ 11, 3 ], [ 9, 3 ], [ 10, 3 ], [ 12, 3 ], [ 12, 3 ], [ 13, 3 ], [ 13, 4 ], [ 6, 2 ], [ 17, 3 ], [ 17, 2 ], [ 17, 2 ], [ 17, 1 ], [ 17, 1 ], [ 26, 2 ], [ 26, 1 ], [ 29, 1 ], [ 29, 1 ], [ 29, 1 ], [ 29, 1 ], [ 29, 1 ], [ 27, 1 ], [ 33, 2 ], [ 33, 1 ], [ 34, 3 ], [ 34, 3 ], [ 34, 3 ], [ 34, 3 ], [ 34, 3 ], [ 25, 1 ], [ 21, 1 ], [ 38, 3 ], [ 38, 1 ] ],
                performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
                    var $0 = $$.length - 1;
                    switch (yystate) {
                      case 1:
                        return $$[$0 - 1];
                        break;

                      case 2:
                        this.$ = new yy.ProgramNode([], $$[$0]);
                        break;

                      case 3:
                        this.$ = new yy.ProgramNode($$[$0 - 2], $$[$0]);
                        break;

                      case 4:
                        this.$ = new yy.ProgramNode($$[$0 - 1], []);
                        break;

                      case 5:
                        this.$ = new yy.ProgramNode($$[$0]);
                        break;

                      case 6:
                        this.$ = new yy.ProgramNode([], []);
                        break;

                      case 7:
                        this.$ = new yy.ProgramNode([]);
                        break;

                      case 8:
                        this.$ = [ $$[$0] ];
                        break;

                      case 9:
                        $$[$0 - 1].push($$[$0]);
                        this.$ = $$[$0 - 1];
                        break;

                      case 10:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1].inverse, $$[$0 - 1], $$[$0]);
                        break;

                      case 11:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1], $$[$0 - 1].inverse, $$[$0]);
                        break;

                      case 12:
                        this.$ = $$[$0];
                        break;

                      case 13:
                        this.$ = $$[$0];
                        break;

                      case 14:
                        this.$ = new yy.ContentNode($$[$0]);
                        break;

                      case 15:
                        this.$ = new yy.CommentNode($$[$0]);
                        break;

                      case 16:
                        this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1]);
                        break;

                      case 17:
                        this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1]);
                        break;

                      case 18:
                        this.$ = $$[$0 - 1];
                        break;

                      case 19:
                        this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1]);
                        break;

                      case 20:
                        this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1], true);
                        break;

                      case 21:
                        this.$ = new yy.PartialNode($$[$0 - 1]);
                        break;

                      case 22:
                        this.$ = new yy.PartialNode($$[$0 - 2], $$[$0 - 1]);
                        break;

                      case 23:
                        break;

                      case 24:
                        this.$ = [ [ $$[$0 - 2] ].concat($$[$0 - 1]), $$[$0] ];
                        break;

                      case 25:
                        this.$ = [ [ $$[$0 - 1] ].concat($$[$0]), null ];
                        break;

                      case 26:
                        this.$ = [ [ $$[$0 - 1] ], $$[$0] ];
                        break;

                      case 27:
                        this.$ = [ [ $$[$0] ], null ];
                        break;

                      case 28:
                        this.$ = [ [ new yy.DataNode($$[$0]) ], null ];
                        break;

                      case 29:
                        $$[$0 - 1].push($$[$0]);
                        this.$ = $$[$0 - 1];
                        break;

                      case 30:
                        this.$ = [ $$[$0] ];
                        break;

                      case 31:
                        this.$ = $$[$0];
                        break;

                      case 32:
                        this.$ = new yy.StringNode($$[$0]);
                        break;

                      case 33:
                        this.$ = new yy.IntegerNode($$[$0]);
                        break;

                      case 34:
                        this.$ = new yy.BooleanNode($$[$0]);
                        break;

                      case 35:
                        this.$ = new yy.DataNode($$[$0]);
                        break;

                      case 36:
                        this.$ = new yy.HashNode($$[$0]);
                        break;

                      case 37:
                        $$[$0 - 1].push($$[$0]);
                        this.$ = $$[$0 - 1];
                        break;

                      case 38:
                        this.$ = [ $$[$0] ];
                        break;

                      case 39:
                        this.$ = [ $$[$0 - 2], $$[$0] ];
                        break;

                      case 40:
                        this.$ = [ $$[$0 - 2], new yy.StringNode($$[$0]) ];
                        break;

                      case 41:
                        this.$ = [ $$[$0 - 2], new yy.IntegerNode($$[$0]) ];
                        break;

                      case 42:
                        this.$ = [ $$[$0 - 2], new yy.BooleanNode($$[$0]) ];
                        break;

                      case 43:
                        this.$ = [ $$[$0 - 2], new yy.DataNode($$[$0]) ];
                        break;

                      case 44:
                        this.$ = new yy.PartialNameNode($$[$0]);
                        break;

                      case 45:
                        this.$ = new yy.IdNode($$[$0]);
                        break;

                      case 46:
                        $$[$0 - 2].push($$[$0]);
                        this.$ = $$[$0 - 2];
                        break;

                      case 47:
                        this.$ = [ $$[$0] ];
                        break;
                    }
                },
                table: [ {
                    3: 1,
                    4: 2,
                    5: [ 2, 7 ],
                    6: 3,
                    7: 4,
                    8: 6,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 5 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    1: [ 3 ]
                }, {
                    5: [ 1, 17 ]
                }, {
                    5: [ 2, 6 ],
                    7: 18,
                    8: 6,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 19 ],
                    20: [ 2, 6 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    5: [ 2, 5 ],
                    6: 20,
                    8: 21,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 5 ],
                    20: [ 2, 5 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    17: 23,
                    18: [ 1, 22 ],
                    21: 24,
                    28: [ 1, 25 ],
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    5: [ 2, 8 ],
                    14: [ 2, 8 ],
                    15: [ 2, 8 ],
                    16: [ 2, 8 ],
                    19: [ 2, 8 ],
                    20: [ 2, 8 ],
                    22: [ 2, 8 ],
                    23: [ 2, 8 ],
                    24: [ 2, 8 ]
                }, {
                    4: 28,
                    6: 3,
                    7: 4,
                    8: 6,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 5 ],
                    20: [ 2, 7 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    4: 29,
                    6: 3,
                    7: 4,
                    8: 6,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 5 ],
                    20: [ 2, 7 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    5: [ 2, 12 ],
                    14: [ 2, 12 ],
                    15: [ 2, 12 ],
                    16: [ 2, 12 ],
                    19: [ 2, 12 ],
                    20: [ 2, 12 ],
                    22: [ 2, 12 ],
                    23: [ 2, 12 ],
                    24: [ 2, 12 ]
                }, {
                    5: [ 2, 13 ],
                    14: [ 2, 13 ],
                    15: [ 2, 13 ],
                    16: [ 2, 13 ],
                    19: [ 2, 13 ],
                    20: [ 2, 13 ],
                    22: [ 2, 13 ],
                    23: [ 2, 13 ],
                    24: [ 2, 13 ]
                }, {
                    5: [ 2, 14 ],
                    14: [ 2, 14 ],
                    15: [ 2, 14 ],
                    16: [ 2, 14 ],
                    19: [ 2, 14 ],
                    20: [ 2, 14 ],
                    22: [ 2, 14 ],
                    23: [ 2, 14 ],
                    24: [ 2, 14 ]
                }, {
                    5: [ 2, 15 ],
                    14: [ 2, 15 ],
                    15: [ 2, 15 ],
                    16: [ 2, 15 ],
                    19: [ 2, 15 ],
                    20: [ 2, 15 ],
                    22: [ 2, 15 ],
                    23: [ 2, 15 ],
                    24: [ 2, 15 ]
                }, {
                    17: 30,
                    21: 24,
                    28: [ 1, 25 ],
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    17: 31,
                    21: 24,
                    28: [ 1, 25 ],
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    17: 32,
                    21: 24,
                    28: [ 1, 25 ],
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    25: 33,
                    37: [ 1, 34 ]
                }, {
                    1: [ 2, 1 ]
                }, {
                    5: [ 2, 2 ],
                    8: 21,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 19 ],
                    20: [ 2, 2 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    17: 23,
                    21: 24,
                    28: [ 1, 25 ],
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    5: [ 2, 4 ],
                    7: 35,
                    8: 6,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 19 ],
                    20: [ 2, 4 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    5: [ 2, 9 ],
                    14: [ 2, 9 ],
                    15: [ 2, 9 ],
                    16: [ 2, 9 ],
                    19: [ 2, 9 ],
                    20: [ 2, 9 ],
                    22: [ 2, 9 ],
                    23: [ 2, 9 ],
                    24: [ 2, 9 ]
                }, {
                    5: [ 2, 23 ],
                    14: [ 2, 23 ],
                    15: [ 2, 23 ],
                    16: [ 2, 23 ],
                    19: [ 2, 23 ],
                    20: [ 2, 23 ],
                    22: [ 2, 23 ],
                    23: [ 2, 23 ],
                    24: [ 2, 23 ]
                }, {
                    18: [ 1, 36 ]
                }, {
                    18: [ 2, 27 ],
                    21: 41,
                    26: 37,
                    27: 38,
                    28: [ 1, 45 ],
                    29: 39,
                    30: [ 1, 42 ],
                    31: [ 1, 43 ],
                    32: [ 1, 44 ],
                    33: 40,
                    34: 46,
                    35: [ 1, 47 ],
                    38: 26
                }, {
                    18: [ 2, 28 ]
                }, {
                    18: [ 2, 45 ],
                    28: [ 2, 45 ],
                    30: [ 2, 45 ],
                    31: [ 2, 45 ],
                    32: [ 2, 45 ],
                    35: [ 2, 45 ],
                    39: [ 1, 48 ]
                }, {
                    18: [ 2, 47 ],
                    28: [ 2, 47 ],
                    30: [ 2, 47 ],
                    31: [ 2, 47 ],
                    32: [ 2, 47 ],
                    35: [ 2, 47 ],
                    39: [ 2, 47 ]
                }, {
                    10: 49,
                    20: [ 1, 50 ]
                }, {
                    10: 51,
                    20: [ 1, 50 ]
                }, {
                    18: [ 1, 52 ]
                }, {
                    18: [ 1, 53 ]
                }, {
                    18: [ 1, 54 ]
                }, {
                    18: [ 1, 55 ],
                    21: 56,
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    18: [ 2, 44 ],
                    35: [ 2, 44 ]
                }, {
                    5: [ 2, 3 ],
                    8: 21,
                    9: 7,
                    11: 8,
                    12: 9,
                    13: 10,
                    14: [ 1, 11 ],
                    15: [ 1, 12 ],
                    16: [ 1, 13 ],
                    19: [ 1, 19 ],
                    20: [ 2, 3 ],
                    22: [ 1, 14 ],
                    23: [ 1, 15 ],
                    24: [ 1, 16 ]
                }, {
                    14: [ 2, 17 ],
                    15: [ 2, 17 ],
                    16: [ 2, 17 ],
                    19: [ 2, 17 ],
                    20: [ 2, 17 ],
                    22: [ 2, 17 ],
                    23: [ 2, 17 ],
                    24: [ 2, 17 ]
                }, {
                    18: [ 2, 25 ],
                    21: 41,
                    27: 57,
                    28: [ 1, 45 ],
                    29: 58,
                    30: [ 1, 42 ],
                    31: [ 1, 43 ],
                    32: [ 1, 44 ],
                    33: 40,
                    34: 46,
                    35: [ 1, 47 ],
                    38: 26
                }, {
                    18: [ 2, 26 ]
                }, {
                    18: [ 2, 30 ],
                    28: [ 2, 30 ],
                    30: [ 2, 30 ],
                    31: [ 2, 30 ],
                    32: [ 2, 30 ],
                    35: [ 2, 30 ]
                }, {
                    18: [ 2, 36 ],
                    34: 59,
                    35: [ 1, 60 ]
                }, {
                    18: [ 2, 31 ],
                    28: [ 2, 31 ],
                    30: [ 2, 31 ],
                    31: [ 2, 31 ],
                    32: [ 2, 31 ],
                    35: [ 2, 31 ]
                }, {
                    18: [ 2, 32 ],
                    28: [ 2, 32 ],
                    30: [ 2, 32 ],
                    31: [ 2, 32 ],
                    32: [ 2, 32 ],
                    35: [ 2, 32 ]
                }, {
                    18: [ 2, 33 ],
                    28: [ 2, 33 ],
                    30: [ 2, 33 ],
                    31: [ 2, 33 ],
                    32: [ 2, 33 ],
                    35: [ 2, 33 ]
                }, {
                    18: [ 2, 34 ],
                    28: [ 2, 34 ],
                    30: [ 2, 34 ],
                    31: [ 2, 34 ],
                    32: [ 2, 34 ],
                    35: [ 2, 34 ]
                }, {
                    18: [ 2, 35 ],
                    28: [ 2, 35 ],
                    30: [ 2, 35 ],
                    31: [ 2, 35 ],
                    32: [ 2, 35 ],
                    35: [ 2, 35 ]
                }, {
                    18: [ 2, 38 ],
                    35: [ 2, 38 ]
                }, {
                    18: [ 2, 47 ],
                    28: [ 2, 47 ],
                    30: [ 2, 47 ],
                    31: [ 2, 47 ],
                    32: [ 2, 47 ],
                    35: [ 2, 47 ],
                    36: [ 1, 61 ],
                    39: [ 2, 47 ]
                }, {
                    35: [ 1, 62 ]
                }, {
                    5: [ 2, 10 ],
                    14: [ 2, 10 ],
                    15: [ 2, 10 ],
                    16: [ 2, 10 ],
                    19: [ 2, 10 ],
                    20: [ 2, 10 ],
                    22: [ 2, 10 ],
                    23: [ 2, 10 ],
                    24: [ 2, 10 ]
                }, {
                    21: 63,
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    5: [ 2, 11 ],
                    14: [ 2, 11 ],
                    15: [ 2, 11 ],
                    16: [ 2, 11 ],
                    19: [ 2, 11 ],
                    20: [ 2, 11 ],
                    22: [ 2, 11 ],
                    23: [ 2, 11 ],
                    24: [ 2, 11 ]
                }, {
                    14: [ 2, 16 ],
                    15: [ 2, 16 ],
                    16: [ 2, 16 ],
                    19: [ 2, 16 ],
                    20: [ 2, 16 ],
                    22: [ 2, 16 ],
                    23: [ 2, 16 ],
                    24: [ 2, 16 ]
                }, {
                    5: [ 2, 19 ],
                    14: [ 2, 19 ],
                    15: [ 2, 19 ],
                    16: [ 2, 19 ],
                    19: [ 2, 19 ],
                    20: [ 2, 19 ],
                    22: [ 2, 19 ],
                    23: [ 2, 19 ],
                    24: [ 2, 19 ]
                }, {
                    5: [ 2, 20 ],
                    14: [ 2, 20 ],
                    15: [ 2, 20 ],
                    16: [ 2, 20 ],
                    19: [ 2, 20 ],
                    20: [ 2, 20 ],
                    22: [ 2, 20 ],
                    23: [ 2, 20 ],
                    24: [ 2, 20 ]
                }, {
                    5: [ 2, 21 ],
                    14: [ 2, 21 ],
                    15: [ 2, 21 ],
                    16: [ 2, 21 ],
                    19: [ 2, 21 ],
                    20: [ 2, 21 ],
                    22: [ 2, 21 ],
                    23: [ 2, 21 ],
                    24: [ 2, 21 ]
                }, {
                    18: [ 1, 64 ]
                }, {
                    18: [ 2, 24 ]
                }, {
                    18: [ 2, 29 ],
                    28: [ 2, 29 ],
                    30: [ 2, 29 ],
                    31: [ 2, 29 ],
                    32: [ 2, 29 ],
                    35: [ 2, 29 ]
                }, {
                    18: [ 2, 37 ],
                    35: [ 2, 37 ]
                }, {
                    36: [ 1, 61 ]
                }, {
                    21: 65,
                    28: [ 1, 69 ],
                    30: [ 1, 66 ],
                    31: [ 1, 67 ],
                    32: [ 1, 68 ],
                    35: [ 1, 27 ],
                    38: 26
                }, {
                    18: [ 2, 46 ],
                    28: [ 2, 46 ],
                    30: [ 2, 46 ],
                    31: [ 2, 46 ],
                    32: [ 2, 46 ],
                    35: [ 2, 46 ],
                    39: [ 2, 46 ]
                }, {
                    18: [ 1, 70 ]
                }, {
                    5: [ 2, 22 ],
                    14: [ 2, 22 ],
                    15: [ 2, 22 ],
                    16: [ 2, 22 ],
                    19: [ 2, 22 ],
                    20: [ 2, 22 ],
                    22: [ 2, 22 ],
                    23: [ 2, 22 ],
                    24: [ 2, 22 ]
                }, {
                    18: [ 2, 39 ],
                    35: [ 2, 39 ]
                }, {
                    18: [ 2, 40 ],
                    35: [ 2, 40 ]
                }, {
                    18: [ 2, 41 ],
                    35: [ 2, 41 ]
                }, {
                    18: [ 2, 42 ],
                    35: [ 2, 42 ]
                }, {
                    18: [ 2, 43 ],
                    35: [ 2, 43 ]
                }, {
                    5: [ 2, 18 ],
                    14: [ 2, 18 ],
                    15: [ 2, 18 ],
                    16: [ 2, 18 ],
                    19: [ 2, 18 ],
                    20: [ 2, 18 ],
                    22: [ 2, 18 ],
                    23: [ 2, 18 ],
                    24: [ 2, 18 ]
                } ],
                defaultActions: {
                    17: [ 2, 1 ],
                    25: [ 2, 28 ],
                    38: [ 2, 26 ],
                    57: [ 2, 24 ]
                },
                parseError: function parseError(str, hash) {
                    throw new Error(str);
                },
                parse: function parse(input) {
                    var self = this, stack = [ 0 ], vstack = [ null ], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
                    this.lexer.setInput(input);
                    this.lexer.yy = this.yy;
                    this.yy.lexer = this.lexer;
                    this.yy.parser = this;
                    if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
                    var yyloc = this.lexer.yylloc;
                    lstack.push(yyloc);
                    var ranges = this.lexer.options && this.lexer.options.ranges;
                    if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
                    function popStack(n) {
                        stack.length = stack.length - 2 * n;
                        vstack.length = vstack.length - n;
                        lstack.length = lstack.length - n;
                    }
                    function lex() {
                        var token;
                        token = self.lexer.lex() || 1;
                        if (typeof token !== "number") {
                            token = self.symbols_[token] || token;
                        }
                        return token;
                    }
                    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
                    while (true) {
                        state = stack[stack.length - 1];
                        if (this.defaultActions[state]) {
                            action = this.defaultActions[state];
                        } else {
                            if (symbol === null || typeof symbol == "undefined") {
                                symbol = lex();
                            }
                            action = table[state] && table[state][symbol];
                        }
                        if (typeof action === "undefined" || !action.length || !action[0]) {
                            var errStr = "";
                            if (!recovering) {
                                expected = [];
                                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                                    expected.push("'" + this.terminals_[p] + "'");
                                }
                                if (this.lexer.showPosition) {
                                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                                } else {
                                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                                }
                                this.parseError(errStr, {
                                    text: this.lexer.match,
                                    token: this.terminals_[symbol] || symbol,
                                    line: this.lexer.yylineno,
                                    loc: yyloc,
                                    expected: expected
                                });
                            }
                        }
                        if (action[0] instanceof Array && action.length > 1) {
                            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                        }
                        switch (action[0]) {
                          case 1:
                            stack.push(symbol);
                            vstack.push(this.lexer.yytext);
                            lstack.push(this.lexer.yylloc);
                            stack.push(action[1]);
                            symbol = null;
                            if (!preErrorSymbol) {
                                yyleng = this.lexer.yyleng;
                                yytext = this.lexer.yytext;
                                yylineno = this.lexer.yylineno;
                                yyloc = this.lexer.yylloc;
                                if (recovering > 0) recovering--;
                            } else {
                                symbol = preErrorSymbol;
                                preErrorSymbol = null;
                            }
                            break;

                          case 2:
                            len = this.productions_[action[1]][1];
                            yyval.$ = vstack[vstack.length - len];
                            yyval._$ = {
                                first_line: lstack[lstack.length - (len || 1)].first_line,
                                last_line: lstack[lstack.length - 1].last_line,
                                first_column: lstack[lstack.length - (len || 1)].first_column,
                                last_column: lstack[lstack.length - 1].last_column
                            };
                            if (ranges) {
                                yyval._$.range = [ lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1] ];
                            }
                            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                            if (typeof r !== "undefined") {
                                return r;
                            }
                            if (len) {
                                stack = stack.slice(0, -1 * len * 2);
                                vstack = vstack.slice(0, -1 * len);
                                lstack = lstack.slice(0, -1 * len);
                            }
                            stack.push(this.productions_[action[1]][0]);
                            vstack.push(yyval.$);
                            lstack.push(yyval._$);
                            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                            stack.push(newState);
                            break;

                          case 3:
                            return true;
                        }
                    }
                    return true;
                }
            };
            /* Jison generated lexer */
            var lexer = function() {
                var lexer = {
                    EOF: 1,
                    parseError: function parseError(str, hash) {
                        if (this.yy.parser) {
                            this.yy.parser.parseError(str, hash);
                        } else {
                            throw new Error(str);
                        }
                    },
                    setInput: function(input) {
                        this._input = input;
                        this._more = this._less = this.done = false;
                        this.yylineno = this.yyleng = 0;
                        this.yytext = this.matched = this.match = "";
                        this.conditionStack = [ "INITIAL" ];
                        this.yylloc = {
                            first_line: 1,
                            first_column: 0,
                            last_line: 1,
                            last_column: 0
                        };
                        if (this.options.ranges) this.yylloc.range = [ 0, 0 ];
                        this.offset = 0;
                        return this;
                    },
                    input: function() {
                        var ch = this._input[0];
                        this.yytext += ch;
                        this.yyleng++;
                        this.offset++;
                        this.match += ch;
                        this.matched += ch;
                        var lines = ch.match(/(?:\r\n?|\n).*/g);
                        if (lines) {
                            this.yylineno++;
                            this.yylloc.last_line++;
                        } else {
                            this.yylloc.last_column++;
                        }
                        if (this.options.ranges) this.yylloc.range[1]++;
                        this._input = this._input.slice(1);
                        return ch;
                    },
                    unput: function(ch) {
                        var len = ch.length;
                        var lines = ch.split(/(?:\r\n?|\n)/g);
                        this._input = ch + this._input;
                        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                        //this.yyleng -= len;
                        this.offset -= len;
                        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                        this.match = this.match.substr(0, this.match.length - 1);
                        this.matched = this.matched.substr(0, this.matched.length - 1);
                        if (lines.length - 1) this.yylineno -= lines.length - 1;
                        var r = this.yylloc.range;
                        this.yylloc = {
                            first_line: this.yylloc.first_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.first_column,
                            last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                        };
                        if (this.options.ranges) {
                            this.yylloc.range = [ r[0], r[0] + this.yyleng - len ];
                        }
                        return this;
                    },
                    more: function() {
                        this._more = true;
                        return this;
                    },
                    less: function(n) {
                        this.unput(this.match.slice(n));
                    },
                    pastInput: function() {
                        var past = this.matched.substr(0, this.matched.length - this.match.length);
                        return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
                    },
                    upcomingInput: function() {
                        var next = this.match;
                        if (next.length < 20) {
                            next += this._input.substr(0, 20 - next.length);
                        }
                        return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
                    },
                    showPosition: function() {
                        var pre = this.pastInput();
                        var c = new Array(pre.length + 1).join("-");
                        return pre + this.upcomingInput() + "\n" + c + "^";
                    },
                    next: function() {
                        if (this.done) {
                            return this.EOF;
                        }
                        if (!this._input) this.done = true;
                        var token, match, tempMatch, index, col, lines;
                        if (!this._more) {
                            this.yytext = "";
                            this.match = "";
                        }
                        var rules = this._currentRules();
                        for (var i = 0; i < rules.length; i++) {
                            tempMatch = this._input.match(this.rules[rules[i]]);
                            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                                match = tempMatch;
                                index = i;
                                if (!this.options.flex) break;
                            }
                        }
                        if (match) {
                            lines = match[0].match(/(?:\r\n?|\n).*/g);
                            if (lines) this.yylineno += lines.length;
                            this.yylloc = {
                                first_line: this.yylloc.last_line,
                                last_line: this.yylineno + 1,
                                first_column: this.yylloc.last_column,
                                last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
                            };
                            this.yytext += match[0];
                            this.match += match[0];
                            this.matches = match;
                            this.yyleng = this.yytext.length;
                            if (this.options.ranges) {
                                this.yylloc.range = [ this.offset, this.offset += this.yyleng ];
                            }
                            this._more = false;
                            this._input = this._input.slice(match[0].length);
                            this.matched += match[0];
                            token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                            if (this.done && this._input) this.done = false;
                            if (token) return token; else return;
                        }
                        if (this._input === "") {
                            return this.EOF;
                        } else {
                            return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                                text: "",
                                token: null,
                                line: this.yylineno
                            });
                        }
                    },
                    lex: function lex() {
                        var r = this.next();
                        if (typeof r !== "undefined") {
                            return r;
                        } else {
                            return this.lex();
                        }
                    },
                    begin: function begin(condition) {
                        this.conditionStack.push(condition);
                    },
                    popState: function popState() {
                        return this.conditionStack.pop();
                    },
                    _currentRules: function _currentRules() {
                        return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                    },
                    topState: function() {
                        return this.conditionStack[this.conditionStack.length - 2];
                    },
                    pushState: function begin(condition) {
                        this.begin(condition);
                    }
                };
                lexer.options = {};
                lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
                    var YYSTATE = YY_START;
                    switch ($avoiding_name_collisions) {
                      case 0:
                        yy_.yytext = "\\";
                        return 14;
                        break;

                      case 1:
                        if (yy_.yytext.slice(-1) !== "\\") this.begin("mu");
                        if (yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0, yy_.yyleng - 1), 
                        this.begin("emu");
                        if (yy_.yytext) return 14;
                        break;

                      case 2:
                        return 14;
                        break;

                      case 3:
                        if (yy_.yytext.slice(-1) !== "\\") this.popState();
                        if (yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0, yy_.yyleng - 1);
                        return 14;
                        break;

                      case 4:
                        yy_.yytext = yy_.yytext.substr(0, yy_.yyleng - 4);
                        this.popState();
                        return 15;
                        break;

                      case 5:
                        this.begin("par");
                        return 24;
                        break;

                      case 6:
                        return 16;
                        break;

                      case 7:
                        return 20;
                        break;

                      case 8:
                        return 19;
                        break;

                      case 9:
                        return 19;
                        break;

                      case 10:
                        return 23;
                        break;

                      case 11:
                        return 23;
                        break;

                      case 12:
                        this.popState();
                        this.begin("com");
                        break;

                      case 13:
                        yy_.yytext = yy_.yytext.substr(3, yy_.yyleng - 5);
                        this.popState();
                        return 15;
                        break;

                      case 14:
                        return 22;
                        break;

                      case 15:
                        return 36;
                        break;

                      case 16:
                        return 35;
                        break;

                      case 17:
                        return 35;
                        break;

                      case 18:
                        return 39;
                        break;

                      case 19:
                        /*ignore whitespace*/
                        break;

                      case 20:
                        this.popState();
                        return 18;
                        break;

                      case 21:
                        this.popState();
                        return 18;
                        break;

                      case 22:
                        yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2).replace(/\\"/g, '"');
                        return 30;
                        break;

                      case 23:
                        yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2).replace(/\\'/g, "'");
                        return 30;
                        break;

                      case 24:
                        yy_.yytext = yy_.yytext.substr(1);
                        return 28;
                        break;

                      case 25:
                        return 32;
                        break;

                      case 26:
                        return 32;
                        break;

                      case 27:
                        return 31;
                        break;

                      case 28:
                        return 35;
                        break;

                      case 29:
                        yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2);
                        return 35;
                        break;

                      case 30:
                        return "INVALID";
                        break;

                      case 31:
                        /*ignore whitespace*/
                        break;

                      case 32:
                        this.popState();
                        return 37;
                        break;

                      case 33:
                        return 5;
                        break;
                    }
                };
                lexer.rules = [ /^(?:\\\\(?=(\{\{)))/, /^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\{\{>)/, /^(?:\{\{#)/, /^(?:\{\{\/)/, /^(?:\{\{\^)/, /^(?:\{\{\s*else\b)/, /^(?:\{\{\{)/, /^(?:\{\{&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{)/, /^(?:=)/, /^(?:\.(?=[}/ ]))/, /^(?:\.\.)/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}\}\})/, /^(?:\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@[a-zA-Z]+)/, /^(?:true(?=[}\s]))/, /^(?:false(?=[}\s]))/, /^(?:-?[0-9]+(?=[}\s]))/, /^(?:[a-zA-Z0-9_$:\-]+(?=[=}\s\/.]))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:\s+)/, /^(?:[a-zA-Z0-9_$\-\/]+)/, /^(?:$)/ ];
                lexer.conditions = {
                    mu: {
                        rules: [ 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 33 ],
                        inclusive: false
                    },
                    emu: {
                        rules: [ 3 ],
                        inclusive: false
                    },
                    com: {
                        rules: [ 4 ],
                        inclusive: false
                    },
                    par: {
                        rules: [ 31, 32 ],
                        inclusive: false
                    },
                    INITIAL: {
                        rules: [ 0, 1, 2, 33 ],
                        inclusive: true
                    }
                };
                return lexer;
            }();
            parser.lexer = lexer;
            function Parser() {
                this.yy = {};
            }
            Parser.prototype = parser;
            parser.Parser = Parser;
            return new Parser();
        }();
        // lib/handlebars/compiler/base.js
        Handlebars.Parser = handlebars;
        Handlebars.parse = function(input) {
            // Just return if an already-compile AST was passed in.
            if (input.constructor === Handlebars.AST.ProgramNode) {
                return input;
            }
            Handlebars.Parser.yy = Handlebars.AST;
            return Handlebars.Parser.parse(input);
        };
        // lib/handlebars/compiler/ast.js
        Handlebars.AST = {};
        Handlebars.AST.ProgramNode = function(statements, inverse) {
            this.type = "program";
            this.statements = statements;
            if (inverse) {
                this.inverse = new Handlebars.AST.ProgramNode(inverse);
            }
        };
        Handlebars.AST.MustacheNode = function(rawParams, hash, unescaped) {
            this.type = "mustache";
            this.escaped = !unescaped;
            this.hash = hash;
            var id = this.id = rawParams[0];
            var params = this.params = rawParams.slice(1);
            // a mustache is an eligible helper if:
            // * its id is simple (a single part, not `this` or `..`)
            var eligibleHelper = this.eligibleHelper = id.isSimple;
            // a mustache is definitely a helper if:
            // * it is an eligible helper, and
            // * it has at least one parameter or hash segment
            this.isHelper = eligibleHelper && (params.length || hash);
        };
        Handlebars.AST.PartialNode = function(partialName, context) {
            this.type = "partial";
            this.partialName = partialName;
            this.context = context;
        };
        Handlebars.AST.BlockNode = function(mustache, program, inverse, close) {
            var verifyMatch = function(open, close) {
                if (open.original !== close.original) {
                    throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
                }
            };
            verifyMatch(mustache.id, close);
            this.type = "block";
            this.mustache = mustache;
            this.program = program;
            this.inverse = inverse;
            if (this.inverse && !this.program) {
                this.isInverse = true;
            }
        };
        Handlebars.AST.ContentNode = function(string) {
            this.type = "content";
            this.string = string;
        };
        Handlebars.AST.HashNode = function(pairs) {
            this.type = "hash";
            this.pairs = pairs;
        };
        Handlebars.AST.IdNode = function(parts) {
            this.type = "ID";
            this.original = parts.join(".");
            var dig = [], depth = 0;
            for (var i = 0, l = parts.length; i < l; i++) {
                var part = parts[i];
                if (part === ".." || part === "." || part === "this") {
                    if (dig.length > 0) {
                        throw new Handlebars.Exception("Invalid path: " + this.original);
                    } else if (part === "..") {
                        depth++;
                    } else {
                        this.isScoped = true;
                    }
                } else {
                    dig.push(part);
                }
            }
            this.parts = dig;
            this.string = dig.join(".");
            this.depth = depth;
            // an ID is simple if it only has one part, and that part is not
            // `..` or `this`.
            this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;
            this.stringModeValue = this.string;
        };
        Handlebars.AST.PartialNameNode = function(name) {
            this.type = "PARTIAL_NAME";
            this.name = name;
        };
        Handlebars.AST.DataNode = function(id) {
            this.type = "DATA";
            this.id = id;
        };
        Handlebars.AST.StringNode = function(string) {
            this.type = "STRING";
            this.string = string;
            this.stringModeValue = string;
        };
        Handlebars.AST.IntegerNode = function(integer) {
            this.type = "INTEGER";
            this.integer = integer;
            this.stringModeValue = Number(integer);
        };
        Handlebars.AST.BooleanNode = function(bool) {
            this.type = "BOOLEAN";
            this.bool = bool;
            this.stringModeValue = bool === "true";
        };
        Handlebars.AST.CommentNode = function(comment) {
            this.type = "comment";
            this.comment = comment;
        };
        // lib/handlebars/utils.js
        var errorProps = [ "description", "fileName", "lineNumber", "message", "name", "number", "stack" ];
        Handlebars.Exception = function(message) {
            var tmp = Error.prototype.constructor.apply(this, arguments);
            // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
            for (var idx = 0; idx < errorProps.length; idx++) {
                this[errorProps[idx]] = tmp[errorProps[idx]];
            }
        };
        Handlebars.Exception.prototype = new Error();
        // Build out our basic SafeString type
        Handlebars.SafeString = function(string) {
            this.string = string;
        };
        Handlebars.SafeString.prototype.toString = function() {
            return this.string.toString();
        };
        var escape = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };
        var badChars = /[&<>"'`]/g;
        var possible = /[&<>"'`]/;
        var escapeChar = function(chr) {
            return escape[chr] || "&amp;";
        };
        Handlebars.Utils = {
            extend: function(obj, value) {
                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        obj[key] = value[key];
                    }
                }
            },
            escapeExpression: function(string) {
                // don't escape SafeStrings, since they're already safe
                if (string instanceof Handlebars.SafeString) {
                    return string.toString();
                } else if (string == null || string === false) {
                    return "";
                }
                // Force a string conversion as this will be done by the append regardless and
                // the regex test will do this transparently behind the scenes, causing issues if
                // an object's to string has escaped characters in it.
                string = string.toString();
                if (!possible.test(string)) {
                    return string;
                }
                return string.replace(badChars, escapeChar);
            },
            isEmpty: function(value) {
                if (!value && value !== 0) {
                    return true;
                } else if (toString.call(value) === "[object Array]" && value.length === 0) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        // lib/handlebars/compiler/compiler.js
        /*jshint eqnull:true*/
        var Compiler = Handlebars.Compiler = function() {};
        var JavaScriptCompiler = Handlebars.JavaScriptCompiler = function() {};
        // the foundHelper register will disambiguate helper lookup from finding a
        // function in a context. This is necessary for mustache compatibility, which
        // requires that context functions in blocks are evaluated by blockHelperMissing,
        // and then proceed as if the resulting value was provided to blockHelperMissing.
        Compiler.prototype = {
            compiler: Compiler,
            disassemble: function() {
                var opcodes = this.opcodes, opcode, out = [], params, param;
                for (var i = 0, l = opcodes.length; i < l; i++) {
                    opcode = opcodes[i];
                    if (opcode.opcode === "DECLARE") {
                        out.push("DECLARE " + opcode.name + "=" + opcode.value);
                    } else {
                        params = [];
                        for (var j = 0; j < opcode.args.length; j++) {
                            param = opcode.args[j];
                            if (typeof param === "string") {
                                param = '"' + param.replace("\n", "\\n") + '"';
                            }
                            params.push(param);
                        }
                        out.push(opcode.opcode + " " + params.join(" "));
                    }
                }
                return out.join("\n");
            },
            equals: function(other) {
                var len = this.opcodes.length;
                if (other.opcodes.length !== len) {
                    return false;
                }
                for (var i = 0; i < len; i++) {
                    var opcode = this.opcodes[i], otherOpcode = other.opcodes[i];
                    if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
                        return false;
                    }
                    for (var j = 0; j < opcode.args.length; j++) {
                        if (opcode.args[j] !== otherOpcode.args[j]) {
                            return false;
                        }
                    }
                }
                len = this.children.length;
                if (other.children.length !== len) {
                    return false;
                }
                for (i = 0; i < len; i++) {
                    if (!this.children[i].equals(other.children[i])) {
                        return false;
                    }
                }
                return true;
            },
            guid: 0,
            compile: function(program, options) {
                this.children = [];
                this.depths = {
                    list: []
                };
                this.options = options;
                // These changes will propagate to the other compiler components
                var knownHelpers = this.options.knownHelpers;
                this.options.knownHelpers = {
                    helperMissing: true,
                    blockHelperMissing: true,
                    each: true,
                    "if": true,
                    unless: true,
                    "with": true,
                    log: true
                };
                if (knownHelpers) {
                    for (var name in knownHelpers) {
                        this.options.knownHelpers[name] = knownHelpers[name];
                    }
                }
                return this.program(program);
            },
            accept: function(node) {
                return this[node.type](node);
            },
            program: function(program) {
                var statements = program.statements, statement;
                this.opcodes = [];
                for (var i = 0, l = statements.length; i < l; i++) {
                    statement = statements[i];
                    this[statement.type](statement);
                }
                this.isSimple = l === 1;
                this.depths.list = this.depths.list.sort(function(a, b) {
                    return a - b;
                });
                return this;
            },
            compileProgram: function(program) {
                var result = new this.compiler().compile(program, this.options);
                var guid = this.guid++, depth;
                this.usePartial = this.usePartial || result.usePartial;
                this.children[guid] = result;
                for (var i = 0, l = result.depths.list.length; i < l; i++) {
                    depth = result.depths.list[i];
                    if (depth < 2) {
                        continue;
                    } else {
                        this.addDepth(depth - 1);
                    }
                }
                return guid;
            },
            block: function(block) {
                var mustache = block.mustache, program = block.program, inverse = block.inverse;
                if (program) {
                    program = this.compileProgram(program);
                }
                if (inverse) {
                    inverse = this.compileProgram(inverse);
                }
                var type = this.classifyMustache(mustache);
                if (type === "helper") {
                    this.helperMustache(mustache, program, inverse);
                } else if (type === "simple") {
                    this.simpleMustache(mustache);
                    // now that the simple mustache is resolved, we need to
                    // evaluate it by executing `blockHelperMissing`
                    this.opcode("pushProgram", program);
                    this.opcode("pushProgram", inverse);
                    this.opcode("emptyHash");
                    this.opcode("blockValue");
                } else {
                    this.ambiguousMustache(mustache, program, inverse);
                    // now that the simple mustache is resolved, we need to
                    // evaluate it by executing `blockHelperMissing`
                    this.opcode("pushProgram", program);
                    this.opcode("pushProgram", inverse);
                    this.opcode("emptyHash");
                    this.opcode("ambiguousBlockValue");
                }
                this.opcode("append");
            },
            hash: function(hash) {
                var pairs = hash.pairs, pair, val;
                this.opcode("pushHash");
                for (var i = 0, l = pairs.length; i < l; i++) {
                    pair = pairs[i];
                    val = pair[1];
                    if (this.options.stringParams) {
                        if (val.depth) {
                            this.addDepth(val.depth);
                        }
                        this.opcode("getContext", val.depth || 0);
                        this.opcode("pushStringParam", val.stringModeValue, val.type);
                    } else {
                        this.accept(val);
                    }
                    this.opcode("assignToHash", pair[0]);
                }
                this.opcode("popHash");
            },
            partial: function(partial) {
                var partialName = partial.partialName;
                this.usePartial = true;
                if (partial.context) {
                    this.ID(partial.context);
                } else {
                    this.opcode("push", "depth0");
                }
                this.opcode("invokePartial", partialName.name);
                this.opcode("append");
            },
            content: function(content) {
                this.opcode("appendContent", content.string);
            },
            mustache: function(mustache) {
                var options = this.options;
                var type = this.classifyMustache(mustache);
                if (type === "simple") {
                    this.simpleMustache(mustache);
                } else if (type === "helper") {
                    this.helperMustache(mustache);
                } else {
                    this.ambiguousMustache(mustache);
                }
                if (mustache.escaped && !options.noEscape) {
                    this.opcode("appendEscaped");
                } else {
                    this.opcode("append");
                }
            },
            ambiguousMustache: function(mustache, program, inverse) {
                var id = mustache.id, name = id.parts[0], isBlock = program != null || inverse != null;
                this.opcode("getContext", id.depth);
                this.opcode("pushProgram", program);
                this.opcode("pushProgram", inverse);
                this.opcode("invokeAmbiguous", name, isBlock);
            },
            simpleMustache: function(mustache) {
                var id = mustache.id;
                if (id.type === "DATA") {
                    this.DATA(id);
                } else if (id.parts.length) {
                    this.ID(id);
                } else {
                    // Simplified ID for `this`
                    this.addDepth(id.depth);
                    this.opcode("getContext", id.depth);
                    this.opcode("pushContext");
                }
                this.opcode("resolvePossibleLambda");
            },
            helperMustache: function(mustache, program, inverse) {
                var params = this.setupFullMustacheParams(mustache, program, inverse), name = mustache.id.parts[0];
                if (this.options.knownHelpers[name]) {
                    this.opcode("invokeKnownHelper", params.length, name);
                } else if (this.options.knownHelpersOnly) {
                    throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
                } else {
                    this.opcode("invokeHelper", params.length, name);
                }
            },
            ID: function(id) {
                this.addDepth(id.depth);
                this.opcode("getContext", id.depth);
                var name = id.parts[0];
                if (!name) {
                    this.opcode("pushContext");
                } else {
                    this.opcode("lookupOnContext", id.parts[0]);
                }
                for (var i = 1, l = id.parts.length; i < l; i++) {
                    this.opcode("lookup", id.parts[i]);
                }
            },
            DATA: function(data) {
                this.options.data = true;
                this.opcode("lookupData", data.id);
            },
            STRING: function(string) {
                this.opcode("pushString", string.string);
            },
            INTEGER: function(integer) {
                this.opcode("pushLiteral", integer.integer);
            },
            BOOLEAN: function(bool) {
                this.opcode("pushLiteral", bool.bool);
            },
            comment: function() {},
            // HELPERS
            opcode: function(name) {
                this.opcodes.push({
                    opcode: name,
                    args: [].slice.call(arguments, 1)
                });
            },
            declare: function(name, value) {
                this.opcodes.push({
                    opcode: "DECLARE",
                    name: name,
                    value: value
                });
            },
            addDepth: function(depth) {
                if (isNaN(depth)) {
                    throw new Error("EWOT");
                }
                if (depth === 0) {
                    return;
                }
                if (!this.depths[depth]) {
                    this.depths[depth] = true;
                    this.depths.list.push(depth);
                }
            },
            classifyMustache: function(mustache) {
                var isHelper = mustache.isHelper;
                var isEligible = mustache.eligibleHelper;
                var options = this.options;
                // if ambiguous, we can possibly resolve the ambiguity now
                if (isEligible && !isHelper) {
                    var name = mustache.id.parts[0];
                    if (options.knownHelpers[name]) {
                        isHelper = true;
                    } else if (options.knownHelpersOnly) {
                        isEligible = false;
                    }
                }
                if (isHelper) {
                    return "helper";
                } else if (isEligible) {
                    return "ambiguous";
                } else {
                    return "simple";
                }
            },
            pushParams: function(params) {
                var i = params.length, param;
                while (i--) {
                    param = params[i];
                    if (this.options.stringParams) {
                        if (param.depth) {
                            this.addDepth(param.depth);
                        }
                        this.opcode("getContext", param.depth || 0);
                        this.opcode("pushStringParam", param.stringModeValue, param.type);
                    } else {
                        this[param.type](param);
                    }
                }
            },
            setupMustacheParams: function(mustache) {
                var params = mustache.params;
                this.pushParams(params);
                if (mustache.hash) {
                    this.hash(mustache.hash);
                } else {
                    this.opcode("emptyHash");
                }
                return params;
            },
            // this will replace setupMustacheParams when we're done
            setupFullMustacheParams: function(mustache, program, inverse) {
                var params = mustache.params;
                this.pushParams(params);
                this.opcode("pushProgram", program);
                this.opcode("pushProgram", inverse);
                if (mustache.hash) {
                    this.hash(mustache.hash);
                } else {
                    this.opcode("emptyHash");
                }
                return params;
            }
        };
        var Literal = function(value) {
            this.value = value;
        };
        JavaScriptCompiler.prototype = {
            // PUBLIC API: You can override these methods in a subclass to provide
            // alternative compiled forms for name lookup and buffering semantics
            nameLookup: function(parent, name) {
                if (/^[0-9]+$/.test(name)) {
                    return parent + "[" + name + "]";
                } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                    return parent + "." + name;
                } else {
                    return parent + "['" + name + "']";
                }
            },
            appendToBuffer: function(string) {
                if (this.environment.isSimple) {
                    return "return " + string + ";";
                } else {
                    return {
                        appendToBuffer: true,
                        content: string,
                        toString: function() {
                            return "buffer += " + string + ";";
                        }
                    };
                }
            },
            initializeBuffer: function() {
                return this.quotedString("");
            },
            namespace: "Handlebars",
            // END PUBLIC API
            compile: function(environment, options, context, asObject) {
                this.environment = environment;
                this.options = options || {};
                Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");
                this.name = this.environment.name;
                this.isChild = !!context;
                this.context = context || {
                    programs: [],
                    environments: [],
                    aliases: {}
                };
                this.preamble();
                this.stackSlot = 0;
                this.stackVars = [];
                this.registers = {
                    list: []
                };
                this.compileStack = [];
                this.inlineStack = [];
                this.compileChildren(environment, options);
                var opcodes = environment.opcodes, opcode;
                this.i = 0;
                for (l = opcodes.length; this.i < l; this.i++) {
                    opcode = opcodes[this.i];
                    if (opcode.opcode === "DECLARE") {
                        this[opcode.name] = opcode.value;
                    } else {
                        this[opcode.opcode].apply(this, opcode.args);
                    }
                }
                return this.createFunctionContext(asObject);
            },
            nextOpcode: function() {
                var opcodes = this.environment.opcodes;
                return opcodes[this.i + 1];
            },
            eat: function() {
                this.i = this.i + 1;
            },
            preamble: function() {
                var out = [];
                if (!this.isChild) {
                    var namespace = this.namespace;
                    var copies = "helpers = helpers || " + namespace + ".helpers;";
                    if (this.environment.usePartial) {
                        copies = copies + " partials = partials || " + namespace + ".partials;";
                    }
                    if (this.options.data) {
                        copies = copies + " data = data || {};";
                    }
                    out.push(copies);
                } else {
                    out.push("");
                }
                if (!this.environment.isSimple) {
                    out.push(", buffer = " + this.initializeBuffer());
                } else {
                    out.push("");
                }
                // track the last context pushed into place to allow skipping the
                // getContext opcode when it would be a noop
                this.lastContext = 0;
                this.source = out;
            },
            createFunctionContext: function(asObject) {
                var locals = this.stackVars.concat(this.registers.list);
                if (locals.length > 0) {
                    this.source[1] = this.source[1] + ", " + locals.join(", ");
                }
                // Generate minimizer alias mappings
                if (!this.isChild) {
                    for (var alias in this.context.aliases) {
                        this.source[1] = this.source[1] + ", " + alias + "=" + this.context.aliases[alias];
                    }
                }
                if (this.source[1]) {
                    this.source[1] = "var " + this.source[1].substring(2) + ";";
                }
                // Merge children
                if (!this.isChild) {
                    this.source[1] += "\n" + this.context.programs.join("\n") + "\n";
                }
                if (!this.environment.isSimple) {
                    this.source.push("return buffer;");
                }
                var params = this.isChild ? [ "depth0", "data" ] : [ "Handlebars", "depth0", "helpers", "partials", "data" ];
                for (var i = 0, l = this.environment.depths.list.length; i < l; i++) {
                    params.push("depth" + this.environment.depths.list[i]);
                }
                // Perform a second pass over the output to merge content when possible
                var source = this.mergeSource();
                if (!this.isChild) {
                    var revision = Handlebars.COMPILER_REVISION, versions = Handlebars.REVISION_CHANGES[revision];
                    source = "this.compilerInfo = [" + revision + ",'" + versions + "'];\n" + source;
                }
                if (asObject) {
                    params.push(source);
                    return Function.apply(this, params);
                } else {
                    var functionSource = "function " + (this.name || "") + "(" + params.join(",") + ") {\n  " + source + "}";
                    Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
                    return functionSource;
                }
            },
            mergeSource: function() {
                // WARN: We are not handling the case where buffer is still populated as the source should
                // not have buffer append operations as their final action.
                var source = "", buffer;
                for (var i = 0, len = this.source.length; i < len; i++) {
                    var line = this.source[i];
                    if (line.appendToBuffer) {
                        if (buffer) {
                            buffer = buffer + "\n    + " + line.content;
                        } else {
                            buffer = line.content;
                        }
                    } else {
                        if (buffer) {
                            source += "buffer += " + buffer + ";\n  ";
                            buffer = undefined;
                        }
                        source += line + "\n  ";
                    }
                }
                return source;
            },
            // [blockValue]
            //
            // On stack, before: hash, inverse, program, value
            // On stack, after: return value of blockHelperMissing
            //
            // The purpose of this opcode is to take a block of the form
            // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
            // replace it on the stack with the result of properly
            // invoking blockHelperMissing.
            blockValue: function() {
                this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                var params = [ "depth0" ];
                this.setupParams(0, params);
                this.replaceStack(function(current) {
                    params.splice(1, 0, current);
                    return "blockHelperMissing.call(" + params.join(", ") + ")";
                });
            },
            // [ambiguousBlockValue]
            //
            // On stack, before: hash, inverse, program, value
            // Compiler value, before: lastHelper=value of last found helper, if any
            // On stack, after, if no lastHelper: same as [blockValue]
            // On stack, after, if lastHelper: value
            ambiguousBlockValue: function() {
                this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                var params = [ "depth0" ];
                this.setupParams(0, params);
                var current = this.topStack();
                params.splice(1, 0, current);
                // Use the options value generated from the invocation
                params[params.length - 1] = "options";
                this.source.push("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
            },
            // [appendContent]
            //
            // On stack, before: ...
            // On stack, after: ...
            //
            // Appends the string value of `content` to the current buffer
            appendContent: function(content) {
                this.source.push(this.appendToBuffer(this.quotedString(content)));
            },
            // [append]
            //
            // On stack, before: value, ...
            // On stack, after: ...
            //
            // Coerces `value` to a String and appends it to the current buffer.
            //
            // If `value` is truthy, or 0, it is coerced into a string and appended
            // Otherwise, the empty string is appended
            append: function() {
                // Force anything that is inlined onto the stack so we don't have duplication
                // when we examine local
                this.flushInline();
                var local = this.popStack();
                this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
                if (this.environment.isSimple) {
                    this.source.push("else { " + this.appendToBuffer("''") + " }");
                }
            },
            // [appendEscaped]
            //
            // On stack, before: value, ...
            // On stack, after: ...
            //
            // Escape `value` and append it to the buffer
            appendEscaped: function() {
                this.context.aliases.escapeExpression = "this.escapeExpression";
                this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
            },
            // [getContext]
            //
            // On stack, before: ...
            // On stack, after: ...
            // Compiler value, after: lastContext=depth
            //
            // Set the value of the `lastContext` compiler value to the depth
            getContext: function(depth) {
                if (this.lastContext !== depth) {
                    this.lastContext = depth;
                }
            },
            // [lookupOnContext]
            //
            // On stack, before: ...
            // On stack, after: currentContext[name], ...
            //
            // Looks up the value of `name` on the current context and pushes
            // it onto the stack.
            lookupOnContext: function(name) {
                this.push(this.nameLookup("depth" + this.lastContext, name, "context"));
            },
            // [pushContext]
            //
            // On stack, before: ...
            // On stack, after: currentContext, ...
            //
            // Pushes the value of the current context onto the stack.
            pushContext: function() {
                this.pushStackLiteral("depth" + this.lastContext);
            },
            // [resolvePossibleLambda]
            //
            // On stack, before: value, ...
            // On stack, after: resolved value, ...
            //
            // If the `value` is a lambda, replace it on the stack by
            // the return value of the lambda
            resolvePossibleLambda: function() {
                this.context.aliases.functionType = '"function"';
                this.replaceStack(function(current) {
                    return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
                });
            },
            // [lookup]
            //
            // On stack, before: value, ...
            // On stack, after: value[name], ...
            //
            // Replace the value on the stack with the result of looking
            // up `name` on `value`
            lookup: function(name) {
                this.replaceStack(function(current) {
                    return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, "context");
                });
            },
            // [lookupData]
            //
            // On stack, before: ...
            // On stack, after: data[id], ...
            //
            // Push the result of looking up `id` on the current data
            lookupData: function(id) {
                this.push(this.nameLookup("data", id, "data"));
            },
            // [pushStringParam]
            //
            // On stack, before: ...
            // On stack, after: string, currentContext, ...
            //
            // This opcode is designed for use in string mode, which
            // provides the string value of a parameter along with its
            // depth rather than resolving it immediately.
            pushStringParam: function(string, type) {
                this.pushStackLiteral("depth" + this.lastContext);
                this.pushString(type);
                if (typeof string === "string") {
                    this.pushString(string);
                } else {
                    this.pushStackLiteral(string);
                }
            },
            emptyHash: function() {
                this.pushStackLiteral("{}");
                if (this.options.stringParams) {
                    this.register("hashTypes", "{}");
                    this.register("hashContexts", "{}");
                }
            },
            pushHash: function() {
                this.hash = {
                    values: [],
                    types: [],
                    contexts: []
                };
            },
            popHash: function() {
                var hash = this.hash;
                this.hash = undefined;
                if (this.options.stringParams) {
                    this.register("hashContexts", "{" + hash.contexts.join(",") + "}");
                    this.register("hashTypes", "{" + hash.types.join(",") + "}");
                }
                this.push("{\n    " + hash.values.join(",\n    ") + "\n  }");
            },
            // [pushString]
            //
            // On stack, before: ...
            // On stack, after: quotedString(string), ...
            //
            // Push a quoted version of `string` onto the stack
            pushString: function(string) {
                this.pushStackLiteral(this.quotedString(string));
            },
            // [push]
            //
            // On stack, before: ...
            // On stack, after: expr, ...
            //
            // Push an expression onto the stack
            push: function(expr) {
                this.inlineStack.push(expr);
                return expr;
            },
            // [pushLiteral]
            //
            // On stack, before: ...
            // On stack, after: value, ...
            //
            // Pushes a value onto the stack. This operation prevents
            // the compiler from creating a temporary variable to hold
            // it.
            pushLiteral: function(value) {
                this.pushStackLiteral(value);
            },
            // [pushProgram]
            //
            // On stack, before: ...
            // On stack, after: program(guid), ...
            //
            // Push a program expression onto the stack. This takes
            // a compile-time guid and converts it into a runtime-accessible
            // expression.
            pushProgram: function(guid) {
                if (guid != null) {
                    this.pushStackLiteral(this.programExpression(guid));
                } else {
                    this.pushStackLiteral(null);
                }
            },
            // [invokeHelper]
            //
            // On stack, before: hash, inverse, program, params..., ...
            // On stack, after: result of helper invocation
            //
            // Pops off the helper's parameters, invokes the helper,
            // and pushes the helper's return value onto the stack.
            //
            // If the helper is not found, `helperMissing` is called.
            invokeHelper: function(paramSize, name) {
                this.context.aliases.helperMissing = "helpers.helperMissing";
                var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
                this.push(helper.name);
                this.replaceStack(function(name) {
                    return name + " ? " + name + ".call(" + helper.callParams + ") " + ": helperMissing.call(" + helper.helperMissingParams + ")";
                });
            },
            // [invokeKnownHelper]
            //
            // On stack, before: hash, inverse, program, params..., ...
            // On stack, after: result of helper invocation
            //
            // This operation is used when the helper is known to exist,
            // so a `helperMissing` fallback is not required.
            invokeKnownHelper: function(paramSize, name) {
                var helper = this.setupHelper(paramSize, name);
                this.push(helper.name + ".call(" + helper.callParams + ")");
            },
            // [invokeAmbiguous]
            //
            // On stack, before: hash, inverse, program, params..., ...
            // On stack, after: result of disambiguation
            //
            // This operation is used when an expression like `{{foo}}`
            // is provided, but we don't know at compile-time whether it
            // is a helper or a path.
            //
            // This operation emits more code than the other options,
            // and can be avoided by passing the `knownHelpers` and
            // `knownHelpersOnly` flags at compile-time.
            invokeAmbiguous: function(name, helperCall) {
                this.context.aliases.functionType = '"function"';
                this.pushStackLiteral("{}");
                // Hash value
                var helper = this.setupHelper(0, name, helperCall);
                var helperName = this.lastHelper = this.nameLookup("helpers", name, "helper");
                var nonHelper = this.nameLookup("depth" + this.lastContext, name, "context");
                var nextStack = this.nextStack();
                this.source.push("if (" + nextStack + " = " + helperName + ") { " + nextStack + " = " + nextStack + ".call(" + helper.callParams + "); }");
                this.source.push("else { " + nextStack + " = " + nonHelper + "; " + nextStack + " = typeof " + nextStack + " === functionType ? " + nextStack + ".apply(depth0) : " + nextStack + "; }");
            },
            // [invokePartial]
            //
            // On stack, before: context, ...
            // On stack after: result of partial invocation
            //
            // This operation pops off a context, invokes a partial with that context,
            // and pushes the result of the invocation back.
            invokePartial: function(name) {
                var params = [ this.nameLookup("partials", name, "partial"), "'" + name + "'", this.popStack(), "helpers", "partials" ];
                if (this.options.data) {
                    params.push("data");
                }
                this.context.aliases.self = "this";
                this.push("self.invokePartial(" + params.join(", ") + ")");
            },
            // [assignToHash]
            //
            // On stack, before: value, hash, ...
            // On stack, after: hash, ...
            //
            // Pops a value and hash off the stack, assigns `hash[key] = value`
            // and pushes the hash back onto the stack.
            assignToHash: function(key) {
                var value = this.popStack(), context, type;
                if (this.options.stringParams) {
                    type = this.popStack();
                    context = this.popStack();
                }
                var hash = this.hash;
                if (context) {
                    hash.contexts.push("'" + key + "': " + context);
                }
                if (type) {
                    hash.types.push("'" + key + "': " + type);
                }
                hash.values.push("'" + key + "': (" + value + ")");
            },
            // HELPERS
            compiler: JavaScriptCompiler,
            compileChildren: function(environment, options) {
                var children = environment.children, child, compiler;
                for (var i = 0, l = children.length; i < l; i++) {
                    child = children[i];
                    compiler = new this.compiler();
                    var index = this.matchExistingProgram(child);
                    if (index == null) {
                        this.context.programs.push("");
                        // Placeholder to prevent name conflicts for nested children
                        index = this.context.programs.length;
                        child.index = index;
                        child.name = "program" + index;
                        this.context.programs[index] = compiler.compile(child, options, this.context);
                        this.context.environments[index] = child;
                    } else {
                        child.index = index;
                        child.name = "program" + index;
                    }
                }
            },
            matchExistingProgram: function(child) {
                for (var i = 0, len = this.context.environments.length; i < len; i++) {
                    var environment = this.context.environments[i];
                    if (environment && environment.equals(child)) {
                        return i;
                    }
                }
            },
            programExpression: function(guid) {
                this.context.aliases.self = "this";
                if (guid == null) {
                    return "self.noop";
                }
                var child = this.environment.children[guid], depths = child.depths.list, depth;
                var programParams = [ child.index, child.name, "data" ];
                for (var i = 0, l = depths.length; i < l; i++) {
                    depth = depths[i];
                    if (depth === 1) {
                        programParams.push("depth0");
                    } else {
                        programParams.push("depth" + (depth - 1));
                    }
                }
                return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
            },
            register: function(name, val) {
                this.useRegister(name);
                this.source.push(name + " = " + val + ";");
            },
            useRegister: function(name) {
                if (!this.registers[name]) {
                    this.registers[name] = true;
                    this.registers.list.push(name);
                }
            },
            pushStackLiteral: function(item) {
                return this.push(new Literal(item));
            },
            pushStack: function(item) {
                this.flushInline();
                var stack = this.incrStack();
                if (item) {
                    this.source.push(stack + " = " + item + ";");
                }
                this.compileStack.push(stack);
                return stack;
            },
            replaceStack: function(callback) {
                var prefix = "", inline = this.isInline(), stack;
                // If we are currently inline then we want to merge the inline statement into the
                // replacement statement via ','
                if (inline) {
                    var top = this.popStack(true);
                    if (top instanceof Literal) {
                        // Literals do not need to be inlined
                        stack = top.value;
                    } else {
                        // Get or create the current stack name for use by the inline
                        var name = this.stackSlot ? this.topStackName() : this.incrStack();
                        prefix = "(" + this.push(name) + " = " + top + "),";
                        stack = this.topStack();
                    }
                } else {
                    stack = this.topStack();
                }
                var item = callback.call(this, stack);
                if (inline) {
                    if (this.inlineStack.length || this.compileStack.length) {
                        this.popStack();
                    }
                    this.push("(" + prefix + item + ")");
                } else {
                    // Prevent modification of the context depth variable. Through replaceStack
                    if (!/^stack/.test(stack)) {
                        stack = this.nextStack();
                    }
                    this.source.push(stack + " = (" + prefix + item + ");");
                }
                return stack;
            },
            nextStack: function() {
                return this.pushStack();
            },
            incrStack: function() {
                this.stackSlot++;
                if (this.stackSlot > this.stackVars.length) {
                    this.stackVars.push("stack" + this.stackSlot);
                }
                return this.topStackName();
            },
            topStackName: function() {
                return "stack" + this.stackSlot;
            },
            flushInline: function() {
                var inlineStack = this.inlineStack;
                if (inlineStack.length) {
                    this.inlineStack = [];
                    for (var i = 0, len = inlineStack.length; i < len; i++) {
                        var entry = inlineStack[i];
                        if (entry instanceof Literal) {
                            this.compileStack.push(entry);
                        } else {
                            this.pushStack(entry);
                        }
                    }
                }
            },
            isInline: function() {
                return this.inlineStack.length;
            },
            popStack: function(wrapped) {
                var inline = this.isInline(), item = (inline ? this.inlineStack : this.compileStack).pop();
                if (!wrapped && item instanceof Literal) {
                    return item.value;
                } else {
                    if (!inline) {
                        this.stackSlot--;
                    }
                    return item;
                }
            },
            topStack: function(wrapped) {
                var stack = this.isInline() ? this.inlineStack : this.compileStack, item = stack[stack.length - 1];
                if (!wrapped && item instanceof Literal) {
                    return item.value;
                } else {
                    return item;
                }
            },
            quotedString: function(str) {
                return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';
            },
            setupHelper: function(paramSize, name, missingParams) {
                var params = [];
                this.setupParams(paramSize, params, missingParams);
                var foundHelper = this.nameLookup("helpers", name, "helper");
                return {
                    params: params,
                    name: foundHelper,
                    callParams: [ "depth0" ].concat(params).join(", "),
                    helperMissingParams: missingParams && [ "depth0", this.quotedString(name) ].concat(params).join(", ")
                };
            },
            // the params and contexts arguments are passed in arrays
            // to fill in
            setupParams: function(paramSize, params, useRegister) {
                var options = [], contexts = [], types = [], param, inverse, program;
                options.push("hash:" + this.popStack());
                inverse = this.popStack();
                program = this.popStack();
                // Avoid setting fn and inverse if neither are set. This allows
                // helpers to do a check for `if (options.fn)`
                if (program || inverse) {
                    if (!program) {
                        this.context.aliases.self = "this";
                        program = "self.noop";
                    }
                    if (!inverse) {
                        this.context.aliases.self = "this";
                        inverse = "self.noop";
                    }
                    options.push("inverse:" + inverse);
                    options.push("fn:" + program);
                }
                for (var i = 0; i < paramSize; i++) {
                    param = this.popStack();
                    params.push(param);
                    if (this.options.stringParams) {
                        types.push(this.popStack());
                        contexts.push(this.popStack());
                    }
                }
                if (this.options.stringParams) {
                    options.push("contexts:[" + contexts.join(",") + "]");
                    options.push("types:[" + types.join(",") + "]");
                    options.push("hashContexts:hashContexts");
                    options.push("hashTypes:hashTypes");
                }
                if (this.options.data) {
                    options.push("data:data");
                }
                options = "{" + options.join(",") + "}";
                if (useRegister) {
                    this.register("options", options);
                    params.push("options");
                } else {
                    params.push(options);
                }
                return params.join(", ");
            }
        };
        var reservedWords = ("break else new var" + " case finally return void" + " catch for switch while" + " continue function this with" + " default if throw" + " delete in try" + " do instanceof typeof" + " abstract enum int short" + " boolean export interface static" + " byte extends long super" + " char final native synchronized" + " class float package throws" + " const goto private transient" + " debugger implements protected volatile" + " double import public let yield").split(" ");
        var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
        for (var i = 0, l = reservedWords.length; i < l; i++) {
            compilerWords[reservedWords[i]] = true;
        }
        JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
            if (!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
                return true;
            }
            return false;
        };
        Handlebars.precompile = function(input, options) {
            if (input == null || typeof input !== "string" && input.constructor !== Handlebars.AST.ProgramNode) {
                throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
            }
            options = options || {};
            if (!("data" in options)) {
                options.data = true;
            }
            var ast = Handlebars.parse(input);
            var environment = new Compiler().compile(ast, options);
            return new JavaScriptCompiler().compile(environment, options);
        };
        Handlebars.compile = function(input, options) {
            if (input == null || typeof input !== "string" && input.constructor !== Handlebars.AST.ProgramNode) {
                throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
            }
            options = options || {};
            if (!("data" in options)) {
                options.data = true;
            }
            var compiled;
            function compile() {
                var ast = Handlebars.parse(input);
                var environment = new Compiler().compile(ast, options);
                var templateSpec = new JavaScriptCompiler().compile(environment, options, undefined, true);
                return Handlebars.template(templateSpec);
            }
            // Template is only compiled on first use and cached after that point.
            return function(context, options) {
                if (!compiled) {
                    compiled = compile();
                }
                return compiled.call(this, context, options);
            };
        };
        // lib/handlebars/runtime.js
        Handlebars.VM = {
            template: function(templateSpec) {
                // Just add water
                var container = {
                    escapeExpression: Handlebars.Utils.escapeExpression,
                    invokePartial: Handlebars.VM.invokePartial,
                    programs: [],
                    program: function(i, fn, data) {
                        var programWrapper = this.programs[i];
                        if (data) {
                            programWrapper = Handlebars.VM.program(i, fn, data);
                        } else if (!programWrapper) {
                            programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
                        }
                        return programWrapper;
                    },
                    programWithDepth: Handlebars.VM.programWithDepth,
                    noop: Handlebars.VM.noop,
                    compilerInfo: null
                };
                return function(context, options) {
                    options = options || {};
                    var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
                    var compilerInfo = container.compilerInfo || [], compilerRevision = compilerInfo[0] || 1, currentRevision = Handlebars.COMPILER_REVISION;
                    if (compilerRevision !== currentRevision) {
                        if (compilerRevision < currentRevision) {
                            var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision], compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
                            throw "Template was precompiled with an older version of Handlebars than the current runtime. " + "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").";
                        } else {
                            // Use the embedded version info since the runtime doesn't know about this revision yet
                            throw "Template was precompiled with a newer version of Handlebars than the current runtime. " + "Please update your runtime to a newer version (" + compilerInfo[1] + ").";
                        }
                    }
                    return result;
                };
            },
            programWithDepth: function(i, fn, data) {
                var args = Array.prototype.slice.call(arguments, 3);
                var program = function(context, options) {
                    options = options || {};
                    return fn.apply(this, [ context, options.data || data ].concat(args));
                };
                program.program = i;
                program.depth = args.length;
                return program;
            },
            program: function(i, fn, data) {
                var program = function(context, options) {
                    options = options || {};
                    return fn(context, options.data || data);
                };
                program.program = i;
                program.depth = 0;
                return program;
            },
            noop: function() {
                return "";
            },
            invokePartial: function(partial, name, context, helpers, partials, data) {
                var options = {
                    helpers: helpers,
                    partials: partials,
                    data: data
                };
                if (partial === undefined) {
                    throw new Handlebars.Exception("The partial " + name + " could not be found");
                } else if (partial instanceof Function) {
                    return partial(context, options);
                } else if (!Handlebars.compile) {
                    throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
                } else {
                    partials[name] = Handlebars.compile(partial, {
                        data: data !== undefined
                    });
                    return partials[name](context, options);
                }
            }
        };
        Handlebars.template = Handlebars.VM.template;
    })(Handlebars);
    module.exports = Handlebars;
});

define("alipay/message-panel/1.0.1/message-panel-debug", [ "arale/popup/1.1.5/popup-debug", "$-debug", "arale/overlay/1.1.3/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug" ], function(require, exports, module) {
    require("./message-panel-debug.css");
    // 闹钟动画css，为了防止被styleBox添加外层class，这里单独定义
    seajs.importStyle("@-moz-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@-webkit-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@-o-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@-ms-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}.message-clock-animate{-webkit-animation:spaceboots 5s infinite;-moz-animation:spaceboots 5s infinite;-o-animation:spaceboots 5s infinite;-ms-animation:spaceboots 5s infinite;animation:spaceboots 5s infinite;display:block}.message-clock-animate:hover{-webkit-animation:none;-moz-animation:none;-o-animation:none;-ms-animation:none;animation:none;text-decoration:none}");
    var Popup = require("arale/popup/1.1.5/popup-debug"), $ = require("$-debug"), Templatable = require("arale/templatable/0.9.2/templatable-debug"), // Tip = require("tip"), 
    Position = require("arale/position/1.0.1/position-debug");
    var MessagePanel = Popup.extend({
        Implements: Templatable,
        templateHelpers: {
            spec_tag: function(str) {
                return MessagePanel.tagFilter(str, this.allowTag);
            }
        },
        attrs: {
            personalServer: !!window.GLOBAL && GLOBAL.system && GLOBAL.system.personalServer || "https://lab.alipay.com/",
            couriercoreServer: !!window.GLOBAL && GLOBAL.system && GLOBAL.system.couriercoreServer || "https://xiaoxi.alipay.com/",
            // 获取消息数量接口 
            apiCount: "{personalServer}/user/msgcenter/getMsgInfosNew.json",
            // 获取消息列表接口 
            apiList: "{couriercoreServer}/messager/getNewMsg.json",
            // 设置已读和忽略接口 
            apiModify: "{couriercoreServer}/messager/modifyMsgStatus.json",
            // 查看全部消息
            viewAll: "{couriercoreServer}/messager/new.htm",
            model: {},
            template: require("./message-panel-debug.handlebars"),
            showEmergencyMsg: false,
            // 用来记录消息数量，和闹钟状态
            messageSummary: {},
            allowTag: [ "br", "a" ],
            align: {
                value: {
                    baseXY: [ "50%", 0 ],
                    selfXY: [ "50%", 0 ]
                }
            },
            // effect: "fade", 
            duration: 500,
            triggerType: "hover",
            zIndex: 101
        },
        initialize: function(config) {
            // superclass init 
            MessagePanel.superclass.initialize.call(this, config);
            // 捕获ajax请求异常
            this.on("messageError", function(stat, type) {
                if (type == "list") {
                    if (stat == "deny") {
                        this.set("model", {
                            denyMsg: true,
                            errorMsg: true
                        });
                    } else if (stat == "fail") {
                        this.set("model", {
                            failMsg: true,
                            errorMsg: true
                        });
                    }
                    this.renderPartial(".message-panel");
                }
            });
            // 获取消息数量 
            this.getMessageCount();
            this.before("show", function() {
                var model = this.get("model");
                if ("emptyMsg" in model && model.emptyMsg) {
                    return false;
                }
                if (this.get("_visible")) {
                    return false;
                }
                this.set("_visible", true);
            });
            this.after("show", function() {
                // 展开面板后，先请求数据
                this._getMessageList();
                // 调整tip位置
                this._adjustUI();
                // 执行动画效果
                this._processDragDown();
            });
            // 隐藏时增加动画
            this.before("hide", this._hideAnimated);
            // 动画结束后做些补丁工作
            this.on("animated", this._onAnimated);
            // 如果消息为0时，跳转到消息中心
            var that = this;
            this.get("trigger").on("click", function(ev) {
                if (that.get("messageSummary").total > 0) ev.preventDefault();
            });
        },
        events: {
            "mouseover .message-panel-list tr": function(e) {
                $("td", e.currentTarget).addClass("message-panel-item-hover");
            },
            "mouseout .message-panel-list tr": function(e) {
                $("td", e.currentTarget).removeClass("message-panel-item-hover");
            },
            "click .message-panel-list .message-panel-delete a": function(ev) {
                ev.preventDefault();
            },
            "click .message-emergency-delete": function(ev) {
                ev.preventDefault();
            },
            "click .message-emergency a": function(ev) {
                // 点击链接或点击x，将消息置为已处理
                this.setMessageStatus($(ev.currentTarget).data("id"), "2");
                this._emergencyMsgDeleted = true;
                // 删除model中的数据
                var model = this.get("model");
                model.emergencyMsg = false;
                this.set("model", model);
                this.set("messageSummary", {
                    total: this.get("messageSummary").total - 1
                });
                this.hide();
            },
            "click .message-panel-list a": "_processDelete",
            "click .message-panel-toggle": function(ev) {
                this.hide();
            },
            "transitionend .message-panel": "_onAnimated",
            "webkitTransitionEnd .message-panel": "_onAnimated"
        },
        _onChangeModel: function(data) {
            var unread = 0, total = 0;
            if (!!data && "msgList" in data) {
                // 只有当msgList存在时才重新统计数量
                $(data.msgList).each(function(i, msg) {
                    if (msg.status == "0") {
                        unread++;
                    }
                    // 只要不是已处理，就计入显示条数
                    if (msg.status != "2") {
                        total++;
                    }
                });
                this.set("messageSummary", {
                    total: total,
                    unread: unread
                });
                // 数量为空时显示数量为空
                if (total == 0) {
                    data.errorMsg = true;
                    data.emptyMsg = true;
                    data.msgList = null;
                } else {
                    data.errorMsg = false;
                    data.emptyMsg = false;
                }
                return data;
            }
        },
        /**
         * 消息数量辩护，统一修改messageSummary
         * 只在此触发 messageChange 事件
         */
        _onChangeMessageSummary: function(stat, me) {
            // 允许参数只传入数量或未读状态
            if (typeof stat.total == "undefined") stat.total = this.get("messageSummary").total;
            if (typeof stat.unread == "undefined") stat.unread = this.get("messageSummary").unread;
            // 通知入口变更
            var argc = {
                total: stat.total < 0 ? 0 : stat.total,
                unread: stat.total > 0 && stat.unread
            };
            // 重设自己
            this.trigger("messageChange", argc);
            return argc;
        },
        /**
         * 处理为已读
         */
        _processRead: function(e) {
            var ids = [], model_after = [];
            // model_after 用来记录jsonp处理完后，需要处理的消息指针
            var model = this.get("model");
            !!model && "msgList" in model && $(model.msgList).each(function(i, msg) {
                if ("status" in msg && msg.status * 1 == 0) {
                    ids.push(msg.id);
                    model_after.push(msg);
                }
            });
            var that = this;
            this.setMessageStatus(ids, "1", function() {
                // 处理成功后将 model 内未读重置为已读
                $(model_after).each(function(i, msg) {
                    msg.status = "1";
                });
                // 触发changeModel
                that.set("model", model);
            });
        },
        /**
         * 处理删除
         */
        _processDelete: function(e) {
            var that = this;
            // 判断是否可删除
            if ($(e.currentTarget).data("delete")) {
                this.setMessageStatus($(e.currentTarget).data("id"), "2", function(id) {
                    this.$("#J-msg-delete-" + id).remove();
                    // 让 messagelist 适应table的高度，让IE6达到max-height的效果，好恶心
                    if (this.$("table").height() < 348) {
                        this.$(".message-panel-list").height(this.$("table").height());
                        this._setPosition();
                    }
                    var model = that.get("model");
                    $(model.msgList).each(function(i, msg) {
                        if (msg.id == id) {
                            msg.status = "2";
                            // 下次模板渲染的时候就不显示了
                            msg.deleted = true;
                            return false;
                        }
                    });
                    // 修改model
                    that.set("model", model);
                    // 消息为空时
                    if (that.get("messageSummary").total == 0) {
                        that.renderPartial(".message-panel");
                    }
                });
            }
        },
        _transitionEnabled: function(ele) {
            var style = ele.style;
            return "transition" in style || "webkitTransition" in style || "WebkitTransition" in style || "mozTransition" in style || "MozTransition" in style || "oTransition" in style || "OTransition" in style || "msTransition" in style || "MsTransition" in style;
        },
        /**
         * do transition animate.
         * @param `isShow` 显示还是隐藏？
         */
        _processDragDown: function() {
            // 动画效果，执行场景：message-panel存在 并且 浏览器支持css3动画，
            // 并且 当前是loading状态或者当前面板没显示的时候才执行动画
            if (!!this.$(".message-panel")[0] && this._transitionEnabled(this.element[0]) && this.get("_visible") == true) {
                // 弹出
                this._transitionAnimate(true);
                this.set("visible", true);
            } else if (!this._transitionEnabled(this.element[0])) {
                this.$(".message-panel").css("visibility", "visible");
            }
        },
        _transitionAnimate: function(isShow) {
            var that = this;
            this.element.css("display", "block");
            var _height = this.$(".message-panel").height() + this.$(".message-panel-toggle").height();
            // this.element.height(_height);
            this.$(".message-panel").css({
                top: isShow ? _height * -1 : 0
            });
            // 执行动画
            setTimeout(function() {
                // 激活动画
                that._cssTransition(that.$(".message-panel").css({
                    visibility: "visible",
                    top: isShow ? 0 : _height * -1
                }), "top " + that.get("duration") / 1e3 + "s ease-in-out");
            }, 0);
        },
        _cssTransition: function(ele, code) {
            ele.css({
                transition: code,
                "-webkit-transition": code,
                "-moz-transition": code,
                "-o-transition": code,
                "-ms-transition": code
            });
        },
        _hideAnimated: function() {
            this.set("_visible", false);
            // 动画效果
            if (!!this.$(".message-panel")[0] && this._transitionEnabled(this.element[0]) && this.element.css("display") == "block") {
                this._transitionAnimate(false);
                return false;
            }
        },
        _onAnimated: function() {
            if (this.$(".message-panel")[0] && this.$(".message-panel").position().top < 0) {
                this.set("visible", false);
            }
        },
        /** 
         * 替换 {xxx} 为对应值 
         */
        _urlRender: function(url) {
            var that = this;
            if (!url) return url;
            return url.replace(/\{(.*?)\}/g, function(pat, key, pos, orig) {
                return !!that.get(key) ? that.get(key) : "";
            });
        },
        show: function() {
            // 添加查看全部消息链接；
            var model = this.get("model");
            model.viewAll = this._urlRender(this.get("viewAll"));
            // 给外层加上padding，以容纳显示阴影效果
            this.element.css({
                padding: "0 10px 25px 10px",
                overflow: "hidden"
            });
            if (this.get("messageSummary").total == 0) return false;
            this.renderPartial();
            return MessagePanel.superclass.show.call(this);
        },
        // 重新矫正 poptip 的位置
        _adjustUI: function() {
            var that = this;
            // ie6 的max-height
            if (this.$(".message-panel-list").height() > 348) {
                this.$(".message-panel-list").height(348);
                this._setPosition();
            }
            // 矫正tips
            MessagePanel.adjustContentTip(this.element);
        },
        /** 
         * 获取消息数量方法实现 
         * event: messageChange 
         */
        getMessageCount: function(force) {
            var that = this, model = this.get("model");
            if (!!model && !!model.msgList) return;
            // 有数据了就不请求服务器，直接返回
            $.ajax({
                url: this._urlRender(this.get("apiCount")),
                jsonpCallback: "callback",
                // 主要是模拟json测试用 
                jsonp: "_callback",
                dataType: "jsonp",
                success: function(rsp) {
                    if (rsp.stat != "ok") return that.trigger("messageError", rsp.stat, "count");
                    /** 
                     * 将消息条数和是否已读广播出去 
                     * 参数： 
                     * total - 全部消息数量； 
                     * unread - 是否存在未读消息； 
                     */
                    var argc = {
                        total: rsp.totalCount || 0,
                        unread: rsp.isRead == false || rsp.isRead == "false"
                    };
                    that.set("messageSummary", argc);
                    // 处理紧急消息 
                    if (that.get("showEmergencyMsg") && !!rsp.popMsg && rsp.infos.length > 0) {
                        // 因为紧急消息一个页面仅需弹一次，所以这里条件满足后，将showEmergencyMsg手动置为false 
                        that.set("showEmergencyMsg", false);
                        // 弹出浮层
                        that._showEmergencyMsg(rsp.infos[0]);
                    }
                }
            });
        },
        _getMessageList: function() {
            var model = this.get("model");
            // 消息数量为0时，不请求数据，也不展开面板
            if (this.get("messageSummary").total == 0) return false;
            // 紧急消息还没删，或者msgList已经存在，不要去请求message list
            if (!this._emergencyMsgDeleted || !!model && !!model.msgList) {
                return true;
            }
            // 失败和登录超时用户重试时也需要重新抓取数据
            if (!!model && !model.emergencyMsg || !!model.errorMsg) {
                var that = this;
                $.ajax({
                    url: this._urlRender(this.get("apiList")),
                    jsonpCallback: "callback",
                    jsonp: "_callback",
                    dataType: "jsonp",
                    success: function(rsp) {
                        if (rsp.stat != "ok") return that.trigger("messageError", rsp.stat, "list");
                        /**
                         * 对获取的数据做一些处理：
                         * 1. 是否为当前进度节点
                         * 2. 失败节点上的提示
                         * 3. 是否为 9 优先级的消息；
                         */
                        var msgList = rsp.info;
                        // 1. 是否为当前进度节点
                        $(msgList).each(function(i, msg) {
                            if (msg.appearance == 1) {
                                var cur_step;
                                $(msg.stepList).each(function(k, step) {
                                    if (step.stepOrder == msg.currentStep) {
                                        step.isCurrentStep = true;
                                        // 当前节点是否错误节点
                                        if (!msg.correct) {
                                            step.isFailStep = true;
                                        }
                                        cur_step = step;
                                        return false;
                                    } else {
                                        // 如果是不是当前节点，那之前的节点也应该是绿色
                                        step.isHistoryStep = true;
                                    }
                                });
                                // 2. 处理是否需要显示备注提示
                                if (!!cur_step) msg.contentTip = cur_step.content || "";
                                // 计算节点数
                                msg.stepLength = msg.stepList.length;
                            }
                            // 3. 是否为 9 优先级的消息；
                            msg.isEmergency = msg.priority * 1 == 9;
                            // 把allowTag给附加进去
                            msg.allowTag = that.get("allowTag");
                        });
                        model.msgList = msgList;
                        that.set("model", model);
                        that.renderPartial(".message-panel");
                        that.$(".message-panel").css("visibility", "visible");
                        // 调整Tip
                        that._adjustUI();
                        // 未读处理为已读
                        that._processRead();
                    }
                });
            }
        },
        /** 
         * 设置消息为已读
         *
         * 未读消息标识：0
         * 已读消息标识：1
         * 已处理消息标识：2
         */
        setMessageStatus: function(ids, status, callback) {
            if (!ids || ids.length == 0) return;
            var data = {
                status: status,
                ids: ids instanceof Array ? ids.join(",") : ids
            };
            var that = this;
            $.ajax({
                url: this._urlRender(this.get("apiModify")),
                data: data,
                jsonpCallback: "callback",
                jsonp: "_callback",
                dataType: "jsonp",
                success: function(rsp) {
                    if (rsp.stat != "ok") return that.trigger("messageError", rsp.stat, "modify");
                    if (typeof callback == "function") callback.call(that, ids);
                }
            });
        },
        _emergencyMsgDeleted: true,
        _showEmergencyMsg: function(msg) {
            var that = this, model = this.get("model") || {};
            if ("content" in msg && msg.content.length == 0) return;
            // 兼容老数据，这里如果content内容为空，不弹出消息
            if (msg.content.length + msg.title.length > 42) {
                msg.content = msg.content.substr(0, 41 - msg.title.length) + "...";
            }
            model.emergencyMsg = msg;
            this.set("model", model);
            this._emergencyMsgDeleted = false;
            this.before("hide", function() {
                // 如果不是用户点删除按钮，阻止掉关闭动作
                if (!this._emergencyMsgDeleted) {
                    return false;
                }
            });
            this.show();
        }
    });
    /**
     * 静态方法：矫正错误提示，消息中心首页也能用
     */
    MessagePanel.adjustContentTip = function(baseElement) {
        // 如果当前元素display为none，可能到只获取不到正确的position，所以在这里直接返回
        if ("width" in $(baseElement) && !$(baseElement).width()) return;
        $(baseElement).find(".ui-poptip").each(function(i, e) {
            var cur_node = $(".message-step-current .message-step-point", e.parentNode);
            if (typeof cur_node[0] == "undefined") return;
            // 重新设置max-width，避免超限而被重新渲染
            var _w = $(e.parentNode).width() - 93;
            // 考虑到恶心的ie6，还是老老实实用js写判断
            if ($(e).width() > _w) {
                $(e).width(_w);
            }
            // 重新叫placeholder高度设置得跟tip高度一样
            $(".message-step-fail-placeholder", e.parentNode).height($(e).height());
            Position.pin(e, {
                element: cur_node,
                x: "100%-" + ($(e).width() - 12) + "px",
                y: "100%-" + ($(e).height() + 28) + "px"
            });
            // 如果超过界限，自动转换为向右展开箭头7点钟方向
            var _h = $(e).height();
            if ($(e).position().left < -12) {
                $(".ui-poptip-arrow", e).removeClass("ui-poptip-arrow-5").addClass("ui-poptip-arrow-7");
                // 先调整宽度为当前位置剩余的宽度
                _w = $(e.parentNode).width() - cur_node.position().left;
                if ($(e).width() > _w) {
                    $(e).width(_w);
                }
                // 重新叫placeholder高度设置得跟tip高度一样
                $(".message-step-fail-placeholder", e.parentNode).height($(e).height());
                Position.pin(e, {
                    element: $(".message-step-current .message-step-point", e.parentNode),
                    x: "-10px",
                    y: "100%-" + ($(e).height() + 28) + "px"
                });
            }
        });
    };
    /**
     * 静态方法：替换不允许的标签，消息中心页面用得到
     */
    MessagePanel.tagFilter = function(str, tags) {
        var tags = "(" + tags.join("|") + ")";
        if (typeof str != "string") return;
        return str.replace(/<[\/]?([a-z]+)[ ]?[^<]*[\/]?>/gi, function(match, tag) {
            if (!tag.match(new RegExp(tags, "i"))) {
                return match.replace("<", "&lt;").replace(">", "&gt;");
            }
            return match;
        });
    };
    module.exports = MessagePanel;
    module.exports.outerBoxClass = "alipay-message-panel-1_0_1";
});

define("alipay/message-panel/1.0.1/message-panel-debug.css", [], function() {
    seajs.importStyle(".alipay-message-panel-1_0_1 table,.alipay-message-panel-1_0_1 tr,.alipay-message-panel-1_0_1 td,.alipay-message-panel-1_0_1 h3,.alipay-message-panel-1_0_1 h4,.alipay-message-panel-1_0_1 .message-panel p{margin:0;padding:0;border-spacing:0}.alipay-message-panel-1_0_1 .ui-poptip{float:left}.alipay-message-panel-1_0_1 .ui-poptip-box{margin-left:0;min-height:0;_height:auto}.alipay-message-panel-1_0_1 .message-panel{width:842px;border:1px solid #b4b4b4;border-top:0;background:#fafafa;border-radius:0 0 5px 5px;box-shadow:0 6px 10px #999;font-size:12px;line-height:18px;font-family:tahoma,arial,'Hiragino Sans GB','Microsoft Yahei','\\u5B8B\\u4F53';position:relative;visibility:hidden}.alipay-message-panel-1_0_1 .message-panel-container{zoom:1}.alipay-message-panel-1_0_1 .message-panel-title,.alipay-message-panel-1_0_1 .message-panel-viewall{background:#edf0f7;color:#647892;font-size:13px;font-weight:bolder;padding:8px 20px;margin:0}.alipay-message-panel-1_0_1 .message-panel-toggle{width:90px;height:25px;overflow:hidden;text-align:center;position:absolute;margin-left:376px}.alipay-message-panel-1_0_1 .message-panel-toggle .iconfont-back{display:block;line-height:78px;font-size:76px;margin:0 auto;top:-58px;position:relative;cursor:pointer;color:#fc6621;text-shadow:0 3px 10px #999}.alipay-message-panel-1_0_1 .message-panel-toggle .iconfont-fold{position:relative;display:block;width:100%;text-align:center;float:left;margin-top:-80px;color:#fff;font-size:12px;line-height:16px;cursor:pointer}.alipay-message-panel-1_0_1 .message-panel-list{overflow:auto;overflow-x:hidden;max-height:348px;width:100%;position:relative;border-top:1px solid #e2e2e2;border-bottom:1px solid #e2e2e2}.alipay-message-panel-1_0_1 .message-panel-list table{margin-top:-1px}.alipay-message-panel-1_0_1 .message-panel-list a{color:#4c4c4c;text-decoration:none}.alipay-message-panel-1_0_1 .message-panel-list a:hover{text-decoration:underline}.alipay-message-panel-1_0_1 .message-panel-list td{padding:11px 15px 10px 20px;vertical-align:middle;border-top:1px solid #e2e2e2}.alipay-message-panel-1_0_1 .message-panel-item-content{position:relative;zoom:1}.alipay-message-panel-1_0_1 .message-panel-list .message-panel-item-hover{background:#f2f2f2}.alipay-message-panel-1_0_1 .message-panel-item-title{border-right:1px dotted #c8c8c8;color:#9a9a9a;width:21%}.alipay-message-panel-1_0_1 .message-panel-item-title h4{font-weight:bolder;font-size:14px;color:#353034;line-height:23px}.alipay-message-panel-1_0_1 .message-panel-item-title p{padding-bottom:3px}.alipay-message-panel-1_0_1 .ui-msgpael-warn,.alipay-message-panel-1_0_1 .ui-msgpael-warn a{font-weight:bolder;color:#e10a1f}.alipay-message-panel-1_0_1 .message-panel-viewall{text-align:right;-moz-border-radius:0 0 3px 3px;-webkit-border-radius:0 0 3px 3px;border-radius:0 0 3px 3px}.alipay-message-panel-1_0_1 .message-panel-viewall a{color:#1589cd;font-weight:400;font-size:12px}.alipay-message-panel-1_0_1 table tr td .message-panel-delete{vertical-align:50%;float:right;width:18px;height:18px;line-height:18px;overflow:hidden;display:none;margin-top:-9px;position:absolute;right:3px;top:50%}.alipay-message-panel-1_0_1 a.message-panel-detail{color:#1589ca;float:right;margin:-10px 10px 0 0;top:50%;position:absolute;right:23px;z-index:100}.alipay-message-panel-1_0_1 .message-panel-delete a.iconfont{font-size:18px;color:#ccc;text-decoration:none;cursor:pointer}.alipay-message-panel-1_0_1 .message-panel .message-panel-delete a.iconfont:hover{color:#666;text-decoration:none}.alipay-message-panel-1_0_1 table tr td.message-panel-item-hover .message-panel-delete{display:block}.alipay-message-panel-1_0_1 .message-panel .fn-clear{zoom:1}.alipay-message-panel-1_0_1 .message-panel .fn-clear:before,.alipay-message-panel-1_0_1 .message-panel .fn-clear:after{content:\"\";display:table}.alipay-message-panel-1_0_1 .message-panel .fn-clear:after{clear:both}.alipay-message-panel-1_0_1 .message-step{padding:18px 50px 10px 20px}.alipay-message-panel-1_0_1 .message-step-item{width:250px;border-top:2px solid #999;color:#999;float:left}.alipay-message-panel-1_0_1 .message-step-2{width:476px}.alipay-message-panel-1_0_1 .message-step-3{width:238px}.alipay-message-panel-1_0_1 .message-step-4{width:158px}.alipay-message-panel-1_0_1 .message-step-5{width:119px}.alipay-message-panel-1_0_1 .message-step-point{width:25px;height:30px;overflow:hidden;position:relative;left:10px;text-align:center;margin-top:-19px;font-size:25px;line-height:30px;_line-height:32px;float:right}.alipay-message-panel-1_0_1 .message-step-desc{width:66%;position:relative;left:67%;text-align:center;line-height:14px;padding-top:2px;clear:both}.alipay-message-panel-1_0_1 .message-step-title{display:block}.alipay-message-panel-1_0_1 .message-step-first{width:20px;border-top:0;padding-top:2px;*overflow:hidden}.alipay-message-panel-1_0_1 .message-step-first .message-step-desc{width:100px;left:-35px}.alipay-message-panel-1_0_1 .message-step-current{border-color:#b9d384;color:#b9d384}.alipay-message-panel-1_0_1 .message-step-done{border-color:#b9d384;color:#999}.alipay-message-panel-1_0_1 .message-step-done .message-step-point{color:#b9d384}.alipay-message-panel-1_0_1 .message-step-fail{border-color:#fd985a;color:#fc6521}.alipay-message-panel-1_0_1 .message-step-fail .message-step-point{color:#fd985a}.alipay-message-panel-1_0_1 .message-step-date{color:#999;font-size:11px;line-height:12px}.alipay-message-panel-1_0_1 .message-step-pointmask{font-size:9px;position:relative;top:-19px}.alipay-message-panel-1_0_1 .message-step-fail-placeholder{line-height:30px;height:30px;visibility:hidden;overflow:hidden}.alipay-message-panel-1_0_1 .message-emergency{background:#fb6720;padding:6px 10px;border-top:1px solid #d6561a;color:#fff;font-size:12px;border-radius:0 0 3px 3px;box-shadow:0 2px 6px #666;line-height:20px;width:580px}.alipay-message-panel-1_0_1 .message-emergency a,.alipay-message-panel-1_0_1 .message-emergency span{color:#fff;text-decoration:none;float:left}.alipay-message-panel-1_0_1 .message-emergency a:hover{text-decoration:underline}.alipay-message-panel-1_0_1 .message-emergency em{font-size:13px;font-weight:700;font-style:normal;margin-right:16px;float:left}.alipay-message-panel-1_0_1 .message-emergency .message-emergency-delete{font-size:12px;margin-left:10px;float:right}.alipay-message-panel-1_0_1 .message-emergency .message-emergency-delete .iconfont{cursor:pointer}.alipay-message-panel-1_0_1 .message-emergency .message-emergency-delete:hover{text-shadow:0 0 3px #fff;text-decoration:none}.alipay-message-panel-1_0_1 .ui-poptip{color:#DB7C22;z-index:101;font-size:12px;line-height:1.5;zoom:1}.alipay-message-panel-1_0_1 .ui-poptip-shadow{background-color:rgba(229,169,107,.15);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#26e5a96b, endColorstr=#26e5a96b);border-radius:2px;padding:2px;zoom:1;_display:inline}.alipay-message-panel-1_0_1 .ui-poptip-container{position:relative;background-color:#FFFCEF;border:1px solid #ffbb76;border-radius:2px;padding:5px 15px;zoom:1;_display:inline}.alipay-message-panel-1_0_1 .ui-poptip:after,.alipay-message-panel-1_0_1 .ui-poptip-shadow:after,.alipay-message-panel-1_0_1 .ui-poptip-container:after{visibility:hidden;display:block;font-size:0;content:\" \";clear:both;height:0}.alipay-message-panel-1_0_1 a.ui-poptip-close{position:absolute;right:3px;top:3px;border:1px solid #ffc891;text-decoration:none;border-radius:3px;width:12px;height:12px;font-family:tahoma;color:#dd7e00;line-height:10px;*line-height:12px;text-align:center;font-size:14px;background:#ffd7af;background:-webkit-gradient(linear,left top,left bottom,from(#FFF0E1),to(#FFE7CD));background:-moz-linear-gradient(top,#FFF0E1,#FFE7CD);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF0E1', endColorstr='#FFE7CD');background:-o-linear-gradient(top,#FFF0E1,#FFE7CD);background:linear-gradient(top,#FFF0E1,#FFE7CD);overflow:hidden}.alipay-message-panel-1_0_1 a.ui-poptip-close:hover{border:1px solid #ffb24c;text-decoration:none;color:#dd7e00;background:#ffd7af;background:-webkit-gradient(linear,left top,left bottom,from(#FFE5CA),to(#FFCC98));background:-moz-linear-gradient(top,#FFE5CA,#FFCC98);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFE5CA', endColorstr='#FFCC98');background:-o-linear-gradient(top,#FFE5CA,#FFCC98);background:linear-gradient(top,#FFE5CA,#FFCC98)}.alipay-message-panel-1_0_1 .ui-poptip-arrow{position:absolute;z-index:10;*zoom:1}.alipay-message-panel-1_0_1 .ui-poptip-arrow em,.alipay-message-panel-1_0_1 .ui-poptip-arrow span{position:absolute;*zoom:1;width:0;height:0;border-color:rgba(255,255,255,0);border-color:transparent\\0;*border-color:transparent;_border-color:tomato;_filter:chroma(color=tomato);border-style:solid;overflow:hidden;top:0;left:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-10{left:-6px;top:10px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-10 em{top:0;left:-1px;border-right-color:#ffbb76;border-width:6px 6px 6px 0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-10 span{border-right-color:#FFFCEF;border-width:6px 6px 6px 0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-2{top:10px;right:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-2 em{top:0;left:1px;border-left-color:#ffbb76;border-width:6px 0 6px 6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-2 span{border-left-color:#FFFCEF;border-width:6px 0 6px 6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-11 em,.alipay-message-panel-1_0_1 .ui-poptip-arrow-1 em{border-width:0 6px 6px;border-bottom-color:#ffbb76;top:-1px;left:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-11 span,.alipay-message-panel-1_0_1 .ui-poptip-arrow-1 span{border-width:0 6px 6px;border-bottom-color:#FFFCEF}.alipay-message-panel-1_0_1 .ui-poptip-arrow-11{left:14px;top:-6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-1{right:28px;top:-6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-5 em,.alipay-message-panel-1_0_1 .ui-poptip-arrow-7 em{border-width:6px 6px 0;border-top-color:#ffbb76;top:1px;left:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-5 span,.alipay-message-panel-1_0_1 .ui-poptip-arrow-7 span{border-width:6px 6px 0;border-top-color:#FFFCEF}.alipay-message-panel-1_0_1 .ui-poptip-arrow-5{right:28px;bottom:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-7{left:14px;bottom:0}:root .alipay-message-panel-1_0_1 .ui-poptip-shadow{FILTER:none\\9}.alipay-message-panel-1_0_1 .ui-poptip-blue{color:#4d4d4d}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-shadow{background-color:rgba(0,0,0,.05);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000)}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-container{background-color:#F8FCFF;border:1px solid #B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-10 em{border-right-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-11 em,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-1 em{border-bottom-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-2 em,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-4 em{border-left-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-5 em,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-7 em{border-top-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-10 span{border-right-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-11 span,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-1 span{border-bottom-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-2 span,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-4 span{border-left-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-5 span,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-7 span{border-top-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-white{color:#333}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-shadow{background-color:rgba(0,0,0,.05);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000)}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-container{background-color:#fff;border:1px solid #b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-10 em{border-right-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-11 em,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-1 em{border-bottom-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-2 em,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-4 em{border-left-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-5 em,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-7 em{border-top-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-10 span{border-right-color:#fff}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-11 span,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-1 span{border-bottom-color:#fff}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-2 span,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-4 span{border-left-color:#fff}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-5 span,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-7 span{border-top-color:#fff}.alipay-message-panel-1_0_1 .ui-loading{width:50px;height:50px;background-repeat:no-repeat;background-image:url('data:image/gif;base64,R0lGODlhMgAyAPZ/AJSUlKCgoICAgJycnGJiYpeXl35+fnJycoqKimRkZHp6eoaGhqWlpWhoaKqqqpKSkmpqaoiIiI6OjpqamnBwcHV1dXh4eIODg2ZmZnx8fG1tbXZ2doKCgm5ubv7+/v39/fPz8/Hx8fLy8vDw8Pr6+vz8/Pn5+erq6u/v7/v7++vr6+zs7PT09Pb29u3t7fj4+O7u7unp6fX19ejo6OHh4ff39+fn5+Tk5OXl5eDg4N/f3+Li4sfHx93d3djY2Nra2t7e3tTU1NXV1ebm5tfX19zc3OPj49DQ0Le3t8XFxc/Pz9HR0dbW1s7OztnZ2a+vr9LS0szMzMnJydvb25mZmbW1tcHBwa2trbS0tKysrMvLy6ioqLq6upCQkMPDw8TExMjIyMDAwLu7u729vc3Nzb+/v6ampoyMjLm5ubCwsKKiosbGxp+fn7Kyso2NjaOjo8rKyra2tpiYmJ6enrGxsb6+vri4uJGRkWFhYaenp////6mpqdPT07y8vMLCwgAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUEY/eHBhY0UwQjIyMDA5NyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmkveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+ACH5BAUAAH8ALAAAAAAyADIAQAf/gH+Cg4SFhoeIiYqIL1QHjxUROYkubBERCGdqIIuHMRQNoXSdpIJOEwMDcziHZgSvE6WyiHx7tn6GeiIovJyznT5IcXFjJLMfKjg4N0YuHoseOFpSYDxRLb+/KSgxKy/Z4IMmWRYK5hkGAuocF3ks4YYmZxAaGhVE4CoTdw8ADNiLFiQYqAZeJyFq3rx5kqIQCREQQTwzqMhDnScYoSjSpULFiRPGwtUAE6ZMHSkNKb64oaNHkSk/etAoIiQIlCVHlsCgWIoEFwNA09GRwbMTGAsVNliwgEDIRBpULkhdECHMRIogEHSgQOEAF1lCuriR0GXAzl9pGkCA0CEIxRUT/wAUkIOmUxsMeCu8KzroAx02bAKUMfTiwKsEg/kimmGm8Za9f0iAmMxCj+JEVrJodkuoRIjPI1Je/sMiTpvTrBKZcMF6hYmiIcqI4YJmyiwPLmbMsGGjxi8WWpJ88bOGqEHcO2jk0KEDxlVBelbwUUImihYmokeT1gHTBxEmNZmssKxdUQgwXL6oKL/IxxkF6NIJ4HBGCXtCRhAsPYeAzQN1U3Vh22gfPFHBgRsogERIfUmBwAJUIZDFazzJ4AZXj6jhmyIflJHJGW4MgAI8LUSgwVYHHPHLEAWQ9QAbI/zygRz0aHBAD/CgMAcAcl2RnSJkhLIWHEXNMAAVVEzQxP8iHyyAQQMYAPDBZWukMscW3xyyQwMDYcBHeSi8oUYAatBgSBIJEJAABb6U5wEWbzDAgH2DePEKARU8x94YeWyxhUaCMIDHoAXcR0gQDiQaxiAesDAZCAyyd8IVT1AKmSAyiPDZhuX1QMendkQ6SA0jlBqCnjx5kEQVWGBBhiIloAADDC4AVCRtdiCxXicyrLBCR6Jm08IXY/TRhxKoJuIBCifEMEMMFP7SAhx+WBHGGlnKuIINQywjgiwoRMHDGklIcSk4HqzATHI4ZBuPE2RoAYcUSrjLkwjK6QBEDzlA1kIRNynRBBk0JFvUBye4BJMT39V00xTRGvoHMj94B94GDT9KrF0gACH5BAUAAHoALAIAAQAvADAAAAf/gHqCg4SFhiJkYVIuho2Oj5ApZRGUCGd2LZCam4RFABcLlZYAQZymjSRtHKALoQiWEhJPMqe1OAAcq60AZgNnZ7FdAzq1nFEcAgKrDz6DN2oSXXcPD2vFkFUG2gIXY41NANMAAFUk14UmbBkZ2l07jyh7DwAFBQ6054IFCgrrey+bktCTQyVPiHMs7ljgl6HMqR8TqEyYkGdEsRpdNliwkIFPsRhqJgyY40DEKRIAKlTYkOHHORcM5rAJ8KSGqQEHVCoglm/EngAB1CDhhOWA0Q1E8g2CkUfNmzd+NCmhYPQAGaWETuRhYMZMKUcnNnSgQKEK1kI9zOTZ4mCGIzcd/+LKOWuoyZY9DtqYMBRHg98MdBuJceAgC49CRihA8CsksKEQT65ceYKD0JnFEMw4bvTjiWc0JQTxgEC6AovNjeqkoUOHiSALDRpAiIrakIo2uKvIWBO7gYLajtZgGe7DQe85wDlXWQ4nD4YGGCYkNzQFiXU4STBo3/BhOiE4dsL/eHEAQwIMXrwLcsGlPRdaa8xjoABCPRgx+J0MWpCg/xvvO4whoBcpDJKDef19VZsMVpRRRx0xFJIGARQecFptSlgRRhiNFVLCBRTicUdtQHjhhx88FGjIEBjgwQIIezmmQhJJfOEFCo+kAMKOIqh4Fghw8LBGEjRoYgIIIogQguWP+bzQhBRg8NDMJi0oGUIIoeVjAh9awCEFH1luwkIII5TJ5CkvBNEEGVEsEaMpIIyAAgwomFNLDUIcoUQTS9hUiwciwACDCytkYooITECxxBFB+FmMByEQuoIKJm2iAhNB8AEFEwApJcKkJ8Swgp2o7OADE0IE8QOpnqoQ6gw2VFrICD044QMRTOgQ5lktxBADrEPM4OgLOBQxxQ9OEGFDbSSoYMMQONxgBA4x3KADEMb+MIWsqHmAArTS7kBDDtf2UIQRrAJXwwzhjnutDhapN8gIN4hL7gm7yqtHCSCgMMKb1wQCACH5BAUAAH8ALAIAAQAvADAAAAf/gH+Cg4SFhiB8YEcoho2Oj5B/YHIFclQDfjWRm5x/OWoABZVUEwMMP52phmIPAK6jpXNsYi2qqTMBXXeuAGptewMDsmoON7abS10Sug8BPYM2T7IBam9Kx44eY2dnEhIPSSmGQm/VDGZh4tiEewgIZ24DQ48hVW/nW3a16y0BERHu2pjY1IRBni0O4oDAJmPAgn8I1qTS4WCPgyxVRNh6MeHCggUIfNhakcbBlSd2WKiaw+HCBQRAsI2o8uRJmj4DOeURwIFDhB3r/oBAkoYOli8lNokxIEDAhSlBBYVA0gZLFTKR+BjYKgBK1EEw4lSJg6TIoxUcMqjt85XQDSRI/+xwceGogIIMCtS0LUQEDRcufkgY6qOgcAQZewuBEdOnD59COBRYsKDASeJCLMqMqVPnBCEAGyxsuHLZ0I4yZcLw+CAoSoUKGwQgLl1Ii5XbMf9wOPCaB21DKPz48ZKkBpwDyC/8bsTni/McaZAfYLDcdJLrTK5QOEBBb3VCRniIFyKFgnkD3wkxAcMeaAYKHSj4Th8CDhwpcF78Kd+hgwWV3wWhxYBACSJBBxposMV3MZBBRhRLJCXIDhQkqAERy72wRBMcwlBIFRpAoIECy01xxBFK6NAIAhC0WABtNkABxRJMSFjIDBRA0EADbVwWQhBB8AHFQo6QoeOOUexVg/oTTAgRRAyRXNEABg1AgGFUJBThAxFM7KBHJB8AgAEGCWhg1jop6PCDEz4AwdomJkRAZgIQiHQMCTQUMcUPPajDSQsCJCBoA0fYYsIOQPRQBBA5pTKCAQkQIKlgnbSwQw46AJFDo6qAcIGkeICgSSR6hGDEDjTkYASl2LQQAR4sgCACCzYaUsIKN5xKAw5+ovkCCLKGEMKohcgwwxA45BrDm22RIIIIwo4QAqskwDCDDcjewEhpJbAQwggjoAADCiHAcEIM19pgwz6/tRCuuC6soMIJ587gQq2/kRACvPLOe8Js6f3hQQswxKuCCiIwG7AgH9QgQwv4qhIIACH5BAUAAHwALAIAAQAvADAAAAf/gHyCg4SFhjI/Sz4iho2Oj5AlR3tbew5ZZCaQm5yEOGkMeZWXV1g5naiNKUlqDAxmo1lXT2k8L6m4K1dqam+vbWVIsrRtaDG4nT4BbAG9TzuDKmNPdG1YVT7IkDwDA3PNTYYeRVXWVUhR2oYkVRMT3g4njyxeWHFIaGu36nwvV3JU3tUhsckDkTh20Ij50kJdiz0ACgAMhwqHGC59xiSRgcxEHgARqfRANiJMnzpleDRElWLPA5BUoGkD4aVMGCtaCHLyQKfLnQcFhvDjI4OHFT9elnzg5EVCly4PdAwVxGLNlyRJskHyccaNGwlEpg4SwWMNDx43HsHoguDMmS9i/wmd4AFGCpwQjtREQIAgi4e4hHLY1XIkhaEvERIXWAlYkAchWqKQGUloRoQFCyJQbjyohhIyTZqMIBTgwoILcTgbiqFEyREmg5ZcmO2GsepBPpbotsHHhAQOHC6ku12IBZTjQUwoEQC8C/FGQIJIj2FHgPUrzw2dEMKdRhUDAgw4yF7oBJPzNJoYWH+GPCEaROKfMBHBQIYMw8nLcMLfCcEmGSiQwQIckZfDDwjKI0gBCjSYBnkoFDHFFDosJcgNATb4w3MkANFDD0WAUIgYFpR4QYGc6TGEDkAAMUMjAGwgIxu3wZBDDjrsYGF5ClTgIxqcybDDDjTkYFshS1RwwPWSSgBmAg5GGLEDCptgoeQBFWw4VQkz4HDDDSp0MsABFFCwARBDlaCCDUPgoGAnElDQQQcHaImMmjHMYEMMJaRSQwQdaKDBAVAgk4ILJ+R5gmG4hLCABhAIKkYqJMCwggonqMAoMiwgACkEELCxDyQ1wODCpS70yU8NXYDaQAMGSOXIByCgYKoLKOw4FBuvNoABBGnoRAgJIoyAgq0h/AWYGBBggEECGFjQpCAlyCBCCCMYK4MeqhWhgLMJhFsBAhaAAMK1IYSgCXE1DBBuAgTEi4e517KgK3FkHBCuvOaCIKx7MuyBAb81KOseIS6MsQcW9+ISCAAh+QQFAAAAACwAAAAAAQABAAACAkQBACH5BAUAAH8ALAIAAQAvADAAAAf/gH+Cg4SFhjU7Pzkyho2Oj5B/TlxoXH1jRCSRm5x/J2VxdpWXdV82naiFJUdYVXFIo2N1YVZ8JqmoKGNtbVivVlE8srR+UjC4mzp0aXRYWGUzgyhwtF5fSTTIj0dXV0/NRCWGN0leSWs8PuLagyl+WVneXC6PLUfnYFJ8muwmXHsO4klJsSkHDzBwtEB5oe0FkjxbABJBpUKLlihk+NTARaIKAzN5HBjBxUIJmSZKhNxCFecNAwZ7TiFrwUfJkSU+CHIaE0CNmi0n2P15IWQJFD49OEVhwybAmxtCBdUQwieIkJGQgMwZMIdN0qiCZAgRwoSIikcjAkwYMCAKWEIj/4gQ8eGEUaMnVCZMsPO2UAwnTn4AWUcoihw5VN5s7EuIxo8pU6IRUiEHQIECOxgXMtGjSJEeLAhlsQwgjGZDI3oAAbLDgyAiAGIPWHyaEA4duFH8ITHggW8+tQ/lGL4jhZA7yOcEbxSDBo0dI8J0kdCF7/JCI4xoV1FHgncs1wuFuEFeRRA36KmEJ7QCh/sQJACcmQ9l/R8TQ/IPERfkDAIED7QQnh4q2GCgCIO8EUEECFi3nAwzRHiCa4LYgMCCEQCxXAkqxOAhQ4T4scCIAQaHggonnBCCIR/MscAFF2xRGwsrrKCCCxQWskIEMHJgGmMmuOBCjfw0IgQHAiQZROtfJYwAAwwuCAiJGEkm+ZVQH4QwAgowgLCJB2YYYEAGHGTDzgcgaDmCCDlCQsIEY2YgwJWpfMCCCCGEIMIHqTyQgQIKGMAELjTIAAIIIuyJCwh3KGDBoz9ycgQEeLBwKJ/IyACABRtUUIEZm3xARwIEEFAppg1R0WkFB0RgZiM7klqqBW2yk8cBrOIahyEehNFBAsASEEFofYXBKgXIClCfID0sgMGzwDJAWF86XIBsBxpokMEdAjTgLQYJaADHdWp0gC0E2UIAwbcIBBXeERmkq663FJRR63ItPHGuumysaB8hMFjxhB04CBUIACH5BAUAAH8ALAIAAQAvADAAAAf/gH+Cg4SFhi9DOTgtho2Oj5AfOl9fazxgQCmQm5yELlJ+Xl9Jl1JNKp2pjkRlYVaipGBSWlFTJKq4IWtjra9wQUeytGR8IbidRn19Y3VhUip6giJBtE1KR0PHkEx2XGJ9ZT0fhjNK1ktQOePahXBxdmhcSSOPLz5H6EFFmux/JF5Y4iCxs6TTECh8gggpYqJfmDZYqsQpogqFECFMiDDUVicNnYA2jrVwQsSHEyC3UpUoc+VJGiwn2L0o4uTHFBolUiXJ0rLNin5/TACZUqQHDg+cljjIkuVJSKBBgfQAoiPGph1b9jhwQAPqoBo6dOTIQc+RiCx5tmyB4pUQiBw0/2jsqNHIgx0GZsyEaVsIxo4dRoasIwTlDYM3T17wLTTDyI0bMAq5eKNGzRsciwulwMF5CN1BVQKoCbAmsyEWQ4bYiCloCpvXZhSbJqRHhQ0bM0AIMjNgzhwisw2ZmDEjxokSTgYo3xK8EQrjJ1jwGDBhQJnmp0+cUBHiC5XvYrAXkqGi/AgfctK/EU8oxIr3MkgEKECfCXt/LvK7GOejAAAAA3yGXQgwFMiIIA78B8B12L2AwoPGDBKDfw880FVwH4QwwoYpDQLGHXd0EWBwLIRgogyN5NGFBBKkMdsLIogQggiOuPCABG6ckURmKYAAQoz8NOLEGWcggIAPfPXQAOsLPjYEiRVFGpmDVzFQQAAeeAgIyRUIRLDAGUYAtcIGBJRpwIGcqOHlAghMqc0MGySQAAEVRJbKCxMscMEFCzhxzA4VyJnAAU+pwgIVF3DAgQBfqAIFBRhEWsEN7LQwwaIGGJCFk5BgAUEDoFpgFVABZJpBBl2EWaMbn4JqwE9QlXDFqRkokAEXjXhRgQYQfOpGZl8YoIACFlgQgRCD6OBGBxrwCsEes9GAALEbbFDBBQAsQAEFzEJQQRTNvbBFsdZWcMC23GrQBSri8XFBBeYecG4HG3hx3yBYWHvuAQzQeO8gKHzRRh/Z9BMIACH5BAUAAH8ALAIAAQAvADAAAAf/gH+Cg4SFhiQuMysmho2Oj5B/M0FBQkxENiWRm5x/IUxQfJWXPkUhnaiFHzRKR0uilkQ+P1NDmqmdMkFkrUtQTjlFRE60RTkyuJsnUVFkTUdEp4ItOcU9OjB6yY45UnBavDiNKD09QDo5Jx7bhCVMPGBSWnwsjyQ35zk0mex/KUdJ1vCQUuQWJBj6dhixkWIbCTJeviThcQMVCyNGbuCY0TBViihW/HhZswKXCRwah5wwyClKmTBWvqBwaGOIjRkqPnQ6MqZOGT8j+qU4MWNGjJmbfojpMyZMyX7+TsQ4oULaoxlouCy1AXUQCRVgV7R4JEOMHTRopnQlVGPFChcu/0g4WhMHCZIoawvJgAtjxLpCP7BUqTJGbt5BekLAQIGiHqEQWNq0wXLicKESI1CMGGFYkB86ko9YNvRicwgQg3akWY2E0ehCIELIfuEvzpUnT4C8NlRChG8RH3JcGY5kd6MWIJKbOJKlORzjhkwkB9GiiYPrPKAXeoKnOwIge8K3+av9TwQC6K+keLKlfZHyf4igJ4Ahxh8gecyYuUIb+gcDCaC3xSBoMGCgFNpxkcCCFYwliAsMvCGhOLvZAMGCCWhRyBFqdOhAf5Z9sAAGGCRARSNVBBAAG328lkUDJG7gWCEjvDHHHAOQYZkWDfTYgBCP6DDAkBP0kJcOFPhIR/QkcAwwARUDVATVCRZAYGUBOkWCBhVyFDAAV+y4YAAEGkCwQCfrFVAAAFRIiUsMAnSggQYZIMWJCXusCUABRqZygwEUdNCBAvalIoMZADzQRRd4dSKEAgccQIEBQ2xTwxZ3dCGBG3FwwsUGkR4gQGXsmJDFpmcgMECljsBQwAYVVHDAAjCshYQbqSKAgBUdEQKGABZsACsAyOSlhRsIRLDAAgA4kVoBCihgQbBPvHaDHBFEcMECF0gQwAMGZJCBtAKItpsJdCx7wQUcCGBAuONS4UJ5PtzBrgD4hnsBGPAJUoMY9xogQBao9TvICHBw4Ueh2wQCACH5BAUAAH4ALAIAAQAvADAAAAf/gH6Cg4SFhh8tLC0lho2Oj5AeICcnKiorLB6Qm5yELyczMZWXLigvnaiNHihDNqGjKy4wKJmptiYzOK2hKygwsbMoISm2nSw3N7o2J6eCKSOzIyMhzcWNei40O0bJIpqEei/SISEiLdaHMznaRjYmjx8g5CIgMt/oHzdAOusrH5t6aoigx6JCDHQljPTYl2NEKhIgQOAhcMBGsQ80phTpoYNFsRIyJhIwmAqjkx9TepyzZoQCAQIJFIjopMeIDx9OptRAJ2jGgQQJMCx4tykGEyJEnHjkKeiGhqAYCmwKEUSIECYhmBLqAQFDgwZYHr0IwidIkINaCSXx2gCCD0dT/5ZAgZIjraE9XyFYWErIxpEjS5gwsksoxYK2ECYUaqGksZKZhAsNoaABgoYjhHyQIdOERuRGfTSINkB0RZTTR4h9LvRhgWgNbfx8UAJHi5YTqxv96MD7wIoTUoIf0ZO7EQDeFLDkAMO8SPFGSChIp6KDh/Ufzw0hOUDhAIAYa5Ik0ZK9EIAD6KuUkPKl/YzygoocqHBgwwo/Mbzo50ECvpsKAMYmiBJWFIhddl5soOAFOwkCghVhhFGGC8+dYIAFG1iwRCE6lFFHHV/0lxsAFihggRmGeKDFGH30gdlqSGSggAIRrFQIC2WIwQUXzkUGRQZAZjDFIzNwgYYdSFhk1/8NFxhgQAZibOIEknEgcZ9WLpwhwJZvdBJFHFVggQSFPI3wwAUcCFBAg5uU8AUWbdCBhQrouADAAgtc0EVWqKQQBh1pPEHHEMXEcCeeElyZygt1PHHFFVm8hUoRXSAQQQR34GaNCWVA6sAeYKgGyRoSnIEAAgDAwBQJVjjgwBZ5tKGoISE4IEGpCEzAJ1MfSLHHFmYwwMARgxHCBxV3dNGFG1uwmZYPwL7xhhpXeNZTFgA88EAXEtTxz2cqpMGAGgGwMUceWGwhRwEAZFuAE8+R4IUaapg7wABUrNtuFg6Vl8Me9uK77gB8wDeICXCwMcAE+Y5ho8EOCgGGEmSiEwgAIfkEBQAAfwAsAgABAC8AMAAAB/+Af4KDhIWGHiQmSEOGjY6PkHovIiAgeAlzIJCbnIQpICKUlgQEHX6dqI4tIyGhlXikCQRdIam2JSEorK0sLQqxCQkHS7adLzAwuiEgKYM/AsHBGFcfxY8sLi7JIzWGH2IQGAkYGADd1oQeISsr2iHNjjEL5A0NFyPogzAnKu0gHptKZKlXL8MJdB9WxOCnokUqKRoaQICgYEYxDytmzFj4ohiQChA0aDBwEJUHFUNsbDSBDocFkRo4aOq0AgeOITNI5PsTI4OGDhQkdBph5MbNjjv/4NgAlMKcTTJ27CgqI+kgHRUoHDjA5VEKIzRo7MBndRCcrQcq/HA0JIfbE3r/yhJ6krbChaqFUADRoWNHNbmDSnSpsGHDm0ImgPToAcQhYEIzFFjYYCEIoRtFMpd8TMiPhc8IdP4JMaU0kBKcDXVRwBqNoB5Ofvwgm5pQDwUZMhiAMcKHbyC1G83JbUBMDCLIcQQ3NMaA8zc2mEi/sbxQHQEGBARAIaS7k+qEAggYP+aDjyDoYYD/o4MDBwEX1KPgwwcKE9TV5VzY71pQkSUAUrecFAvs1wVSf7SwxBFHKCFCcC6cscCETBRigxJNNAEFPJypEUEECzzRCBFkkBHFFKmVgQACEZjTSA1NaKEFHALK5cMZOCKgwyMwwCGFFGCsIJcNAEjgxhlebLID+Bg8NElbPiNM0EUXEjwB0CY+rJFEEjzUko8IajxwRxcMIAjJB1B84YUfX6CADgpqAADAA5mkUkITflgRhhUqFLOCGnLIOYd6tpgQRRhl1DFGDqnQEMAEVBQQgAvokBCFon1wwQd+j3jQBBsDDEDFG08Wk0ITfYiBhh1WlEoICHYEAOoAe8yUVBBcoIFEHFX40MgPe6gh6xxYmJmUDrpWgUUbYtgwyApomPHGGwEEwENqKJShbBt0PIGEFXHskYe0b+QBXG2nttFGGk9ckYUDe2xhBgNo2BrcEGiw6y68W2Sx1np/kBBEGvvuAcY5AAsiQw9QEOFqKoEAACH5BAUAAHsALAIAAQAvADAAAAf/gHuCg4SFhjBhV2Izho2Oj5AkaRANDRAab5Cam4V8ChiVlpcWa5ymjS8BGKugopcaBaeyezkZCQmrDQpdAhqvHRlBs5tWDbe3Fk0egkURGhodFBRYw44fZgTZuFcmhmUV0gcHAy/VhTV42hZFjydu4QduIeZ7Hi0gLOkFLZttBxX/Fqyo5oGFCBAgCLQ5RcbCvw0XTgxjEULEwRSzaAjYYMFChIGnQIwIEQJEiWo2LnRUIIGFKRYoRowQcdKcigUKFGSgQmJTCxgoYmKkt2fGhQwGDOTRZMIFjKfdiArawcGAAAFWHpVwscKFC35SBzWxKoADkEZ6UKhYsWJeWEJI/zhwuCABLCEZJ1SocLHsLaEBFy4suFIoRYwYJ05E9TtIBYIFkH0QcjHjsAjGhsBEiLAglqAWNmzMOPEBs6E5ERBEyOphxpDQMkwbooGgtpsRMnAMGRJDdqMtCM6c8TICh3EYvg0lccP8CYob0F0kL7RGgnUHLIxoH6Jn+qAsXcIn8XBjxw4aILzvMXKnPYARe1jQoJFjR+npZgA8eOBnkI0cOugAkm9HFAAAAHMsZkIOQDRoF2YoDABAAQVMUQgMPfRQRA73YfaEHHIUwEUjRhQxxRQ4mAbGABNQ8UY5hphQxA8/ODFgWEAMoOMERjwCghNO+EDEZWGp8MYccwwQhfkmJxBBBBNMuESUCA4EEAAbYmyihxFMCBGEELGZw0Iab6gRAB2LaQJEEHxAwUd6w4hAhxkMvJFFmKZMAcUSRywBnywotLFFHmZk4dYpKThxhBJNNGHDKTak4YADWzzx5yyJNkFGFFr0wIkPaVyRhQNtEFlNCT9wCgcYSsDZSAtJ0BHqFXbgaY4HQMAhBRhrrEFDh4PQgEYbbaTxhBVpEmWDFDyskYQXcAw4Ag9IVIFFG3QsYZoITSTxhRdWhJFEE2twgQYScWCBxA2+leDEF36EW8cYfZiL7hq2yqYCGPLSa24fNKgnSAo9hDFvvXwkq14NN0yhg6vDBAIAIfkEBQAAfwAsAgABAC8AMAAAB/+Af4KDhIWGKF5tdTGGjY6PkH9YBxSVFXsskZqbf0ICHZUUBwcVBlKcqIUmbxoaHa+ioxUVcyKpqDQCGhCtHQIAC7IbFhdEt5peuxDLBkeDQBIVG8MKdsePew3avHSNXhkWFgoKateFL3cNGA0QGT2PKgDiGRkAtuYsCxjrDQM1mnEU0DMgwcU1ERwS7GtQBdURAQYECJCg4lYLAQkUNiBzy0gEARw43IGBysQCAgQSQBBybYYbDhcuFJCx6cMdlAQgTDH3Z0WXBRcWBNhkggUeAhiW8BQU48yCCBGeREoBAgQLAjyWDrpxJgICBGsefQAhoqoJrYT4fEXghoYjFiL/4rZAW2jMmTNuqPw7F6LvPbqE3kiQ0KUhoRIjEodIAbiQCwBdutwpQggEChQj5jYuRObOgwcBGP8xAePyCA+bDZl5AABA2D8jYMh+kdrQDQAFAMgJ8cKFbxS1G6UpQFwKixXIQQQ3pEWO8yogVEj/u1yQFirY29SQrmJFdUJYBgyYoKXnifOaqw8RP2BOiD81Ysg/8f3Pkzn4TwlyMWOGjffLCRFAAGxsQQgJNiQ4BG21hcCAGgGooUMhIgwxBA4z1OYBEm90aEUjJ+Bwww0VbdaEGQwwcMVZhqSAgxFG7DBCYzTssUUeZtjwSAs77EADDTSh5cITDtgIRSQo0JDD9JLp4VPFFVk44MUmMeigAxA67HWNDGg88cQVYpCwiQc4ANFDET00iQoLYrSRxhNIqAnJB0YUMcUPPyiXSghjYNEGHUjoiUoJNPzghA9EeMfJCWIgUQUWXFA3KA2IMiHEDR9o0oMYaCARRx2ZmPPBDkQIEQQfTgTZSA1kjCEGF3b4IecxOJgKxRJLDGGIHkN4UcYYfXABh5h0rRDErUo0EQRwgohwhB9WlFFHHz6g1pgMRByRbBRaHMGEEkl8AW0YfmQYHA1KkMGtFGDwEK4XVigxa2MoQLFuu+HygIMe9f1RghFasOvuD8T2K4gJM9Bwg6rHBAIAOw==');*background-image:url(https://i.alipayobjects.com/e/201305/M9UQl3TuH.gif);text-align:center;line-height:50px;font-size:11px;color:#777}");
});

define("alipay/message-panel/1.0.1/message-panel-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing;
        function program1(depth0, data) {
            var buffer = "", stack1, stack2;
            buffer += '\n<div class="message-emergency fn-clear">\n    <a href="#delete" data-id="' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.id), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + '" class="message-emergency-delete" target="_blank"><i class="iconfont" title="关闭">&#xF028;</i></a>\n    <em>' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.title), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "</em> ";
            stack2 = helpers.unless.call(depth0, (stack1 = depth0.emergencyMsg, stack1 == null || stack1 === false ? stack1 : stack1.url), {
                hash: {},
                inverse: self.noop,
                fn: self.program(2, program2, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += " ";
            stack2 = helpers["if"].call(depth0, (stack1 = depth0.emergencyMsg, stack1 == null || stack1 === false ? stack1 : stack1.url), {
                hash: {},
                inverse: self.noop,
                fn: self.program(4, program4, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += " \n<div>\n";
            return buffer;
        }
        function program2(depth0, data) {
            var buffer = "", stack1;
            buffer += "<span>" + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, stack1 == null || stack1 === false ? stack1 : stack1.content), 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "</span>";
            return buffer;
        }
        function program4(depth0, data) {
            var buffer = "", stack1;
            buffer += '<a href="' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.url), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + '" data-id="' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.id), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + '" target="_blank">' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.content), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "</a>";
            return buffer;
        }
        function program6(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n<div class="message-panel">\n    <div class="message-panel-container">\n        <h3 class="message-panel-title">消息</h3>\n        <div class="message-panel-list">\n            <table width="100%">\n                <tbody>\n                    ';
            stack1 = helpers.unless.call(depth0, depth0.msgList, {
                hash: {},
                inverse: self.noop,
                fn: self.program(7, program7, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            stack1 = helpers.each.call(depth0, depth0.msgList, {
                hash: {},
                inverse: self.noop,
                fn: self.program(17, program17, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += '\n                </tbody>\n            </table>\n        </div>\n        <div class="message-panel-viewall">\n            <a href="';
            if (stack1 = helpers.viewAll) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.viewAll;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" target="_blank" seed="msg-whole-detail-v1">查看全部消息 <i class="iconfont">&#xF036;</i></a>\n        </div>\n    </div>\n    <div class="message-panel-toggle fn-clear" seed="msg-fold"><i class="iconfont iconfont-back" title="收起">&#xF044;</i><i class="iconfont iconfont-fold" title="收起">&#xF03B;</i></div>\n</div>\n';
            return buffer;
        }
        function program7(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                    <tr>\n                        <td align="center">\n                            ';
            stack1 = helpers["if"].call(depth0, depth0.errorMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(8, program8, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            stack1 = helpers.unless.call(depth0, depth0.errorMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(15, program15, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                        </td>\n                    </tr>\n                    ";
            return buffer;
        }
        function program8(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                            ";
            stack1 = helpers["if"].call(depth0, depth0.denyMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(9, program9, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            stack1 = helpers["if"].call(depth0, depth0.failMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(11, program11, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            stack1 = helpers["if"].call(depth0, depth0.emptyMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(13, program13, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            return buffer;
        }
        function program9(depth0, data) {
            return "\n                            <div>登录超时，请登录后重试。</div>\n                            ";
        }
        function program11(depth0, data) {
            return "\n                            <div>加载失败，请重试。</div>\n                            ";
        }
        function program13(depth0, data) {
            return '\n                            <div>\n                               <img src="https://i.alipayobjects.com/e/201310/1HC4IMqPGJ.png" width="80" height="75" alt="没有新消息" align="absmiddle"> &nbsp;&nbsp;&nbsp; 没有发现新消息。\n                            </div>\n                            ';
        }
        function program15(depth0, data) {
            return '\n                            <div class="ui-loading">Loading</div>\n                            ';
        }
        function program17(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                    ";
            stack1 = helpers["if"].call(depth0, depth0.appearance, {
                hash: {},
                inverse: self.noop,
                fn: self.program(18, program18, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            stack1 = helpers.unless.call(depth0, depth0.appearance, {
                hash: {},
                inverse: self.noop,
                fn: self.program(35, program35, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            return buffer;
        }
        function program18(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                    ";
            stack1 = helpers.unless.call(depth0, depth0.deleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(19, program19, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            return buffer;
        }
        function program19(depth0, data) {
            var buffer = "", stack1, stack2, options;
            buffer += '\n                    <tr id="J-msg-delete-';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '">\n                        <td class="message-panel-item-title">\n                            <h4>';
            if (stack1 = helpers.title) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.title;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</h4>\n                            <p>";
            options = {
                hash: {},
                data: data
            };
            stack2 = (stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.content, options) : helperMissing.call(depth0, "spec_tag", depth0.content, options));
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '</p>\n                        </td>\n                        <td>\n                            <div class="message-panel-item-content">\n                                ';
            stack2 = helpers["if"].call(depth0, depth0.canDeleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(20, program20, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "\n                                ";
            stack2 = helpers["if"].call(depth0, depth0.url, {
                hash: {},
                inverse: self.noop,
                fn: self.program(22, program22, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "\n                                ";
            stack2 = helpers["if"].call(depth0, depth0.contentTip, {
                hash: {},
                inverse: self.noop,
                fn: self.program(24, program24, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '\n                                <div class="message-step fn-clear">\n                                    ';
            stack2 = helpers.each.call(depth0, depth0.stepList, {
                hash: {},
                inverse: self.noop,
                fn: self.programWithDepth(26, program26, data, depth0),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "\n                                </div>\n                            </div>\n                        </td>\n                    </tr>\n                    ";
            return buffer;
        }
        function program20(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                                <div class="message-panel-delete">\n                                    <a class="iconfont" data-delete="true" data-id="';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" href="#" title="删除消息">&#xF045;</a>\n                                </div>\n                                ';
            return buffer;
        }
        function program22(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                                <a href="';
            if (stack1 = helpers.url) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.url;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-delete="';
            if (stack1 = helpers.deleteOnClick) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.deleteOnClick;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-id="';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" class="message-panel-detail" target="_blank" seed="msg-detail-v1">详情</a>\n                                ';
            return buffer;
        }
        function program24(depth0, data) {
            var buffer = "", stack1, stack2, options;
            buffer += '\n                                <div class="ui-poptip ui-poptip-yellow">\n                                    <div class="ui-poptip-shadow">\n                                        <div class="ui-poptip-container">\n                                            <div class="ui-poptip-arrow ui-poptip-arrow-5" data-role="arrow">\n                                                <em></em>\n                                                <span></span>\n                                            </div>\n                                            <div class="ui-poptip-box ui-poptip-box-text" data-role="content">\n                                                <div class="ui-poptip-text" data-role="text">';
            options = {
                hash: {},
                data: data
            };
            stack2 = (stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.contentTip, options) : helperMissing.call(depth0, "spec_tag", depth0.contentTip, options));
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '</div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div class="message-step-fail-placeholder">';
            options = {
                hash: {},
                data: data
            };
            stack2 = (stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.contentTip, options) : helperMissing.call(depth0, "spec_tag", depth0.contentTip, options));
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "</div>\n                                ";
            return buffer;
        }
        function program26(depth0, data, depth1) {
            var buffer = "", stack1, stack2;
            buffer += '\n                                    <div class="message-step-item message-step-' + escapeExpression((stack1 = depth1.stepLength, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + " ";
            stack2 = helpers.unless.call(depth0, data.index, {
                hash: {},
                inverse: self.noop,
                fn: self.program(27, program27, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            stack2 = helpers["if"].call(depth0, depth0.isHistoryStep, {
                hash: {},
                inverse: self.noop,
                fn: self.program(29, program29, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            stack2 = helpers["if"].call(depth0, depth0.isFailStep, {
                hash: {},
                inverse: self.noop,
                fn: self.program(31, program31, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            stack2 = helpers["if"].call(depth0, depth0.isCurrentStep, {
                hash: {},
                inverse: self.noop,
                fn: self.program(33, program33, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '">\n                                        <div class="message-step-point">&#9679;</div>\n                                        <div class="message-step-desc">\n                                            <span class="message-step-title">';
            if (stack2 = helpers.title) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.title;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            buffer += escapeExpression(stack2) + '</span>\n                                            <span class="message-step-date">';
            if (stack2 = helpers.stepTime) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.stepTime;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            buffer += escapeExpression(stack2) + "</span>\n                                        </div>\n                                    </div>\n                                    ";
            return buffer;
        }
        function program27(depth0, data) {
            return " message-step-first";
        }
        function program29(depth0, data) {
            return " message-step-done";
        }
        function program31(depth0, data) {
            return " message-step-fail";
        }
        function program33(depth0, data) {
            return " message-step-current";
        }
        function program35(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                    ";
            stack1 = helpers.unless.call(depth0, depth0.deleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(36, program36, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            return buffer;
        }
        function program36(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                    <tr id="J-msg-delete-';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '">\n                        <td class="message-panel-item-title">\n                            <h4>';
            if (stack1 = helpers.title) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.title;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '</h4>\n                        </td>\n                        <td>\n                            <div class="message-panel-item-content';
            stack1 = helpers["if"].call(depth0, depth0.isEmergency, {
                hash: {},
                inverse: self.noop,
                fn: self.program(37, program37, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += '">\n                                ';
            stack1 = helpers["if"].call(depth0, depth0.canDeleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(20, program20, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                                ";
            stack1 = helpers["if"].call(depth0, depth0.url, {
                hash: {},
                inverse: self.noop,
                fn: self.program(39, program39, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                                ";
            stack1 = helpers.unless.call(depth0, depth0.url, {
                hash: {},
                inverse: self.noop,
                fn: self.program(41, program41, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            </div>\n                        </td>\n                    </tr>\n                    ";
            return buffer;
        }
        function program37(depth0, data) {
            return " ui-msgpael-warn";
        }
        function program39(depth0, data) {
            var buffer = "", stack1, options;
            buffer += '\n                                <a href="';
            if (stack1 = helpers.url) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.url;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-delete="';
            if (stack1 = helpers.deleteOnClick) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.deleteOnClick;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-id="';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" target="_blank" seed="msg-detail-v1">';
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.content, options) : helperMissing.call(depth0, "spec_tag", depth0.content, options))) + "</a>\n                                ";
            return buffer;
        }
        function program41(depth0, data) {
            var buffer = "", stack1, options;
            buffer += "\n                                <span>";
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.content, options) : helperMissing.call(depth0, "spec_tag", depth0.content, options))) + "</span>\n                                ";
            return buffer;
        }
        buffer += '<div class="message-wrapper">\n';
        stack1 = helpers["if"].call(depth0, depth0.emergencyMsg, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n";
        stack1 = helpers.unless.call(depth0, depth0.emergencyMsg, {
            hash: {},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n</div>";
        return buffer;
    });
});

define("gallery/handlebars/1.0.2/runtime-debug", [], function(require, exports, module) {
    /*

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
    // lib/handlebars/browser-prefix.js
    var Handlebars = {};
    (function(Handlebars, undefined) {
        // lib/handlebars/base.js
        Handlebars.VERSION = "1.0.0-rc.4";
        Handlebars.COMPILER_REVISION = 3;
        Handlebars.REVISION_CHANGES = {
            1: "<= 1.0.rc.2",
            // 1.0.rc.2 is actually rev2 but doesn't report it
            2: "== 1.0.0-rc.3",
            3: ">= 1.0.0-rc.4"
        };
        Handlebars.helpers = {};
        Handlebars.partials = {};
        var toString = Object.prototype.toString, functionType = "[object Function]", objectType = "[object Object]";
        Handlebars.registerHelper = function(name, fn, inverse) {
            if (toString.call(name) === objectType) {
                if (inverse || fn) {
                    throw new Handlebars.Exception("Arg not supported with multiple helpers");
                }
                Handlebars.Utils.extend(this.helpers, name);
            } else {
                if (inverse) {
                    fn.not = inverse;
                }
                this.helpers[name] = fn;
            }
        };
        Handlebars.registerPartial = function(name, str) {
            if (toString.call(name) === objectType) {
                Handlebars.Utils.extend(this.partials, name);
            } else {
                this.partials[name] = str;
            }
        };
        Handlebars.registerHelper("helperMissing", function(arg) {
            if (arguments.length === 2) {
                return undefined;
            } else {
                throw new Error("Could not find property '" + arg + "'");
            }
        });
        Handlebars.registerHelper("blockHelperMissing", function(context, options) {
            var inverse = options.inverse || function() {}, fn = options.fn;
            var type = toString.call(context);
            if (type === functionType) {
                context = context.call(this);
            }
            if (context === true) {
                return fn(this);
            } else if (context === false || context == null) {
                return inverse(this);
            } else if (type === "[object Array]") {
                if (context.length > 0) {
                    return Handlebars.helpers.each(context, options);
                } else {
                    return inverse(this);
                }
            } else {
                return fn(context);
            }
        });
        Handlebars.K = function() {};
        Handlebars.createFrame = Object.create || function(object) {
            Handlebars.K.prototype = object;
            var obj = new Handlebars.K();
            Handlebars.K.prototype = null;
            return obj;
        };
        Handlebars.logger = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 3,
            methodMap: {
                0: "debug",
                1: "info",
                2: "warn",
                3: "error"
            },
            // can be overridden in the host environment
            log: function(level, obj) {
                if (Handlebars.logger.level <= level) {
                    var method = Handlebars.logger.methodMap[level];
                    if (typeof console !== "undefined" && console[method]) {
                        console[method].call(console, obj);
                    }
                }
            }
        };
        Handlebars.log = function(level, obj) {
            Handlebars.logger.log(level, obj);
        };
        Handlebars.registerHelper("each", function(context, options) {
            var fn = options.fn, inverse = options.inverse;
            var i = 0, ret = "", data;
            if (options.data) {
                data = Handlebars.createFrame(options.data);
            }
            if (context && typeof context === "object") {
                if (context instanceof Array) {
                    for (var j = context.length; i < j; i++) {
                        if (data) {
                            data.index = i;
                        }
                        ret = ret + fn(context[i], {
                            data: data
                        });
                    }
                } else {
                    for (var key in context) {
                        if (context.hasOwnProperty(key)) {
                            if (data) {
                                data.key = key;
                            }
                            ret = ret + fn(context[key], {
                                data: data
                            });
                            i++;
                        }
                    }
                }
            }
            if (i === 0) {
                ret = inverse(this);
            }
            return ret;
        });
        Handlebars.registerHelper("if", function(context, options) {
            var type = toString.call(context);
            if (type === functionType) {
                context = context.call(this);
            }
            if (!context || Handlebars.Utils.isEmpty(context)) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        });
        Handlebars.registerHelper("unless", function(context, options) {
            return Handlebars.helpers["if"].call(this, context, {
                fn: options.inverse,
                inverse: options.fn
            });
        });
        Handlebars.registerHelper("with", function(context, options) {
            if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
        });
        Handlebars.registerHelper("log", function(context, options) {
            var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
            Handlebars.log(level, context);
        });
        // lib/handlebars/utils.js
        var errorProps = [ "description", "fileName", "lineNumber", "message", "name", "number", "stack" ];
        Handlebars.Exception = function(message) {
            var tmp = Error.prototype.constructor.apply(this, arguments);
            // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
            for (var idx = 0; idx < errorProps.length; idx++) {
                this[errorProps[idx]] = tmp[errorProps[idx]];
            }
        };
        Handlebars.Exception.prototype = new Error();
        // Build out our basic SafeString type
        Handlebars.SafeString = function(string) {
            this.string = string;
        };
        Handlebars.SafeString.prototype.toString = function() {
            return this.string.toString();
        };
        var escape = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };
        var badChars = /[&<>"'`]/g;
        var possible = /[&<>"'`]/;
        var escapeChar = function(chr) {
            return escape[chr] || "&amp;";
        };
        Handlebars.Utils = {
            extend: function(obj, value) {
                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        obj[key] = value[key];
                    }
                }
            },
            escapeExpression: function(string) {
                // don't escape SafeStrings, since they're already safe
                if (string instanceof Handlebars.SafeString) {
                    return string.toString();
                } else if (string == null || string === false) {
                    return "";
                }
                // Force a string conversion as this will be done by the append regardless and
                // the regex test will do this transparently behind the scenes, causing issues if
                // an object's to string has escaped characters in it.
                string = string.toString();
                if (!possible.test(string)) {
                    return string;
                }
                return string.replace(badChars, escapeChar);
            },
            isEmpty: function(value) {
                if (!value && value !== 0) {
                    return true;
                } else if (toString.call(value) === "[object Array]" && value.length === 0) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        // lib/handlebars/runtime.js
        Handlebars.VM = {
            template: function(templateSpec) {
                // Just add water
                var container = {
                    escapeExpression: Handlebars.Utils.escapeExpression,
                    invokePartial: Handlebars.VM.invokePartial,
                    programs: [],
                    program: function(i, fn, data) {
                        var programWrapper = this.programs[i];
                        if (data) {
                            programWrapper = Handlebars.VM.program(i, fn, data);
                        } else if (!programWrapper) {
                            programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
                        }
                        return programWrapper;
                    },
                    programWithDepth: Handlebars.VM.programWithDepth,
                    noop: Handlebars.VM.noop,
                    compilerInfo: null
                };
                return function(context, options) {
                    options = options || {};
                    var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
                    var compilerInfo = container.compilerInfo || [], compilerRevision = compilerInfo[0] || 1, currentRevision = Handlebars.COMPILER_REVISION;
                    if (compilerRevision !== currentRevision) {
                        if (compilerRevision < currentRevision) {
                            var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision], compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
                            throw "Template was precompiled with an older version of Handlebars than the current runtime. " + "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").";
                        } else {
                            // Use the embedded version info since the runtime doesn't know about this revision yet
                            throw "Template was precompiled with a newer version of Handlebars than the current runtime. " + "Please update your runtime to a newer version (" + compilerInfo[1] + ").";
                        }
                    }
                    return result;
                };
            },
            programWithDepth: function(i, fn, data) {
                var args = Array.prototype.slice.call(arguments, 3);
                var program = function(context, options) {
                    options = options || {};
                    return fn.apply(this, [ context, options.data || data ].concat(args));
                };
                program.program = i;
                program.depth = args.length;
                return program;
            },
            program: function(i, fn, data) {
                var program = function(context, options) {
                    options = options || {};
                    return fn(context, options.data || data);
                };
                program.program = i;
                program.depth = 0;
                return program;
            },
            noop: function() {
                return "";
            },
            invokePartial: function(partial, name, context, helpers, partials, data) {
                var options = {
                    helpers: helpers,
                    partials: partials,
                    data: data
                };
                if (partial === undefined) {
                    throw new Handlebars.Exception("The partial " + name + " could not be found");
                } else if (partial instanceof Function) {
                    return partial(context, options);
                } else if (!Handlebars.compile) {
                    throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
                } else {
                    partials[name] = Handlebars.compile(partial, {
                        data: data !== undefined
                    });
                    return partials[name](context, options);
                }
            }
        };
        Handlebars.template = Handlebars.VM.template;
    })(Handlebars);
    module.exports = Handlebars;
});

define("alipay/nav/1.2.7/widget/account-debug", [ "$-debug", "arale/popup/1.1.5/popup-debug", "arale/overlay/1.1.3/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Popup = require("arale/popup/1.1.5/popup-debug");
    var Templatable = require("arale/templatable/0.9.2/templatable-debug");
    // 为了统计`显示余额`点击的次数
    var clickCount = 0;
    var Account = Popup.extend({
        Implements: Templatable,
        events: {
            "click [data-role=showbalance]": "showBalance"
        },
        parseElement: function() {
            this.set("model", {
                showEmail: hidePhoneNumber(limitEmail(this.get("model").email))
            });
            Account.superclass.parseElement.call(this);
        },
        show: function() {
            var model = this.get("model");
            if (!this.get("visible") && model.isLogin) {
                // 每次显示都重置`显示余额`的链接，为了保持余额同步
                model.balance = "";
                model.clickCount = clickCount;
                this.set("model", model);
                this.$("[data-role=balance]").html(renderBalance(model));
            }
            Account.superclass.show.call(this);
        },
        showBalance: function(e) {
            e.preventDefault();
            var that = this, model = this.get("model");
            url = model.personalServer + "/user/assets/queryBalance.json?_callback=?";
            //用于监控点击的次数
            clickCount++;
            $.ajax(url, {
                dataType: "jsonp"
            }).success(function(data) {
                if (data.stat !== "ok") {
                    return;
                }
                model.balance = data.availableAmount;
                that.set(model, model);
                that.$("[data-role=balance]").html(renderBalance(model));
            }).error(function() {
                model.balance = "";
                that.set(model, model);
                that.$("[data-role=balance]").html(renderBalance(model));
            });
        }
    });
    module.exports = Account;
    // Helper
    // ------
    // 限制 email 的长度，整个字符最长为19，@ 字符左边最长11，右边7
    function limitEmail(text) {
        text = text.replace(/^\s*(.*?)\s*$/g, "$1");
        var defaults = {
            regxp: /(^.*)(.{3}$)/g,
            placeholder: "$1...",
            leftLimit: 11,
            rightLimit: 7,
            totalLimit: 19
        };
        var list = text.split("@");
        var left = list[0];
        var right = list[1];
        if (list.length > 1 && text.length > defaults.totalLimit) {
            if (left.length > defaults.leftLimit) {
                left = left.slice(0, defaults.leftLimit).replace(defaults.regxp, defaults.placeholder);
            }
            if (right.length > defaults.rightLimit) {
                right = right.slice(0, defaults.rightLimit).replace(defaults.regxp, defaults.placeholder);
            }
            return [ left, "@", right ].join("").toLowerCase();
        } else {
            return text.toLowerCase();
        }
    }
    // 隐藏手机号码为 138****1234
    function hidePhoneNumber(text) {
        return text.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
    }
    function renderBalance(model) {
        if (model.balance) {
            return '<span class="global-account-balance">' + model.balance + "</span>元";
        } else {
            return '<a href="#" class="global-account-showbalance" seed="global-showbalance' + model.clickCount + '" data-role="showbalance">显示余额</a>';
        }
    }
});

define("alipay/nav/1.2.7/widget/count-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Count = {
        count: 0,
        setCount: function(count) {
            var countDom = $("#globalMsg .global-msg-count");
            this.count = count;
            if (count > 99) {
                count = "99+";
            }
            if (count === 0) {
                countDom.html(count).removeClass("global-msg-count-active");
            } else {
                countDom.html(count).addClass("global-msg-count-active");
            }
        },
        getCount: function() {
            return this.count;
        }
    };
    module.exports = Count;
});

define("alipay/nav/1.2.7/tpl/component-top-debug.tpl", [], '<div class="global-top">\n<div class="global-top-container">\n  <ul class="global-top-right">\n    <li class="global-top-item global-top-item-last">\n      <a id="globalBirthIcon" href="http://abc.alipay.com/jiniance/index.htm" class="global-icon global-icon-birth global-hide" target="_blank"></a>\n      {{#if isLogin}}\n    <li class="global-top-item">你好,</li>\n    <li id="globalUser" class="global-top-item">\n      <span class="global-top-text">\n        {{{userName}}}\n        <i class="iconfont global-top-angle">&#xF03C;</i>\n      </span>\n    </li>\n      {{else}}\n      <span class="global-top-text">欢迎使用支付宝！</span>\n      {{/if}}\n    </li>\n    {{#if isLogin }}\n    {{#unless msgHide }}\n    <li id="globalMsg" class="global-top-item">\n      <a href="{{couriercoreServer}}/messager/new.htm" seed="global-msg" target="_blank">\n        <i class="iconfont" title="提醒">&#xF056;</i>\n        <span class="global-msg-count"></span>\n      </a>\n    </li>\n    <em class="global-top-item global-top-seperator">|</em>\n    {{/unless}}\n    {{/if}}\n    <li class="global-top-item">\n      {{#if isLogin}}\n      <a href="{{authCenterServer}}/login/logout.htm?goto={{authCenterServer}}" class="global-top-link" seed="global-exit-v1">退出</a>\n      {{else}}\n      <a href="{{authCenterServer}}/login/index.htm?needTransfer=true&goto={{pageAbsUrl}}" class="global-top-link" seed="global-header-login">登录</a>\n      <span class="global-top-item global-top-seperator">-</span>\n      <a href="{{personalServer}}/user/reg/index.htm" class="global-top-link" seed="global-header-register">注册</a>\n      {{/if}}\n    </li>\n    <em class="global-top-item global-top-seperator">|</em>\n    <li  class="global-top-item">\n      <a class="global-top-link" href="{{personalportalServer}}" seed="global-portal-v1" target="_blank">我的支付宝</a>\n    </li>\n    <em class="global-top-item global-top-seperator">|</em>\n    <li id="globalSecurity" class="global-top-item">\n      <a class="global-top-link" href="{{securityServer}}/sc/index.htm" seed="global-security-v1" target="_blank">安全中心</a>\n    </li>\n    <em class="global-top-item global-top-seperator">|</em>\n    <li id="globalHelp" class="global-top-item">\n      <a class="global-top-link" href="http://help.alipay.com/lab/index.htm" seed="global-help" target="_blank">帮助中心</a>\n      <i class="iconfont global-top-angle">&#xF03C;</i>\n    </li>\n    <li id="globalMore" class="global-top-item global-top-item-last">\n        <i class="iconfont" title="记录">&#xF055;</i>\n    </li>\n  </ul>\n  <ul class="global-top-left">\n    <li class="global-top-item global-top-item-first {{#if showMobileLast}}global-top-item-last{{/if}}">\n      <i class="iconfont" title="手机">&#xF033;</i>\n      <a class="global-top-link" seed="global-mobile-v1" href="https://mobile.alipay.com/index.htm" target="_blank">手机支付宝</a>\n    </li>\n    {{#if showOtherLogin}}\n    <em class="global-top-item global-top-seperator">|</em>\n    <li class="global-top-item {{#if showOtherLoginLast}}global-top-item-last{{/if}}">\n      <i class="iconfont" title="返回">&#xF040;</i>\n      {{#if showTaobaoLogin}}\n      <a href="http://i.taobao.com/my_taobao.htm?r={{timestamp}}&userid={{userId}}" target="_blank" seed="global-return-taobao-v1" class="global-top-link">返回淘宝网</a>\n      {{/if}}\n      {{#if showAlibabaLogin}}\n      <a href="http://china.alibaba.com/member/myalibaba.htm" class="global-top-link" target="_blank" seed="global-return-alibaba-v1">返回阿里助手</a>\n      {{/if}}\n    </li>\n    {{/if}}\n    {{#if showSwitch}}\n    <em class="global-top-item global-top-seperator">|</em>\n    <li class="global-top-item {{#if showSwitchLast}}global-top-item-last{{/if}}">\n      <i class="iconfont" title="切换">&#xF04D;</i>\n      {{#if showMerchant}}\n      <a href="{{personalServer}}/user/switch2merchant.htm" seed="global-change-shanghu-v1" class="global-top-link">切换到商户版</a>\n      {{/if}}\n      {{#if showPersonal}}\n      <a href="{{merchantwebServer}}/home/switchPersonal.htm" seed="global-change-geren-v1" class="global-top-link">切换到个人版</a>\n      {{/if}}\n    </li>\n    {{/if}}\n  </ul>\n</div>\n</div>\n');

define("alipay/nav/1.2.7/tpl/widget-help-debug.tpl", [], '<div class="global-top-overlay fn-clear global-widget-help">\n  <ul>\n    <li class="global-top-overlay-item">\n      <i class="iconfont" title="常见问题">&#xF00E;</i>\n      <a href="http://help.alipay.com/lab/question.htm" target="_blank" seed="global-help-common-v1">常见问题</a>\n    </li>\n    <li class="global-top-overlay-item">\n      <i class="iconfont" title="自助服务">&#xF010;</i>\n      <a href="https://self.alipay.com/index.htm" target="_blank" seed="global-help-selfservice-v1">自助服务</a>\n    </li>\n    <li class="global-top-overlay-item" style="border:none;">\n      <i class="iconfont" title="玩转支付宝">&#xF012;</i>\n      <a href="http://abc.alipay.com/i/index.htm" target="_blank" seed="global-help-abc-v1">玩转支付宝</a>\n    </li>\n  </ul>\n</div>\n');

define("alipay/nav/1.2.7/tpl/widget-more-debug.tpl", [], '<div class="global-top-overlay fn-clear global-widget-help">\n  <ul>\n    <li class="global-top-overlay-item">\n      <i class="iconfont" title="建议/对话">&#xF031;</i>\n      <a class="global-top-link" href="https://egg.alipay.com/" target="_blank" seed="global-advice-v1">提建议</a>\n    </li>\n    <li class="global-top-overlay-item">\n      <i class="iconfont" title="地图">&#xF057;</i>\n      <a href="http://fun.alipay.com/sitemap/index.htm" target="_blank" seed="global-sitemap-v1">网站地图</a>\n    </li>\n    <li class="global-top-overlay-item" style="border:none;">\n      <i class="iconfont" title="盾牌-阳">&#xF000;</i>\n      <a href="https://www.alipay.com/" target="_blank" seed="global-homepage-v1">支付宝首页</a>\n    </li>\n  </ul>\n</div>\n\n');

define("alipay/nav/1.2.7/tpl/widget-account-debug.tpl", [], '<div class="global-top-overlay global-account fn-clear">\n  <div class="global-account-head">\n    <a href="{{personalportalServer}}/portal/account/index.htm" class="global-account-img" target="_blank" seed="global-account-img">\n      {{#if portraitPath}}\n      <img src="{{portraitPath}}" alt="我的头像" />\n      {{else}}\n      <i class="iconfont" title="我的头像">&#xF03E;</i>\n      {{/if}}\n    </a>\n    <div class="global-account-name" title="{{showEmail}}">{{showEmail}}</div>\n    <a href="{{personalportalServer}}/portal/account/index.htm" seed="global-name-zhanghu-set-v1" target="_blank">账户设置</a>\n    <span class="global-top-seperator">|</span>\n    <a href="{{personalServer}}/consume/record/index.htm" seed="global-name-record-v1" target="_blank">交易记录</a>\n  </div>\n  <div class="global-account-body">\n    <p>\n       账户余额：<span data-role="balance" seed="global-name-yue-display-v1"></span> \n      <a href="https://shenghuo.alipay.com/transfer/deposit/depositPreprocessGw.htm" seed="global-name-recharge-v1" target="_blank">充值</a>\n    </p>\n    <hr>\n    <p>\n      <a href="https://financeprod.alipay.com/fund/asset.htm" seed="global-name-yuebao-v1" target="_blank">余额宝</a>\n      <span class="global-top-seperator">|</span>\n      <a href="https://zht.alipay.com/asset/iframeDetail.htm?providerType=FINANCING&partnerId=TAOBAOLICAI" seed="global-name-fortune-v1" target="_blank">理财</a>\n      <span class="global-top-seperator">|</span>\n      <a href="{{personalportalServer}}/portal/assets/index.htm" seed="global-name-other-property-v1" target="_blank">其他资产</a>\n    </p>\n  </div>\n</div>\n');

define("alipay/nav/1.2.7/component/common-debug", [ "$-debug", "arale/cookie/1.0.2/cookie-debug", "alipay/nav/1.2.7/widget/component-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Cookie = require("arale/cookie/1.0.2/cookie-debug");
    var Component = require("alipay/nav/1.2.7/widget/component-debug");
    // A 版
    exports.a = function(model) {
        return new CommonComponentA({
            className: "global-common-a",
            model: model
        }).after("appendTo", addTopAD).after("appendTo", showMerchant).render();
    };
    // B 版
    exports.b = function(model) {
        return exports.a(model);
    };
    // 新UI方案
    // ---
    var CommonComponentA = Component.extend({
        attrs: {
            template: require("alipay/nav/1.2.7/tpl/component-common-debug.tpl")
        },
        templateHelpers: {
            showCurrent: function(menu) {
                if (this.menu && this.menu.indexOf(menu) > -1) {
                    return "global-nav-item-current";
                }
                return "";
            },
            showSubCurrent: function(menu) {
                if (this.menu && this.menu.indexOf(menu) > -1) {
                    return "global-subnav-item-current";
                }
                return "";
            }
        },
        render: function() {
            var model = this.get("model"), showSubNav;
            // 应用中心为 s5
            if (model.appKey || model.catKey) {
                model.menu = "s5";
            }
            if (model.menu && (model.menu.indexOf("s0") > -1 || model.menu.indexOf("s1") > -1 || model.menu.indexOf("s2") > -1)) {
                model.showSubNav = true;
            } else {
                model.showSubNav = false;
            }
            // 标记哪个菜单是当前菜单
            for (var i = 0; i < 8; i++) {
                if (model.menu.indexOf("s" + i) > -1) {
                    model["menu-" + i] = true;
                }
            }
            this.set("model", model);
            return CommonComponentA.superclass.render.call(this);
        }
    });
    // 添加广告
    function addTopAD() {
        // 浮层插入的容器
        if ($(this.get("model").container).length === 0) {
            return;
        }
        var adKey = "global-ad";
        var globalTopAD = this.find("#globalTopAD");
        if (!Cookie.get(adKey) && globalTopAD.length) {
            globalTopAD.show();
            globalTopAD.find(".global-top-ad-close").click(function() {
                globalTopAD.hide();
                Cookie.set(adKey, "true", {
                    expires: 1e3,
                    path: "/",
                    domain: document.domain.split(".").slice(-2).join(".")
                });
            });
        }
    }
    // 根据后台数据显示“我的支付宝-商家服务”
    function showMerchant() {
        var that = this, model = this.get("model");
        var url = (model.uninavServer || "") + "/nav/getUniData.json?_callback=?";
        // 为了减少服务器压力，满足以下情况才会请求
        // 1. cms 中的开关开启
        // 2. 一级导航为“我的支付宝”
        if (model.merchantSwitch === "true" && model.menu.indexOf("s1") > -1) {
            // 异常情况都不做处理
            $.ajax(url, {
                dataType: "jsonp"
            }).success(function(data) {
                if (data.stat === "ok" && data.isMerchant) {
                    that.find("#global-subnav-merchant").show();
                }
            });
        }
    }
});

define("arale/cookie/1.0.2/cookie-debug", [], function(require, exports) {
    // Cookie
    // -------------
    // Thanks to:
    //  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
    //  - http://developer.yahoo.com/yui/3/cookie/
    var Cookie = exports;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    /**
     * Returns the cookie value for the given name.
     *
     * @param {String} name The name of the cookie to retrieve.
     *
     * @param {Function|Object} options (Optional) An object containing one or
     *     more cookie options: raw (true/false) and converter (a function).
     *     The converter function is run on the value before returning it. The
     *     function is not used if the cookie doesn't exist. The function can be
     *     passed instead of the options object for conveniently. When raw is
     *     set to true, the cookie value is not URI decoded.
     *
     * @return {*} If no converter is specified, returns a string or undefined
     *     if the cookie doesn't exist. If the converter is specified, returns
     *     the value returned from the converter.
     */
    Cookie.get = function(name, options) {
        validateCookieName(name);
        if (typeof options === "function") {
            options = {
                converter: options
            };
        } else {
            options = options || {};
        }
        var cookies = parseCookieString(document.cookie, !options["raw"]);
        return (options.converter || same)(cookies[name]);
    };
    /**
     * Sets a cookie with a given name and value.
     *
     * @param {string} name The name of the cookie to set.
     *
     * @param {*} value The value to set for the cookie.
     *
     * @param {Object} options (Optional) An object containing one or more
     *     cookie options: path (a string), domain (a string),
     *     expires (number or a Date object), secure (true/false),
     *     and raw (true/false). Setting raw to true indicates that the cookie
     *     should not be URI encoded before being set.
     *
     * @return {string} The created cookie string.
     */
    Cookie.set = function(name, value, options) {
        validateCookieName(name);
        options = options || {};
        var expires = options["expires"];
        var domain = options["domain"];
        var path = options["path"];
        if (!options["raw"]) {
            value = encode(String(value));
        }
        var text = name + "=" + value;
        // expires
        var date = expires;
        if (typeof date === "number") {
            date = new Date();
            date.setDate(date.getDate() + expires);
        }
        if (date instanceof Date) {
            text += "; expires=" + date.toUTCString();
        }
        // domain
        if (isNonEmptyString(domain)) {
            text += "; domain=" + domain;
        }
        // path
        if (isNonEmptyString(path)) {
            text += "; path=" + path;
        }
        // secure
        if (options["secure"]) {
            text += "; secure";
        }
        document.cookie = text;
        return text;
    };
    /**
     * Removes a cookie from the machine by setting its expiration date to
     * sometime in the past.
     *
     * @param {string} name The name of the cookie to remove.
     *
     * @param {Object} options (Optional) An object containing one or more
     *     cookie options: path (a string), domain (a string),
     *     and secure (true/false). The expires option will be overwritten
     *     by the method.
     *
     * @return {string} The created cookie string.
     */
    Cookie.remove = function(name, options) {
        options = options || {};
        options["expires"] = new Date(0);
        return this.set(name, "", options);
    };
    function parseCookieString(text, shouldDecode) {
        var cookies = {};
        if (isString(text) && text.length > 0) {
            var decodeValue = shouldDecode ? decode : same;
            var cookieParts = text.split(/;\s/g);
            var cookieName;
            var cookieValue;
            var cookieNameValue;
            for (var i = 0, len = cookieParts.length; i < len; i++) {
                // Check for normally-formatted cookie (name-value)
                cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
                if (cookieNameValue instanceof Array) {
                    try {
                        cookieName = decode(cookieNameValue[1]);
                        cookieValue = decodeValue(cookieParts[i].substring(cookieNameValue[1].length + 1));
                    } catch (ex) {}
                } else {
                    // Means the cookie does not have an "=", so treat it as
                    // a boolean flag
                    cookieName = decode(cookieParts[i]);
                    cookieValue = "";
                }
                if (cookieName) {
                    cookies[cookieName] = cookieValue;
                }
            }
        }
        return cookies;
    }
    // Helpers
    function isString(o) {
        return typeof o === "string";
    }
    function isNonEmptyString(s) {
        return isString(s) && s !== "";
    }
    function validateCookieName(name) {
        if (!isNonEmptyString(name)) {
            throw new TypeError("Cookie name must be a non-empty string");
        }
    }
    function same(s) {
        return s;
    }
});

define("alipay/nav/1.2.7/tpl/component-common-debug.tpl", [], '<div class="global">\n    {{{cms_alipay_nav_global_ad}}}\n    {{{cms_alipay_notice_headNotice}}}\n    <div class="global-header fn-clear {{#unless showSubNav}}global-nav-nosub{{/unless}}" coor="headarea">\n      <div class="global-header-content">\n        <div class="global-logo">\n            <a href="{{personalportalServer}}/portal/i.htm" seed="global-logo" title="我的支付宝"></a>\n        </div>\n        <div class="global-logo-neighbor">\n        </div>\n        <ul class="global-nav">\n            <li class="global-nav-item {{#if menu-1}}global-nav-item-current{{/if}}">\n                <i class="iconfont" title="菱形">&#xF02F;</i>\n                <a href="{{personalportalServer}}/portal/i.htm"  seed="global-user-i">我的支付宝</a  >\n                <span class="global-nav-item-arrow">◆</span>\n                <span class="global-nav-item-arrow global-nav-item-arrow-border">◆</span>\n            </li>\n            <li class="global-nav-item {{#if menu-2}}global-nav-item-current{{/if}}">\n                <i class="iconfont" title="菱形">&#xF02F;</i>\n                <a href="{{consumeprodServer}}/record/index.htm" seed="global-record">交易记录</a>\n                <span class="global-nav-item-arrow">◆</span>\n                <span class="global-nav-item-arrow global-nav-item-arrow-border">◆</span>\n            </li>\n            <li class="global-nav-item {{#if menu-6}}global-nav-item-current{{/if}}">\n                <i class="iconfont" title="菱形">&#xF02F;</i>\n                <a href="{{personalportalServer}}/portal/account/safeguard.htm" seed="global-safeguard">会员保障</a>\n                <span class="global-nav-item-arrow">◆</span>\n                <span class="global-nav-item-arrow global-nav-item-arrow-border">◆</span>\n            </li>\n            <li class="global-nav-item {{#if menu-5}}global-nav-item-current{{/if}}">\n                <i class="iconfont" title="菱形">&#xF02F;</i>\n                <a href="{{appstoreServer}}/container/web/index.htm" seed="global-appstore">应用中心</a>\n                <span class="global-nav-item-arrow">◆</span>\n                <span class="global-nav-item-arrow global-nav-item-arrow-border">◆</span>\n            </li>\n        </ul>\n      </div>\n    </div>\n    {{#if showSubNav}}\n    <div class="global-subheader">\n        <ul class="global-subnav">\n            {{#if menu-1}}\n                <li class="global-subnav-item {{showSubCurrent "s1_index"}}">\n                    <a href="{{personalportalServer}}/portal/i.htm" seed="global-user-i">首页</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s1_fund"}}">\n                    <a href="{{personalportalServer}}/portal/assets/index.htm" seed="global-account-info">账户资产</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s1_myaccount"}}">\n                    <a href="{{personalportalServer}}/portal/account/index.htm" seed="global-account-member">账户设置</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s1_zht"}}">\n                    <a href="{{benefitprodServer}}/asset/index.htm" seed="global-account-zht">账户通</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s1_merchant"}} global-hide" id="global-subnav-merchant">\n                    <a href="{{morderprodServer}}/order/products.htm?channel=psl" seed="global-merchant">商户服务</a>\n                </li>\n                <div class="global-subnav-input">\n                    <form action="http://help.alipay.com/lab/search_new_result.htm" method="GET" id="J-my-app-search-form" class="my-app-search-form fn-hide" target="_blank" accept-charset="gb2312">\n                        <input type="text" id="J-my-app-search-input" placeholder="输入关键字，如“密码”" seed="my-app-search-input" name="word" autocomplete="off">\n                        <i class="iconfont global-subnav-input-scan" seed="my-app-search-icon" title="查询/搜索">&#xF02A;</i>\n                    </form>\n                </div>\n            {{/if}}\n            {{#if menu-2}}\n                <li class="global-subnav-item {{showSubCurrent "s2_traderecord"}}">\n                    <a href="{{consumeprodServer}}/record/index.htm" seed="global-record-detail">交易记录</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s2_tradeflow"}}">\n                    <a href="{{personalServer}}/consume/record/inpour.htm" seed="global-record-deposit">充值记录</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s2_tradedraw"}}">\n                    <a href="{{personalServer}}/consume/record/draw.htm" seed="global-record-deposit">提现记录</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s2_tradereview"}}">\n                    <a href="{{tradecmtServer}}/comment/concumserCriticismManage.htm" seed="global-record-comment">交易评价</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s2_ebill"}}">\n                    <a href="{{zhangdanServer}}/ebill/index.htm" seed="global-record-ebill" id="global-record-ebill">电子对账单</a>\n                </li>\n                <li class="global-subnav-item {{showSubCurrent "s2_tally"}}">\n                    <a href="{{tallyServer}}/tally/index.htm" seed="global-record-tally">记账</a>\n                </li>\n            {{/if}}\n        </ul> \n    </div>\n    {{/if}}\n</div>\n');

define("alipay/nav/1.2.7/widget/cmstpl-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var cms = {};
    $("script.global-cms-block").each(function(i, ele) {
        cms[ele.id] = ele.innerHTML;
    });
    module.exports = cms;
});
