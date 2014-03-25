define("authcenter/login/1.1.3/js/login-debug", [ "$-debug", "alipay/storex/1.0.1/storex-debug", "gallery/json/1.0.3/json-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "gallery/store/1.3.7/store-debug", "./util/namespace-debug", "./util/getTime-debug", "./util/set-domain-debug", "./util/util-debug", "./util/rule-debug", "./util/crossIframe-debug", "./module/alieditAttr-debug", "./module/checkcode-debug", "./module/switchaliedit-debug", "arale/tip/1.1.3/tip-debug", "arale/popup/1.1.1/popup-debug", "arale/overlay/1.1.1/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "./module/btnStyle-debug", "./module/validator-debug", "arale/validator/0.9.5/validator-debug", "arale/placeholder/1.1.0/placeholder-debug", "./module/account-debug", "./module/accountsave-debug", "./module/adjustheight-debug", "./module/autocomplete-debug", "arale/autocomplete/1.2.2/autocomplete-debug", "arale/templatable/0.9.1/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug", "gallery/handlebars/1.0.2/runtime-debug", "alipay/object-shim/1.0.0/object-shim-debug", "./module/proxyip-debug", "./module/ignoringSpaces-debug", "./module/refreshCheckCode-debug", "./util/uri-debug", "./module/realtimeCheckcode-debug", "./module/voiceCheckcode-debug", "./module/alilogin-debug", "./scene/alipay-debug", "./module/indexBg-debug", "./module/qrcode-debug" ], function(require, exports, module) {
    /**
     *  @name       : login.js
     *  @desc       : 1. 登录中心的核心函数集合
     *                2. 处理命名空间，错误信息，公用接口
     *  @example    :
     *  @depend     : 这里依赖 3 个参数，分别如下：
     *                1. json_ua        //ua 参数
     *                2. form_tk        //表单token
     *                3. ACCOUNTTIPS    //出错信息
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    var storex = require("alipay/storex/1.0.1/storex-debug");
    var nameSpace = require("./util/namespace-debug");
    var getTime = require("./util/getTime-debug");
    /**
     *  设置 Domain
     */
    require("./util/set-domain-debug");
    /**
     * 注册命名空间
     */
    nameSpace("system.auth");
    /**
     *  错误码
     */
    system.auth.errorcode = {
        closechacha: "删除账号记录",
        accounterror: "账户名blur时候校验未通过"
    };
    /**
     *  静态工具类
     */
    require("./util/util-debug");
    /**
     *  日志
     */
    system.auth.log = function(level, message) {
        var debug = storex.status().enabled ? storex.get("debug") : "";
        var log = "";
        var v = "";
        if (location.host.indexOf("alipay.com") > 1) {
            //线上环境
            if ($.inArray(level, [ "track", "error" ]) !== -1 && Tracker) {
                Tracker.click("auth^" + level + "^" + message);
            }
        } else if (debug === "true") {
            //测试环境,开启debug
            if ($.inArray(level, [ "track", "debug", "info", "warn", "error" ]) !== -1) {
                v = system.auth.errorcode[message];
                log = level.toUpperCase() + ": " + (typeof v !== "undefined" && v ? v : message) + " - " + getTime();
                if (typeof console !== "undefined") {
                    console.log(log);
                }
            }
        } else {
            if ($.inArray(level, [ "track", "warn", "error" ]) !== -1) {
                v = system.auth.errorcode[message];
                log = level.toUpperCase() + ": " + (typeof v !== "undefined" && v ? v : message) + " - " + getTime();
                if (typeof console !== "undefined") {
                    console.log(log);
                }
            }
        }
    };
    /**
     *  定义好约定的参数
     */
    system.auth.param = {
        //判断是否需要强制控件登录
        J_superSwitch: $("#J-superSwitch"),
        //账户输入框
        account: $("#J-input-user"),
        //记录密码控件的使用方式
        J_isNoActiveX: $("#J-noActiveX"),
        //密码控件输入框外部容器
        J_alieditPwd: $("#password_container"),
        //正常密码输入框
        standarPwd: $("#password_input"),
        //正常密码输入框外部容器
        J_standarPwd: $(".standardPwdContainer"),
        //验证码输入框
        authcode: $("#J-input-checkcode"),
        //验证码输入框外部容器
        J_authcode: $("#J-checkcode"),
        //无控件登录切换checkbox
        safeSignCheck: $("#safeSignCheck"),
        //无控件登录切换checkbox外部容器
        J_safeSignCheck: $("#J-password"),
        //是否使用密码控件
        alieditUsing: document.getElementsByName("J_aliedit_using")[0],
        //最后提交的密码隐藏域
        password: $("#password"),
        //登录按钮
        loginBtn: $("#J-login-btn"),
        //form表单
        loginForm: $("#login")
    };
    /**
     *  示例缓存
     */
    system.auth.instance = {};
    /**
     *  @name: 设置前端性能
     *  @READY: domReady
     *  @FOCUS: autoFocus
     *  @SSO: aliLogin
     *  @IMAGE: imgLoad
     */
    system.auth.instance.TTI = {
        FOCUS: ""
    };
    system.auth.instance.getTTI = function(name, time) {
        if (typeof window._to !== "undefined") {
            var currentTime = time - window._to.start;
            for (var i in system.auth.instance.TTI) {
                if (i === name) {
                    system.auth.instance.TTI[i] = currentTime;
                }
            }
        }
    };
    /**
     *  通用校验规则
     */
    require("./util/rule-debug");
    /**
     *  跨iframe接口
     */
    require("./util/crossIframe-debug");
    /**
     *  密码控件接口获取
     */
    require("./module/alieditAttr-debug");
    /**
     *  校验码功能
     */
    require("./module/checkcode-debug");
    /**
     *  切换密码控件的功能
     */
    require("./module/switchaliedit-debug");
    /**
     *  提交按钮的样式变化
     */
    require("./module/btnStyle-debug");
    /*
     *  校验规则
     */
    require("./module/validator-debug");
    /**
     *  用户名操作
     */
    require("./module/account-debug");
    /**
     *  记录用户名
     */
    require("./module/accountsave-debug");
    /**
     *  高度自适应
     */
    require("./module/adjustheight-debug");
    /**
     *  账户输入框的自动提示
     */
    require("./module/autocomplete-debug");
    /**
     *  ip 检测
     */
    require("./module/proxyip-debug");
    /**
     *  去除空格
     */
    require("./module/ignoringSpaces-debug");
    /*
     *  刷新校验码
     */
    require("./module/refreshCheckCode-debug");
    /*
     *  实时校验码功能
     */
    require("./module/realtimeCheckcode-debug");
    /*
     *  语音校验码
     */
    require("./module/voiceCheckcode-debug");
    /**
     *  sso 集团登录状态检测
     */
    require("./module/alilogin-debug");
    /**
     *  场景 - alipay
     */
    require("./scene/alipay-debug");
    /**
     *  首页的背景图片功能
     */
    require("./module/indexBg-debug");
    /**
     *  二维码登录
     */
    require("./module/qrcode-debug");
    /**
     *  存储数据并等加载完毕发送
     */
    $(document).ready(function() {
        setTimeout(function() {
            var thumbData = "";
            for (var i in system.auth.instance.TTI) {
                thumbData = system.auth.instance.TTI[i];
            }
            if (typeof Tracker !== "undefined") {
                Tracker.calc("TTI-autoFocus", thumbData);
            }
        }, 3e3);
    });
});

define("authcenter/login/1.1.3/js/util/namespace-debug", [], function(require, exports, module) {
    /**
     *  @name       : namespace.js
     *  @desc       : 工具类 - 命名空间
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    function nameSpace(namespace, root) {
        var parts = namespace.split("."), current = root || window;
        //创建命名空间
        if (!(parts[0] in window)) {
            window[parts[0]] = {};
        }
        for (var part; parts.length && (part = parts.shift()); ) {
            if (!current[part]) {
                current[part] = {};
            }
            //因为我们有时候需要混入对象的时候,只有得到父类的才能混入
            //            current[part]._parentModule || (current[part]._parentModule = current);
            //换个写法：
            if (!current[part]._parentModule) {
                current[part]._parentModule = current;
            }
            //自己本身module所对应的key
            current = current[part];
            current._moduleName = part;
        }
        return current;
    }
    module.exports = nameSpace;
});

define("authcenter/login/1.1.3/js/util/getTime-debug", [], function(require, exports, module) {
    /**
     *  @name       : getTime.js
     *  @desc       : 工具类 - 用于获取当前时间
     *  @example    : var getTime = require('getTime.js');
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    function getTime() {
        var d = new Date();
        return [ d.getFullYear(), d.getMonth() + 1, d.getDate() ].join("-") + " " + [ d.getHours(), d.getMinutes(), d.getSeconds() ].join(":");
    }
    module.exports = getTime;
});

define("authcenter/login/1.1.3/js/util/set-domain-debug", [], function(require) {
    /**
     *  @name       : set-domain.js
     *  @desc       : 1. 处理跨域操作
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var aDomain = document.domain.split(".");
    if (aDomain.length > 1) {
        var sDomain = aDomain[aDomain.length - 2] + "." + aDomain[aDomain.length - 1];
        document.domain = sDomain;
    }
});

define("authcenter/login/1.1.3/js/util/util-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : util.js
     *  @desc       : 工具类 - 封装好的静态方法
     *  @example    : system.auth.util();
     *  @create     : 2013.08
     *  @auther     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.util = system.auth.util || {};
    system.auth.util.trimAll = function(str) {
        return str.toString().replace(/^\s+|\s+|\s+$/g, "");
    };
    system.auth.util.limitEmail = function(text) {
        text = text.replace(/^\s*(.*?)\s*$/g, "$1");
        var defaults = {
            regxp: /(^.*)(.{3}$)/g,
            placeholder: "$1***",
            leftLimit: 6
        };
        var list = text.split("@");
        var left = list[0];
        var right = list[1];
        if (list.length > 1) {
            if (left.length > defaults.leftLimit) {
                left = left.slice(0, defaults.leftLimit).replace(defaults.regxp, defaults.placeholder);
            }
            return [ left, "@", right ].join("").toLowerCase();
        } else {
            return text.toLowerCase();
        }
    };
});

define("authcenter/login/1.1.3/js/util/rule-debug", [], function(require) {
    /**
     *  @name       : rule.js
     *  @desc       : 工具类 - 校验规则
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    system.auth.rule = system.auth.rule || {};
    system.auth.rule.emailOrMobile = function(v) {
        var valid = false;
        //普通的邮箱校验
        if (/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(v)) {
            valid = true;
        } else if (/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+(\#[a-zA-Z0-9]{1,20})+$/.test(v)) {
            valid = true;
        } else if (/^1\d{10}$/.test(v)) {
            valid = true;
        } else if (/^(1\d{10})(\#[a-zA-Z0-9]{1,20})$/.test(v)) {
            valid = true;
        } else if (/^(00)?(886|853|852|82|81|65|60)[0-9]{8}$/.test(v)) {
            valid = true;
        } else if (/^(00)?(886|853|852|82|81|65|60)-?[0-9]{7,11}$/.test(v)) {
            valid = true;
        }
        return valid;
    };
});

define("authcenter/login/1.1.3/js/util/crossIframe-debug", [], function(require) {
    /**
     *  @name       : crossIframe.js
     *  @desc       : 1. 登录中心iframe接口
     *                2. 父窗口需要有 showLoginIframe 的方法可以调用
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    system.auth.crossIframe = function() {
        var timeId = null;
        (function() {
            var parent_ = self.parent;
            if (parent_ && parent_.showLoginIframe) {
                parent_.showLoginIframe();
                if (timeId) {
                    clearTimeout(timeId);
                }
            } else {
                try {
                    timeId = setTimeout(arguments.callee, 500);
                } catch (e) {}
            }
        })();
    };
});

define("authcenter/login/1.1.3/js/module/alieditAttr-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : alieditAttr.js
     *  @desc       : 1. 和安全脚本的交互，获取密码控件的属性
     *                2. 依赖于 light 和 alipay.security
     *                3. 默认是执行的
     *  @example    : system.auth.alieditInit();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.alieditInit = function() {
        //控件方法容器
        this.alieditAttrs = {};
        //新控件方式
        if (window.light && light.page && (light.page.products["password"] || light.page.products["password_input"])) {
            var alieditInstance = light.page.products["password"] || light.page.products["password_input"], security_ = window.alipay.security;
            //密码控件输入框
            this.alieditAttrs.alieditPwd = alieditInstance.element;
            //获取密码方式
            this.alieditAttrs.getPassword = function() {
                return alieditInstance.getPassword();
            };
            //获取mac方式
            this.alieditAttrs.getCi1 = function() {
                return alieditInstance.getCi1();
            };
            //获取代理方式
            this.alieditAttrs.getCi2 = function() {
                return alieditInstance.getCi2();
            };
            //判断是否按装了控件
            this.alieditAttrs.installedAliedit = security_.npedit.installed || security_.edit.installed;
            //判断是否支持该浏览器 TODO 换方式
            //this.alieditAttrs.supportAliedit = security_.edit.available ;
            //控件弹出层
            this.alieditAttrs.detectAliedit = security_.edit.detect;
        }
    };
    light.ready(function() {
        system.auth.alieditInit();
    });
});

define("authcenter/login/1.1.3/js/module/checkcode-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : checkcode.js
     *  @desc       : 1. 原先的 alipay.auth.checkcode 修改版本，迁移到系统里面来
     *                2. 和 RDS 配合，对表单进行人机识别的操作
     *                3. 主要处理有两件事情，一个是判断是否为机器，校验码的控制；
     *                   另外一个是在表单提交的时候进行人机识别处理
     *                4. 辅助功能是鼠标的自动 focus 和错误提示
     *                5. 依赖于一个全局变量 json_ua 和 form_tk
     *  @example    : new system.auth.checkcode({
     *                   form: $("#login")
     *                });
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.checkcode = function(options) {
        var that = this;
        this.init();
        for (var i in options) {
            this[i] = options[i];
        }
        //对验证码的通用操作
        $("#J-checkcode-img").on("click", function(e) {
            e.preventDefault();
            system.auth.refreshCheckCode();
            //自动focus
            system.auth.param.authcode[0].focus();
        });
        //判断当前是不是账户名不能更改的场景，如果账户名不能更改，这logonId为空，会在下面return掉，所以在这里显示验证码就ok了，不会触发RDS校验逻辑。
        if (!!(document.getElementsByName("logonIdReadOnly")[0] && document.getElementsByName("logonIdReadOnly")[0].value === "true")) {
            this.failCallback.call(this);
        }
        //如果一些必要的元素不存在，或者json_ua不存在，则直接显示验证码，同时显示验证码，避免无法登录
        if (!this.form.length > 0 || !this.logonId.length > 0 || !this.errorBox.length > 0) {
            this.failCallback.call(this);
            return false;
        }
        this.logonIdFirstValue = this.logonId.val();
        /**
         *  RDS 的载入和生效时间是因人而异，这里需要检验 RDS 参数的真实状态，第一次为null，所以需要去定时取出来。
         *  最多尝试5次，如果没有，则的确为null。
         */
        if (!json_ua) {
            var tryTime = 0;
            var tryTimeInterval = setInterval(function() {
                if (!!json_ua) {
                    clearInterval(tryTimeInterval);
                } else {
                    tryTime++;
                    if (tryTime > 4) {
                        clearInterval(tryTimeInterval);
                        that.showCheckCode();
                    }
                }
            }, 100);
        }
        //如果不支持控件，显示验证码
        if (!this.supportAliedit()) {
            this.showCheckCode();
        }
        this.bind();
    };
    system.auth.checkcode.prototype = {
        /**
         * 包含校验码的form
         */
        form: null,
        /**
         * 账户名
         */
        logonId: null,
        /**
        保存账户名初始值
        */
        logonIdFirstValue: null,
        /**
         * 报错提示容器
         */
        errorBox: null,
        /**
         * 表单标题
         */
        loginTitle: null,
        /**
         * 账户名格式校验错误文案数组
         */
        accountFormatError: [ "请输入账户名。", "账户名的长度不能超过100位。", "支付宝账户是邮箱地址或手机号码。" ],
        /**
         * 是否需要异步校验账户名，默认开启
         *
         */
        accountSwtich: true,
        /**
         * 是否需要通过异步校验显示用户名、手机
         */
        accountInfoShow: false,
        /**
         *
         */
        accountInfoNode: null,
        /**
         * 是否通过Alert来弹出报错
         */
        isAlertType: false,
        /**
         * 账户名本地存储的key
         */
        accountsaverKey: null,
        /**
         * 校验码容器
         * @type {arale.node}
         */
        codeCnt_: null,
        /**
         * 验证码输入框
         * @type {Array}
         */
        authcode: null,
        /**
         * 表单提交
         * @private
         */
        formSubmit_: null,
        /**
         * 表单token
         * @type {arale.node}
         */
        formToken: null,
        /**
         * 标示是否是人
         * @type {Boolean}
         */
        isPerson: false,
        /**
         * 延时清除报错信息的计时器
         */
        timer: null,
        /**
         * 超时时间
         * @type {Number}
         */
        timeout: 3e3,
        /**
         * 已经校验过的账户名，如果blur后发现值没变，就不发请求
         */
        accountValue: null,
        /**
         * 账户名异步校验结果
         */
        accountResult: false,
        /**
         * 用来做钱包用户的临时存储
         */
        qrAccountThumb: [],
        /**
         * 保存当前报错的错误码
         */
        accountErrorCode: null,
        /**
         *错误码提示文案map，维护在登录中心的showMSG.vm中
         */
        accountTips: window.ACCOUNTTIPS,
        /**
         *异步请求对象，在success或者failure之后都会将ajaxTarget设置为null，标识是否正在发送中。
         */
        ajaxTarget: null,
        /**
         * 是否需要二维码登录，默认为false，debug为true
         */
        needQrLogin: true,
        /**
         * 元素的初始化
         */
        init: function() {
            this.form = $("#login")[0];
            this.logonId = $("#J-input-user");
            this.errorBox = $("#J-errorBox");
            this.loginTitle = $("#J-login-title");
            this.codeCnt_ = $("#J-checkcode");
            this.authcode = $("#J-input-checkcode");
            this.formToken = $("#login input[name=rds_form_token]");
        },
        /**
         * 绑定事件
         * @ignore
         */
        bind: function() {
            var that = this;
            //表单校验切面
            this.submitAspect();
            $(system.auth.param.loginForm).on("SWITCH_ALIEDITER_EVENT", function(e, v) {
                if (v && that.isPerson && system.auth.alieditAttrs.supportAliedit) {
                    that.hideCheckCode();
                } else if (!v) {
                    try {
                        $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                    } catch (e) {}
                    if (that.onFailCallback) {
                        that.onFailCallback.call(that, null);
                    }
                    that.ajaxTarget = null;
                }
            });
            //如果验证码已经显示那么就不发送rds校验 主要是在错误情况或者强制在session中设置过
            if (!(that.logonId && that.logonId.attr("id")) || !that.codeCnt_ || that.codeCnt_ && !that.codeCnt_.hasClass("fn-hide")) {
                that.failCallback.call(that);
            }
            /*
             *  @changeLogBefore:   1. 光标定位问题，原先只会自动 Focus 到账户名；
             *                      2. 当有用户名保存的时候，用户会先输入密码，这时候会出现光标被移动的情况;
             *  @changeLogAfter:    1. 用户没输入内容，自动 Focus 到账户名;
             *                      2. 已经输入过内容，自动 Focus 到密码框;
             *  @setTimeout:        1. 只有当控件渲染完毕，再来做自动聚焦功能才准确
             *                      2. 如果有账户名的情况下，对账户名进行校验，发起rds请求
             */
            setTimeout(function() {
                try {
                    //这个自动 focus 的标志位可以去掉
                    //that.isLogonIdFocus = true;
                    //                     $(that.logonId).focus();
                    if (!system.auth.accountsaver.status()) {
                        $(that.logonId).focus();
                    } else {
                        //如果是密码控件，则foucs到控件内
                        if ($(system.auth.param.alieditUsing).val() === "true") {
                            if (system.auth.alieditAttrs.alieditPwd) {
                                system.auth.alieditAttrs.alieditPwd.focus();
                            }
                        } else {
                            $(system.auth.param.standarPwd)[0].focus();
                        }
                        //如果有账户名的情况下，自动进行rds校验，避免点击登录按钮的时候重新校验，导致需要点2次按钮
                        if (that.checkAccount(that.logonId.val())) {
                            that.request();
                        }
                    }
                } catch (e) {
                    that.failCallback.call(that);
                }
                //页面加载到登录框可用时间
                try {
                    system.auth.instance.getTTI("FOCUS", new Date());
                } catch (e) {}
            }, 300);
            //输出账户名，则发送请求
            $(that.logonId).on("blur", function() {
                if (that.checkAccount(that.logonId.val())) {
                    that.request();
                } else {
                    //监控账户名输入错误的量，从main.js迁移到这里
                    that.sendSeed("accounterror");
                }
            });
        },
        //校验账户名
        checkAccount: function(acctname) {
            var that = this;
            acctname = acctname.replace(/^\s+|\s+$/g, "");
            acctname = acctname.replace(/[。．]/, ".");
            if (acctname.length === 0) {
                //为空的话blur不提示
                return false;
            } else if (acctname === that.logonId.attr("placeholder")) {
                //如果账户名等于placeholder的值，则不发请求，也不显示报错
                return false;
            } else if (acctname.length > 100) {
                that.showErrorBox(that.accountFormatError[1]);
                return false;
            } else if (!that.emailOrMobile(acctname)) {
                that.showErrorBox(that.accountFormatError[2]);
                return false;
            }
            return true;
        },
        /**
         * 在提交时确保表单中是否存在_form_token
         * 如果不存在的添加进去
         * 主要针对remoteTile方式调用
         */
        emailOrMobile: function(v) {
            var valid = false;
            //普通的邮箱校验
            if (/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(v)) {
                valid = true;
            } else if (/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+(\#[a-zA-Z0-9]{1,20})+$/.test(v)) {
                valid = true;
            } else if (/^1\d{10}$/.test(v)) {
                valid = true;
            } else if (/^(1\d{10})(\#[a-zA-Z0-9]{1,20})$/.test(v)) {
                valid = true;
            } else if (/^(00)?(886|853|852|82|81|65|60)[0-9]{8}$/.test(v)) {
                valid = true;
            } else if (/^(00)?(886|853|852|82|81|65|60)-?[0-9]{7,11}$/.test(v)) {
                valid = true;
            }
            return valid;
        },
        insertFormToken: function() {
            var formToken_ = this.formToken;
            if (formToken_.length < 1) {
                formToken_ = document.createElement("input");
                formToken_.setAttribute("type", "hidden");
                formToken_.name = "rds_form_token";
                formToken_.value = form_tk;
                this.form.appendChild(formToken_);
            }
        },
        /**
         * 判断是否支持控件
         * 不支持的化直接显示验证码
         */
        supportAliedit: function() {
            //return AlieditControl && (AlieditControl.src || AlieditControl.installedAliedit);
            return document.getElementsByName("J_aliedit_using")[0] && document.getElementsByName("J_aliedit_using")[0].value === "true";
        },
        /**
         * 表单提交切面
         * 在表单提交时判断是否发送过rds
         */
        submitAspect: function() {
            var submit_ = this.form.submit, that = this;
            this.form.submit = function() {
                that.insertFormToken();
                //                that.onSubmit && that.onSubmit.call(that);
                if (that.onSubmit) {
                    that.onSubmit.call(that);
                }
                that.formSubmit_ = submit_;
                //如果开启了账户名异步校验，校验正确了才提交
                //添加二维码标识
                var qrcodeState = $(system.auth.param.loginForm).attr("data-qrcode");
                if (!that.accountSwtich || that.accountSwtich && that.accountResult || qrcodeState === "true") {
                    //提交之前保存账户名
                    try {
                        system.auth.accountsaver.save(that.accountsaverKey);
                    } catch (e) {}
                    //点击了提交按钮
                    try {
                        $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", true);
                    } catch (e) {}
                    try {
                        submit_();
                    } catch (e) {
                        submit_.call(that.form);
                    }
                } else if (that.accountErrorCode) {
                    that.showErrorBox(that.accountTips[that.accountErrorCode]);
                    //点击了提交按钮
                    try {
                        $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                    } catch (e) {}
                } else if (that.accountValue === null) {
                    if (that.checkAccount(that.logonId.attr("value"))) {
                        that.request();
                    }
                    //点击了提交按钮
                    try {
                        $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                    } catch (e) {}
                } else {
                    //未知情况发埋点
                    that.sendSeed("onSubmit-others");
                    //点击了提交按钮
                    try {
                        $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                    } catch (e) {}
                }
            };
        },
        /**
         * 发送埋点
         * @param {String} str
         */
        sendSeed: function(str) {
            if (typeof Tracker !== "undefined") {
                Tracker.click(str);
            }
        },
        /**
         * 重置校验信息
         * 在发送新的一条json之前要重置一下。
         */
        reset: function() {
            this.formSubmit_ = null;
            this.accountValue = null;
            this.accountErrorCode = null;
            this.accountResult = false;
        },
        /**
         * 校验码存在的处理
         */
        showCheckCode: function() {
            this.codeCnt_.removeClass("fn-hide");
            //高度自适应
            try {
                if (system.auth.adjustheight.inited) {
                    system.auth.adjustheight();
                }
            } catch (err) {}
            //发送埋点,显示验证码的次数
            var sys = window.location.hostname.split(".")[0];
            this.sendSeed("authlogin-showCheckCode-" + sys);
        },
        /**
         * 隐藏校验码
         */
        hideCheckCode: function() {
            this.codeCnt_.addClass("fn-hide");
            //隐藏的同时将值清空，实时校验码结果也清空
            this.authcode.val("");
            //校验码icon现显示与否
            if ($("#J-checkcodeIcon").length > 0) {
                $("#J-checkcodeIcon").removeClass("sl-checkcode-err").removeClass("sl-checkcode-suc");
            }
            //高度自适应
            try {
                if (system.auth.adjustheight.inited) {
                    system.auth.adjustheight();
                }
            } catch (err) {}
        },
        /**
         * 发送请求判断是人还是机器
         * 考虑到remoteTile情况这里使用jsonp
         * @return {Object} isPerson true为人, false为机器
         */
        request: function() {
            var that = this;
            var errorType = that.errorBox.attr("errorType");
            //如果blur的时候，规则符合通过，如果和上次校验过的账户名一样，则清除报错。
            if (errorType === "0" && that.logonId.val() !== that.logonIdFirstValue) {
                that.hideErrorBox();
            }
            //如果blur的时候，从不符合规则到符合规则，但是就是上一个报错的信息，则显示报错信息，不是则清除。
            if (errorType === "1" && $.inArray(that.errorBox.find(".sl-error-text").html(), that.accountFormatError) !== -1) {
                if (that.accountErrorCode) {
                    that.showErrorBox(that.accountTips[that.accountErrorCode]);
                } else {
                    that.hideErrorBox();
                }
            }
            //如果上一次发送的账户信息和这次的值一样，就不发请求；
            if (that.logonId.val() === that.accountValue) {
                //判断当前的账户名是否为钱包用户，是的话则跳转到扫码
                var thumbState = $.inArray(this.accountValue, this.qrAccountThumb);
                if (thumbState >= 0) {
                    that.qrAccountLogin();
                }
                return false;
            }
            //如果当前报错信息是后端或者异步请求的错，则清除掉，如果是组件的错，不清除。
            if (errorType === "1") {
                that.hideErrorBox();
            }
            that.reset();
            that.accountValue = $.trim(that.logonId.val());
            //发送 Ajax 请求
            var currentData = {};
            if (that.accountInfoShow) {
                currentData = {
                    logonId: that.accountValue,
                    _json_token: form_tk,
                    json_ua: json_ua,
                    sceneCode: "AC1",
                    stamp: new Date().getTime(),
                    getUser: true
                };
            } else {
                currentData = {
                    logonId: that.accountValue,
                    _json_token: form_tk,
                    json_ua: json_ua,
                    sceneCode: "AC1",
                    stamp: new Date().getTime()
                };
            }
            $.ajax({
                type: "POST",
                url: "/login/verifyId.json",
                //url: 'http://authcenter.alipay.net/login/verifyId.json',
                data: currentData,
                dataType: "json",
                //dataType: "jsonp",
                timeout: that.timeout,
                //jsonp: "_callback",
                success: function(data) {
                    that.successCallback.call(that, data);
                },
                error: function() {
                    that.failCallback.call(that);
                    that.accountResult = true;
                }
            });
        },
        /**
         * rds成功回调
         * @param {Object} data 后台返回数据
         */
        successCallback: function(data) {
            //判断RDS状态，如果是人，设置变量为true。否则显示校验码，调用错误的回调函数
            if (data.isPerson === "true") {
                this.isPerson = true;
            } else {
                //显示验证码
                this.showCheckCode();
                //如果开启显示账户信息，则清空
                if (this.accountInfoShow) {
                    this.clearAccountInfo();
                }
                //识别为机器的时候，显示校验码的时候，需要把按钮恢复为可点击状态
                try {
                    $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                } catch (e) {}
                //                this.onFailCallback && this.onFailCallback.call(this, data);
                if (this.onFailCallback) {
                    this.onFailCallback.call(this, data);
                }
            }
            //对账户名状态进行判断
            if (this.accountSwtich) {
                if (!this.accountTips[data.checkResult]) {
                    this.accountResult = true;
                    //显示账户信息
                    if (this.accountInfoShow) {
                        //如果为Q账户，则不显示账户信息，提示去注册，但是可以登录
                        if (data.enabledStatus) {
                            if (data.enabledStatus === "T") {
                                this.showAccountInfo(data);
                            } else if (data.enabledStatus === "Q") {
                                this.clearAccountInfo();
                                clearTimeout(this.timer);
                                this.showErrorBox(this.accountTips["STATUS_NEED_ACTIVATE"]);
                            }
                        }
                    }
                } else {
                    clearTimeout(this.timer);
                    this.accountResult = false;
                    this.accountErrorCode = data.checkResult;
                    //如果开启显示账户信息，则清空
                    if (this.accountInfoShow) {
                        this.clearAccountInfo();
                    }
                    this.showErrorBox(this.accountTips[this.accountErrorCode]);
                }
            }
            //显示二维码登录
            if (this.needQrLogin) {
                if (data.isShowQRCode === "true") {
                    //临时存储当前会话过程中，已经通过实时校验的手机号码
                    var thumbState = $.inArray(this.accountValue, this.qrAccountThumb);
                    if (thumbState < 0) {
                        this.qrAccountThumb.push(this.accountValue);
                    }
                    //进行跳转到扫码区域
                    this.qrAccountLogin();
                }
            }
            //如果存在validator且账户名校验正确 说明已经提交表单那么直接提交
            if (this.formSubmit_ && this.isPerson && (!this.accountSwtich || this.accountSwtich && this.accountResult)) {
                //提交之前保存账户名
                try {
                    system.auth.accountsaver.save(this.accountsaverKey);
                } catch (e) {}
                try {
                    this.formSubmit_();
                } catch (e) {
                    this.formSubmit_.call(this.form);
                }
            }
            this.ajaxTarget = null;
        },
        /**
         * rds失败回调
         */
        failCallback: function() {
            this.showCheckCode();
            //rds校验失败的清空下，也需要让按钮可以点击
            try {
                $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
            } catch (e) {}
            if (this.onFailCallback) {
                this.onFailCallback.call(this, null);
            }
            this.ajaxTarget = null;
        },
        /**
         * 显示报错信息
         */
        showErrorBox: function(msg) {
            //如果不做异步账户名校验，也不会出现提示信息。
            if (this.isAlertType) {
                return false;
            }
            this.loginTitle.addClass("fn-hide");
            //这里不能使用jQuery的html()方法
            this.errorBox.find(".sl-error-text")[0].innerHTML = msg;
            this.errorBox.addClass("sl-error-display");
            this.errorBox.attr("errorType", "1");
            //高度自适应
            try {
                if (system.auth.adjustheight.inited) {
                    system.auth.adjustheight();
                }
            } catch (err) {}
            //当出现冻结的时候，处理扫码功能
            if (this.needQrLogin) {
                //处理样式
                if ($(".J-forQRLogin").length > 0) {
                    $(".J-forQRLogin").addClass("sl-error-link");
                }
                //绑定事件
                this.errorBox.delegate(".J-forQRLogin", "click", function(e) {
                    e.preventDefault();
                    system.auth.qrCode.show("false");
                });
            }
            if (this.onFailCallback) {
                this.onFailCallback.call(this, null);
            }
        },
        hideErrorBox: function() {
            //延迟0.5s去清除，避免出现误点的可能
            var that = this;
            clearTimeout(that.timer);
            that.timer = setTimeout(function() {
                that.errorBox.removeClass("sl-error-display");
                that.errorBox.find(".sl-error-text").html("");
                that.errorBox.attr("errorType", "");
                that.loginTitle.removeClass("fn-hide");
            }, 500);
            //高度自适应
            try {
                if (system.auth.adjustheight.inited) {
                    system.auth.adjustheight();
                }
            } catch (err) {}
        },
        /**
         * 显示账户信息
         */
        showAccountInfo: function(data) {
            //显示用户名和手机
            if (typeof data.realName !== "undefined" && typeof data.bindMobile !== "undefined") {
                $("#J-getAccount").removeClass("fn-hide");
                $("#J-getAccount-result").removeClass("fn-hide");
                $("#J-showRealName").html(data.realName);
                $("#J-showMobile").html(data.bindMobile);
            }
        },
        /**
         * 清空账户信息
         */
        clearAccountInfo: function() {
            $("#J-getAccount").addClass("fn-hide");
            $("#J-getAccount-result").addClass("fn-hide");
            $("#J-showRealName").html("");
            $("#J-showMobile").html("");
        },
        /**
         *  钱包用户仅能使用扫码登录
         */
        qrAccountLogin: function() {
            system.auth.qrCode.show("true");
            system.auth.accountsaver.clear();
            clearTimeout(this.timer);
            this.showErrorBox(this.accountTips["MOBILE_ACCOUNT_NEED_QRLOGON"]);
        }
    };
});

define("authcenter/login/1.1.3/js/module/switchaliedit-debug", [ "$-debug", "arale/tip/1.1.3/tip-debug", "arale/popup/1.1.1/popup-debug", "arale/overlay/1.1.1/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug" ], function(require) {
    /**
     *  @name       : switchaliedit.js
     *  @desc       : 1. 密码控件的切换功能
     *                2. 和 checkcode 有依赖，
     *                   当选择控件之后，能不能收起来，需要依赖于 RDS 的人机识别结果
     *  @example    : system.auth.switchaliedit();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    (function(p) {
        var $ = require("$-debug");
        var Tip = require("arale/tip/1.1.3/tip-debug");
        var show = function(o, style) {
            if (!o) {
                return false;
            }
            if (style) {
                o.style.display = style;
            } else {
                o.style.display = "block";
            }
        };
        var hide = function(o) {
            if (!o) {
                return false;
            }
            o.style.display = "none";
        };
        //tips 提示
        var alieditTip = new Tip({
            element: "#J-label-editer-pop",
            trigger: "#J-label-editer",
            pointPos: "50%+2"
        });
        var J_superSwitch = p.J_superSwitch ? p.J_superSwitch[0] : null, J_alieditPwd = p.J_alieditPwd ? p.J_alieditPwd[0] : null, J_standarPwd = p.J_standarPwd ? p.J_standarPwd[0] : null, standarPwd = p.standarPwd ? p.standarPwd[0] : null, safeSignCheck = p.safeSignCheck, J_safeSignCheck = p.J_safeSignCheck ? p.J_safeSignCheck[0] : null, J_isNoActiveX = p.J_isNoActiveX ? p.J_isNoActiveX : null, authcode = p.authcode ? p.authcode[0] : null, J_authcode = p.J_authcode ? p.J_authcode[0] : null, alieditUsing = p.alieditUsing;
        /**
         * 切换密码控件
         */
        system.auth.switchaliedit = function() {
            var isIE6 = (window.navigator.userAgent || "").toLowerCase().indexOf("msie 6") !== -1;
            if ($(J_safeSignCheck).length < 1 || $(J_superSwitch).length < 1 || $(J_isNoActiveX).length < 1) {
                return false;
            }
            /**
             *  @Description: 整个控件切换（校验码）流程梳理
             *  @Author: 展新
             *  @Create: 2013.11
             *  @Detail:
             *  【1】. 通过「J_superSwitch」来判断渲染的界面，值为「false」的时候需要走【2】，值为「true」的时候走【3】。
             *  【2】. 渲染普通的密码框 + 校验码。【End】
             *  【3】. 判断环境是否支持密码控件「alieditUsing」，值为「false」的时候走【2】，值为「true」的时候走【4】。
             *  【4】. 判断当前电脑是否已经安装了密码控件「alipay.security.edit.installed」，值为「false」的时候走【5】，值为「true」的时候走【8】。
             *  【5】. 判断是否使用普通密码框「J_isNoActiveX」，值为「true」的时候走【6】，值为「false」或者「其他」，走【7】。
             *  【6】. 渲染普通的密码框 + 校验码，同时可以切换控件功能。【End】
             *  【7】. 渲染未安装控件的密码框，同时可以切换控件功能。【End】
             *  【8】. 渲染加密输入框，同时不能切换选择控件功能。【End】
             *
             *  @Description: 「J_isNoActiveX」的控制
             *  @Detail:
             *  【1】. 默认进来，为空。
             *  【2】. 切换到普通输入框，值为「true」。
             *  【3】. 切换到加密输入框，值为「false」。
             */
            //【1】通过「J_superSwitch」来判断渲染的界面
            if ($(J_superSwitch).val() === "true") {
                //【3】判断环境是否支持密码控件「alieditUsing」
                if ($(alieditUsing).val() === "true") {
                    //切换到安全控件，这时候校验码的出现和隐藏，由checkcode来处理
                    var switchToSafe = function() {
                        $(J_isNoActiveX).val("false");
                        hide(J_standarPwd);
                        show(J_alieditPwd, "inline-block");
                        //更换 ICON 样式
                        $(safeSignCheck).removeClass("ui-icon-securityOFF").addClass("ui-icon-securityON");
                        if ($(J_authcode).length > 0) {
                            //如果用户名不可以编辑，则需要显示校验码
                            if (!!(document.getElementsByName("logonIdReadOnly")[0] && document.getElementsByName("logonIdReadOnly")[0].value === "true")) {
                                $(J_authcode).removeClass("fn-hide");
                                $(authcode).attr("data", "validate");
                            } else {
                                $(authcode).val("");
                                $(authcode).attr("data", "");
                                $(J_authcode).addClass("fn-hide");
                            }
                        }
                        //设置提示信息
                        alieditTip.set("content", "点此选择非密码控件登录");
                        //设置自动 focus
                        try {
                            if (system.auth.alieditAttrs.alieditPwd) {
                                system.auth.alieditAttrs.alieditPwd.focus();
                            }
                        } catch (e) {}
                    };
                    //切换到普通输入框
                    var switchToStandard = function() {
                        $(J_isNoActiveX).val("true");
                        //清空数据
                        $(standarPwd).val("");
                        hide(J_alieditPwd);
                        //居然要做 IE6 的兼容
                        if (isIE6) {
                            show(J_standarPwd, "block");
                        } else {
                            show(J_standarPwd, "inline-block");
                        }
                        //更换 ICON 样式
                        $(safeSignCheck).removeClass("ui-icon-securityON").addClass("ui-icon-securityOFF");
                        if ($(J_authcode).length > 0) {
                            $(J_authcode).removeClass("fn-hide");
                            $(authcode).attr("data", "validate");
                        }
                        //设置提示信息
                        alieditTip.set("content", "点此选择密码控件登录");
                        //设置自动 focus
                        try {
                            standarPwd.focus();
                        } catch (e) {}
                    };
                    //【4】判断当前电脑是否已经安装了密码控件
                    if (alipay.security.edit.installed) {
                        //【8】渲染加密输入框
                        switchToSafe();
                        //提示取消
                        alieditTip.set("disabled", true);
                        //同时不能切换选择控件功能
                        $(safeSignCheck).on("click", function(e) {
                            e.preventDefault();
                            try {
                                if (system.auth.alieditAttrs.alieditPwd) {
                                    system.auth.alieditAttrs.alieditPwd.focus();
                                }
                            } catch (e) {}
                        });
                    } else {
                        //【5】判断是否使用普通密码框「J_isNoActiveX」，后台会输出过来
                        if ($(J_isNoActiveX).val() === "true") {
                            //【6】渲染普通的密码框 + 校验码，同时可以切换控件功能
                            switchToStandard();
                        } else {
                            $(J_isNoActiveX).val("false");
                            //设置提示信息
                            alieditTip.set("content", "点此选择非密码控件登录");
                        }
                        //【7】渲染未安装控件的密码框，同时可以切换控件功能
                        $(safeSignCheck).on("click", function(e) {
                            e.preventDefault();
                            var target_ = e.target;
                            //切换密码框的安全模式
                            if ($(target_).hasClass("ui-icon-securityON")) {
                                switchToStandard();
                                //发布一个事件，告诉checkcode要选择非控件登录
                                try {
                                    $(system.auth.param.loginForm).trigger("SWITCH_ALIEDITER_EVENT", false);
                                } catch (e) {}
                            } else {
                                switchToSafe();
                                //发布一个事件，告诉checkcode要选择控件登录
                                try {
                                    $(system.auth.param.loginForm).trigger("SWITCH_ALIEDITER_EVENT", true);
                                } catch (e) {}
                            }
                            //高度自适应
                            try {
                                if (system.auth.adjustheight.inited) {
                                    system.auth.adjustheight();
                                }
                            } catch (err) {}
                        });
                    }
                } else if ($(alieditUsing).val() === "false") {
                    //【2】渲染普通的密码框 + 校验码。
                    $(J_isNoActiveX).val("false");
                    randerNormalPWD();
                }
            } else {
                //【2】渲染普通的密码框 + 校验码。
                $(J_isNoActiveX).val("true");
                randerNormalPWD();
            }
            //【2】渲染普通的密码框 + 校验码。
            function randerNormalPWD() {
                //不可切换无控件替换不需要绑定
                show(J_standarPwd, "inline-block");
                hide(J_alieditPwd, "inline-block");
                //显示校验码
                if ($(J_authcode).length > 0) {
                    $(authcode).attr("data", "validate");
                    $(J_authcode).removeClass("fn-hide");
                }
                //修改显示的图标
                $(safeSignCheck).removeClass("ui-icon-securityON").addClass("ui-icon-securityOFF");
                //点击图标自动聚焦到输入框
                $(safeSignCheck).on("click", function(e) {
                    e.preventDefault();
                    try {
                        if (system.auth.param.standarPwd) {
                            $(system.auth.param.standarPwd)[0].focus();
                        }
                    } catch (e) {}
                });
                //不显示提示
                alieditTip.set("disabled", true);
            }
        };
    })(system.auth.param);
});

define("authcenter/login/1.1.3/js/module/btnStyle-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : btnStyle.js
     *  @desc       : 1. 用于控制登录按钮的可否点击功能
     *                2. 提供是否使用这个功能
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.btnStyle = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
        if ($("#login").length < 1 || $("#J-login-btn").length < 1 || !this.isNeedSub) {
            return false;
        }
        this.bindEvent();
    };
    system.auth.btnStyle.prototype = {
        isNeedSub: false,
        defaultId: "#J-login-btn",
        defaultText: "登 录",
        disabledClass: "ui-button-disabled",
        disabledText: "正在进入...",
        bindEvent: function() {
            var that = this;
            if (!that.isNeedSub) {
                return false;
            }
            //捕获事件进行处理，这样做的好处是样式的操作在一个地方
            $(system.auth.param.loginForm).on("CLICK_SUBMIT_BUTTON_EVENT", function(e, value) {
                if (value) {
                    $(that.defaultId).addClass(that.disabledClass);
                    $(that.defaultId).val(that.disabledText);
                    $(that.defaultId).attr("disabled", "disabled");
                } else {
                    $(that.defaultId).removeClass(that.disabledClass);
                    $(that.defaultId).val(that.defaultText);
                    $(that.defaultId).removeAttr("disabled");
                }
            });
        }
    };
});

define("authcenter/login/1.1.3/js/module/validator-debug", [ "$-debug", "arale/validator/0.9.5/validator-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/placeholder/1.1.0/placeholder-debug" ], function(require) {
    /**
     *  @name       : validator.js
     *  @desc       : 1. 校验登录的表单
     *                2. 表单出错的自动 Focus 功能
     *                3. 出错提示分为两种，一种 Alert，一种是登录顶部
     *  @example    : system.auth.validator(options);
     *  @create     : 2013.08
     *  @auther     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    (function(p) {
        var $ = require("$-debug");
        var Validator = require("arale/validator/0.9.5/validator-debug");
        var standarPwd = p.standarPwd ? p.standarPwd[0] : null, alieditUsing = p.alieditUsing, J_isNoActiveX = p.J_isNoActiveX, loginForm = p.loginForm[0], password = p.password, loginTitle = $("#J-login-title"), errorBox = $("#J-errorBox"), pwdLabelDesc = $("#J-label-editer").attr("data-desc"), errorArray = [], isAlertType = false;
        Validator.addRule("emailOrMobile", function(options) {
            var element = $(options.element);
            var v = element.val();
            return system.auth.rule.emailOrMobile(v);
        });
        Validator.addRule("lenth4", function(options) {
            var element = $(options.element);
            var v = element.val();
            return v.length === 4;
        });
        Validator.setMessage({
            required: "请输入{{display}}",
            emailOrMobile: "支付宝账户是邮箱地址或手机号码。",
            lenth4: "验证码是4位字符"
        });
        system.auth.validator = function(options) {
            var config = options ? options : {};
            var Placeholder = require("arale/placeholder/1.1.0/placeholder-debug");
            //如果是alert类型的校验，需要传入alertType为true。默认是false。
            isAlertType = config.isAlertType === true ? true : false;
            function showErrorbox(msg, type) {
                if (!isAlertType) {
                    loginTitle.addClass("fn-hide");
                    errorBox.find(".sl-error-text").html(msg);
                    errorBox.addClass("sl-error-display");
                    errorBox.attr("errorType", type);
                } else {
                    alert(msg);
                }
            }
            function hideErrorbox() {
                loginTitle.removeClass("fn-hide");
                errorBox.removeClass("sl-error-display");
                errorBox.find(".sl-error-text").html("");
                errorBox.attr("errorType", "");
            }
            var validator;
            validator = system.auth.instance.validator = new Validator({
                element: "#login",
                explainClass: "ui-form-explain",
                autoFocus: false,
                triggerType: [],
                //表单校验之前做密码保存处理
                onFormValidate: function(element) {
                    var alieditAttrs_ = system.auth.alieditAttrs;
                    errorArray = [];
                    //                    p.account && p.account.val($.trim(p.account.val()));
                    if (p.account) {
                        p.account.val($.trim(p.account.val()));
                    }
                    //环境支持控件 && 使用控件登录 && 控件接口有
                    if (alieditUsing.value == "true" && $(J_isNoActiveX).val() === "false" && typeof alieditAttrs_.getPassword !== "undefined") {
                        var formItem = password.parent();
                        var value = password[0].value = alieditAttrs_.getPassword();
                        //校验之前重置报错信息
                        hideErrorbox();
                        try {
                            loginForm._seaside_gogo_.value = alieditAttrs_.getCi1();
                            if (alieditAttrs_.getCi2()) {
                                loginForm._seaside_gogo_p.value = alieditAttrs_.getCi2();
                            }
                        } catch (e) {}
                    } else if (standarPwd) {
                        password.val(standarPwd.value);
                    }
                },
                onItemValidated: function(error, message, element, event) {
                    var alieditAttrs_ = system.auth.alieditAttrs;
                    if (error) {
                        errorArray.push({
                            dom: element,
                            errorMsg: message
                        });
                        //发送密码错误相关埋点
                        if (element[0].name === "password") {
                            try {
                                var logsStr_ = [];
                                logsStr_.push("alieditUsing.value=" + (alieditUsing.value == "true"));
                                logsStr_.push("&alieditPwd=" + (alieditAttrs_.alieditPwd !== null));
                                logsStr_.push("&getPassword=" + (alieditAttrs_.getPassword() !== ""));
                                logsStr_.push("&standarPwd.value=" + (standarPwd.value !== ""));
                                system.auth.log("track", logsStr_.join(""));
                            } catch (e) {}
                        }
                    }
                },
                onFormValidated: function(error, results, element) {
                    var alieditAttrs_ = system.auth.alieditAttrs;
                    //如果校验成功
                    if (!error) {
                        //hacker IE
                        if ($("input[name=logonId]").length > 0) {
                            Placeholder.clear("input[name=logonId]");
                        }
                        if ($("input[name=checkCode]").length > 0) {
                            Placeholder.clear("input[name=checkCode]");
                        }
                        if ($("input[name=operatorNick]").length > 0) {
                            Placeholder.clear("input[name=operatorNick]");
                        }
                        //发布一次点击事件
                        try {
                            $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", true);
                        } catch (e) {}
                    }
                    //校验失败
                    if (error && errorArray.length > 0) {
                        if (isAlertType) {
                            alert(errorArray[0].errorMsg);
                        } else {
                            showErrorbox(errorArray[0].errorMsg, "2");
                        }
                        //点击按钮发布一个事件
                        try {
                            $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                        } catch (e) {}
                        //处理高度自适应
                        try {
                            if (system.auth.adjustheight.inited) {
                                system.auth.adjustheight();
                            }
                        } catch (e) {}
                        //报错后的focus处理
                        var el = errorArray[0].dom;
                        if (!el) {
                            return false;
                        }
                        //如果是密码没有输入，focus到输入框
                        if (el[0].name === "password") {
                            //环境支持控件 && 上次使用的是非控件登录 && 获取控件成功
                            if (alieditUsing.value == "true" && $(J_isNoActiveX).val() === "false" && typeof alieditAttrs_.getPassword() !== "undefined") {
                                if (alieditAttrs_.alieditPwd) {
                                    alieditAttrs_.alieditPwd.focus();
                                }
                            } else if (standarPwd) {
                                standarPwd.focus();
                            }
                        } else {
                            //应为有些时候 placeholder 会失效，所以得清除
                            try {
                                Placeholder.clear($(el));
                            } catch (e) {}
                            //延时 200ms 再 focus 到输入框，解决 IE 下 placeholder 不能清除的问题
                            setTimeout(function() {
                                el[0].focus();
                            }, 200);
                        }
                    }
                }
            });
            //账户名输入框校验
            if ($("input[name=logonId]").length > 0) {
                validator.addItem({
                    element: "[name=logonId]",
                    required: true,
                    rule: "emailOrMobile maxlength{max:100}",
                    display: "账户名",
                    skipHidden: true
                });
            }
            //密码隐藏域校验
            if ($("input[name=password]").length > 0) {
                validator.addItem({
                    element: "[name=password]",
                    required: true,
                    display: pwdLabelDesc ? pwdLabelDesc : "登录密码",
                    skipHidden: false
                });
            }
            //密码文本输入框校验
            if ($("input[name=password_input]").length > 0) {
                validator.addItem({
                    element: "[name=password_input]",
                    required: true,
                    display: "登录密码",
                    skipHidden: true
                });
            }
            //验证码校验框
            if ($("input[name=checkCode]").length > 0) {
                validator.addItem({
                    element: "[name=checkCode]",
                    display: "验证码",
                    required: true,
                    rule: "lenth4",
                    skipHidden: true
                });
            }
            //操作员输入框校验
            if ($("input[name=operatorNick]").length > 0) {
                validator.addItem({
                    element: "[name=operatorNick]",
                    display: "操作员登录名",
                    required: true,
                    skipHidden: true
                });
            }
            //在表单校验之前要做的事情
            validator.before("execute", function() {
                var alieditAttrs_ = system.auth.alieditAttrs;
                if (alieditUsing.value === "true" && $(J_isNoActiveX).val() === "false" && !alieditAttrs_.installedAliedit) {
                    alieditAttrs_.detectAliedit();
                    return false;
                }
                return true;
            });
        };
    })(system.auth.param);
});

define("authcenter/login/1.1.3/js/module/account-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : account.js
     *  @desc       : 1. 主要的功能用于对账户名的操作
     *                2. 点击图标的时候自动 focus 到输入框
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    $("#J-label-user").on("click", function(e) {
        e.preventDefault();
        if ($("#J-input-user").length > 0) {
            $("#J-input-user")[0].focus();
        }
    });
});

define("authcenter/login/1.1.3/js/module/accountsave-debug", [ "$-debug", "alipay/storex/1.0.1/storex-debug", "gallery/json/1.0.3/json-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "gallery/store/1.3.7/store-debug" ], function(require) {
    /**
     *  @name       : accountsave.js
     *  @desc       : 1. 账户名的存储
     *                2. 提供存储判断，添加、删除、当前存储状态
     *                3. 直接暴露出来。依赖 localStorage
     *  @example    : system.auth.accountsaver();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    var storex = require("alipay/storex/1.0.1/storex-debug");
    /**
     *  账户名保存
     */
    (function(account) {
        /**
         *  通用
         */
        system.auth.accountsaver = function(name) {
            name = name || "home-username";
            if (storex.status().enabled && account && account.val() === "") {
                var savedHomeName = storex.get(name);
                //只有存在用户名，并且该用户名符合校验规则
                if (savedHomeName && system.auth.rule.emailOrMobile(savedHomeName)) {
                    //把用户名读取出来
                    account.val(savedHomeName);
                    //将要删除的节点
                    var deleteDom = '<span class="sl-delect" seed="authcenter-account-delete"><i class="iconfont" title="删除">&#xF045;</i></span>';
                    //节点的操作
                    $(deleteDom).appendTo(account.parent()).hover(function() {
                        $(this).addClass("sl-delect-hover");
                    }, function() {
                        $(this).removeClass("sl-delect-hover");
                    });
                    $(account.parent()).delegate(".sl-delect", "click", function(e) {
                        e.preventDefault();
                        account.val("");
                        account.focus();
                        try {
                            storex.remove(name);
                        } catch (e) {}
                        $(this).remove();
                        system.auth.log("track", "closechacha");
                    });
                }
            }
        };
        /**
         *  保存当前用户名
         */
        system.auth.accountsaver.save = function(name) {
            name = name || "home-username";
            if (storex.status().enabled && account) {
                var v = $.trim(account.val());
                if (v) {
                    try {
                        storex.set(name, v);
                    } catch (e) {}
                }
            }
        };
        /*
         *  清空用户名
         */
        system.auth.accountsaver.clear = function() {
            if (account) {
                account.val("");
                var parent_ = account.parent();
                var deleteDom = $(parent_).find(".sl-delect");
                if (deleteDom.length > 0) {
                    $(deleteDom).remove();
                }
            }
        };
        /**
         *  用户名保存的状态
         */
        system.auth.accountsaver.status = function(name) {
            name = name || "home-username";
            if (storex.status().enabled && account) {
                var savedHomeName = storex.get(name);
                //只有存在用户名，并且该用户名符合校验规则
                if (savedHomeName && system.auth.rule.emailOrMobile(savedHomeName)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };
    })(system.auth.param.account);
});

define("authcenter/login/1.1.3/js/module/adjustheight-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : adjustheight.js
     *  @desc       : 高度自适应
     *  @example    : 1. 假如是 iframe 的话，父页面可以通过这样来修改高度
     *                  var adjustHeight = function(contentHeight,id){
     *                      $(id).css({
     *                          'height' : contentHeight+'px'
     *                      });
     *                  };
     *                2. 假如是本身页面，因为居中会对密码控件造成不定概率的丢失，所以不做这个功能
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    (function(p) {
        var login = p.loginForm, content = login.parent(), adjustSelf = function(outer, inner) {
            var diff = outer - inner;
            $(content).css({
                position: "absolute",
                top: diff > 0 ? (outer - inner) / 2 + "px" : 0
            });
        };
        system.auth.adjustheight = function() {
            //是否初始化，必须被调用一次
            system.auth.adjustheight.inited = true;
            setTimeout(function() {
                var containerHeight = document.body.offsetHeight, //body的高度。
                //修复UM高度问题，至少再加2px。
                contentHeight = content[0].offsetHeight + 2;
                //内容的高度。
                system.auth.log("debug", containerHeight + " " + contentHeight);
                try {
                    var loginFrame = window.frameElement;
                    // 获取引用该页面的iframe
                    if (loginFrame) {
                        if (parent.adjustHeight) {
                            // 如果父页面有adjustHeight方法，则先调用
                            parent.adjustHeight(contentHeight, loginFrame.id);
                            system.auth.log("debug", "adjustHeight");
                        } else if (contentHeight > loginFrame.offsetHeight) {
                            // 如果页面内容高于iframe，则设置iframe高度
                            loginFrame.height = contentHeight;
                            //同时要动态改变样式的高度，避免出现样式覆盖属性高度的情况;
                            loginFrame.style.height = contentHeight + "px";
                            system.auth.log("debug", "set iframe height " + contentHeight);
                        }
                    }
                } catch (err) {}
            }, 500);
        };
    })(system.auth.param);
});

define("authcenter/login/1.1.3/js/module/autocomplete-debug", [ "$-debug", "arale/autocomplete/1.2.2/autocomplete-debug", "arale/overlay/1.1.1/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/templatable/0.9.1/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug", "gallery/handlebars/1.0.2/runtime-debug", "alipay/object-shim/1.0.0/object-shim-debug" ], function(require) {
    /**
     *  @name       : autocomplete.js
     *  @desc       : 1. 账户名的自动提示功能
     *                2. 输出自动提示的时候，需要把密码控件给隐藏掉，解决穿透的问题
     *  @example    : new system.auth.autocomplete(options);
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    /**
     *  依赖的 autoComplete 组件
     */
    var $ = require("$-debug");
    var AutoComplete = require("arale/autocomplete/1.2.2/autocomplete-debug");
    var objShim = require("alipay/object-shim/1.0.0/object-shim-debug");
    /**
     *  账户名自动提示功能
     */
    system.auth.autoComplete = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
        this.init();
    };
    /**
     * 原型
     */
    system.auth.autoComplete.prototype = {
        //默认的数据
        defaultData: [ "qq.com", "163.com", "126.com", "189.cn", "sina.com", "hotmail.com", "gmail.com", "sohu.com", "21cn.com" ],
        //需要自动提示的账户名
        accountId: "#J-input-user",
        //初始化
        init: function() {
            var that = this;
            var classfix = "ui-autocomplete";
            if ($(".login-modern").length > 0) {
                classfix = "ui-autocomplete-modern";
            }
            var autoComplete = new AutoComplete({
                trigger: that.accountId,
                classPrefix: classfix,
                submitOnEnter: false,
                selectFirst: true,
                align: {
                    baseXY: [ 0, "100%-6px" ]
                },
                dataSource: function(query) {
                    //输入源去除@
                    query = query.replace(/^([^@]*)@.*$/, "$1");
                    //定义结果数据
                    var autoCompleteResult = [];
                    //如果只有数字，在第一条插入输入的数字
                    if (!query.match(/[^0-9]/)) {
                        autoCompleteResult.push(query);
                    }
                    //拼装数据源
                    for (var i in that.defaultData) {
                        var mail = i;
                        autoCompleteResult.push(query + "@" + that.defaultData[mail]);
                    }
                    return autoCompleteResult;
                },
                filter: function(data, query) {
                    //是否结果是空
                    var empty = false;
                    //定义最终展现数据
                    var result = [];
                    $.each(data, function(index, value) {
                        //如果输入的邮箱已经和结果中的某一项匹配了，就可以不展示下拉
                        if (query.indexOf("@") > -1 && value === query) {
                            empty = true;
                        } else if (value.indexOf(query) > -1) {
                            result.push({
                                matchKey: value
                            });
                        }
                    });
                    if (empty) {
                        return [];
                    } else {
                        return result;
                    }
                }
            }).render();
            objShim(autoComplete);
        }
    };
});

define("authcenter/login/1.1.3/js/module/proxyip-debug", [ "$-debug", "alipay/storex/1.0.1/storex-debug", "gallery/json/1.0.3/json-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "gallery/store/1.3.7/store-debug" ], function(require) {
    /**
     *  @name       : proxyip.js
     *  @desc       : 1. 读取本地 localStorage 的值获取 IP 信息
     *                2. 通过安全接口取的正确的 IP 信息
     *                3. 两者进行匹配，不一致则发送埋点
     *                4. 重置本地 localStorage 的 IP 信息，下次不一致继续发送
     *  @example    : system.auth.proxyid();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    var storex = require("alipay/storex/1.0.1/storex-debug");
    //获取控件的值
    var loadFormControl = function() {
        var alieditAttrs_ = system.auth.alieditAttrs;
        if (alieditAttrs_.alieditPwd) {
            try {
                return alieditAttrs_.getCi2();
            } catch (e) {
                return "";
            }
        }
        return "";
    };
    //发送监控值
    var sendFromControl = function(name, value) {
        if (Tracker) {
            Tracker.minInterval = 0;
            Tracker.click(name + ":" + value);
            Tracker.minInterval = 1e3;
        }
    };
    var init = function() {
        /**
         *  读取本地的 IP 地址进行匹配，如果 IP 不一致，说明使用了代理
         */
        if (storex.status().enabled) {
            var i = loadFormControl(), p = storex.get("p");
            if (i && p && p !== i) {
                storex.set("p", i);
                sendFromControl("p", i);
            }
        }
    };
    system.auth.proxyid = function() {
        setTimeout(init, 500);
    };
});

define("authcenter/login/1.1.3/js/module/ignoringSpaces-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : ignoreSpace.js
     *  @desc       : 1. 用于过滤输入框的前后空格
     *                2. 过滤空格的前后，都会发布一个事件到表单对象里面
     *  @example    : system.auth.ignoringSpaces($("#J-input-checkcode"));
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.ignoringSpaces = function(el) {
        var reg = /[ ]/g;
        //原先是 el && el.keyup()
        el.on("keyup", function(evt) {
            var nowValue = el.val();
            //{before}在keyup的时候，去空格之后发出事件,参数为当前input的值；
            $(system.auth.param.loginForm).trigger("IGNORINGSPACES_EVENT_BEFORE", nowValue);
            //{doing}当当前有空格的时候，去除空格并赋值
            if (nowValue.match(reg) !== null) {
                nowValue = nowValue.replace(reg, "");
                el.val(nowValue);
            }
            //{after}在keyup的时候，去空格之后发出事件,参数为当前input的值；
            $(system.auth.param.loginForm).trigger("IGNORINGSPACES_EVENT_AFTER", nowValue);
        });
    };
});

define("authcenter/login/1.1.3/js/module/refreshCheckCode-debug", [ "$-debug", "authcenter/login/1.1.3/js/util/uri-debug" ], function(require) {
    /**
     *  @name       : refreshCheckcode.js
     *  @desc       : 1. 主要的功能就是刷新图片校验码
     *                2. 同时发布一个事件，在 checkcode 中自动清除输入框内容及 focus
     *  @example    : system.auth.refreshCheckcode();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    require("authcenter/login/1.1.3/js/util/uri-debug");
    system.auth.refreshCheckCode = function() {
        //发布点击过后的事件
        var img = $("#J-checkcode-img");
        var s = img.attr("src"), p = system.auth.uri.getParams(s, true);
        p.t = new Date().getTime();
        img.attr("src", system.auth.uri.setParams(s, p));
        //清空校验码输入框
        system.auth.param.authcode.val("");
        //重置实时校验码，在刷新校验码的时候发出事件
        $(system.auth.param.loginForm).trigger("REFRESHCHECKCODE_EVENT_AFTER");
    };
});

define("authcenter/login/1.1.3/js/util/uri-debug", [ "$-debug" ], function(require, exports, module) {
    /**
     *  @name       : uri.js
     *  @desc       : 工具类 - 链接参数修改功能
     *                替换链接后面的参数，例如修改时间戳等
     *  @example    : var p = system.auth.uri.getParams(url, true);
     *                p.r = new Date().getTime();
     *                return system.auth.uri.setParams(url, p);
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    var _re_path = /^(http(s)?:\/\/)?[a-zA-Z.]*((\/)?[^?#]*)/, _re_search = /\?([^#]*)(#.*)?/, _re_hostptc = /(https|http)\:\/\/((\w+|\.)+)/, _re_hostnoptc = /(\w+|\.)+/, _re_portnoptc = /^https|^http\:\/\/(\w+|\.)+(\:\d+)/, _re_portptc = /(\w+|\.)+(\:\d+)/;
    system.auth.uri = function() {};
    /**
     * 获取url中path部分
     * @param {string} url 处理的url
     * @example
     * var url  = 'http://www.alipay.com/user/getUser.json';
     */
    system.auth.uri.getPath = function(url) {
        if (_re_path.test(url)) {
            var path = /^(http(s)?:\/\/)?[a-zA-Z.]*(:\d*)?((\/)?[^?#]*)/.exec(url)[4];
            if (path) {
                return path;
            }
            return "/";
        } else {
            return null;
        }
    };
    /**
     * 获取url端口
     * @param {string} url 处理的url
     * @example
     * var url  = 'http://www.alipay.com:8080';
     * @return {string}
     */
    system.auth.uri.getPort = function(url) {
        if (/\:(\d+)/.test(url)) {
            return /\:(\d+)/.exec(url)[1];
        }
        return "80";
    };
    /**
     * 设置或返回当前 URL 的主机名和端口
     * @param {string} url 处理的url
     * @param {boolean} [nonedefaultport] 是否需要返回80端口
     * @example
     * var url  = 'http://www.alipay.com:8080';
     * var port = arale.uri.getHost(url); // return 'www.alipay.com:8080'
     * var url  = 'http://www.alipay.com';
     * var port = arale.uri.getHost(url); // return 'www.alipay.com:80'
     * @return {string}
     */
    system.auth.uri.getHost = function(url, nonedefaultport) {
        var hostname = system.auth.uri.getHostName(url);
        var port = system.auth.uri.getPort(url);
        if (nonedefaultport && port == "80") {
            return hostname;
        } else {
            return hostname + ":" + port;
        }
    };
    /**
     * 设置或返回当前 URL 的主机名
     * @param {string} url 处理的url
     * @example
     * var url  = 'http://www.alipay.com';
     * var hostname = arale.uri.getProtocol(url); // return 'www.alipay.com'
     * @return {string}
     */
    system.auth.uri.getHostName = function(url) {
        if (_re_hostptc.test(url)) {
            return _re_hostptc.exec(url)[2];
        }
        if (_re_hostnoptc.test(url)) {
            return _re_hostnoptc.exec(url)[0];
        }
        return null;
    };
    /**
     * 获取协议类型
     * @param {string} url 处理的url
     * @param {boolean} [nonedefaultport] 是否需要返回80端口
     * @example
     * var url  = 'http://www.alipay.com';
     * var protocol = arale.uri.getProtocol(url); // return 'http'
     * var url  = 'https://www.alipay.com';
     * var protocol = arale.uri.getProtocol(url); // return 'https'
     * @return {string}
     */
    system.auth.uri.getProtocol = function(url) {
        var reg1 = /^http|^https/, reg2 = /^http\:|^https\:/;
        if (reg1.test(url)) {
            return reg2.exec(url)[0].replace(":", "");
        }
        return null;
    };
    /**
     * 获取url的请求参数
     * @param {string} url 处理的url
     * @param {boolean} [isobject] 是否以object的格式返回
     * @example
     * var url  = 'http://www.alipay.com?name=fackweb&live=hangzhou';
     * arale.uri.getParams(url); // return 'name=fackweb&live=hangzhou'
     * arale.uri.getParams(url); // return {name:'fackweb', live:'hangzhou'}
     * @return {string | Object}
     */
    system.auth.uri.getParams = function(url, isobject) {
        var result = {}, params = _re_search.exec(url);
        if (params && params.length && params.length >= 2) {
            params = params[1].split("&");
            for (var p; p = params.shift(); ) {
                if (p.split("=").length > 1) {
                    result[p.split("=")[0]] = p.split("=")[1];
                }
            }
            if (isobject) {
                return result;
            } else {
                return system.auth.uri.toQueryString(result);
            }
        }
        if (isobject) {
            return {};
        } else {
            return null;
        }
    };
    /**
     * 获取当前url的hash
     * @param {string} url 要处理的url
     * @example
     * 当前url 如果为'http://www.alipay.com?name=fackweb&live=hangzhou#abcd';
     * arale.uri.getHash(); // return 'abcd'
     * @return {string}
     */
    system.auth.uri.getHash = function(url) {
        var h = url || window.location.hash;
        if (h.charAt(0) == "#") {
            h = h.substring(1);
        } else if (h.lastIndexOf("#") > -1) {
            h = h.substring(h.lastIndexOf("#") + 1);
        }
        return $.browser.mozilla ? h : decodeURIComponent(h);
    };
    /**
     * 设置url请求参数
     * @param {string} url 需要处理的url。
     * @param {object} data 需要设置的url参数。
     * @example
     * var url = 'http://www.alipay.com?buyid=123&product_id=321';
     * var params = {'pname':'shoues','pice':334};
     * url = arale.uri.setParams(url,params);
     * @return {string}
     */
    system.auth.uri.setParams = function(url, data) {
        var params = system.auth.uri.getParams(url, true), o, params_array = [];
        if (typeof data == "object") {
            for (o in data) {
                params[o] = data[o];
            }
        }
        for (o in params) {
            params_array.push(o + "=" + params[o]);
        }
        if (system.auth.uri.getProtocol(url)) {
            var protocol = system.auth.uri.getProtocol(url) + "://";
        } else {
            var protocol = "";
        }
        return protocol + system.auth.uri.getHost(url, true) + system.auth.uri.getPath(url) + "?" + params_array.join("&");
    };
    /**
     * 将对象转化为 URLString
     */
    system.auth.uri.toQueryString = function(options) {
        var queryString = [];
        $.each(options, function(key, value) {
            queryString.push(key + "=" + value);
        });
        return queryString.join("&");
    };
});

define("authcenter/login/1.1.3/js/module/realtimeCheckcode-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : realtimeCheckcode.js
     *  @desc       : 1. 图片校验码的实时校验功能
     *                2. 默认只提供给一个 session 会话期间校验 5 次
     *                3. 校验不能通过，则提交不了表单
     *  @example    : new system.auth.realtimeCheckcode();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    /**
     *  实时校验码
     */
    system.auth.realtimeCheckcode = function(options) {
        this.init();
        for (var i in options) {
            this[i] = options[i];
        }
        if (this.form && this.form.length < 1 || this.checkcode && this.checkcode.length < 1 || this.checkcodeIcon && this.checkcodeIcon.length < 1) {
            return false;
        }
        this.bindEvent();
        this.submitAspect();
    };
    system.auth.realtimeCheckcode.prototype = {
        //表单
        form: null,
        //checkcodeServer地址
        checkcodeServer: "verifyCheckCode.json",
        //验证码的DOM
        checkcode: null,
        //验证码的验证信息的DOM
        checkcodeIcon: null,
        //结果变量
        result: false,
        //统计发送请求的次数
        count: 0,
        //统计错误的次数
        errorCount: 0,
        //设置超时时间
        timeout: 2e3,
        //设置实时校验码超时时间为9分钟（保险起见，实时校验码的失效时间比session少1分钟）:
        invalidTime: 1e3 * 60 * 9,
        //记录初始化时间:
        initialTime: new Date().getTime(),
        //标识当前页面停留时间:
        nowTime: null,
        //判断是否超时:
        isInvalid: false,
        //标识此时是否在校验,如果用户点击刷新，则阻断上次校验；
        isChecking: false,
        //标识当前已经校验过的数据,避免用户输入4位数后继续点击键盘重复校验相同值；
        nowValue: null,
        //表单提交的方法,这个变量同时标识当前用户是否点击过提交按钮
        formSubmit_: null,
        //成功的ICON的DOM
        sucDOM: '<i class="iconfont" title="成功">&#xF049;</i>',
        //失败的ICON的DOM
        errDOM: '<i class="iconfont" title="出错">&#xF045;</i>',
        //初始化事件,赋予变量值
        init: function() {
            this.form = $("#login") && $("#login")[0];
            this.checkcode = $("#J-input-checkcode");
            this.checkcodeIcon = $("#J-checkcodeIcon");
            if ($("input[name=idPrefix]").length > 0) {
                this.idPrefixValue = $("input[name=idPrefix]").val();
            }
        },
        //异步请求的方法
        request: function(value) {
            var that = this;
            //发起请求之前先重置一次；
            that.checkReset();
            that.count++;
            that.nowTime = new Date().getTime();
            //判断当前是否页面停留时间超过10分钟，如果超过10分钟，则失效，不进行实时校验
            that.isInvalid = that.nowTime - that.initialTime > that.invalidTime ? true : false;
            //如果请求数超过5次的话，不再去发请求 ||如果当前时间超过10分钟，也不再去发请求
            if (that.count > 5 || that.isInvalid) {
                return false;
            }
            //标识用户当前在发送实时校验码校验;
            that.isChecking = true;
            //用户当前进行校验的值;
            that.nowValue = value;
            $.ajax({
                type: "POST",
                url: that.checkcodeServer,
                //url: 'http://authcenter.alipay.net/login/verifyCheckCode.json',
                data: {
                    checkCode: value,
                    idPrefix: that.idPrefixValue,
                    timestamp: new Date().getTime()
                },
                dataType: "json",
                //dataType: "jsonp",
                timeout: that.timeout,
                //jsonp: "_callback",
                success: function(data) {
                    that.successCallback.call(that, data);
                },
                error: function() {
                    that.failureCallback();
                }
            });
        },
        //结果有返回的时候
        successCallback: function(data) {
            //如果此时用户已经点击刷新校验码，则阻止此次返回的结果显示；
            if (!this.isChecking) {
                return false;
            }
            if (data.checkResult === null) {
                this.checkTimeout();
            } else {
                if (data.checkResult === "true") {
                    //返回结果正确，且用户已经点击过提交，则直接提交表单，并且显示正确的图标;
                    if (this.formSubmit_) {
                        this.submitForm();
                    }
                    //返回结果正确，但是用户没有点击过提交，则显示正确的图标，同时标识结果为正确;
                    this.checkcodeIcon.addClass("sl-checkcode-suc");
                    $(this.sucDOM).appendTo(this.checkcodeIcon);
                    this.result = true;
                } else {
                    //记录用户失败的次数
                    this.errorCount++;
                    //返回结果错误，显示错误的图标，并且focus到验证码框
                    this.checkcodeIcon.addClass("sl-checkcode-err");
                    $(this.errDOM).appendTo(this.checkcodeIcon);
                    this.checkcode[0].focus();
                    this.result = false;
                    this.formSubmit_ = null;
                    system.auth.log("track", "realtimeCheckcode_errorCount_" + this.errorCount);
                }
            }
        },
        //结果超时或者接口挂了的时候
        failureCallback: function() {
            //如果此时用户已经点击刷新校验码，则阻止此次返回的结果显示
            if (!this.isChecking) {
                return false;
            }
            //结果超时或者接口挂了，如果此时用户已经点击提交，则直接提交
            if (this.formSubmit_) {
                this.submitForm();
            } else {
                //结果超时或者接口挂了，用户没有点击提交，则标识结果为正确（允许用户点击提交的时候直接提交表单)
                this.checkTimeout();
            }
            //统计记录接口超时或者挂了
            system.auth.log("track", "realtimeCheckcode_serverFailure");
        },
        //接口超时或者接口不可用的情况下,默认都为true，防止因为实时校验码影响到登录功能
        checkTimeout: function() {
            this.result = true;
        },
        //重置实时校验码的功能,标识校验码结果为false,同时标识用户没有点击过提交按钮
        checkReset: function() {
            this.checkcodeIcon.removeClass("sl-checkcode-err");
            this.checkcodeIcon.removeClass("sl-checkcode-suc");
            this.checkcodeIcon.empty();
            this.result = false;
            this.formSubmit_ = null;
            //当校验码没有返回的时候用户点击刷新验证码，则标识用户没有在校验
            this.isChecking = false;
            //清空用户用于校验的值
            this.nowValue = null;
        },
        //提交表单切面
        submitAspect: function() {
            var submit_ = this.form.submit;
            var that = this;
            this.form.submit = function() {
                that.formSubmit_ = submit_;
                //提交之前先判断当前是否有验证码，如果没有验证码功能则直接提交表单
                var qrcodeState = $(system.auth.param.loginForm).attr("data-qrcode");
                if ($("#J-checkcode").hasClass("fn-hide") || qrcodeState === "true") {
                    that.submitForm();
                } else {
                    //先判断是否已经校验过5次,校验过5次之后不再去校验,直接提交表单 || 判断页面是否超时，如果超时也提交
                    if (that.count > 5 || that.isInvalid) {
                        that.submitForm();
                    } else if (that.result) {
                        //判断实时校验码标识的结果
                        that.submitForm();
                    } else {
                        //如果当前用户没有进行实时校验（当输入第四位的keyup的同时blur掉，则不会执行keyup事件），点击登录，会去发一次校验；
                        if (that.checkcode.val() !== that.nowValue) {
                            that.request(that.checkcode.val());
                        } else {
                            //标识符为false，focus验证码框;
                            that.checkcode[0].focus();
                            //查看当前是否已经出现了关闭，如果出现了用户还点击登录，则触发埋点;
                            if (that.checkcodeIcon.hasClass("sl-checkcode-err")) {
                                system.auth.log("track", "realtimeCheckcode_X");
                            }
                        }
                        //发布一次点击事件，让按钮恢复可以点击
                        try {
                            $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", false);
                        } catch (e) {}
                    }
                }
            };
        },
        //直接提交表单的方法，方法会先判断用户是否有点击过提交表单的按钮，没点击过不会提交
        submitForm: function() {
            var submit_ = this.formSubmit_;
            if (!submit_) {
                return false;
            }
            //发布一次点击按钮事件
            try {
                $(system.auth.param.loginForm).trigger("CLICK_SUBMIT_BUTTON_EVENT", true);
            } catch (e) {}
            try {
                submit_();
            } catch (e) {
                submit_.call(this.form);
            }
        },
        //监听去空格逻辑中发出来的事件，在去空格之后判断输入验证码的长度
        bindEvent: function() {
            var that = this;
            //监听去空格后发出的事件
            $(system.auth.param.loginForm).on("IGNORINGSPACES_EVENT_AFTER", function(e, value) {
                /*
                 *如果验证码输入到达4位且点击不是回车，则发请求。回车在验证码上的作用仅是提交表单，避免发送重复的请求；
                 *如果验证码输入长度小于4位，重置实时校验码功能;
                 *如果用户选中了语音校验码，则不发实时校验功能;
                 */
                if (value.length < 4) {
                    that.checkReset();
                } else if (value.length === 4) {
                    if (that.checkcode.attr("data-type") && that.checkcode.attr("data-type") === "VOICE") {
                        that.result = true;
                        return true;
                    }
                    //如果当前用户进行校验的值和上一个值相同，则不校验,避免出现用户输满4个字符后点击键盘其他字符发起的重复校验
                    if (value !== that.nowValue) {
                        that.request(value);
                    }
                }
            });
            $(system.auth.param.loginForm).on("REFRESHCHECKCODE_EVENT_AFTER", function() {
                //重置实时校验码
                that.checkReset();
            });
        }
    };
});

define("authcenter/login/1.1.3/js/module/voiceCheckcode-debug", [ "$-debug", "arale/tip/1.1.3/tip-debug", "arale/popup/1.1.1/popup-debug", "arale/overlay/1.1.1/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug" ], function(require) {
    /**
     *  @name       : voiceCheckcode.js
     *  @desc       : 1. 语音校验码功能
     *                2. IE6 - bgsound
     *                   IE7/8/9 - embed
     *                   safari/chrome/firefox - audio
     *                3. 语音校验码不做实时校验
     *  @example    : new system.auth.voiceCheckcode();
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    var Tip = require("arale/tip/1.1.3/tip-debug");
    //tips 提示
    if ($("#J-label-checkcode-pop").length > 0) {
        var checkCodeTip = new Tip({
            element: "#J-label-checkcode-pop",
            trigger: "#J-label-checkcode",
            pointPos: "50%+2"
        });
    } else {
        //没有该节点的时候，点击则自动focus到输入框
        $("#J-label-checkcode").on("click", function(e) {
            e.preventDefault();
            $("#J-input-checkcode")[0].focus();
        });
    }
    system.auth.voiceCheckcode = function(options) {
        this.init();
        for (var i in options) {
            this[i] = options[i];
        }
        if (!this.checkcodeInput || !this.switchCheckCode || !this.checkCodeIMG || !this.checkCodeVOICE || !this.voiceUrl || this.voiceUrl === "") {
            return false;
        }
        //由于safari下对https的语音播放有兼容性问题，所以safari下不支持语音校验码
        if (/version\/\d+\.\d+(?:\.[ab\d]+)? safari\//.test(navigator.userAgent.toLowerCase())) {
            if (checkCodeTip) {
                checkCodeTip.set("disabled", true);
                $("#J-label-checkcode").on("click", function(e) {
                    e.preventDefault();
                    $("#J-input-checkcode")[0].focus();
                });
            }
            return false;
        }
        //监听输入框事件
        this.bindEvent();
    };
    system.auth.voiceCheckcode.prototype = {
        //验证码的 DOM
        checkcodeInput: null,
        //验证码的切换
        switchCheckCode: null,
        //图片校验码 DOM
        checkCodeIMG: null,
        //语音校验码 DOM
        checkCodeVOICE: null,
        //语音校验码进度背景
        voicePressBg: null,
        //语音校验码显示文案
        voicePressTxt: null,
        //输入框校验节点 ICON
        checkcodeIcon: null,
        //语音校验码 URL
        voiceUrl: null,
        //初始化事件，赋予变量值
        init: function() {
            this.checkcodeInput = $("#J-input-checkcode");
            this.switchCheckCode = $("#J-switchCheckcode");
            this.checkCodeIMG = $("#J-checkcode-img");
            this.checkCodeVOICE = $("#J-checkcode-voice");
            this.voicePressBg = $("#J-checkcode-voice-bg");
            this.voicePressTxt = $("#J-checkcode-voice-txt");
            this.checkcodeIcon = $("#J-checkcodeIcon");
            //获取语音链接
            if (this.checkCodeVOICE.length > 0) {
                this.voiceUrl = this.checkCodeVOICE.attr("data-src");
            }
        },
        //清除输入框的值
        checkReset: function() {
            //清空校验码输入框
            this.checkcodeInput.val("");
            //重置实时校验码，在刷新校验码的时候发出事件
            $(system.auth.param.loginForm).trigger("REFRESHCHECKCODE_EVENT_AFTER");
            this.checkcodeInput[0].focus();
        },
        //语音标签处理
        voiceHtml: function() {
            var voiceDom;
            //是否为 IE6
            var isOldIE = (window.navigator.userAgent || "").toLowerCase().indexOf("msie 6") !== -1;
            //是否为 IE
            var isIE = (window.navigator.userAgent || "").toLowerCase().indexOf("msie") !== -1;
            //语音标签探针
            try {
                voiceDom = "Audio" in window && new Audio().canPlayType("audio/x-wav;") ? function() {
                    return "<audio autoplay hidden id='J-bgsound'></audio>";
                } : isOldIE ? function() {
                    return "<bgsound id='J-bgsound' >";
                } : function() {
                    return "<embed id='J-bgsound'" + (isIE ? " type='application/x-mplayer2'" : " type='audio/x-wav'") + " autostart='true' hidden='true' />";
                };
            } catch (e) {
                //使用老标签
                voiceDom = isOldIE ? function() {
                    return "<bgsound id='J-bgsound' >";
                } : function() {
                    return "<embed id='J-bgsound'" + (isIE ? " type='application/x-mplayer2'" : " type='audio/x-wav'") + " autostart='true' hidden='true' />";
                };
                //探寻出问题，发送log
                system.auth.log("track", "voickCheckcode - " + e);
            }
            //返回语音dom结构
            return voiceDom();
        },
        //绑定事件
        bindEvent: function() {
            var that = this;
            //选择图片
            function switchToImg() {
                that.switchCheckCode.removeClass("ui-icon-checkcodeV").addClass("ui-icon-checkcodeT");
                checkCodeTip.set("content", "点此选择语音验证码");
                //切换DOM结构
                that.checkCodeIMG.removeClass("fn-hide");
                that.checkCodeVOICE.addClass("fn-hide");
                //切换标志位
                if (that.checkcodeInput.attr("data-type")) {
                    that.checkcodeInput.attr("data-type", "IMAGE");
                }
            }
            //选择语音
            function switchToVoice() {
                that.switchCheckCode.removeClass("ui-icon-checkcodeT").addClass("ui-icon-checkcodeV");
                checkCodeTip.set("content", "点此选择图片验证码");
                //切换DOM结构
                that.checkCodeIMG.addClass("fn-hide");
                that.checkCodeVOICE.removeClass("fn-hide");
                //切换标志位
                if (that.checkcodeInput.attr("data-type")) {
                    that.checkcodeInput.attr("data-type", "VOICE");
                }
            }
            //切换不同的验证码
            that.switchCheckCode.on("click", function(e) {
                e.preventDefault();
                var target_ = e.target;
                //重置输入框
                that.checkReset();
                if ($(target_).hasClass("ui-icon-checkcodeT")) {
                    switchToVoice();
                    that.playVoice();
                } else {
                    switchToImg();
                    that.stopPlayVoice();
                    that.voicePressBg.css({
                        width: "0%"
                    });
                }
            });
            that.checkCodeVOICE.on("click", function(e) {
                e.preventDefault();
                //清除输入的内容
                that.checkReset();
                //刷新语音校验码
                that.refreshVoice();
            });
        },
        playVoice: function() {
            var that = this;
            if ($("#J-bgsound").length < 1) {
                var player = null;
                if ((window.navigator.userAgent || "").toLowerCase().indexOf("msie 6") !== -1) {
                    player = document.createElement("bgsound");
                    player.id = "J-bgsound";
                } else {
                    player = $(that.voiceHtml());
                }
                //将语音标签动态插入到body里面
                $(player).appendTo($(document.body));
            }
            //获取语音并播放
            $("#J-bgsound").attr("src", that.getVoiceUrl());
            if (that.audioSupport) {
                $("#J-bgsound")[0].pause();
                $("#J-bgsound")[0].play();
                //进度条显示
                var media = document.getElementById("J-bgsound");
                //播放中
                media.addEventListener("timeupdate", function() {
                    if (!this.duration || this.duration === Infinity) {
                        that.playVoiceProcess(-1);
                    } else {
                        that.playVoiceProcess(parseInt(100 * this.currentTime / this.duration, 10));
                    }
                });
                //播放结束
                media.addEventListener("ended", function() {
                    that.playVoiceProcess(100);
                });
            } else {
                that.playVoiceProcess("NOPROCESS");
            }
        },
        //取的语音的链接地址
        getVoiceUrl: function() {
            var p = system.auth.uri.getParams(this.voiceUrl, true);
            p.r = new Date().getTime();
            return system.auth.uri.setParams(this.voiceUrl, p);
        },
        //刷新语音校验码
        refreshVoice: function() {
            if (this.audioSupport) {
                $("#J-bgsound").attr("src", this.getVoiceUrl());
                $("#J-bgsound")[0].pause();
                $("#J-bgsound")[0].play();
            } else {
                this.stopPlayVoice();
                this.playVoice();
            }
        },
        //删除或者停止播放
        stopPlayVoice: function() {
            var media = $("#J-bgsound");
            if (this.audioSupport) {
                media[0].pause();
                try {
                    media.attr("src", "");
                } catch (e) {}
            } else {
                try {
                    $("#J-bgsound").attr("src", "");
                    $("#J-bgsound").remove();
                } catch (e) {
                    system.auth.log("track", "voickCheckcode_stop - " + e);
                }
            }
        },
        //是否支持 audio
        audioSupport: function() {
            try {
                return "Audio" in window && new Audio().canPlayType("audio/x-wav");
            } catch (p) {
                return false;
            }
        }(),
        //语音播放进度
        playVoiceProcess: function(rate) {
            switch (rate) {
              case -1:
                this.voicePressTxt.html('<i class="ui-icon ui-icon-voicing" title="声音"></i>播放中...');
                break;

              case 100:
              case "NOPROCESS":
                this.voicePressTxt.html('<i class="ui-icon ui-icon-loading" title="加载中"></i>重新播放');
                this.voicePressBg.css({
                    width: "0%"
                });
                break;

              default:
                this.voicePressTxt.html('<i class="ui-icon ui-icon-voicing" title="声音"></i>播放中...');
                this.voicePressBg.css({
                    width: rate + "%"
                });
                break;
            }
        }
    };
});

define("authcenter/login/1.1.3/js/module/alilogin-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : alilogin.js
     *  @desc       : 1. 主要的功能用于阿里统一ID账户的使用
     *                2. 通过 Ajax 获取用户的登录状态，定时替换
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    system.auth.aliLogin = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
        if (this.autoLogin) {
            this.loginTokenRequest();
        } else {
            if (!!(this.formCont_ && this.loginDom && this.loginNameDom && this.havanaSsoUrl)) {
                this.init();
            } else {
                this.showFormDom();
            }
        }
    };
    system.auth.aliLogin.prototype = {
        //表单所在的容器，页面初始化的时候要隐藏这个容器
        formCont_: $("#login"),
        //显示帐户的domid
        loginDom: $("#J-ssoLogin"),
        //显示账户名字的spanid
        loginNameDom: $("#J-ssoLogin-name"),
        //显示账户名的公司icon
        loginIconDom: $("#J-ssoLogin-icon"),
        //提交登录的按钮ID
        loginBtn: $("#J-ssoLogin-btn"),
        //切换表单显示的按钮
        changeBtn: $("#J-ssoLogin-change"),
        //请求帐户名的地址
        havanaSsoUrl: null,
        //标识信任登录的地址
        authTokenServer: "havana_trust_login.htm",
        //标识请求帐户名的超时时间
        timeout: 1e3,
        //标识请求回来的token值
        tokenValue: "",
        //token只能请求一次，标识当前是否已经请求过，这时候会把按钮灰掉
        isTokenRequested: false,
        //标识是否是首页的登录框，首页的登录框特殊性在于，刚开始的时候是把整个iframe隐藏起来的，所以在请求账户成功返回/超时/失败都要调用首页显示方法，将iframe显示出来。
        isHomePage: false,
        //是否调用过首页的显示方法，调用过一次之后就不再调用
        isHomePageShowed: false,
        //标识当前的site为支付宝（1）
        siteValue: 1,
        //标识是否不去请求账户名，直接登录
        autoLogin: false,
        //标识登录来源
        site: null,
        //goto地址
        gotoUrl: "",
        //二维码强势侵入
        isShowQRLogin: false,
        //集团返回site对应的每个子公司的icon
        companyList: {
            company_0: "taobao",
            company_3: "cbu",
            company_4: "icbu",
            company_6: "aliyun",
            company_7: "aliyunOS",
            company_8: "aliyun",
            company_9: "aliyun",
            company_10: "taobao"
        },
        init: function() {
            this.blindEvent();
            this.loginNameRequest();
        },
        /**
         *  用来标记当前是否有qr码的状态
         */
        qrSign: function(type) {
            if (type === "true") {
                this.loginDom.attr("data-hide", "true");
            } else {
                this.loginDom.attr("data-hide", "false");
            }
        },
        blindEvent: function() {
            var that = this;
            this.changeBtn.click(function(e) {
                e.preventDefault();
                that.showFormDom();
                that.qrSign("true");
            });
            this.loginBtn.click(function(e) {
                e.preventDefault();
                if (!that.isTokenRequested) {
                    that.loginTokenRequest();
                    that.isTokenRequested = true;
                    //替换样式
                    that.loginBtn.text("正在进入...");
                    that.loginBtn.addClass("ui-button-disabled");
                    //隐藏返回链接
                    that.changeBtn.addClass("fn-hide");
                }
            });
        },
        //获取输入框值
        getInputValue: function(name) {
            if (document.getElementsByName(name)[0]) {
                return document.getElementsByName(name)[0].value;
            } else {
                return "";
            }
        },
        //发起阿里账户状态获取的请求
        loginNameRequest: function() {
            var that = this;
            $.ajax({
                type: "POST",
                url: that.havanaSsoUrl + "/api/havana_top.js",
                data: {
                    //标记当前是支付宝的请求
                    site: that.siteValue,
                    //标记只需要一条数据
                    single: true
                },
                dataType: "jsonp",
                timeout: that.timeout,
                jsonp: "callback",
                charset: "UTF-8",
                success: function(data) {
                    that.loginNameSuccessCallback(data);
                    that.loginDom.attr("data-state", "finished");
                },
                error: function() {
                    that.loginNameFailureCallback();
                    system.auth.log("track", "aliLogin_request_token_failure");
                    that.loginDom.attr("data-state", "error");
                }
            });
        },
        //获取阿里账户成功
        loginNameSuccessCallback: function(msg) {
            //潜规则：集团返回的data是一个数组，我们取数组的第一个对象。
            //判断条件：code为200，site有且不为1，账户名不全是空格。
            if (!!(msg.code === 200 && msg.data && msg.data[0] && typeof msg.data[0].site === "number" && msg.data[0].site !== 1 && system.auth.util.trimAll(msg.data[0].loginId) !== "")) {
                this.showLoginMsgDom(msg.data[0].site, msg.data[0].loginId);
                if (this.isHomePage) {
                    this.showHomePage();
                }
            } else {
                this.loginNameFailureCallback();
            }
        },
        //获取阿里账户失败
        loginNameFailureCallback: function() {
            this.showFormDom();
            if (this.isHomePage) {
                this.showHomePage();
            }
        },
        //显示阿里账户登录的 DOM 结构
        showLoginMsgDom: function(companyId, loginName) {
            if (this.companyList["company_" + companyId]) {
                this.loginIconDom.addClass("icon-sso-" + this.companyList["company_" + companyId]);
            }
            this.loginNameDom.html(system.auth.util.limitEmail(loginName));
            //二维码强势侵入
            if (this.isShowQRLogin) {
                this.qrSign("false");
            }
            this.loginDom.removeClass("fn-hide");
            this.formCont_.addClass("fn-hide");
            //外部接口
            if (this.onLoginMsgShow) {
                this.onLoginMsgShow.call(this, loginName);
            }
        },
        //显示默认的表单
        showFormDom: function() {
            //二维码强势侵入，默认就不展示普通登录框了
            if (this.isShowQRLogin) {
                this.qrSign("true");
            }
            this.formCont_.removeClass("fn-hide");
            this.loginDom.addClass("fn-hide");
            //外部接口
            if (this.onFormShow) {
                this.onFormShow.call(this);
            }
        },
        //展示首页的时候，需要高度自适应
        showHomePage: function() {
            if (!this.isHomePageShowed && system.auth.crossIframe) {
                system.auth.crossIframe();
            }
        },
        //获取 token 的接口函数
        loginTokenRequest: function() {
            //如果还没有获取 token
            if (!this.isTokenRequested) {
                var that = this;
                var formSitevalue = that.getInputValue("site");
                that.isTokenRequested = true;
                that.tokenValue = "";
                var jsonData = {};
                if (formSitevalue !== "") {
                    jsonData = {
                        site: that.siteValue,
                        formSite: formSitevalue
                    };
                } else {
                    jsonData = {
                        site: that.siteValue
                    };
                }
                $.ajax({
                    type: "POST",
                    url: that.havanaSsoUrl + "/mini_login_check.js",
                    data: jsonData,
                    dataType: "jsonp",
                    timeout: that.timeout,
                    jsonp: "callback",
                    success: function(data) {
                        that.loginTokenSuccessCallback(data);
                    },
                    error: function() {
                        that.loginTokenFailureCallback();
                        system.auth.log("track", "aliLogin_request_token_failure");
                    }
                });
            }
        },
        //获取 token 成功
        loginTokenSuccessCallback: function(msg) {
            if (msg.code === 200 && msg.data && msg.data.st !== null && msg.data.st.length > 0) {
                this.tokenValue = msg.data.st;
            } else {
                system.auth.log("track", "aliLogin_request_token_dataError");
            }
            this.jumpPage();
        },
        //获取 token 失败
        loginTokenFailureCallback: function() {
            this.jumpPage();
        },
        //页面跳转
        jumpPage: function() {
            try {
                var page = this.authTokenServer + "?token=" + this.tokenValue + "&goto=" + encodeURIComponent(this.getInputValue("goto")) + "&sso_hid=" + this.getInputValue("sso_hid") + "&autoLogin=" + this.autoLogin + "&site=" + this.getInputValue("site");
                if (this.isHomePage) {
                    window.parent.location = page;
                } else {
                    window.location = page;
                }
            } catch (e) {
                this.showFormDom();
            }
        }
    };
});

define("authcenter/login/1.1.3/js/scene/alipay-debug", [ "$-debug" ], function(require) {
    /**
     *  @name       : alipay.js
     *  @desc       : 支付宝场景交互
     *  @example    :
     *  @create     : 2013.08
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    (function(p) {
        var authcode = p.authcode, standarPwd = p.standarPwd, password = p.password;
        system.auth.alipay = function(idPrefix) {
            //清除账户
            system.auth.accountsaver.clear();
            system.auth.accountsaver(idPrefix);
            //清除密码
            $(standarPwd).val("");
            $(password).val("");
            //清空验证码
            if ($(authcode).length > 0) {
                $(authcode).val("");
            }
        };
    })(system.auth.param);
});

define("authcenter/login/1.1.3/js/module/indexBg-debug", [ "$-debug" ], function(require) {
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

define("authcenter/login/1.1.3/js/module/qrcode-debug", [ "$-debug", "alipay/storex/1.0.1/storex-debug", "gallery/json/1.0.3/json-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "gallery/store/1.3.7/store-debug" ], function(require) {
    /**
     *  @name       : qrcode.js
     *  @desc       : 1. 用于二维码扫码登录
     *  @example    :
     *  @create     : 2013.11
     *  @author     : 展新 < zhanxin.info@gmail.com >
     */
    "use strict";
    var $ = require("$-debug");
    var storex = require("alipay/storex/1.0.1/storex-debug");
    system.auth.qrCode = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
        if ($("#J-qrcode-target").length < 1 || $("#J-qrcode").length < 1 || $("#J-loginFormMethod").length < 1) {
            return false;
        }
        this.init();
    };
    system.auth.qrCode.show = function(state) {
        /**
         *  给外部调用的接口
         *  state 为是否需要提示内容
         */
        $("#J-input-user").focus();
        //将焦点移出控件，否则焦点在框里的时候隐藏会让控件不可用
        $("#J-login").addClass("fn-hide");
        $("#J-qrcode").removeClass("fn-hide");
        if ($("#J-ssoLogin").length > 0) {
            $("#J-ssoLogin").addClass("fn-hide");
        }
        $("#J-qrcode-target").removeClass("qrcode-target-show").addClass("qrcode-target-hide");
        $("#J-qrcode-target").attr("title", "返回");
        $("#J-qrcode-target").attr("seed", "authcenter-qrhide");
        $("#J-loginFormMethod").val("qrCodeLogin");
        //显示提示内容
        if (state === "true") {
            var showTips = setTimeout(function() {
                $("#J-qrcode-tips").addClass("qrcode-tips-show");
                $("#J-qrcode-tips").html("钱包注册用户仅限扫码登录");
            }, 100);
            var hideTips = setTimeout(function() {
                $("#J-qrcode-tips").removeClass("qrcode-tips-show");
                $("#J-qrcode-tips").html("");
            }, 8e3);
        }
        //强制不出现提示
        if (state === "false") {
            $("#J-qrcode-tips").addClass("fn-hide");
        }
        //开始轮询
        if (window.light && light.page && light.page.products && light.page.products.barcode) {
            light.page.products.barcode.start();
        }
    };
    system.auth.qrCode.prototype = {
        target: $("#J-qrcode-target"),
        toggleClassName: "fn-hide",
        formId: $("#J-login"),
        qrId: $("#J-qrcode"),
        qrTitle: "#J-qrcode-title",
        qrErrorBox: "#J-qrcode-errorBox",
        qrImage: "#J-qrcode-img",
        qrIntro: "#J-qrcode-intro",
        qrMethod: "#J-loginFormMethod",
        /**
         *  用于设置是否默认显示上一次的登录状态
         */
        showDefault: true,
        /**
         *  如果页面中有需要使用 SSO 登录的场景，就需要增加这个参数
         */
        hasSSOLogin: false,
        showQR: function() {
            if (this.hasSSOLogin) {
                $("#J-ssoLogin").addClass(this.toggleClassName);
                $(this.formId).addClass(this.toggleClassName);
            } else {
                $(this.formId).addClass(this.toggleClassName);
            }
            $(this.qrId).removeClass(this.toggleClassName);
            $(this.target).removeClass("qrcode-target-show").addClass("qrcode-target-hide");
            $(this.target).attr("title", "返回");
            $(this.target).attr("seed", "authcenter-qrhide");
            $(this.qrMethod).val("qrCodeLogin");
            $("#J-qrcode-tips").removeClass("fn-hide");
            //开始轮询
            if (window.light && light.page && light.page.products && light.page.products.barcode) {
                light.page.products.barcode.start();
            }
        },
        hideQR: function() {
            if (this.hasSSOLogin) {
                var ssoData = $("#J-ssoLogin").attr("data-hide");
                ssoData = $.trim(ssoData);
                if (ssoData === "true") {
                    $(this.formId).removeClass(this.toggleClassName);
                } else {
                    $("#J-ssoLogin").removeClass(this.toggleClassName);
                }
            } else {
                $(this.formId).removeClass(this.toggleClassName);
            }
            $(this.qrId).addClass(this.toggleClassName);
            $(this.target).removeClass("qrcode-target-hide").addClass("qrcode-target-show");
            $(this.target).attr("title", "扫码登录");
            $(this.target).attr("seed", "authcenter-qrshow");
            $(this.qrMethod).val("");
            if (window.light && light.page && light.page.products && light.page.products.barcode) {
                light.page.products.barcode.onready(function() {
                    this.stop();
                });
            }
            this.clearQRState();
        },
        /**
         *  当通过扫码登录的时候，记录下扫码的状态
         */
        saveQRState: function() {
            if (storex.status().enabled) {
                storex.set("qrLogin", "true");
            }
        },
        /**
         *  读取扫码登录状态，并做操作
         */
        readQRState: function() {
            var that = this;
            if (storex.status().enabled) {
                var state = storex.get("qrLogin");
                //自动切换到扫码
                if (!!state) {
                    //TODO 自动切换到扫码模式
                    if (that.hasSSOLogin) {
                        checkSSOState();
                    } else {
                        system.auth.qrCode.show("false");
                    }
                }
            }
            function checkSSOState() {
                var tryTime = 0;
                var getSSOStateInterval = setInterval(function() {
                    var ssoStateData = $("#J-ssoLogin").attr("data-state");
                    if (ssoStateData !== "start") {
                        //通过这个值来判断显示
                        var ssoData = $("#J-ssoLogin").attr("data-hide");
                        if (ssoData === "true") {
                            system.auth.qrCode.show("false");
                        }
                        clearInterval(getSSOStateInterval);
                    } else {
                        tryTime++;
                        if (tryTime > 4) {
                            clearInterval(getSSOStateInterval);
                        }
                    }
                }, 200);
            }
        },
        /**
         *  清除扫码登录状态
         */
        clearQRState: function() {
            if (storex.status().enabled) {
                var state = storex.get("qrLogin");
                if (!!state) {
                    try {
                        storex.remove("qrLogin");
                    } catch (e) {}
                }
            }
        },
        bindEvent: function() {
            var that = this;
            /**
             *  切换扫码登录
             */
            $(that.target).on("click", function(e) {
                e.preventDefault();
                var target_ = e.target;
                if (that.hasSSOLogin) {
                    var ssoStateData = $("#J-ssoLogin").attr("data-state");
                    if (ssoStateData !== "start") {
                        if ($(target_).hasClass("qrcode-target-show")) {
                            that.showQR();
                        } else {
                            that.hideQR();
                        }
                    }
                } else {
                    if ($(target_).hasClass("qrcode-target-show")) {
                        that.showQR();
                    } else {
                        that.hideQR();
                    }
                }
            });
            /**
             *  显示提示内容
             */
            $("#J-qrcode-gethelp").hover(function() {
                $(that.qrImage).css({
                    display: "none"
                });
                $(that.qrIntro).addClass("qrcode-detail-intro-show");
            }, function() {
                $(that.qrImage).css({
                    display: "block"
                });
                $(that.qrIntro).removeClass("qrcode-detail-intro-show");
            });
            if ($("#J-qrcode-errorBox").hasClass("sl-error-display")) {
                setTimeout(function() {
                    $(that.qrTitle).removeClass("fn-hide");
                    $(that.qrErrorBox).removeClass("sl-error-display");
                    $(that.qrErrorBox).find(".sl-error-text")[0].innerHTML = "";
                    $(that.qrErrorBox).attr("errorType", "1");
                }, 3e3);
            }
            $(system.auth.param.loginForm).on("GREEN_WAY_ROF_QRCODE", function() {
                $(system.auth.param.loginForm).attr("data-qrcode", "true");
            });
            light.ready(function() {
                if (window.light && light.page && light.page.products && light.page.products.barcode) {
                    //关闭轮询
                    light.page.products.barcode.onready(function() {
                        if ($(that.target).hasClass("qrcode-target-show")) {
                            this.stop();
                        }
                    });
                    //添加二维码标识
                    $(system.auth.param.loginForm).attr("data-qrcode", "false");
                    //完成骚扫码工作
                    light.page.products.barcode.onConfirm(function() {
                        $(system.auth.param.loginForm).trigger("GREEN_WAY_ROF_QRCODE");
                        that.saveQRState();
                        document.getElementById("login").submit();
                    });
                }
            });
        },
        init: function() {
            this.bindEvent();
            if (this.showDefault) {
                this.readQRState();
            }
        }
    };
});
