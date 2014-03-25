/**
 * @name araleConfig
 * @namespace
 * Arale页面全局配置项
 */
//TODO这样有问题就是araleConfig不能只设置其中的部分,要么全提供,要么不提供
var _baseAraleConfig =
/** @lends araleConfig */
{
    /**
     * 是否开启debug模式
     * @type Boolean
     */
    debug: false,
    /**
     * combo 服务路径
     * @type String
     */
    combo_path: '/min/?b=ar&f=',
    css_combo_path: '/min/?b=al&f=',
    /**
     * combo 服务器地址
     * @type String
     */
    combo_host: 'localhost',
    /**
     * 静态js存放路径
     * @type String
     */
    module_path: '/arale-trunk',
    /**
     * 多语言设置
     * @type String
     */
    locale: 'zh-cn',
    /**
     * combo服务等待js队列的时间
     * @type String
     */
    waitTime: 100,
    /**
     * 在初始化的时候是否默认加载arale.corex
     * @type String
     */
    corex: false,
    /**
     * 是否依赖的是源文件,方便调试 
     * @type String
     */
	depSrc: false
};
if (window['araleConfig']) {
    //mixin
    (function() {
        for (var _name in _baseAraleConfig) {
            if (_baseAraleConfig.hasOwnProperty(_name) && !araleConfig.hasOwnProperty(_name)) {
                araleConfig[_name] = _baseAraleConfig[_name];
            }
        }
    }());
} else {
    var araleConfig = _baseAraleConfig;
}

/**
 * @name arale
 * @namespace
 * 顶层命名空间，包含在整个arale框架中常用到的功能函数
 */
var arale = arale || {
    /**
     * 是否开启debug模式
     * @type Boolean
     */
    debug: araleConfig.debug || false,
    /**
     * 是否依赖的是源文件,方便调试 
     * @type String
     */
	depSrc: araleConfig.depSrc || false,
    /**
     * 临时存储，所有临时存储的数据都应该放入该对象中
     * @type Object
     */
    cache: {},
    /**
     * 配置项
     * @type Object
     */
    env: {
        /**
         * combo服务器地址
         * @memberOf arale
         * @type String
         */
        combo_host: araleConfig.combo_host,
        /**
         * combo服务路径
         * @memberOf arale
         * @type String
         */
		combo_path: araleConfig.combo_path,

		css_combo_path: araleConfig.css_combo_path,
        /**
         * 语言设置
         * @memberOf arale
         * @type Object
         */
        locale: araleConfig.locale
    },
    registerCoboPath: function(comboPath) {
        arale.env.combo_path = comboPath;
    },
    registerComboHost: function(moduleHost) {
        arale.env.combo_host = moduleHost;
    },
    getComboPath: function() {
        return this.getComboHost() + arale.env.combo_path;
	},
	getCssComboPath: function() {
        if(araleConfig.__tmp) {
            if (this.getComboHost().indexOf('assets') > -1) {
                return this.getCssComboHost() + '/??';
            } else {
                return this.getCssComboHost() + '/min/?f=';
            }
        }
        return this.getCssComboHost() + arale.env.css_combo_path;
    },
    /**
     * 获取combo_host
     */
    getComboHost: function() {
        var env = arale.env;
        if (env.combo_host.indexOf('http') == -1) {
            env.combo_host = location.protocol + '//' + env.combo_host;
        }
        return env.combo_host;
    },
    /**
     * 获取当前的css_combo_host    
     * @return string 当前的csscombohost
     */
    getCssComboHost: function() {
        return this.getComboHost();
    },

    /**
     * 获取执行中未抛异常的函数返回值，否则为null
     * @param {Function} arguments fn[, fn, fn, fn, ...].
     * @example
     * var e = arale.$try(function() {
     *      throw('error');
     * }, function() {
     *      return 'pass';
     * }); //return 'pass'
     * @returns {mixed|null}
     */
    $try: function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
            try {
                return arguments[i]();
            } catch (e) {}
        }
        return null;
    },
    /**
     * 对传入的object的prototype进行扩展
     * @example
     * arale.implement(Array,{
     *      test: function() {
     *          alert('test');
     *      }
     * });
     * @return {void}
     */
    implement: function(objects, properties) {
        if (!arale.isArray(objects)) {
            objects = [objects];
        }
        for (var i = 0, l = objects.length; i < l; i++) {
            for (var p in properties) {
                objects[i].prototype[p] = properties[p];
            }
        }
    },
    /**
     * 模块注册方法，
     * 该方法用于注册模块信息
     * @param {string} namespace
     * @param {object} root
     * @return {void}
     */
    namespace: function(namespace, root) {
        var parts = namespace.split('.'),
            current = root || window;
        //创建命名空间
        if (!(parts[0] in window)) {
            window[parts[0]] = {};
        }
        for (var part; parts.length && (part = parts.shift());) {
              if (!current[part]) {
                current[part] = {};
              }
            //因为我们有时候需要混入对象的时候,只有得到父类的才能混入
            current[part]._parentModule || (current[part]._parentModule = current);
            //自己本身module所对应的key
            current = current[part];
            current._moduleName = part;
        }
        return current;
    },
    /**
     * 由命名空间解析为对象
     * @param {string} ns
     * @return {void}
     */
    parseNamespace: function(ns) {
        var arr = ns.split('.'),
            obj;
        for (var i = 0; i < arr.length; i++) {
            obj = arr[i];
        }
    },
    /**
     *生成一个Module
     * @param {String} module 模块的名称
     * @param {Function || Object } obj 一个对象,或者一个可执行的函数,这个函数需要返回一个对象
     * @param {String} alias 别名
     * @return {void}
     * Example
     * 我们传递进来的obj支持三种形式
     * 1.{fn: function() {}}  //对象的字面形式
     * 2.function() {//code  return {fn: function() {}}} //一个可执行并返回一个字面常量的对象
     * 3.function() {//code  return function() {}} //一个可执行并返回一个函数
     */
    module: function(module, obj, alias) {
        var current = this.namespace(module), root = window;
        if (arale.isFunction(obj)) {
            obj = obj.call(arale, obj);
        }
        if (arale.isFunction(obj)) {
            alias && (root[alias] = obj);
            current._parentModule[current._moduleName] = obj;
        }else {
            arale._mixin(current, obj);
            if (!root[alias]) {
                root[alias] = {};
            }
            alias && (arale._mixin(root[alias], obj));
        }
    },
     /**
     * 把一个对象混入到另外一个对象中
     * @name mixin
     * @param {Object} target 要被混入的对象
     * @param {Object } 需要混入的对象
     * @param {boolean} override 是否要覆盖原有存在的属性
     * @return {Object}
     * Example
     * var obj1 = arale._mixin({name:'alipay'},{name:'arale'});
     * //obj1.name == 'alipay'
       * var obj1 = arale._mixin({name:'alipay'},{name:'arale'},true);
     * //obj1.name == 'arale'
     */
    _mixin: function(target, src, override) {
        if (!target) {
            target = {};
        }
        for (var name in src) {
            if (src.hasOwnProperty(name)) {
                if ((target[name] == undefined) || override) {
                    target[name] = src[name];
                }
            }
        }
        return target;
    },
    extend: function(obj) {
        var temp = function() {};
        temp.prototype = obj;
        return new temp();
    },
    inherits: function(childCtor, parentCtor) {
      function tempCtor() {};
      tempCtor.prototype = parentCtor.prototype;
      childCtor.superClass = parentCtor.prototype;
      childCtor.superCouns = parentCtor;
      childCtor.prototype = new tempCtor();
      childCtor.prototype.constructor = childCtor;
    },
    augment: function(receivingClass, obj) {
        for (methodName in obj) {
            if (obj.hasOwnProperty(methodName)) {
                if (!receivingClass.prototype.hasOwnProperty(methodName)) {
                     receivingClass.prototype[methodName] = obj[methodName];
                }
            }
        }
    },
    dblPrototype: function(obj, init) {
        var Middle = function() {
        };
        Middle.prototype = obj;
        var First = function() {
            if (init) {
                init.apply(this, arguments);
            }
            this[0] = arguments[0];
        };
        First.prototype = new Middle();
        return First;
    },
    /**
     * 获取类型值
     * @param {String} value 需要获取的值
     * @example
     * arale.typeof([]) //return Array
     * @returns {String}
     */
    typeOf: function(value) {
      var s = typeof value;
      if (s == 'object') {
        if (value) {
          if (value instanceof Array ||
             (!(value instanceof Object) &&
             (Object.prototype.toString.call((value)) == '[object Array]') ||
             typeof value.length == 'number' &&
             typeof value.splice != 'undefined' &&
             typeof value.propertyIsEnumerable != 'undefined' &&
             !value.propertyIsEnumerable('splice'))) {
                return 'array';
          }
          if (!(value instanceof Object) &&
              (Object.prototype.toString.call((value)) == '[object Function]' ||
              typeof value.call != 'undefined' &&
              typeof value.propertyIsEnumerable != 'undefined' &&
              !value.propertyIsEnumerable('call'))) {
            return 'function';
          }
        } else {
          return 'null';
        }
      } else if (s == 'function' && typeof value.call == 'undefined') {
        return 'object';
      }
      return s;
    },
    /**
     * 判断值是否为undefined
     * @param {*} val 需要测试的值
     * @returns {Boolean}
     */
    isUndefined: function(val) {
        return typeof val === 'undefined';
    },
    /**
     * 判断值是否为null
     * @param {*} val 需要检测的值
     * @returns {Boolean}
     */
    isNull: function(val) {
        return val === null;
    },
    /**
     * 是否为函数类型
     * @param {*} val 任何值
     * @returns {Boolean}
     */
    isFunction: function(val) {
        return arale.typeOf(val) == 'function';
    },
    /**
     * 是否为数组类型
     * @param {*} val 任何值
     * @returns {Boolean}
     */
    isArray: function(val) {
        return arale.typeOf(val) == 'array';
    },
    /**
     * 是否为整型
     * @param {*} val 任何值
     * @returns {Boolean}
     */
    isNumber: function(val) {
        return arale.typeOf(val) == 'number';
    },
    /**
     * 是否为字符串
     * @param {*} val 目标字符串
     * @returns {Boolean}
     */
    isString: function(val) {
        return arale.typeOf(val) == 'string';
    },
    /**
     * 是否为字符串
     * @param {*} val 任何值
     * @returns {Boolean}
     */
    isObject: function(val) {
        var type = arale.typeOf(val);
        return type == 'object' || type == 'array' || type == 'function';
    },
    /**
     * 是否为日期类型
     * @param {*} val 任何值
     * @returns {Boolean}
     */
    isDate: function(val) {
        return arale.isObject(val) && arale.isFunction(val.getMonth);
    },
    /**
     * 判断给定对象是否为原生对象，以避免污染
     * @param {Object} ufo 对象传入
     * @returns {Boolean}
     * @example
     * arale.isNativeObject((new Date)) //return true
     */
    isNativeObject: function(ufo) {
        return (arale.isString(ufo) ||
                arale.isObject(ufo) ||
                arale.isFunction(ufo) ||
                arale.isDate(ufo));
    },
    /**
     * 数组取出重复项
     * @param {array} arr 数组
     * @returns {Array}
     * @example
     * arale.unique([1, 1, 2, 3]); //return [1,2,3]
     */
    unique: function(arr) {
        if (arr.constructor !== Array) {
            arale.error('type error: ' + arr + ' must be an Array!');
        }
        var r = new Array();
        o: for (var i = 0, n = arr.length; i < n; i++)
        {
            for (var x = 0, y = r.length; x < y; x++)
            {
                if (r[x] == arr[i])
                {
                    continue o;
                }
            }
            r[r.length] = arr[i];
        }
        return r;
    },
    /**
     * 生成某一个区间的随机数
     * @param {Number} min 最小数
     * @param {Number} max 最大数
     * @example
     * arale.$random(1, 10);
     * @returns {Number}
     */
    $random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    error: function(str) {
        arale.log('error:' + str);
    },
    /**
     * 执行script
     * @example
     * arale.exec('this is a example<script>alert(1);</script>')
     * @retruns {String}
     */
    exec: function(text) {
        if (!text) return text;
        if (window.execScript) {
            window.execScript(text);
        } else {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script[(arale.browser.Engine.webkit && arale.browser.Engine.ver < 420) ? 'innerText' : 'text'] = text;
            document.getElementsByTagName('head')[0].appendChild(script);
            document.getElementsByTagName('head')[0].removeChild(script);
        }
        return text;
    },
    /**
     * 返回一个只能在我们给定scope中执行的函数，这个函数可以让我们方便的使用在和this相关的一些callback,成员函数中
     * @param {Object} scope 函数执行的scope.
     * @param {Function || String} method 一个需要被绑定scope的函数,或者一个对象中某个需要和这个对象绑定的方法.
     * @example
     * arlea.hitch(foo, 'bar')();
     * retuns foo.bar() 返回的这个bar函数，是运行在foo中的
     * var foo = {
     *   name:'alipay'
     * }
     * arlea.hitch(foo,function() {console.log(this.name)})(); //alipay
     * @returns {Function}
     */
    hitch: function(scope, method) {
        if (!method) {
            method = scope;
            scope = null;
        }
        if (arale.isString(method)) {
            scope = scope || window;
            if (!scope[method]) { throw (['arlea.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
            return function() { return scope[method].apply(scope, arguments || []); }; // Function
        }
        return !scope ? method : function() { return method.apply(scope, arguments || []); }; // Function
    },
    now: function() {
        return (new Date()).getTime();
    },
    /**
     * 到服务器记录错误信息
     * @param {String} sev 错误的级别.
     * @param {String} msg 错误的信息.
     * @example
     * try{
     *        //logic
     *    catch(e) {
     *        arale.logError("error",e.message);
     *    }
     * @returns {String}
     */
    logError: function(sev, msg) {
        var img = new Image();
        //TODO 设置全局error url
        img.src = 'sev=' + encodeURIComponent(sev) + '&msg=' + encodeURIComponent(msg);
    },
    log: function() {
        if (araleConfig.debug && ('console' in window)) {
            console.log.apply(console, arguments);
        }
    },
    getUniqueId: function(str) {
        var id = arale.getUniqueId._id || 1;
        arale.getUniqueId._id = ++id;
        return (str) ? str + id : id;
    },
    getModulePath: function(path) {
        return araleConfig.module_path + '/' + path;
	},
	/**
	 * arale.array
	 */
	each: function(obj, callback, bind){       
        var isObject = arale.typeOf(obj) === 'object', key;
        if(isObject) {
			for(key in obj) {
				if (this.obj.hasOwnProperty(key)){
					callback.call(bind, key, obj[key]);
				}
            }
        } else {
			if (Array.prototype.forEach) {
				return [].forEach.call(obj, callback, bind);
			}
			for (var i = 0, len = obj.length; i < len; i++) {
				callback.call(bind, obj[i], i, obj);
			}
       }
   	},
   	checkVersion: function(version) {
		return;
    	if(version != arale.version) {
        	throw new Error("core version disaccord.[runtime is "+arale.verison + ", dependency is " + version);
   		}
	}
};
/**
 * 通过给定开始值和结束值创建数组
 * @memberOf arale
 * @example
 * range ( 0, 12 ); //return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
 * range( 0, 100, 10 ); //return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
 * range( 'a', 'i' ); //return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
 * range( 'c', 'a' ); //return ['c', 'b', 'a']
 */
arale.range = function(start, end, step) {
    var matrix = [];
    var inival, endval, plus;
    var walker = step || 1;
    var chars = false;
    if (!isNaN(start) && !isNaN(end)) {
        inival = start;
        endval = end;
    } else if (isNaN(start) && isNaN(end)) {
        chars = true;
        inival = start.charCodeAt(0);
        endval = end.charCodeAt(0);
    } else {
        inival = (isNaN(start) ? 0 : start);
        endval = (isNaN(end) ? 0 : end);
    }
    plus = ((inival > endval) ? false : true);
    if (plus) {
        while (inival <= endval) {
            matrix.push(((chars) ? String.fromCharCode(inival) : inival));
            inival += walker;
        }
    } else {
        while (inival >= endval) {
            matrix.push(((chars) ? String.fromCharCode(inival) : inival));
            inival -= walker;
        }
    }
    return matrix;
};
arale.mixin = arale._mixin;
(function() {
	if(!window['console']){
		window.console = {
			log: function() {},
			info: function() {},
			dir: function() {},
			warn: function() {},
			error: function() {},
			debug: function() {}
		};
	}
}());

/**
 * @namespace
 * 返回当前浏览器的相关属性包括浏览器的版本、内核以及平台等信息.
 * <br/>
 * 旨在arale顶层命名空间加入arale.isIE(), arale.isOpera() , arale.isSafari()
 */
arale.browser = function() {
    //rendering engines
    /**
     * 浏览器引擎信息
     * @memberOf arale.browser
     * @name Engine
     * @type Object
     */
    var engine = {
        /** @lends arale.browser.Engine */
        ie: 0,
        gecko: 0,
        webkit: 0,
        khtml: 0,
        opera: 0,
        //complete version
        /**
         * 浏览器引擎版本
         * @memberOf arale.browser
         * @type String
         */
        ver: null,
        /**
         * 浏览器引擎名称
         * @memberOf arale.browser
         * @type String
         */
        name: null
    };
    //browsers
    /**
     * 浏览器信息
     * @memberOf arale.browser
     * @type Object
     * @name Browser
     */
    var browser = {
        /** @lends arale.browser.Browser */
         //browsers
         ie: 0,
         firefox: 0,
         safari: 0,
         konq: 0,
         opera: 0,
         chrome: 0,
         safari: 0,
         //specific version
        /**
         * 浏览器版本
         * @memberOf arale.browser
         * @type String
         */
         ver: null,
        /**
         * 浏览器名称
         * @memberOf arale.browser
         * @type String
         */
         name: ''
    };
    /**
     * 操作系统信息
     * @memberOf arale.browser
     * @type Object
     * @name System
     */
    var system = {
        /** @lends arale.browser.System */
        /**
         * 是否是windows平台
         * @memberOf arale.browser
         * @type Boolean
         */
         win: false,
        /**
         * 是否是mac平台
         * @memberOf arale.browser
         * @type Boolean
         */
         mac: false,
        /**
         * 是否是x11平台
         * @memberOf arale.browser
         * @type Boolean
         */
         x11: false,
         //mobile devices
        /**
         * 是否是iphone平台
         * @memberOf arale.browser
         * @type Boolean
         */
         iphone: false,
        /**
         * 是否是ipod平台
         * @memberOf arale.browser
         * @type Boolean
         */
         ipod: false,
        /**
         * 是否是nokiaN平台
         * @memberOf arale.browser
         * @type Boolean
         */
         nokiaN: false,
        /**
         * 是否是winMobile平台
         * @memberOf arale.browser
         * @type Boolean
         */
         winMobile: false,
        /**
         * 是否是macMobile平台
         * @memberOf arale.browser
         * @type Boolean
         */
         macMobile: false,
         //game systems
        /**
         * 是否是wii平台
         * @memberOf arale.browser
         * @type Boolean
         */
         wii: false,
        /**
         * 是否是ps平台
         * @memberOf arale.browser
         * @type Boolean
         */
         ps: false,
         /**
          * 操作系统名称
          * @memberOf arale.browser
          * @type String
          */
         name: null
    };
    //detect rendering engines/browsers
    var ua = navigator.userAgent;
    if (window.opera) {
        engine.ver = browser.ver = window.opera.version();
        engine.opera = browser.opera = parseFloat(engine.ver);
    }else if (/AppleWebKit\/(\S+)/.test(ua)) {
        engine.ver = RegExp['$1'];
        engine.webkit = parseFloat(engine.ver);
           //figure out if it’s Chrome or Safari
        if (/Chrome\/(\S+)/.test(ua)) {
            browser.ver = RegExp['$1'];
            browser.chrome = parseFloat(browser.ver);
        } else if (/Version\/(\S+)/.test(ua)) {
            browser.ver = RegExp['$1'];
            browser.safari = parseFloat(browser.ver);
          } else {
            //approximate version
            var safariVersion = 1;
            if (engine.webkit < 100) {
                  safariVersion = 1;
            } else if (engine.webkit < 312) {
                safariVersion = 1.2;
            } else if (engine.webkit < 412) {
                safariVersion = 1.3;
            } else {
                safariVersion = 2;
            }
            browser.safari = browser.ver = safariVersion;
        }
    } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
        engine.ver = browser.ver = RegExp['$1'];
        engine.khtml = browser.konq = parseFloat(engine.ver);
    } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
        engine.ver = RegExp['$1'];
        engine.gecko = parseFloat(engine.ver);
        //determine if it’s Firefox
        if (/Firefox\/(\S+)/.test(ua)) {
            browser.ver = RegExp['$1'];
            browser.firefox = parseFloat(browser.ver);
        }
    } else if (/MSIE ([^;]+)/.test(ua)) {
        engine.ver = browser.ver = RegExp['$1'];
        engine.ie = browser.ie = parseFloat(engine.ver);
    }
    //detect browsers
    browser.ie = engine.ie;
    browser.opera = engine.opera;
    //detect platform
    var p = navigator.platform;
    system.win = p.indexOf('Win') == 0;
    system.mac = p.indexOf('Mac') == 0;
    system.x11 = (p == 'X11') || (p.indexOf('Linux') == 0);
    //detect windows operating systems
    if (system.win) {
        if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
            if (RegExp['$1'] == 'NT') {
                switch (RegExp['$2']) {
                    case '5.0':
                         system.win = '2000';
                         break;
                    case '5.1':
                         system.win = 'XP';
                         break;
                    case '6.0':
                         system.win = 'Vista';
                         break;
                    default:
                         system.win = 'NT';
                         break;
                }
            } else if (RegExp['$1'] == '9x') {
                system.win = 'ME';
            } else {
                system.win = RegExp['$1'];
            }
        }
    }
    //mobile devices
    system.iphone = ua.indexOf('iPhone') > -1;
    system.ipod = ua.indexOf('iPod') > -1;
    system.nokiaN = ua.indexOf('NokiaN') > -1;
    system.winMobile = (system.win == 'CE');
    system.macMobile = (system.iphone || system.ipod);
    //gaming systems
    system.wii = ua.indexOf('Wii') > -1;
    system.ps = /playstation/i.test(ua);
    /**
     * 是否是IE系列浏览器
     * @memberOf arale
     * @returns {Boolean} 是否是IE系列浏览器
     */
    arale.isIE = function() {
        return browser.ie > 0;
    };
    /**
     * 是否是IE6浏览器
     * @memberOf arale
     * @returns {Boolean} 是否是IE6浏览器
     */
    arale.isIE6 = function() {
        return browser.ie == 6;
    };
    /**
     * 是否是firefox浏览器
     * @memberOf arale
     * @returns {Boolean} 是否是firefox浏览器
     */
    arale.isFF = function() {
        return browser.firefox > 0;
    };
    /**
     * 是否是chrome浏览器
     * @memberOf arale
     * @returns {Boolean} 是否是chrome浏览器
     */
    arale.isChrome = function() {
        return browser.chrome > 0;
    };
    /**
     * 判断是否是safari浏览器
     * @memberOf arale
     * @returns {Boolean} 是否是safari浏览器
     */
    arale.isSafari = function() {
        return browser.safari > 0;
    };
    /**
     * 是否是opera浏览器
     * @memberOf arale
     * @returns {Boolean} 是否是opera浏览器
     */
    arale.isOpera = function() {
        return browser.opera > 0;
    };
    /**
     * 判断是否是mac操作系统
     * @memberOf arale
     * @returns {Boolean} 是否是mac操作系统
     */
    arale.isMac = function() {
        return system.mac;
    };
    browser.name = arale.isIE() ? 'ie' : (arale.isFF() ? 'firefox' : (arale.isChrome() ? 'chrome' : (arale.isSafari() ? 'safari' : (arale.isOpera() ? 'opera' : 'unknown'))));
    var s = system;
    system.name = s.win ? 'win' : (s.mac ? 'mac' : (s.x11 ? 'x11' : (s.iphone ? 'iphone' : (s.ipod ? 'ipod' : (s.nokiaN ? 'nokiaN' : (s.winMobile ? 'winMobile' : (s.macMobile ? 'macMobile' : (s.wii ? 'wii' : (s.ps ? 'ps' : 'unknown')))))))));
    var e = engine;
    engine.name = e.ie ? 'ie' : (e.gecko ? 'gecko' : (e.webkit ? 'webkit' : (e.khtml ? 'khtml' : (e.opera ? 'opera' : 'unknown'))));
    return {
        /** @lends arale.browser */
        /**
         * 浏览器名称
         * @memberOf arale.browser
         * @type String
         */
        name: browser.name,
        Engine: engine,
        Browser: browser,
        System: system,
        /**
         * @memberOf arale.browser
         * @returns {String} 浏览器版本
         */
        ver: function() {
            return this.Browser.ver;
        },
        /**
         * 获取不同浏览器下的XMLHTTP对象
         * @memberOf arale.browser
         * @example
         * var xhr = arale.browser.Request()
         * @returns {Object} XMLHTTP对象
         */
        Request: function() {
            if (typeof XMLHttpRequest != 'undefined') {
                return new XMLHttpRequest();
            }else if (typeof ActiveXObject != 'undefined') {
                if (typeof arguments.callee.activeXString != 'string') {
                    var versions = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP', 'MSXML2.XMLHttp.6.0'];
                    for (var i = 0, len = versions.length; i < len; i++) {
                        try {
                            var xhr = new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            return xhr;
                        }catch (ex) {//skip
                        }
                    }
                }
                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error('No XHR object available.');
            }
        }
    };
}();

//moduleName, namespace, path, requires, assets
//deps需要解决的问题是,在我们arale中所有的我们可以划分为模块的对象统一管理起来,通过名字
//d等一些关键字来确定一些组件的依赖关系,还有通过模块的名字实动态加载.
arale.deps = (function() {
    //all module
    var all_modules = {
    };
    var LOAD = {
        //没有加载
        unload: 0,
        //加载了,但是依赖的组件没有加载完
        loading: 1,
        //加载成功
        loaded: 2
    };
    /**
     * path array
     * key string
     * deps array
     */
    var Dependency = function(key) {
        this.key = key;
        this.fileName = key
        this.status = LOAD.unload;
        //增加代理状态,用来在我们去请求真正的js的时候,代理的module并不会对应真正的js文件
        this.proxy = false;
    };
    Dependency.prototype = {
        /**
        * 设置组件状态
        * ,获取组件状态
        */
        moduleStatus: function(status) {
            if (status) {
                this.status = status;
            }
            return this.status;
        },
        isLoad: function() {
            return this.status > 0;
        },
        getPath: function() {
            return this.fileName;
        },
        isProxy: function() {
        	return this.proxy;
        }
    };

    return{
        /**
         *
         */
		addDependency: function(moduleName, deps) {
			var modules = all_modules;
            if (modules[moduleName]){
            	return;
            }
        	modules[moduleName] = [];
        	//给对应依赖的module,创建对应的子module
        	//需要反转
        	while(deps.length > 0){
        	   var dep = deps.pop();
        	   modules[moduleName].push(dep);
               if(!modules[dep]){
                   modules[dep] = new Dependency(dep);  
               }
        	}
        },
        /**
         * 目前我们通过use用到的模块名字来获取需要加载的文件的paht,来加载
         * 这个方法给用户module有2个作用
         * 1.用来让用户来判断组件是否已经加载
         * 2.如果没有加载的话,需要自己加载后,在这个模块里面注册自己的状态.
         */
        getModule: function(moduleName) {
        	return all_modules[moduleName];
        },
        LOAD: LOAD,
        /**
         * 把自己的依赖转换成一个module
         */
        depsToModule: function(key) {
        	var tempDependency = new Dependency(key);
        	tempDependency.proxy = true;
        	return all_modules[key] = tempDependency;
        },
        /**
         * 是否是我们Dependency的实例
         */
        isDep: function(dep){
        	return dep instanceof Dependency;
        },
        __getAllModule: function() {
            return all_modules;
        }
    };
})();

arale.module('arale.loader', function() {
    var Queue = function() {
        this._queue = [];
        this.running = false;
    };
    function empty(arr) {
        arr.length = 0;
    };
    function each(arr, callback, context) {
        for (var i = 0, len = arr.length; i < len; i++) {
            callback.call(context || null, arr[i]);
        }
    };
    Queue.prototype = {
        get: function() {
            return this._queue.shift();
        },
        size: function() {
            return this._queue.length;
        },
        add: function(params) {
            this._queue.push(params);
        },
        status: function(status) {
            if (typeof status !== 'undefined') {
                return (this.running = status);
            }
            return this.running;
        },
        run: function() {
            if (!this.running && this.size() > 0) {
                this.status(true);
                var params = this.get();
                params && this._apply.apply(this, params);
                empty(params);
            }
        },
        _apply: function(paths, modules, callbackList, deps) {
          //这个是局限于此类独特的一个方法,因为我们执行的逻辑都是一样的,只是不同的参数,所以我们把我们的的处理逻辑放到这里
            var that = this;
            loaderScript(getPaths(paths), function() {
                for (var i = 0, len = modules.length; i < len; i++) {
                    deps.getModule(modules[i]).moduleStatus(deps.LOAD.loaded);
                }
                each(callbackList, function(callback) {
                    callback();
                });
                that.status(false);
                that.run();
            });
        }
    };
    var loaderQueue = new Queue(), LOADER_LOADED = '/moduleloaded/', deps = arale.deps;
    var loadScriptDomElement = function(url, onload) {
        var domscript = document.createElement('script');
        domscript.charset = 'UTF-8';
        domscript.src = url;
        if (onload) {
			domscript.onloadDone = false;
			domscript.onload = function() {
				if (domscript.onloadDone) {
					return;
				}
				onload.call(domscript);
				domscript.onloadDone = true;
			}
			//domscript.onload = onload;
            domscript.onreadystatechange = function() {
                if (('loaded' === domscript.readyState || 'complete' === domscript.readyState) && !domscript.onloadDone) {
					//domscript.onloadDone = true;
					if(url.indexOf('cashier.module') > 0) {
						if(!window.Cashier || ((typeof Cashier.Module) == 'undefined')) {
							return;
						}
					}
                    domscript.onload();
                }
            };
        }
        document.getElementsByTagName('head')[0].appendChild(domscript);
    };
    var loadCssDomElement = function(href) {
        var cssFile = document.createElement('link');
        cssFile.setAttribute('rel', 'stylesheet');
        cssFile.setAttribute('type', 'text/css');
        cssFile.setAttribute('href', href);
        document.getElementsByTagName('head')[0].appendChild(cssFile);
    };
    var loaderScript = loadScriptDomElement;
    //init var
    var loading = null, cssLoading, readyLoader = [], cssReadyLoader = [], callbacks = [];
	var context = arale.getComboPath(), cssContext = arale.getCssComboPath(), WT = araleConfig.waitTime;
	//generator url
	var srcFileReg = /(?:.*).css|(.*)src\.js/;
	var noneSrcFileReg = /(.*)(.js)/;
	var getSrcFile = function(fileName) {
		if(!srcFileReg.test(fileName)) {
			var matcher =fileName.match(noneSrcFileReg);
			if(matcher.length > 2) {
				return matcher[1] + '-src' + matcher[2];
			}
		} else {
			return fileName;
		}
	};
    var getPaths = function(paths) {
		if (arale.depSrc) {
			for(var i = paths.length -1 ; i > -1; i--) {
				paths[i] = getSrcFile(paths[i]);
			} 
		}
        if (araleConfig.__tmp) {    //如果是拆分后的系统，则新规则生效
            for(var i = 0, l = paths.length; i < l; i++) {
                var fileName = paths[i];
                if (fileName.indexOf('arale') > -1 || fileName.indexOf('alipay') > -1) {
                    paths[i] = 'static/ar/' + fileName;
                } else {
                    paths[i] = fileName.slice(0, fileName.indexOf('.')) + '/' + fileName;
                }
            }
        }

        var path = context + paths.join(',');
        if (arale.debug) {
            path = path + '&date=' + new Date().getTime() + '&debug=1';
        }
        return path;
    };
    /**
    *开始加载
    **/
    var startLoader = function(watiTime) {
        if (loading) {
            clearTimeout(loading);
        }
        loading = setTimeout(function() {
            var paths = [], modules = [], moduleList = readyLoader, tempModule;
            //init status
			readyLoader = [];
            for (var i = 0, len = moduleList.length; i < len; i++) {
                tempModule = moduleList[i];
                if (!tempModule.isProxy()) {
                    paths.push(tempModule.getPath());
                }
            }
			if (paths.length === 0) {
                return;
            }
            callbacks.splice(0, 0, function() {
                var loaded = deps.LOAD.loaded;
                each(moduleList, function(module) {
                    module.moduleStatus(loaded);
                });
            });
            var callbackList = [].slice.call(callbacks, 0);
            empty(callbacks);
            loaderQueue.add([paths, modules, callbackList, deps]);
            loaderQueue.run();
        }, watiTime || WT);
    };
    var getModules = function(module, moduleList) {
        each(module.getDeps(), function(m) {
            var module = deps.getModule(m);
            getModules(module, moduleList);
            if (moduleList.indexOf(m) < 0) {
                moduleList.arr.push(m);
            }
        });
    };
    //默认是不阻塞队列的.如果阻塞的话,所有的请求都会被加到队列中,不会被执行.目前先支持第一个阻塞,后续中间在有阻塞的请求会有问题
    //考略多阻塞的话,会很麻烦,也没有必要
    var blockQueue = new Queue(), blocked = false;
    blockQueue.run = function() {
        //后续是否又有新的阻塞请求
        var params, isBlock;
        while (params = this.get()) {
            isBlock = blockLoader.apply(null, params);
            if (isBlock) {
                break;
            }
        }
    };
    var blockLoader = function(modules, callback, block) {
        var params = [].slice.call(arguments, 0);
        if (blocked) {
            blockQueue.add(params);
            return;
        }
        if (block) {
            params[1] = function() {
                callback.call();
                blocked = false;
                blockQueue.run();
            };
            params[2] = 1;
            blocked = block;
        }
        loader.apply(null, params);
        return block;
    };
    var loader = function(modules, callback, waitTime) {
        var Allsuccess = true;
        //保存我们即将加载的子module,需要在加载完成后设置状态
        var loadingModules = [];
        if (!callback) {
            callback = function() {};
        }
        if (arale.isString(modules)) {
            modules = [modules];
        }
        each(modules, function(module) {
            var subModule = deps.getModule(module), subSuccess;
            if (arale.isArray(subModule)) {
                //如果此module是第一次加载,他依赖的子module还没有被转换为整体module.我们需要循环去判断他
                //依赖的key对应的module是否加载过
                each(subModule, function(depName) {
                    var tempModule = deps.getModule(depName), status = tempModule.moduleStatus();
                    //判断一个module是否加载过,如果没有加载,设置为正在加载中,准备加载
                    switch (tempModule.moduleStatus()) {
                        case deps.LOAD.loaded:
                            return;
                        case deps.LOAD.unload:
                            //如果没有成功加载,添加到我们的队列中,在我们成功加载后,需要设置加载成功状态
                            readyLoader.push(tempModule);
                            tempModule.moduleStatus(deps.LOAD.loading);
                        case deps.LOAD.loading:
                             Allsuccess && (Allsuccess = false);
                        default:
                            return;
                    }
                });
				//创建一个替身,以后只需要判断这个代理就行了
				var proxyModule = deps.depsToModule(module);
				//set proxyModule status when subModule all loaded 
				if (Allsuccess) {
					proxyModule.moduleStatus(deps.LOAD.loaded);
				} else {
					proxyModule.moduleStatus(deps.LOAD.loading);
					readyLoader.push(proxyModule);
				}
            }else if (deps.isDep(subModule)) {
                if (subModule.moduleStatus() != deps.LOAD.loaded) {
                    Allsuccess = false;
                }
            }else {
				throw new Error('error module:' + (subModule || module || modules));
            }
        });
        if (Allsuccess) {
            //如果此模块已经加载,直接执行callback
            callback();
        } else {
            //如果此module正在加载,或者即将加载,把callback追加到callbacks队列中
            callbacks.push(callback);
            startLoader(waitTime);
        }
    };
    var loadCss = function() {
        if (cssLoading) {
            clearTimeout(cssLoading);
        }
        cssLoading = setTimeout(function() {
            if (cssReadyLoader.length > 0) {
                loadCssDomElement(getPaths(cssReadyLoader));
                cssReadyLoader = [];
            }
        }, 50);
    };
    return {
        use: blockLoader,
        waituse: function() {
            throw new Error('Deprecated method.');
            return;
            var params = [].slice.call(arguments, 0);
            $E.domReady(function() {
                blockLoader.apply(null, params);
            });
        },
        css: function(cssPath) {
            if (cssPath) {
                cssReadyLoader.push(cssPath);
                loadCss();
            }
		},
		useCss: function() {
            var files = [].slice.call(arguments,0);
            if (araleConfig.__tmp) {
                for (var i = 0, l = files.length; i < l; i++) {
                    var fileName = files[i];
                    if (fileName.indexOf('alice') > -1 || fileName.indexOf('arale') > -1 || fileName.indexOf('alipay') > -1) {
                        files[i] = "static/al/" + fileName;
                    } else {
                        files[i] = fileName.slice(0, fileName.indexOf('.')) + '/' + fileName;
                    }
                }
            }
			loadCssDomElement(cssContext + files.join(','));
		},
		loadScriptByUrl: function(url, callback) {
			loadScriptDomElement(url, callback);	
		}
    };
//    return loader;
}, '$Loader');
Loader = $Loader;
arale.deps.depsToModule('arale.base-1.1.js').moduleStatus(arale.deps.LOAD.loaded);


//TODO
//1.先把chuan'r传入内容节点放
(function(arale){
	var support = {};
	var script = document.createElement('script'),
		id = 'script' + arale.now(),
		rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		rnotwhite = /\S/;

	script.type = "text/javascript";
	try {
		script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
	} catch(e) {}
	if ( window[ id ] ) {
		support.scriptEval = true;
		delete window[ id ];
	}
	var merge = function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	};
	var nodeName = function(node, name) {
		return node && node.nodeName.toLowerCase() === name;
	};
	var makeArray = function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = arale.typeOf(array);

			if ( array.length == null || type === "string" || type === "function" || type === "regexp") {
				[].push.call( ret, array );
			} else {
				merge( ret, array );
			}
		}
		return ret;
	};
	var buildFragment = function(elem, scripts) {
		var ret = [];
		var fragment = document.createDocumentFragment();
		if(typeof elem === 'string'){
			var div = document.createElement('div');
			div.innerHTML = elem;
			elem = div.childNodes;
		}
		if (elem.nodeType) {
			ret.push(elem);
		} else {
			ret = merge(ret, elem);	
		}
		for ( i = 0; ret[i]; i++ ) {
			if ( scripts && nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
				scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
			} else {
				if ( ret[i].nodeType === 1 ) {
					ret.splice.apply( ret, [i + 1, 0].concat(makeArray(ret[i].getElementsByTagName("script"))) );
				}
				fragment.appendChild( ret[i] );
			}
		}
		return fragment;
	};	
	// Evalulates a script in a global context
	arale.globalEval = function( data ) {
		if ( data && rnotwhite.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				script = document.createElement("script");

			script.type = "text/javascript";

			if (support.scriptEval) {
				script.appendChild( document.createTextNode( data ) );
			} else {
				script.text = data;
			}
			// Use insertBefore instead of appendChild to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}
	};
	var globalEvalScript = function(scripts) {
		if(scripts && scripts.length) {
			var elem = scripts.shift();
			if(elem.type && elem.src) {
				arale.loader.loadScriptByUrl(elem.src, function() {
					globalEvalScript(scripts);
				});	
			} else {
				arale.globalEval(elem.text || elem.textContent || elem.innerHTML || "");
				globalEvalScript(scripts);
			}
		}
	};
	arale.domManip = function(args, callback){
		var scripts = [];
		var fragment = buildFragment(args, scripts);
		callback.call(arale, fragment);
		globalEvalScript(scripts);
		/**
		for(var i=0, len = scripts.length; i <  len; i++) {
			var elem = scripts[i];
			arale.globalEval(elem.text || elem.textContent || elem.innerHTML || "");
		}
		*/
	};	
}(arale));

/**Last Changed Author: shuai.shao--Last Changed Date: Tue Sep 20 11:02:53 CST 2011**/