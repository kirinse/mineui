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
arale.deps.depsToModule('arale.base-1.1.js').moduleStatus(arale.deps.LOAD.loaded);
arale.deps.depsToModule('arale.base-1.1-src.js').moduleStatus(arale.deps.LOAD.loaded);
/**
 * @name arale.string
 * @class
 * @param {String} str 要封装的字符串
 * @returns {CString} 封装后的字符串
 * 字符串操作模块，提供trim、clean等众多对字符串操作的功能函数
 */
arale.module('arale.string', (function(){
    
    var _encodeUriRegExp = /^[a-zA-Z0-9\-_.!~*'()]*$/;
    var _amperRe = /&/g;
    var _ltRe    = /</g;
    var _gtRe    = />/g;
    var _quotRe  = /\"/g;
    var _allRe   = /[&<>\"]/;

	var character = {
		'<':'&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;'
	};
	var entity = {
        quot: '"',
        lt:   '<',
        gt:   '>'
    };
    
	var CString = arale.dblPrototype("",function(strr){
		this.str = strr;
		this.length = strr.length;
	});
	
	arale.augment(CString,
/** @lends arale.string.prototype */
{
        
        /**
         * 去除前后空格
         * @example
         * $S("   I love mac  ").trim(); // return "I love mac"
         * @returns {String}
         */
        trim: function(){
			var str = this.str.replace(/^\s+/,'');
			for(var i= str.length - 1; i >= 0; i--){
				if(/\S/.test(str.charAt(i))){
					str = str.substring(0,i+1);
					break;
				}
			}
			return str;
        },
        
        /**
         * 去除前后无相干的空白符如:\n \t引起的空行
         * @example
         * $S('   I love mac  \n\n).clean(); // return "I love mac"
         * @returns {String}
         */
        clean: function(){
            return this.trim(this.str.replace(/\s+/g, ' '));
        },
        
        /**
         * 合并用横杠分隔的字符串并驼峰风格
         * @example
         * $S("i-love-you").camelCase(); // return "ILoveYou"
         * @returns {String}
         */
        camelCase: function(){
            var str = this.str.replace(/-\D/g, function(match){
                return match.charAt(1).toUpperCase();
            });
			return str;
        },
        
        /**
         * 将驼峰风格的支付串用"-"分隔
         * @example
         * $("iLoveYou").hyphenate(); // return "I-love-you"
         * @returns {String}
         */
        hyphenate: function(){
            var str = this.str.replace(/[A-Z]/g, function(match){
                return ('-' + match.charAt(0).toLowerCase());
            });
			return str;
        },
        
        /**
         * 将字符串转化成正则格式
         * @example
         * $S("animals.sheep[1]").escapeRegExp(); // return "animals\.sheep\[1\]"
         * @returns {String}
         */
        escapeRegExp: function(){
            return this.str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
        },
        
        /**
         * 将字符串转化成整数
         * @param {base, 可选, 默认10} base 数字类型
         * @example
         * $S("1em").toInt(); // return 1
         * $S("10px").toInt(); // return 10
         * $S("100.00").toInt(); // return 100
         * @returns {Number}
         */
        toInt: function(base){
            return parseInt(this.str, base || 10);
        },
        
        /**
         * 将字符串转化成浮点数
         * @example
         * $S("99.9%").toFloat(); // return 99.9
         * $S("100.11").toFloat(); // return 100.11
         * @returns {Number}
         */
        toFloat: function(){
            return parseFloat(this.str);
        },
        
        /**
         * 将颜色值转换成RGB格式
         * @param {Boolean} array 是否已数组格式返回
         * @example
         * $S("#123").hexToRgb(); // return "rgb(17,34,51)"
         * $S("112233").hexToRgb(); // return "rgb(17,34,51)"
         * $S("#112233").hexToRgb(true); // return [17, 34, 51]
         * @returns {String || Array}
         */
        hexToRgb: function(array){
            var hex = this.str.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
            return (hex) ? $A(hex.slice(1)).hexToRgb(array) : null;
        },
        
        /**
         * 将RGB转换成对应的颜色值
         * @param {Boolean} array 是否已数组格式返回
         * @example
         * $S("rgb(17,34,51)").rgbToHex(); // return "#112233"
         * $S("rgb(17,34,51)").rgbToHex(true); // return ["11","22","33"];
         * $S("rgba(17,34,51)").rgbToHex(); // return "transparent"
         * @returns {String || Array}
         */
        rgbToHex: function(array){
            var rgb = this.str.match(/\d{1,3}/g);
            return (rgb) ? $A(rgb).rgbToHex(array) : null;
        },

        /**
         * 将rgb 或者 "#xxx" 转换成 "#xxxxxx"
         * @param {String} co 异常情况下返回的值
         * @example
         * $S('#fff').parseColor();  //return '#ffffff'
         * $S('#ff2').parseColor('#ffffff'); //return '#ffffff'
         * @returns {String} 返回自生或者指定值
         */
        parseColor: function(co){
			if (this.str.slice(0,4) == 'rgb('){
               var color = this.rgbToHex();
            }else{
              var color = '#';
              if (this.str.slice(0,1) == '#') {
                  if (this.str.length==4) for(var i=1;i<4;i++) color += (this.str.charAt(i) + this.str.charAt(i)).toLowerCase();
                  if (this.str.length==7) color = this.str.toLowerCase();
              }
            }
            return (color.length==7 ? color : ($S(co) || this.str));
        },
        /**
         * 过滤script并返回剩余的字符串
         * @param {Function || Boolean, 可选} option 执行script程序，或者返回函数调用
         * @example
         * var str = $S("<script>var a = 1; alert_(1);</script> this is a test");
         * str.stripScripts(); // alert(1) then return "this is a test"
         * str.stripScripts(function(sc,txt){
         *    alert(sc) //return "var a = 1; alert(a)"
         *    alert(txt) //return "this is a test"
         * });
         * @returns {String}
         */
        stripScripts: function(option, override){
            var scripts = '';
            var text = this.str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
                scripts += arguments[1];
                return '';
            });
            if (option === true){
                arale.exec(scripts);
            }else if (typeof(option) == 'function'){
                option.call(override, scripts, text);
            }
            return text;
        },
        
        /**
         * 字符串中的占位符替换
         * @param {Object} object 待替换的数据对象
         * @param {Regexp, 可选} regexp 描述占位符的正则表达式 默认"/\?{([^}]+)}/g"
         * @example
         * var myString = $S("{subject} is {property_1} and {property_2}.");
         * var myObject = {subject: 'Jack Bauer', property_1: 'our lord', property_2: 'savior'};
         * myString.substitute(myObject); //Jack Bauer is our lord and savior
         * @returns {String}
         */
        substitute: function(object, regexp){
            var str = this.str.replace(regexp || (/\$\{([^}]+)\}/mg), function(match, name){
                //if (match.charAt(0) == '$') return match.slice(1);
                return (object[name] != undefined) ? object[name] : '';
            });
			return str;
        },
        
        /**
         * 清除左边空格
         * @example
         * var str = $S("  this is a example");
         * str.trimLeft(); //return "this is a example"
         * @returns {String}
         */
        trimLeft: function(){
            return this.str.replace(/^[\s\xa0]+/, '');
        },
        
        /**
         * 清除右边空格
         * @example
         * var str = "  this is a example   ";
         * str.trimRight(); //return "  this is a example"
         * @return {String}
         */
        trimRight: function(){
            return this.str.replace(/[\s\xa0]+$/, '');
        },
        
        /**
         * 对字符串进行urlEncode
         * @example
         * var str = $S(" . 我 this is a example");
         * str.urlEncode(); //return "%20.%20%E6%88%91%20this%20is%20a%20example"
         * @returns {String}
         */
        urlEncode: function(){
            this.str = String(this.str);
            if (!_encodeUriRegExp.test(this.str)) {
                return encodeURIComponent(this.str);
            }
            return this.str;
        },
    
        /**
         * 对字符串进行urlDecode
         * @example
         * var str = $S("%20.%20%E6%88%91%20this%20is%20a%20example");
         * str.urlDecode(str); //return " . 我 this is a example"
         * @returns {String}
         */     
        urlDecode: function() {
            return decodeURIComponent(this.str.replace(/\+/g, ' '));
        },
    
        /**
         * 对字符串进行html转码
         * @example
         * var str = $S("<html><body>Go Go");
         * str.htmlEscape(str); //return "&lt;html&gt;&lt;body&gt;Go Go"
         * @returns {String}
         */ 
        escapeHTML: function() {
            if (!_allRe.test(this.str)) return this.str;

            if (this.str.indexOf('&') != -1) {
               this.str = this.str.replace(_amperRe, '&amp;');
            }
            if (this.str.indexOf('<') != -1) {
              this.str = this.str.replace(_ltRe, '&lt;');
            }
            if (this.str.indexOf('>') != -1) {
              this.str = this.str.replace(_gtRe, '&gt;');
            }
            if (this.str.indexOf('"') != -1) {
              this.str = this.str.replace(_quotRe, '&quot;');
            }
            return this.str;
        },
        
        /**
         * 反转义HTML
         * @param {String} str 需要操作的字符串
         * @example
         * var str = $S("&lt;html&gt;&lt;body&gt;Go Go");
         * str.unescapeHTML(); //return "<html><body>Go Go"
         * @returns {String}
         */
       unescapeHTML: function() {
			if(!this.trim().length) return this.str;
			return this.str.replace(/&([^;]+);/g, function(s, entity) {
				switch (entity) {
				  case 'amp':
					return '&';
				  case 'lt':
					return '<';
				  case 'gt':
					return '>';
				  case 'quot':
					return '"';
				  default:
					if (entity.charAt(0) == '#') {
					  // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
					  var n = Number('0' + entity.substr(1));
					  if (!isNaN(n)) {
						return String.fromCharCode(n);
					  }
					}
					// For invalid entities we just return the entity
					return s;
				}
			});
		},
		/**
		 * 监测是否包含相关字符
		 * @param {String} string 需要搜索的字符
		 * @param {String|可选} separator 分隔符 (如element中的className用空格分隔)
		 * @example
		 * 
		 * @returns {Boolean}
		 */
        contains: function(string, separator){
            return (separator) ? (separator + this.str + separator).indexOf(separator + string + separator) > -1 : this.str.indexOf(string) > -1;
        }, 

        /**
         * 根据指定次数重复字符串
         * @param {Number} num 需要重复的次数
         * @example
         * var str = $S("***");
         * str.rep(str,3); //return "*********"
         * @returns {String}
         */ 
        rep: function(num, text){
			if(text) this.str=text;
            if(num <= 0 || !this.str){ return ""; }
            var buf = [];
            for(;;){
                if(num & 1){
                    buf.push(this.str);
                }
                if(!(num >>= 1)){ break; }
                this.str += this.str;
            }
            return buf.join("");    // String
        },

        /**
         * 通过我们给定的备选字符去填充一个字符串，确保他的长度至少是我们指定的长度，默认是在前面填充
         * @param {Number} times 需要被填充到的长度 
         * @param {String||可选} ch  被填充的字符，
         * @param {Boolean||可选} end 如果是后填充，为true
         * @example
         * var str = $S("abc");
         * str.pad(7,"*"); //return "****abc"
         * str.pad(7,"*",true); //return "abc***"
         * @returns {String}
         */
        pad: function(size,ch,end){
            if(!ch){
                ch = '0';
            }
            var out = String(this.str);
            var pad = this.rep(Math.ceil((size-out.length) / ch.length),ch);
            return end ? (out + pad) : (pad + out);
        },
		
		/**
		 * 将每个词的首字母大写
		 * @example
		 * $S("i like cookies").capitalize(); //return "I Like Cookies"
		 * @returns {String}
		 */
        capitalize: function(){
            var str = this.str.replace(/\b[a-z]/g, function(match){
                return match.toUpperCase();
            });
			return str;
		},
		/**
		 * full- width to half-width
		 * @param {String} both, left, right, all;
		 * * @example
		 * 'ａｂｃ'.ftoh(); //return abc
		 * @returns {String}
		 */
		ftoh: function(isTrim) {
	  		var result = "", str, c, isTrim = isTrim || 'both';
			switch(isTrim) {
				case 'all':
				case 'both':
					str = this.trim();
					break;
				case 'left':
					str = this.trimLeft();
					break;
				case 'right':
					str = this.trimRight();
					break;
				default:
					str = this.str;
			}
	   		for (var i = 0, len = str.length; i < len; i++){
				c = str.charCodeAt(i);
				if (c == 12288) {
					if (isTrim != 'all') {
		 				result += String.fromCharCode(c - 12256);
					}
		 			continue;
				}
				if (c > 65280 && c < 65375) {
		 			result += String.fromCharCode(c - 65248);
				} else {
					if (c == 32 && isTrim == 'all') {
						continue;
					}
					result += String.fromCharCode(str.charCodeAt(i));
	   			}
			}
			return result;
		}
    });
	CString.prototype['toString'] = function(){
		return this.str;
	};
	var StringFactory = function(strr){	
		return new CString(strr);
	}
	StringFactory.fn =CString.prototype;
	return StringFactory;
}), '$S');
S = $S;

/**Last Changed Author: hui.kang--Last Changed Date: Thu May 05 13:37:49 CST 2011**/
arale.deps.depsToModule('arale.string-1.0.js').moduleStatus(arale.deps.LOAD.loaded);
arale.deps.depsToModule('arale.string-1.0-src.js').moduleStatus(arale.deps.LOAD.loaded);
/**
 * @name arale.hash
 * @class
 * 对自定义的Object {} 进行键值对操作
 * @param {Object} obj 要封装的对象
 * @returns {Object} 返回封装后增强的对象
 * @author <a href="mailto:xuning@alipay.com">xuning@alipay.com</a>
 * $H({name : "xuning", email : "xuning@alipay.com"}); 
 */
arale.module("arale.hash", (function(){
	var CHash = arale.dblPrototype({},function(obj){
		this.obj = obj;
	});
    arale.augment(CHash, {
        /** @lends arale.hash.prototype */
        /**
         * 循环遍历
         * @param {Function} fn 回调函数
         * @param {Object} context 作用域 as this
         * @example
         * var info = $H({
         *  name : "xuning",
         *  age : 27    
         * })
         * info.each(function(key,value){
         *  alert(key);
         *  alert(value);
         * });
         * @returns {void}
         */
        each : function(fn,context){
            for(var key in this.obj){
                if (this.obj.hasOwnProperty(key)){
                    fn.call(context,key,this.obj[key],this.obj);
                }
            }
        },
        
        /**
         * 设置key value
         * @param {String} key 键
         * @param {String} value 值
         * @example
         * var hash = $H({});
         * hash.set('name','love'); // {'name':'love'}
         * @return {Object}
         */
        set: function(key, value){
            if (!this.obj[key] || this.obj.hasOwnProperty(key)) this.obj[key] = value;
            return this;
        },
        
        /**
         * 扩展Hash
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @param {Object} properties 需要压入的Hash
         * @example
         * var obj = $H({'name':'xuning', 'age':'27'});
         * obj.extend({'livein':'hangzhou'}) //return {'name':'xuning', 'age':'27', 'livein':'hangzhou'}
         * @return {Object}
         */
        extend: function(properties){
			$H(properties||{}).each(function(key,value){
				this.set(key,value);
			},this);
			return this;
        },
        
        /**
         * 获取对象长度
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @example 
         * var info = $H({
         *  name : "xuning",
         *  age : 27    
         * })
         * info.getLength(); //return 2
         * @return {Number}
         */
        getLength : function(){
            var length = 0;
            for (var key in this.obj){
                if (this.obj.hasOwnProperty(key)){
                    length++;
                }
            }
            return length;
        },
        
        /**
         * 是否包含该键
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @param {String} key 键值
         * @example 
         * var info = $H({
         *  name : "xuning",
         *  age : 27    
         * })
         * info.has('name'); //return True
         * @return {Boolean}
         */
        has : function(key){
            return this.obj.hasOwnProperty(key);
        },
        
        /**
         * 获取该值对应的key
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @param {Anything} value 任何值
         * @example 
         * var info = $H({
         *  name : "xuning",
         *  nickname : "xuning" 
         * })
         * info.keyOf('xuning'); //["name","nickname"]
         * @return {Array || null}
         */
        keyOf : function(value){
            var keys = []
            for (var key in this.obj){
                if (this.obj.hasOwnProperty(key) && this.obj[key] == value){
                    keys.push(key);
                }
            }
            return keys.length ? keys : null;
        },
        
        /**
         * 是否含有该值
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @param {Anything} value 任何值
         * @example 
         * var info = $H({
         *  name : "sdh",
         *  nickname : "xuning" 
         * })
         * info.hasValue('sdh'); //return true
         * @return {Boolean}
         */
        hasValue : function(value){
            return (this.keyOf(value) !== null);
        },
        
        /**
         * 删除某一项
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @param {String} key键
         * @example 
         * var info = $H({
         *  name : "sdh",
         *  nickname : "xuning" 
         * })
         * info.removeKey('name'); //return true
         * @return {Object}
         */
        removeKey : function(key){
            if (this.obj.hasOwnProperty(key)){
                delete this.obj[key];
            }
            return this;
        },
        
        /**
         * 获取所有key
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @example 
         * var info = $H({
         *  name : "sdh",
         *  nickname : "xuning" 
         * })
         * info.getKeys(info); //return ['name', 'nickname']
         * @return {Array}
         */
        getKeys : function(){
            var keys = [];
            this.each(function(key,value){
                keys.push(key);
            });
            return keys;
        },
        
        /**
         * 获取所有值
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @example 
         * var info = $H({
         *  name : "sdh",
         *  nickname : "xuning" 
         * })
         * info.getValues(); //return ['sdh', 'xuning']
         * @return {Array}
         */     
        getValues : function(){
            var values = [];
            this.each(function(key, value){
                values.push(value);
            });
            return values;
        },

        /**
         * 将对象转化为URLString
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @example 
         * var info = $H({
         *  name : "sdh",
         *  nickname : "xuning" 
         * })
         * info.toQueryString(); //return "name=sdh@nickname=xuning"
         * @return {String}
         */     
        toQueryString : function(){
            var queryString = [];
            this.each(function(key,value){
                queryString.push(key + "=" + value);
            });
            return queryString.join("&");
        },
        
        /**
         * 将key进行排序
         * @param {Object} obj Object对象 如: {name:"jack",age:12}
         * @example 
         * var info = $H({
         *  a : "a",
         *  c : "c" ,
         *  b : "b"
         * })
         * info.sort(); //return {a : "a", b : "b", c : "c"}
         * @return {Object}
         */
        sort : function(){
            var result = {};
            var keys = this.getKeys();
            keys.sort();
            for(var key; key = keys.shift();){
                result[key] = this.obj[key];
            }
            return $H(result);
        }
    });
	CHash.prototype['toString'] = function(){
		var str = [];
		for(var key in this.obj){
			str.push(key + ' : ' + this.obj[key]);
		}
		return '{ ' + str.join(',') + ' }';
	};
	var HashFactory = function(obj){	
		return new CHash(obj);
	}
	HashFactory.fn =CHash.prototype;
	return HashFactory;
}),"$H");
H = $H;

arale.deps.depsToModule('arale.hash-1.0.js').moduleStatus(arale.deps.LOAD.loaded);
arale.deps.depsToModule('arale.hash-1.0-src.js').moduleStatus(arale.deps.LOAD.loaded);
arale.module('arale.array', function() {
    var CArray = arale.dblPrototype(Array.prototype, function(obj) {
        this.arr = obj;
    });
    arale.augment(CArray, /**@lends arale.array.prototype */ {

        /**
         * 循环数组(对象)
         * @param {function} callback 每一项回调函数, 还两个参数，
         *  第一个为当前项(key)，第二项为序数(value)；.
         * @param {Object|可选} bind 传入的Object用作this对象使用.
         * @example
         * var arr = $A(['apple', 'banana', 'lemon']);
         * arr.each(function(item, index){
         *    alert(index + " = " + item);
         * });
         * var obj = {a:'value1',b:'value2',c:'value3'};
         * $A(obj).each(function(key, value){
         *    alert(key, ' = ', value);
         * }
         * @return {void}
         */
        each: function(callback, bind) {
            var target = this.arr;

            if (Array.prototype.forEach) {
                return [].forEach.call(target, callback, bind);
            }
            for (var length = target.length, i = 0; i < length; i++) {
                callback.call(bind, target[i], i, target);
            }
        },


        /**
         * 测试数组(对象)每一项是否符合所给条件
         * @method
         * @param {function} callback 每一项回调函数.
         * @param {Object} [bind] 传入的Object用作this对象使用.
         * @example
         * var arr = $A([10,4,25,100])
         * var areAllBigEnough = arr.every(function(item, index){
         *   return item > 20;
         * }); //return false
         * @return {Boolean}
         */
        every: function(callback, bind) {

            var target = this.arr;

            if (Array.prototype.every) {
                return [].every.call(target, callback, bind);
            }

            for(var i=0,l=target.length; i<l; i++) {
                if(!callback.call(bind, target[i], i, target)) {
                    return false;
                }
            }
            return true;

        },


        /**
         * 过滤出与条件相符的项并返回新数组(对象)
         * @memeberOf arale.array
         * @param {function} callback 每一项回调函数.
         * @param {Object||可选} bind 传入的Object用作this对象使用.
         * @example
         * var arr = $A([10,4,25,100]);
         * arr.filter(function(item, index){
         *   return item > 20;
         * }); //return [25,100];
         * @return {Array}
         */
        filter: function(callback, bind) {
            var result = [];

            this.each(function(item, index) {
                if (callback.call(bind, item, index)) {
                    result.push(item);
                }
            });
            return result;
        },

        /**
         * TODO: 去留
         * 清除所有未定义的变量并返回新数组 (i.e not null or undefined)
         * @memeberOf arale.array
         * @example
         * var arr = $A([null, 1, 0, true, false, "foo", undefined, ""]);
         * arr.clean(); //return [1,0,true,false,"foo",""];
         * @return {Array}
         */
        clean: function() {
            var fn = function(obj) {
                return (obj != undefined);
            }
            return this.filter(fn);
        },

        /**
         * 改变每一项并创建一个新数组
         * @memeberOf arale.array
         * @param {Function} callback 回调函数.
         * @param {Object||可选} bind 传入的Object用作this对象使用.
         * @example
         * var arr = $A([1, 2, 3]);
         * arr.map(function(item,index){
         *  return item * 2;
         * }); // [2,4,6]
         * @return {Array}
         */
        map: function(callback, bind) {
            var result = [],
                i = 0;
            this.each(function(item, index) {
                result[i++] = callback.call(bind, item, index);
            });
            return result;
        },

        /**
         * 至少有一项满足条件则返回true
         * @memeberOf arale.array
         * @param {Function} callback 回调函数.
         * @param {Object||可选} bind 传入的Object用作this对象使用.
         * @example
         * var arr = $A([10, 25, 31]);
         * var isAnyBigEnough = arr.some(function(item,index){
         *  return item > 30;
         * }); // return true
         * @return {Boolean}
         */
        some: function(callback, bind) {
            var target = this.arr;
            if (Array.prototype.some) {
                return [].some.call(target, callback, bind);
            }
            for (var l = target.length, i = 0; i < l; i++) {
                if(callback.call(bind, target[i], i, target)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 将两个数组合并成key:value Object
         * @memeberOf arale.array
         * @param {Array} vals 用作value的数组.
         * @param {Array} keys 用组key的数组.
         * @example
         * var vals  = $A(['Cow', 'Pig', 'Dog', 'Cat']);
         * var keys = $A(['Moo', 'Oink', 'Woof', 'Miao']);
         * arr.associate(keys); //returns {'Cow': 'Moo', 'Pig': 'Oink', 'Dog': 'Woof', 'Cat': 'Miao'}
         * @return {Array}
         */
        associate: function(keys) {
            keys && (keys = keys.arr || keys);
            var obj = {},
                vals = this;

            vals.each(function(item, index) {

                //$A() 是没有 length 所，所以线上版的有 BUG
                // 2010.01.14
                if (keys[index] && item) {
                    obj[keys[index]] = item;
                }
            });
            return obj;
        },

        /**
         * 返回该值在数组中的下标，如不存在则返回 -1
         * @memeberOf arale.array
         * @param {Object} item 需要查找的项.
         * @param {Number|可选} from 从某个下标开始搜索.
         * @example
         * var arr = $A(['apple', 'lemon', 'banana']);
         * arr.indexOf("lemon"); //return 1
         * arr.indexOf("lemin", 4); //return -1
         * @return {Number}
         */
        indexOf: function(item, from) {
            var arr = this.arr,
                len = arr.length;
            i = (from < 0) ? Math.max(0, len + from) : from || 0;
            for (; i < len; i++) {
                if (arr[i] === item) return i;
            }
            return -1;
        },

        /**
         * 是否包含提供的项
         * @memeberOf arale.array
         * @param {Object} item 匹配的项.
         * @param {Number|可选} from 从改下标开始搜索，默认为0.
         * @example
         * var arr = $A(['a', 'b', 'c']);
         * arr.contains('a'); //return true
         * @return {Boolean}
         */
        contains: function(item, from) {
            return this.indexOf(item, from) !== -1;
        },

        /**
         * 扩展一个数组
         * @memeberOf arale.array
         * @param {Array} array 操作的数组对象.
         * @example
         * var arr = $A(['a', 'b', 'c']);
         * arr.extend(['d','c']); //return ['a', 'b', 'c', 'd', 'c']
         * @return {Array}
         */
        extend: function(array) {
            array = array.arr || array;
            for (var i = 0, j = array.length; i < j; i++) this.arr.push(array[i]);
            return this.arr;
        },

        /**
         * 获取数组最后一项
         * @memeberOf arale.array
         * @example
         * var arr = $A(['a', 'b', 'c']);
         * arr.last(); //return 'c'
         * @return {?mixed}
         */
        last: function() {
            return (this.arr && this.arr[this.arr.length - 1]) || null;
        },

        /**
         * 随机获取一项
         * @memeberOf arale.array
         * @example
         * var arr = $A(['a', 'b', 'c']);
         * arr.random(); //return 其中的某一项
         * @return {?mixed}
         */
        random: function() {
            return (this.arr && this.arr[arale.$random(0, this.arr.length - 1)]) || null;
        },

        /**
         * push一项原由数组没有的项
         * @memeberOf arale.array
         * @param {Object} item 插入的项.
         * @example
         * var arr = $A(['a', 'b', 'c']);
         * arr.include('c'); //return ['a', 'b', 'c']
         * arr.include('d'); //return ['a', 'b', 'c', 'd']
         * @return {Array}
         */
        include: function(item) {
            if (!this.contains(item)) this.arr.push(item);
            return this.arr;
        },

        /**
         * 合并两个数组
         * @memeberOf arale.array
         * @param {Array} array 操作的数组对象.
         * @example
         * var arr = $A(['a', 'b', 'c']);
         * arr.combine(['d','c']); //return ['a', 'b', 'c', 'd']
         * @return {Array}
         */
        combine: function(array) {
            var arr = [],
                that = this;
            $A(array).each(function(item) {
                arr = that.include(item);
            });
            return arr;
        },

        /**
         * 移除等于该值的项
         * @memeberOf arale.array
         * @param {Object} item 需要移除项的值.
         * @example
         * var arr = $(['a', 'b', 'c', 'a']);
         * arr.erase('a'); //return ['b', 'c']
         * @return {Array}
         */
        erase: function(item) {
            var arr = this.arr;
            this.each(function(member, index) {
                if (member === item) {
                    arr.splice(index, 1);
                }
            });
            return arr;
        },

        /**
         * 清空数组
         * @memeberOf arale.array
         * @example
         * var arr = ['a', 'b', 'c', 'a'];
         * arr.empty(); //return []
         * @return {Array}
         */
        empty: function() {
            this.arr.length = 0;
            return this.arr;
        },

        /**
         * 合并成一个单一数组
         * @memeberOf arale.array
         * @example
         * var myArray = $A([1,2,3,[4,5, [6,7]], [[[8]]]]);
         * var newArray = myArray.flatten(); //newArray is [1,2,3,4,5,6,7,8]
         * @return {Array}
         */
        flatten: function() {
            return this.inject([], function(array, item) {
                if (item instanceof Array) return array.concat($A(item).flatten());
                array.push(item);
                return array;
            });
        },

        /**
         * 将hex颜色值转化成RGB格式
         * @param {Boolean} array 是否以数组格式返回，默认为false.
         * @example
         * $A(['11','22','33']).hexToRgb(); //returns "rgb(17,34,51)"
         * $A(['11','22','33']).hexToRgb(true); //returns [17, 34, 51]
         * @return {Array|String}
         */
        hexToRgb: function(array) {
            if (this.arr.length !== 3) return null;
            var rgb = this.map(function(value) {
                if (value.length === 1) value += value;
                return $S(value).toInt(16);
            });
            return (array) ? rgb : 'rgb(' + rgb + ')';
        },

        /**
         * 将rgb颜色值转化成"#12323"类似格式
         * @param {Boolean} array 是否以数组格式返回，默认为false.
         * @example
         * $A([17,34,51]).rgbToHex(); //returns "#112233"
         * $A([17,34,51]).rgbToHex(true); //returns ['11','22','33']
         * $A([17,34,51,0]).rgbToHex(); //returns "transparent"
         * @return {Array|String}
         */
        rgbToHex: function(array) {
            if (this.arr.length < 3) return null;
            if (this.arr.length === 4 && this.arr[3] === 0 && !array) return 'transparent';
            var hex = [];
            for (var i = 0; i < 3; i++) {
                var bit = (this.arr[i] - 0).toString(16);
                hex.push((bit.length == 1) ? '0' + bit : bit);
            }
            return (array) ? hex : '#' + hex.join('');
        },

        /**
         * 根据定义的规则来累计值,该方法常用于构建数组、计数数值总和或平均值等。
         * @param {Anything} memo 初始值.
         * @param {Function} iterator 回调函数.
         * @param {Object} context 作用域.
         * @example
         * $A([1,2,3,4,5,6,7,8,9,10]).inject(0, function(acc, n) {
         return acc + n;
         * }); //return 55 	(1 到 10 的总和)
         * $A([2,3,4,5]).inject(1, function(acc, n) {
         *	return acc * n;
         * });  // return 120 (5 的阶乘)
         * $A(['hello', 'world', 'this', 'is', 'nice']).inject([],
         *	 function(array, value, index) {
         if (0 == index % 2)
         array.push(value);
         return array;
         }
         * ); //return 	['hello', 'this', 'nice']
         * @return {mixed}
         */
        inject: function(memo, iterator, context) {
            this.each(function(value, index) {
                memo = iterator.call(context, memo, value, index);
            });
            return memo;
        },
        /**
         * 删除一个元素,目前支持一个
         * @param {Object} item
         * @example
         * @return {Array|String}
         */
        remove: function(item) {
            var index = this.indexOf(item);
            if (index > -1) {
                this.arr.splice(index, 1);
            }
        }
    });
    CArray.prototype['toString'] = function() {
        return this.arr.toString();
    };
    CArray.prototype['valueOf'] = function() {
        return this.arr.valueOf();
    };
    //return new Temp(node);
    var ArrayFactory = function(arr) {
        //如果是NodeList则不处理，这是为了与以前的代码兼容
        //if(arr.Arr) {return arr;}
        if(arr.arr) {
            return arr;
        }
        return new CArray(arr);
    }
    ArrayFactory.fn = CArray.prototype;

    return ArrayFactory;
}, '$A');
A = $A;

//TODO,push ,pop 这些原生的方法没有在包装类型中实现.

/**Last Changed Author: shuai.shao--Last Changed Date: Sun May 22 15:54:08 CST 2011**/
arale.deps.depsToModule('arale.array-1.1.js').moduleStatus(arale.deps.LOAD.loaded);
arale.deps.depsToModule('arale.array-1.1-src.js').moduleStatus(arale.deps.LOAD.loaded);
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(arale){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
		soFar = selector, ret, cur, pop, i;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec("");
		m = chunker.exec(soFar);

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string",
				elem, i = 0, l = checkSet.length;

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return (/h\d/i).test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return (/input|select|textarea|button/i).test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [], i = 0;

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.compareDocumentPosition ? -1 : 1;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.sourceIndex ? -1 : 1;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.ownerDocument ? -1 : 1;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !Sizzle.isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

Sizzle.contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

Sizzle.isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
window.$$ = function(selector, context, results, seed){
	if(context) {
		context = context.node ? context.node : context;
	}
	var results = Sizzle(selector, context, results, seed);
	var nodes = [];
	$A(results).each(function(elem){
		nodes.push($Node(elem));
	});
	return nodes;
};
window.$  = function(id){
	if(!id)return null;
	if(id.node)return id;
	if(!arale.isString(id) && id.nodeType){
		return $Node(id);
	}
	var node = document.getElementById(id);
	if(node){
	    return $Node(node);
	}
	return null;
};

arale.dom = arale.dom || {};

arale.dom.filter_ = function(selector, eles) {
    return Sizzle.matches(selector, eles);
};

arale.dom.sizzle = Sizzle;

})(arale);

/**
 * @name arale.dom
 * @namespace
 * Dom操作模块，可以对dom进行创建，遍历，插入等
 * @description
 * arale.dom 封装了主要针对document, window的一些操作方法，另外少许对HTMLElement操作的方法，更多对dom操作的方法以及链式操作 具体请参见 { @link arale.Node }
 */
arale.module("arale.dom", (function(){
	
	var isIE     = arale.browser.Engine.trident;
	var isOpera  = arale.browser.Engine.presto;
	var isSafari = arale.browser.Engine.webkit;
	var isBody   = function(element){
		return (/^(?:body|html)$/i).test(element.tagName);
	}
	
	// 支持 _toDom 这个方法
	var tagWrap = {
			option: ["select"],
			tbody: ["table"],
			thead: ["table"],
			tfoot: ["table"],
			tr: ["table", "tbody"],
			td: ["table", "tbody", "tr"],
			th: ["table", "thead", "tr"],
			legend: ["fieldset"],
			caption: ["table"],
			colgroup: ["table"],
			col: ["table", "colgroup"],
			li: ["ul"]
		},
		reTag = /<\s*([\w\:]+)/,
		masterNode = {}, masterNum = 0,
		masterName = "__araleToDomId";

	// generate start/end tag strings to use
	// for the injection for each special tag wrap case.
	for(var param in tagWrap){
		var tw = tagWrap[param];
		tw.pre  = param == "option" ? '<select multiple="multiple">' : "<" + tw.join("><") + ">";
		tw.post = "</" + tw.reverse().join("></") + ">";
		// the last line is destructive: it reverses the array,
		// but we don't care at this point
	}
	var specialAttr = $H({
		appendTo: function(node,value){
			value.appendChild(node.node);
		},
		innerHTML: function(node,value){
			node.setHtml(value);
		},
		style: function(node,value){
			node.setStyle(value);
		},
		"class": function(node,value){
			node.addClass(value);
		}
	});
	/** @lends arale.dom */
	return {
		/**
         * 获取元素可见区域的高度
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的可见区域高度
         * @example
         * $D.getViewportHeight($('node1'));
         * @returns {Number} 元素可见区域高度
         */
		getViewportHeight : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){
		    	var height = self.innerHeight, // Safari, Opera
	                mode = document['compatMode'];
	            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
	                height = (mode == 'CSS1Compat') ?
	                        document.documentElement.clientHeight : // Standards
	                        document.body.clientHeight; // Quirks
	            }
				return height;
			}
			
			return element.offsetHeight;
        },
		
		/**
         * 获取元素可见区域的宽度
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的可见区域宽度
         * @example
         * $D.getViewportWidth($('node1'));
         * @returns {Number} 元素可见区域宽度
         */
		getViewportWidth : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){
		    	var width = self.innerWidth,  // Safari
	                mode = document['compatMode'];

	            if (mode || isIE) { // IE, Gecko, Opera
	                width = (mode == 'CSS1Compat') ?
	                        document.documentElement.clientWidth : // Standards
	                        document.body.clientWidth; // Quirks
	            }
				return width;
			}
			return element.offsetWidth;
        },
		
		/**
         * 获取元素实际高度(scroll在内)
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的实际高度
         * @example
         * $D.getDocumentHeight($('node1'));
         * @returns {Number} 元素实际高度(scroll在内)
         */
		getDocumentHeight : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){
            	var scrollHeight = (document['compatMode'] != 'CSS1Compat' || isSafari) ? document.body.scrollHeight : document.documentElement.scrollHeight,
	                h = Math.max(scrollHeight, $D.getViewportHeight());

	            return h;
			}
			
			return element.scrollHeight;
        },
		
		/**
         * 获取元素实际宽度(scroll在内)
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的实际宽度
         * @example
         * $D.getDocumentWidth($('node1'));
         * @returns {Number} 元素实际宽度(scroll在内)
         */
        getDocumentWidth : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){	
            	var scrollWidth = (document['compatMode'] != 'CSS1Compat' || isSafari) ? document.body.scrollWidth : document.documentElement.scrollWidth,
	                w = Math.max(scrollWidth, $D.getViewportWidth());
				return w;
			}
            return element.scrollWidth;
        },
		
		/**
         * 获取元素scroll当前位置
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的scroll当前位置
         * @example
         * $D.getScroll($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示scroll位置
         */
		getScroll : function(element) {
		    element = element || document;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){	
            	return {
					left : Math.max(document['documentElement'].scrollLeft, document.body.scrollLeft),
					top  : Math.max(document['documentElement'].scrollTop, document.body.scrollTop)
				}
			}
			return {left : element.scrollLeft, top : element.scrollTop};
        },
		
		/**
         * 获取元素scroll当前位置(其所有父元素的scroll累加)
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的scroll当前位置(其所有父元素的scroll累积)
         * @example
         * $D.getScrolls($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示scroll当前位置(其所有父元素的scroll累加)
         */
		getScrolls: function(element){
		    element = element || document;
			element = element.node ? element.node : element;
            var position = {left : 0, top : 0};
            while (element && ! isBody(element)){
                position.left += element.scrollLeft;
                position.top += element.scrollTop;
                element = element.parentNode;
            }
            return position;
        },

		/**
         * 获取元素相对当前窗口的坐标
         * @param {HTMLElement} [element] 元素对象
         * @example
         * $D.getOffsets($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示元素相对当前窗口的坐标
         */
		getOffsets : function(element) {
			element = element.node ? element.node : element;
		    var getNextAncestor = function(node){
		    	var actualStyle;
			    if( window.getComputedStyle ) {
			      actualStyle = getComputedStyle(node,null).position;
			    } else if( node.currentStyle ) {
			      actualStyle = node.currentStyle.position;
			    } else {
			      actualStyle = node.style.position;
			    }
			    if( actualStyle == 'absolute' || actualStyle == 'fixed' ) {
			      return node.offsetParent;
			    }
			    return node.parentNode;
		   }
		   if( typeof( element.offsetParent ) != 'undefined' ) {
		    	var originalElement = element;
			    for( var posX = 0, posY = 0 ; element; element = element.offsetParent ) {
			      posX += element.offsetLeft;
			      posY += element.offsetTop;
			    }
			    if( !originalElement.parentNode || !originalElement.style || typeof( originalElement.scrollTop ) == 'undefined' ) {
			      return {left : posX, top : posY };
			    }
			    element = getNextAncestor(originalElement);
			    while( element && element != document.body && element != document.documentElement ) {
			      posX -= element.scrollLeft;
			      posY -= element.scrollTop;
			      element = getNextAncestor(element);
			    }
			    return { left : posX, top : posY };
		   } else {
		    	return { left : element.x, top : element.y };
		   }
		},
		
		/**
         * 获取元素相对坐标
         * @param {HTMLElement} element 元素对象
         * @param {HTMLElement} [relative] 相对元素，默认为offsetParent
         * @example
         * $D.getPosition($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示元素相对坐标
         */
		getPosition : function(element, relative){
			if(!element) return null;
			element = element.node ? element.node : element;
            relative = relative || $D.getOffsetParent(element);
			if (isBody(element)) return {left : 0, top : 0};
            var offset = $D.getOffsets(element),
                scroll = $D.getScrolls(element);
		
            var position = {
                left : parseInt(offset.left) - parseInt(scroll.left),
                top  : parseInt(offset.top) - parseInt(scroll.top)
            };
            var relativePosition = (relative) ? $D.getPosition(relative) : {left : 0, top : 0};
            return {left : parseInt(position.left) - parseInt(relativePosition.left), top : parseInt(position.top) - parseInt(relativePosition.top)};    
        },

		getComputedStyle: function(node, property){
            node = node.node || node;
			if (node.currentStyle) return node.currentStyle[$S(property).camelCase()];
			var computed = node.ownerDocument.defaultView.getComputedStyle(node, null);
			return (computed) ? computed[$S(property).camelCase()] : null;
		},
		
		/**
         * 获取元素的offsetParent
         * @param {HTMLElement} [element] 元素对象
         * @example
         * $D.getOffsetParent($('node1'));
         * @returns {HTMLElement|null} 元素的offsetParent
         */
		getOffsetParent: function(element){
			element = element.node ? element.node : element;
			if (isBody(element)) return null;
			if (!arale.isIE()) return element.offsetParent;
			while ((element = element.parentNode) && !isBody(element)){
				if (arale.dom.getComputedStyle(element, 'position') != 'static') return element;
			}
			return null;
		},
		/**
         * 转换一个html 字符串为 dom节点
         * @param {String} frag html字符串片段
         * @example
         * $D.toDom($('&lt;div id="div1"&gt;&lt;div&gt;'));
         * @returns {HTMLElement} 生成的DOM元素
         */
		toDom: function(frag){
			var master = this._getMaster(frag);
			if(master.childNodes.length == 1){	
				return master.removeChild(master.firstChild); // DOMNode
			}else{		
				var elem = master.removeChild(master.firstChild);
				while(elem.nodeType == 3){
					elem = master.removeChild(master.firstChild);
				}
				return elem;
			}
			//因为现在不可能有这这种情况,先不考虑,所以直接返回
			// 把多个节点作为一个documentFragment返回
			/*
			df = doc.createDocumentFragment();
			while(fc = master.firstChild){ 
				df.appendChild(fc);
			}
			return df; // DOMNode
			*/
		},
		toDomForTextNode: function(frag){
			var master = this._getMaster(frag);
			df = doc.createDocumentFragment();
			while(fc = master.firstChild){ 
				df.appendChild(fc);
			}
			return df;
		},
		_getMaster: function(frag){
			//转换一个html 字符串为 dom节点
			doc = document;
			var masterId = doc[masterName];
			if(!masterId){
				doc[masterName] = masterId = ++masterNum + "";
				masterNode[masterId] = doc.createElement("div");
			}
			// 确保我们的flag是一个字符串
			frag += "";

			//获取开始的tag,然后获取这个最外层的tag
			var match = frag.match(reTag),
				tag = match ? match[1].toLowerCase() : "",
				master = masterNode[masterId],
				wrap, i, fc, df;
			if(match && tagWrap[tag]){
				wrap = tagWrap[tag];
				master.innerHTML = wrap.pre + frag + wrap.post;
				for(i = wrap.length; i; --i){
					master = master.firstChild;
				}
			}else{
				master.innerHTML = frag;
			}
			return master;	
		},
		/**
         * 替换dom节点
         * @param { HTMLElement } element 需要被替换的元素对象
		 * @param { HTMLElement } element 需要去替换的元素对象
         */
		replace: function(refNode,node){
			refNode = refNode.node ? refNode.node : refNode;
			node = node.node ? node.node: node;
			refNode.parentNode.replaceChild(node, refNode);
		},
		create: function(type,param){		
			var node = $(document.createElement(type));
			if(type == "script" || type == "iframe"){
				if(param['callback']){
					if(node.node.attachEvent){
						node.node.attachEvent("onload",param['callback']);
					}else{
						node.node.onload = param['callback']
					}
					delete param['callback'];
				}			
			}
			var temp = {};
			specialAttr.each(function(attr){
				param[attr] && (temp[attr] = param[attr]);
				delete param[attr];
			});
			node.setAttributes(param);
			$H(temp).each(function(attr,value){
				specialAttr.obj[attr](node,value);
			});
			return node;
		},
		/**
         * 给node list 设置样式
         * @param { Array } nodes 需要设置样式的数组
         */
		setStyles: function(nodes,style){
			$A(nodes).each(function(node){
				$(node).setStyle(style);
			});
		},
		append: function(parent, elem) {
			if(!arale.domManip) return;
			arale.domManip(elem, function(fragment) {
				parent.appendChild(fragment);
			});	
		}
	}
}), '$D');

D = $D;
//TODO create,getText,getValue,ancestor

/**
 * @name arale.node
 * @class
 * 对HTMLElement的最次封装，可以对元素进行方便的创建，遍历，插入等操作
 * @param {HTMLElement} node 要包装的DOM对象
 * @returns {Node} 包装后的对象
 * @description
 * arale.node 操作返回Node对象，只是对你传入的元素进行了增加，你用链式的方式对你得到的节点进行操作
 * @example
 * $Node(document.getElementById("id"));
 */
arale.module("arale.node", (function(){

	var attributes = {
		'html': 'innerHTML',
		'class': 'className',
		'for': 'htmlFor',
		'defaultValue': 'defaultValue',
		'text': (arale.browser.Engine.trident || (arale.browser.Engine.webkit && arale.browser.Engine.version < 420)) ? 'innerText' : 'textContent'
	};
	
	var inserters = {

        before: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            if(context.parentNode) context.parentNode.insertBefore(element, context);
        },

        after: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            if (!context.parentNode) return;
            var next = context.nextSibling;
            (next) ? next.parentNode.insertBefore(element,next) : context.parentNode.appendChild(element);
        },

        bottom: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            context.appendChild(element);
        },

        top: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            var first = context.firstChild;
            (first) ? context.insertBefore(element, first) : context.appendChild(element);
        }
    };
	
	var match = function(element, selector){
        //return (!tag || (tag == element) || element.tagName.toLowerCase() == tag.toLowerCase());
		//return (!selector || (selector == element) || $A($A($$(selector, element.parentNode)).map(function(item){return item.node;})).contains(element));
        return !selector || (selector == element) || arale.dom.filter_(selector, [element]).length;
    };
	var Node = arale.dblPrototype(document.createElement("div"),function(node){
		this.node  = node;
		this.noded = true;
	});
	
	var isTable = function(nodeName){
		
	}
		
	arale.augment(Node,
	/** @lends arale.node.prototype */
	{
		/**
		 * @ignore 
		 * 遍历查找相关元素
		 */
		walk: function(walk, start, tag, all){
			var el = this.node[start || walk];
	        var elements = [];
	        while (el){
	            if (el.nodeType == 1 && (!tag || match(el, tag))){
	                if (!all) return $(el);
	                elements.push($(el));
	            }
				el = el[walk];
	        }
	        return (all) ? elements : null;
		},
		
		/**
		 * 插入多个元素到当前元素
		 * @param {HTMLElement[,others]} arguments 需要插入的元素
		 * @example
		 * var node1 = $Node('div');
		 * var node2 = $Node('div');
		 * $('parentNode').adopt(node1, node2) //在parentNode中插入node1 和 node2
		 * @returns {Node} 原对象
		 */
		adopt: function(){
			var that = this;
            arguments = Array.prototype.slice.call(arguments);
            $A(arguments).each(function(el){
                if(el){
					el = el.node || el;
                    that.node.appendChild(el);
                }
            });
            return this;
        },
		
		/**
		 * 将元素插入到某个元素中的指定位置
		 * @param {HTMLElement} el 目标元素
		 * @param {String} where  插入的位置, before, after, bottom, top 默认bottom
		 * @example
		 * $Node('div').inject(document.body) //将新创建的div元素插入到document.body中
		 * $Node('div').inject($('node1'),'before') //将新创建的div元素插入到node1的前面
		 * @returns {Node} 原对象
		 */
		inject: function(el, where){
			//有可能el也是我们的Node类型
			el = el.node || el;
            inserters[where || 'bottom'](el, this.node);
            return this;
        },
	
		/**
		 * 获取前一个兄弟节点或满足条件的兄弟节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').prev() //获取node1前一个兄弟节点
		 * $('node1').prev('div') //获取node1前一个tagName为div的兄弟节点
		 * @returns {Node | Array} 前一个兄弟节点对象或满足条件的兄弟节点数组
		 */
		prev: function(match){
			return this.walk('previousSibling', null, match, false);
		},	
		
		/**
		 * 获取所有前面的兄弟节点或满足条件的兄弟节点
		 * @param {String} match 选择器
		 * @example
		 * $('node1').prevAll() //获取所有在node1前面的兄弟节点
		 * $('node1').prevAll('div') //获取所有在node1前面的tagName为div的兄弟节点
		 * @returns {Node} 所有前面的兄弟节点或满足条件的兄弟节点数组
		 */
		prevAll: function(match){
			return this.walk('previousSibling', null, match, true);
		},
		
		/**
		 * 获取所有后面的兄弟节点或满足条件的兄弟节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').next() //获取node1前一个兄弟节点
		 * $('node1').next('div') //获取node1前一个tagName为div的兄弟节点
		 * @returns {Node} 所有后面的兄弟节点或满足条件的兄弟节点
		 */		
		next: function(match){
			return this.walk('nextSibling', null, match, false);
		},	
		
		/**
		 * 获取所有后面的兄弟节点或满足条件的兄弟节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').nextAll() //获取所有在node1后面的兄弟节点
		 * $('node1').nextAll('div') //获取所有在node1后面的tagName为div的兄弟节点
		 * @returns {Node} 所有后面的兄弟节点或满足条件的兄弟节点
		 */	
		nextAll: function(match){
			return this.walk('nextSibling', null, match, true);
		},
		
		/**
		 * 获取第一个子节点或者满足条件的子节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').first() //获取node1的第一个子节点
		 * $('node1').first('div') //获取node1的tagName为div的第一个子节点
		 * @returns {Node} 第一个子节点或者满足条件的子节点
		 */		
		first: function(match){
			return $(this.walk('nextSibling', 'firstChild', match, false));
		},	
		
		/**
		 * 获取最后一个子节点或者满足条件的子节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').last() //获取node1的最后一个子节点
		 * $('node1').last('div') //获取node1的tagName为div的最后一个子节点
		 * @returns {Node} 最后一个子节点或者满足条件的子节点
		 */	
		last: function(match){
			return $(this.walk('previousSibling', 'lastChild', match, false));
		},
		
		/**
		 * 获取第一个父节点或者满足条件的父节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').parent() //获取node1的第一个父节点
		 * $('node1').parent('div') //获取node1的tagName为div的父节点
		 * @returns {Node} 第一个父节点或者满足条件的父节点
		 */		
		parent: function(match){
			return $(this.walk('parentNode', null, match, false));
		},
		
		/**
		 * 获取满足条件的父节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').parents() //获取node1的所有父节点
		 * $('node1').parents('div') //获取node1的tagName为div的所有父节点
		 * @returns {Array} 满足条件的父节点
		 */		
		parents: function(match){
			return this.walk('parentNode', null, match, true);
		},
		
		/**
		 * 获取所有子节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').nodes() //获取node1的所有子结点
		 * $('node1').nodes('div') //获取node1的tagName为div的所有子节点
		 * @returns {Array} 所有子节点
		 */		
		nodes: function(match){
			return this.walk('nextSibling', 'firstChild', match, true);
		},
		
		/**
		 * 获取或者设置元素单个属性
		 * @param {String} key 属性名
		 * @param {String} [value] 属性值 
		 * @example
		 * $('node1').attr('id') //获取node1的id属性
		 * $('node1').attr('id','node2') //设置node1的id属性为node2
		 * @returns {Node | String}  若设置属性值，则返回原对象；若获取属性值，则返回属性值。
		 */		
		attr: function(key, value){
			if(key){
				if(attributes[key]) key = attributes[key];
                if (!arale.isUndefined(value)) {
					if(key == 'class' || key == 'className'){
						this.node.className = value;
					}else{
						this.node[key] = value;
						this.node.setAttribute(key , value);
					}
					return $Node(this.node);
				}else{
					if(key == 'class' || key == 'className'){
						return this.node.className;
					}
					return (!arale.isUndefined(this.node[key])) ? this.node[key] : this.node.getAttribute(key);
				}
			}
			return this;
		},	
		/**
		 * 设置元素多个属性
		 * @param {Object} attributes 属性键值对
		 * @example
		 * $('node1').attrs({id : 'node2', 'data' : '123'})
		 * @returns {Node} 原对象
		 */
		attrs: function(attries){
			for (var attr in attries) {
				if(attributes[attr]) attr = attributes[attr];
				if(attr == 'class' || attr == 'className'){
					this.node.className = attries[attr];
				}else{
					this.node[attr] = attries[attr];
					this.node.setAttribute(attr, attries[attr]);
				}
            }
            return this;	
		},
		/**
		 * 设置元素多个属性,
         * @deprecated 从1.1以后此方法废弃，您可以使用attrs方法代替
		 * @param {Object} attributes 属性键值对
		 * @example
		 * $('node1').setAttributes({id : 'node2', 'data' : '123'})
		 * @returns {Node} 原对象
		 */	
		setAttributes: function(attries){		
            return this.attrs(attries);
		},	
		
		/**
		 * 获取元素多个属性
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').getAttrs("id" , "data"}); //return {id : 'node1' , data : '123'}
		 * @returns {Object} 获取的多属性对象
		 */	
		getAttrs: function(){
			var that = this;
            var args = $A(arguments).map(function(arg){
				if(attributes[arg]) arg = attributes[arg];
				if(arg == 'class' || arg == 'className'){
					return that.node.className;
				}else{
					return (!arale.isUndefined(that.node[arg])) ? that.node[arg] : that.node.getAttribute(arg);
				}
            });
            return $A(args).associate(arguments);
		},
		/**
		 * 获取元素多个属性
         * @deprecated 从1.1以后此方法废弃，您可以使用attrs方法代替
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').getAttributes("id" , "data"}); //return {id : 'node1' , data : '123'}
		 * @returns {Object} 获取的多属性对象
		 */	
		getAttributes: function(){
			return this.getAttrs.apply(this,arguments);
		},
		
		/**
		 * 删除元素多个属性
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').removeAttrs("id" , "data"});
		 * @returns {Node} 原对象
		 */		
		removeAttrs: function(){
			var that = this;
            $A(arguments).each(function(arg){
                return that.node.removeAttribute(arg);
            });
            return this;
		},
		
		/**
		 * 删除元素多个属性
         * @deprecated 从1.1以后此方法废弃，您可以使用attrs方法代替
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').removeAttributes("id" , "data"});
		 * @returns {Node} 原对象
		 */		
		removeAttributes: function(){
			return this.removeAttrs.apply(this,arguments);
		},
		
		/**
		 * 是否包含指定的类名
		 * @param {String} className 类名
		 * @example
		 * $('node1').hasClass('heighlight');
		 * @return {Boolean} 是否包含指定的类名
		 */		
		hasClass: function(className){
            return Boolean(this.node.className.match(new RegExp('(\\s|^)' + className +'(\\s|$)')));
        },
		
		/**
		 * 添加类名
		 * @param {String} className 类名
		 * @example
		 * $('node1').addClass('heighlight');
		 * @returns {Node} 原对象
		 */
		addClass: function(className){
			if (!this.hasClass(className)) this.node.className = $S(this.node.className + ' ' + className).clean();
            return this;
		},
		
		/**
		 * 删除类名
		 * @param {String} className 类名
		 * @example
		 * $('node1').removeClass('heighlight');
		 * @returns {Node} 原对象
		 */		
		removeClass: function(className){
            this.node.className = this.node.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
            return this;
        },
		
		/**
		 * 交替类
		 * @param {String} className 类名
		 * @example
		 * $('node1').toggleClass('heighlight');
		 * @return {Node} 原对象
		 */
        toggleClass: function(className){
            return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
        },

		/**
		 * 拷贝一个元素
		 * @param {Boolean} [contents] 是否拷贝元素里面的内容
		 * @param {Boolean} [keepid] 是否保留Id
		 * @example
		 * $('node1').clone();
		 * @returns {Node} 新拷贝出的对象
		 */
		clone: function(contents, keepid){
            contents = contents !== false;
			var props = {
				input: 'checked', 
			 	option: 'selected', 
			 	textarea: (arale.browser.Engine.webkit && arale.browser.Engine.version < 420) ? 'innerHTML' : 'value'
			};
			var clone = this.node.cloneNode(contents);
            var clean = function(cn, el){
                if (!keepid) cn.removeAttribute('id');
                if (arale.browser.Engine.trident){
                    cn.mergeAttributes(el);
                    if(cn.options){
                        var no = cn.options, eo = el.options;
                        for(var j = no.length; j--;){
                            no[j].selected = eo[j].selected;
                        }
                    }
                    var prop = props[el.tagName.toLowerCase()];
                    if(prop && el[prop]) cn[prop] = el[prop];
                }
            };
			if (contents){
                var ce = clone.getElementsByTagName('*'),
                    te = this.node.getElementsByTagName('*');
                for (var i = ce.length; i--;) clean(ce[i], te[i]);
            }

            clean(clone, this.node);
            return $Node(clone);
        },
		
		/**
		 * 设置滚动条到某个位置
		 * @param {Number} x x坐标
		 * @param {Number} y y坐标
		 * @example
		 * $('node1').scrollTo(10, 20);
		 * @return {Node} 原对象
		 */
		scrollTo: function(x, y){
            if ((/^(?:body|html)$/i).test(this.node.tagName)){
                this.node.ownerDocument.window.scrollTo(x, y);
            } else {
                this.node.scrollLeft = x;
                this.node.scrollTop = y;
            }
            return this;
        },
		
		/**
		 * 获取元素样式
		 * @param {String} arguments 要获取的样式名称
		 * @example
		 * $('node1').getStyle('background', 'border'); //return {Object}
		 * $('node1').getStyle('background'); //return {String} 
		 * @returns {Object|String} 要获取的样式
		 */
		getStyle: function() {
			var that = this;
			var get_style = function(style){
				if(style == 'float') {
					style = arale.isIE() ? 'styleFloat' : 'cssFloat';
				}
				style = $S(style).camelCase();
			    var value = that.node.style[style];

			    if (!value || value == 'auto') {
				  value = that.getComputedStyle(style);
			    }	
				var color = /rgba?\([\d\s,]+\)/.exec(value);
                if (color) value = value.replace(color[0], $S(color[0]).rgbToHex());

			    if (style == 'opacity') {
                    return this.getOpacity();
                    /*
					try{
						return parseFloat(value)
					}catch(e){
						return 1.0;
					}
                    */
				}
				
				//Opera IE需用offsetTop&offsetLeft来获取宽高
				if ( arale.isOpera() || ( arale.isIE() && isNaN(parseFloat(value))) ) {
					if (/^(height|width)$/.test(style)){
						var values = (style == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
						$A(values).each(function(value){
							size += parseInt(get_style('border-' + value + '-width')) + parseInt(get_style('padding-' + value));
						});
						value = that.node['offset' + $S(style).capitalize()] - size + 'px';
					}
					if ( arale.isOpera() && String(value).indexOf('px') != -1 ) return value;
					if ( /(border(.+)Width|margin|padding)/.test(style)) return '0px';
				}
				
			    return value == 'auto' ? null : value;
			
			}

			if(!arguments.length){
				return null;
			}

			if(arguments.length > 1){
				var result = {};
				for(var i=0;i<arguments.length;i++){
					result[arguments[i]] = get_style(arguments[i]);
				}
				return result;
			}
			return get_style(arguments[0]);
		},
		
		/**
		 * 获取元素opacity值
		 * @example
		 * $('node1').getOpacity('opacity');
		 * @returns {String} opacity值，0-1之间
		 */
		getOpacity: function() {
		  	//return this.getStyle('opacity');
            var opacity = null;
            //Get the opacity based on the current browser used
            if(arale.isIE() && Number(arale.browser.ver()) < 9) {
                filter = this.node.style.filter;
                if(filter) {
                    alpha = filter.split("alpha(opacity=");
                    opacity = alpha[1].substr(0,(alpha[1].length-1))/100;
                }
            }
            else {
                opacity = this.node.style.opacity;
            }
            opacity = parseFloat(opacity);
            return (!opacity && opacity!=0) ? 1.0 : opacity;
		},
		
		/**
		 * 设置元素属性
		 * @example
		 * $('node1').setStyle({
		 *		'height' : '200px',
		 *		'width'  : '300px'
		 * });
		 * $('node1').setStyle('height','200px');
		 * @returns {Node} 原对象
		 */
		setStyle: function(styles) {
			var  match;
			if (arale.isString(styles) && arguments.length==2) {
			  var tmp = {};
			  tmp[arguments[0]] = arguments[1];
			  styles = tmp;
			}
			for (var property in styles){
			  if (property == 'opacity'){
				this.setOpacity(styles[property]);
			  }else if(property == 'class' || property == 'className'){
				this.className = new String(property);
			  }else{
			    this.node.style[(property == 'float' || property == 'cssFloat') ? 
					(arale.isUndefined(this.node.style.styleFloat) ? 'cssFloat' : 'styleFloat') : property] = styles[property];
			  }
			}
			return this;
		},
		
		/**
		 * 设置元素opacity值
         * @param {Number} value 要设置的opacity值，0-1之间
		 * @example
		 * $('node1').setOpacity(0.2);
		 * @returns {Node} 原对象
		 */
		setOpacity: function(value) {
            if(value >1 || value<0) {return this;}
			if(arale.isIE() && Number(arale.browser.ver()) < 9) {
				this.node.style.filter = 'alpha(opacity=' + value*100 + ')';
			}
            this.node.style.opacity = (value < 0.00001) ? 0 : value;
			//this.node.style.opacity = (value == 1 || value === '') ? this.getOpacity(value) : (value < 0.00001) ? 0 : value;
			return this;
		},	
			
		/**
		 * 获取元素可见区域宽，高
		 * @example
		 * $('node1').getViewportSize();
		 * @returns {Object} 类似{width:200 , height:300}的对象
		 */	
		getViewportSize: function(){
            return {
				width  : $D.getViewportWidth(this.node),
				height : $D.getViewportHeight(this.node)
			}
        },	
	
		/**
		 * 获取元素实际宽，高
		 * @example
		 * $('node1').getDocumentSize();
		 * @returns {Object} 类似{width:200 , height:300}的对象
		 */
		getDocumentSize: function(){
            return {
				width  : $D.getDocumentWidth(this.node),
				height : $D.getDocumentHeight(this.node)
			}
		},		
		
		/**
		 * 获取元素scroll位置
		 * @example
		 * $('node1').getScroll();
		 * @returns {Object} 类似{left : 200 , top : 300}的对象
		 */
		getScroll: function(){
			return $D.getScroll(this.node);
		},		
		
		/**
		 * 获取元素scroll当前位置(其所有父元素的scroll累加)
		 * @example
		 * $('node1').getDocumentSize();
		 * @returns {Object} 类似{left : 200 , top : 300}的对象
		 */
		getScrolls: function(){
			return $D.getScrolls(this.node);
		},
		
		/**
		 * 获取元素区块参数
		 * @example
		 * $('node1').region();
		 * @returns {Object} 类似{left : 200 , top : 300 , right : 400 , bottom : 600, width : 200, height : 300 }的对象
		 */
		region: function(){
			var position = this.getOffsets();
			var obj = {
                left   : position.left,
                top    : position.top,
                width  : $D.getViewportWidth(this.node),
                height : $D.getViewportHeight(this.node)
            };
            obj.right  = obj.left + obj.width;
            obj.bottom = obj.top  + obj.height;
			return obj;
		},
		/**
		 * 获取元素边框
		 * @example
		 * $('node1').border();
		 * @returns {Object} 类似{l : 200 , t : 300 , r : 400 , b : 600}的对象
		 */
		border: function(){
			var fix = this._toFixPx;
			return{
				l: fix(this.getStyle('border-left-width')),
				t: fix(this.getStyle('border-top-width')),
				r: fix(this.getStyle('border-right-width')),
				b: fix(this.getStyle('border-bottom-width'))	
			}
		},
		_toFixPx: function(value){
			//TODO可能需要对不同的浏览器进行扩展,来处理比如middle这类的情况
			return parseFloat(value) || 0;
		},
		/**
		 * @ignore
		 */
		getComputedStyle: function(property){
            return $D.getComputedStyle(this.node, property);
		},
		
		/**
         * 获取元素相对坐标
         * @param {HTMLElement} [element] 元素对象
         * @param {HTMLElement} [relative] 相对元素，默认为offsetParent
         * @example
         * $('node1').getPosition();
         * @returns {Object} 类似{left : 10, top : 10}的对象
         */
		getPosition : function(relative){
			return $D.getPosition(this.node, relative);
		},
		
		/**
         * 获取元素的offsetParent
         * @example
         * $('node1').getOffsetParent();
         * @returns {HTMLElement|null} 元素的offsetParent
         */
		getOffsetParent : function(){
			return $D.getOffsetParent(this.node);
		},
		
		/**
         * 获取元素相对当前窗口的坐标
         * @example
         * $('node1').getOffsets();
         * @returns {Object} 类似{left : 10, top : 10}的对象
         */
		getOffsets : function(){
			return $D.getOffsets(this.node);
		},
		
		/**
         * 设置元素坐标
         * @example
         * $('node1').setPosition({ left : 10, top : 10 });
         * @returns {Node} 原对象
         */
		setPosition: function(pos){
			var obj = { 
				left: new String(parseInt(pos.left) - (parseInt(this.getComputedStyle('margin-left')) || 0)) + 'px',
				top: new String(parseInt(pos.top) - (parseInt(this.getComputedStyle('margin-top')) || 0)) + 'px'
			}
			return this.setStyle(obj);
		},
		
		/**
         * DOM选择器, 详细文档请查看<a href="http://wiki.github.com/jeresig/sizzle/">Sizzle</a>
         * @example
         * $('node1').query('input[name=number]'); //返回node1下name值为number的input元素
         * @returns {Array} 利用sizzle选择出的对象
         */
		query : function(match){
			return $$(match, this.node);
		},
	
		/**
         * 销毁元素
         * @example
         * $('node1').dispose(); //返回node1下name值为number的input元素
         * @returns {Array} 删除掉的对象
         */	
		dispose : function(){
			return this.node.parentNode ? $Node(this.node.parentNode.removeChild(this.node)) : $Node(this.node);
		},

        /**
         * 清空所有子元素
         * @example
         * $('node1').empty(); 
         * @returns {Node} 原对象
         */
		empty: function(){
			while(this.node.firstChild){
				this.node.removeChild(this.node.firstChild);
			}
            return this;
		},

        /**
         * 设置innerHTML，此方法目前还比较粗糙,需要进一步完善
         * @returns {Node} 原对象
         */
		setHtml: function(html){
			//此方法目前还比较粗糙,需要进一步完善
			if(this._isTableInIe(this.node.nodeName)){
				var tempnode = $D.toDom(html);
				this.empty();
				this.node.appendChild(tempnode);
			}else{
				this.node.innerHTML = html;	
			}
			return this;
		},
		_isTableInIe: function(nodeName){
			return arale.isIE() && $A(["tbody","thead","tr","td"]).indexOf(nodeName.toLowerCase())>-1;
		},

        /**
         * 获取html
         */
		getHtml: function(){
			return $S(this.node.innerHTML).unescapeHTML();
		},
		/**
         * 替换dom节点
		 * @param { HTMLElement } element 需要去替换的元素对象
         * @example
         * $('div').replace('<div id="div1"><div>');
         * @returns {Node} 原对象
         */
		replace: function(node){
			node = node.node || node;
			this.node.parentNode.replaceChild(node,this.node);
            return this;
		}
	});
	
	Node.prototype['toString'] = function(){
		return this.node.toString();
	};
	Node.prototype['valueOf'] = function(){
		return this.node.valueOf();
	};
	
	//return new Temp(node);
	var NodeFactory = function(node){
		if(node.noded) return node;
		if(arale.isString(node)){
			node = document.createElement(node);
		}	
		return new Node(node);
	}
	
	NodeFactory.fn =Node.prototype;
	return NodeFactory;
}), '$Node');


$A(("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" ")).each(function(key){
		$Node.fn[key] = function(context,method){
			$E.connect(this,'on'+key,arale.hitch(context,method));
			return this;
			//return $E.connect(this,'on'+key,arale.hitch(context,method));
		};
});
$Node.fn['trigger'] = function(type,data){
	$E.trigger(this,type,data);
};

Node=$Node;

/**Last Changed Author: shuai.shao--Last Changed Date: Tue Aug 09 15:49:23 CST 2011**/
arale.deps.depsToModule('arale.dom-1.1.js').moduleStatus(arale.deps.LOAD.loaded);
arale.deps.depsToModule('arale.dom-1.1-src.js').moduleStatus(arale.deps.LOAD.loaded);
/**
 * @name arale.event.object
 * @namespace
 * 事件对象的封装,包括自定义事件和dom事件
 * @description
 * 可以直接使用$E.来操作方法
 */
arale.module('arale.event.object', (function(arale) {
    //fix delete currentTarget
    var doc = document,
        props = 'altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which'.split(' ');
    var EventObject = function(target, domEvent) {
        this.currentTarget = target;
        this.originalEvent = domEvent || {};
        //TODO如果自定义事件对象的处理
        if (domEvent && domEvent.type) {
            this.type = domEvent.type;
            this._fix();
        } else {
            this.type = domEvent;
            this.target = target;
        }
    };
    function returnFalse() {
        return false;
    }
    function returnTrue() {
        return true;
    }
    arale.augment(EventObject, /** @lends arale.event.object */ {
        _fix: function(event) {
               var that = this, originalEvent = this.originalEvent, l = props.length,
             prop, ct = this.currentTarget,
            ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe
            // clone properties of the original event object
            while (l) {
                prop = props[--l];
                that[prop] = originalEvent[prop];
            }
            // fix target property, if necessary
            if (!that.target) {
                that.target = that.srcElement || doc; // srcElement might not be defined either
            }
            // check if target is a textnode (safari)
            if (that.target.nodeType === 3) {
                that.target = that.target.parentNode;
            }
            // add relatedTarget, if necessary
            if (!that.relatedTarget && that.fromElement) {
                that.relatedTarget = (that.fromElement === that.target) ? that.toElement : that.fromElement;
            }
            // calculate pageX/Y if missing and clientX/Y available
            if (that.pageX === undefined && that.clientX !== undefined) {
                var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                that.pageX = that.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                that.pageY = that.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
            }
            // add which for key events
            if (!that.which) {
                that.which = (that.charCode) ? that.charCode : that.keyCode;
            }
            // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (that.metaKey === undefined) {
                that.metaKey = that.ctrlKey;
            }
            // add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!that.which && that.button !== undefined) {
                that.which = (that.button & 1 ? 1 : (that.button & 2 ? 3 : (that.button & 4 ? 2 : 0)));
            }
        },
        /**
         * 阻止事件原有的行为
         * @example
         * $E.connect(d,"onclick",function(e){e.preventDefault()});
         */
        preventDefault: function() {
            this.isDefaultPrevented = returnTrue;
            var e = this.originalEvent;
            if (!e) {
                return;
            }
            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },
        /**
         * 阻止事件冒泡
         * @example
         * $E.connect(d,"onclick",function(e){e.stopPropagation()});
         */
        stopPropagation: function() {
            this.isPropagationStopped = returnTrue;
            var e = this.originalEvent;
            if(!e) {
                return;
            }
            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }
        },
        /**
         *    Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         * @example
         *  $E.connect(d,"onclick",function(e){e.stopImmediatePropagation()});
         */
        stopImmediatePropagation: function() {
              this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        },
        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         * @example
         *  $E.connect(d,"onclick",function(e){e.halt()});
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
        },
        stopEvent: function(evt) {
            this.stopPropagation();
            this.preventDefault();
        },
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse
    });
    return {
        /**
         * 根据一个原生的事件对象,获取一个事件包装对象,主要是为了fix一些浏览器的差异
         * @memberOf arale.event.object
         * @param {Object || Node || String } target Node对象或者 element ID 或者普通的Object
         * @param {Event} event 原生的事件对象
         * @example
         * var e = e || window.event;
         * var eobject = $E.getEventObject(source,e);
         */
        getEventObject: function(target, event) {
            return new EventObject(target, event);
        }
    };
})(arale), '$E');

/**
 * @name arale.event.store
 * @namespace
 * 一个事件仓库,所有的事件绑定的处理函数,最终都会被添加到事件仓库里面.
 * @description
 * 可以直接使用$E.来操作方法 .
 */
arale.module('arale.event.store', (function(arale) {
    var array = arale.array, arr = Array.prototype;
    /**
        {
            targets:{
                id:target
            },
            handlers:{
                id:{type:[]}
            }
        }
    **/
    var store = function() {
        this.targets = {};
        this.handlers = {};
    }
    arale.augment(store, {
        /**
         * 给事件仓库添加一个事件 .
         * @memberOf arale.event.store.
         * @param {number} id 某一类事件的标示 .
         * @param {string} type 事件的类型.
         * @param {function} fn 事件处理函数.
         * @example
         * var store = $E.getStore();
         * store.addHandler("123","click",f1);
         */
        addHandler: function(id, type, fn) {
            //TODO 优化
            this._getHandlerList(id, type).push(fn);
            return fn;
        },
        _getHandlerList: function(id, type){
            var handlers = this.handlers;
            var handlersForId = handlers[id] || (handlers[id] = {});
            return (handlersForId[type] || (handlersForId[type] = []));
        },
        /**
         * 移除一个事件
         * @memberOf arale.event.store  .
         * @param {number} id 某一类事件的标示 .
         * @param {string} type 事件的类型 .
         * @param {function} fn 事件处理函数.
         * @example
         * var store = $E.getStore();
         * store.addHandler("123","click",f1);
         * store.removeHandler("123","click",f1);
         */
        removeHandler: function(id, type, fn) {
            var handlers = this.handlers, shandler;
            if (!handlers[id]) return;
            shandler = handlers[id];
            if (!shandler[type]) return;
            shandler[type] = $A(shandler[type]).filter(function(f) {
                return f != fn;
            });
            if (shandler[type].length === 0) {
                delete handlers[id][type];
            }
        },
        /**
         * 移除某这个类型的所有事件 .
         * @memberOf arale.event.store.
         * @param {number} id 某一类事件的标示  .
         * @param {string} type 事件的类型 .
         * @param {function} fn 事件处理函数.
         * @example
         * var store = $E.getStore();
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f2);
         * store.removeAllHandler("123","click");
         */
        removeAllHandler: function(id, type) {
            var handlers = this.handlers;
            if (handlers[id] && handlers[id][type]) {
                handlers[id][type] = null;
                delete handlers[id][type];
            }
        },
        /**
         * 调用某类型的所有事件 .
         * @memberOf arale.event.store .
         * @param {number} id 某一类事件的标示 .
         * @param {string} type 事件的类型 .
         * @param {Object} fn 事件对象   .
         * @example
         * var store = $E.getStore();
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f2);
         * store.invoke("123","click",{'name:kang'})
         */
        invoke: function(id, type, e) {
            var handlers = this.getHandlers(id, type), params = arr.slice.call(arguments, 2);
            $A(handlers).each(function(fn) {
                arale.isFunction(fn) && fn.apply(null, params);
            });
        },
        /**
         * 获取某类型的所有事件 .
         * @memberOf arale.event.store.
         * @param {number} id 某一类事件的标示.
         * @param {string} type 事件的类型 .
         * @example
         * var store = $E.getStore();
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f2);
         * var handlers = store.getHandlers("123","click");
         */
        getHandlers: function(id, type) {
            if (this.handlers[id] === undefined) return [];
            if (this.handlers[id][type] === undefined) {
                return this.handlers[id][type] = [];
            }
            return this.handlers[id][type];
        },
        getTarget: function(id) {
            return this.targets[id];
        },
        setTarget: function(target) {
            this.targets[id] = target;
        }
    });
    return/** @lends arale.event.store.prototype */{
        /**
         * 获取一个事件仓库.
         * @memberOf arale.event.store.
         * @example
         * var f1 = function(){console.log(1)};
         * var f2 = function(){console.log(2)};
         * var f3 = function(){console.log(3)};
         * var store = $E.getStore();
         * store.addHandler("123","click",f1);
         * store.addHandler("123","click",f2);
         * store.addHandler("123","click",f3);
         * store.invoke("123","click",{'name:kang'})
         * store.removeHandler("123",'click',f1);
         * store.invoke("123","click",{'name:kang'})
         */
        getStore: function() {
            return new store();
        }
    };
})(arale), '$E');

/**
 * @name arale.event.chain
 * @namespace
 * 一个事件仓库, 所有的事件绑定的处理函数, 最终都会被添加到事件仓库里面
 * @description
 * 可以直接使用$E.来操作方法
 */
arale.module('arale.event.chain', (function(arale) {
    var array = arale.array;
    var Action = function(fn) {
        this.handler = fn;
    };
    arale.augment(Action, {
        fire: function(e) {
            if (e && e.originalEvent && e.originalEvent.cancelBubble) {
                return;
            }else {
                this.handler.call(null, e);
                if (this.parent) {
                    this.parent.fire(e);
                }
            }
        },
        setParent: function(action) {
            this.parent = action;
        }
    });
    var Chain = function(fn) {
        if (arale.isArray(fn)) {
            var that = this, firstAction = fn.shift();
            this.action = new Action(firstAction);
            $A(fn).each(function(action) {
                that.addAction(action);
            });
        }else {
            this.action = new Action(fn);
        }
    };
    arale.augment(Chain, {
        /**
         * 在我们的chain中添加一个事件对象
         * @memberOf arale.event.chain
         * @param {Function} fn 事件处理函数.
         * @example
            * var chain = $E.getChains(f1);
         * chain.addAction(f2);
         * chain.addAction(f3);
         * chain.fire({name:kang});
         */
        addAction: function(fn) {
            var action = new Action(fn);
            action.setParent(this.action);
            this.action = action;
        },
        /**
         * 触发我们的chain
         * @memberOf arale.event.chain
         * @param {Object} e 在我们chain中需要传递的数据.
         * @example
         * var chain = $E.getChains(f1);
         * chain.addAction(f2);
         * chain.addAction(f3);
         * chain.fire({name:kang});
         */
        fire: function(e) {
            var obj = $E.getEventObject(this.action, e);
            this.action.fire.apply(this.action, [obj].concat(Array.prototype.slice.call(arguments)));
        }
    });
    return /** @lends arale.event.chain */{
         /**
         * 获取一个chain
         * @param {Function 或 Array} fn 初始化的action.
         * @example
         * var f1 = function() {console.log(1)};
            * var f2 = function() {console.log(2)};
            * var f3 = function() {console.log(3)};
         * var chain = $E.getChains(f1);
         * chain.addAction(f2);
         * chain.addAction(f3);
         * chain.fire({name:kang});
         * ========
         * var chain2 = $E.getChains([f1, f2, f3]) ;
         * chain2.fire();
         * ========
         * var chain3 = $E.getChains(f1, f2, f3) ;
         * chain3.fire();
         *
         */
        getChains: function(fn) {
            if (arguments.length > 1) {
                return new Chain([].slice.call(arguments, 0));
            }
            return new Chain(fn);
        }
    };
})(arale), '$E');

/**
 * @name arale.event.core
 * @namespace
 * 事件绑定的核心内容,提供了事件绑定的基本方法
 * @description
 * 可以直接使用$E.来操作方法
 */
arale.module('arale.event.core', (function(arale) {
    var slice = Array.prototype.slice,
        array = arale.array, dom = arale.dom,
        store = arale.event.store.getStore(),
        doc = document;

    var STORE_GUID = 'storeTargetId', SId = arale.now();
    //
    var getId = function(target) {
        return target[STORE_GUID] || (target[STORE_GUID] = (++SId));
    };
    var allEvents = 'blur focus focusin focusout load resize scroll' +
    ' unload click dblclick mousedown mouseup mousemove mouseover mouseout ' +
    ' mouseenter mouseleave change select submit keydown keypress keyup error popstate';
    var fixEvent = function(method) {
        if (allEvents.indexOf(method) > -1) {
            return 'on' + method;
        }
        return method;
    };
    var getDispatcher = function(store, source, method) {
        var serId = getId(source);
        if (isElement(source)) {
            return function(e) {
                e = e || window.event;
                var argums = slice.call(arguments, 1);
                var params = [serId, method].concat(e, argums);
                params[2] = $E.getEventObject(source, params[2]);
                store.invoke.apply(store, params);
            };
        } else {
            return function() {
                var c = arguments.callee, t = c.target,
                params = [serId, method].concat(slice.call(arguments));
                var r = (t && t.apply(null, arguments));
                store.invoke.apply(store, params);
                return r;
            };
        }
    };
    //
    var isElement = function(obj) {
        return obj && (obj.nodeType || obj.attachEvent || obj.addEventListener);
        //return obj && obj instanceof arale.Node;
    };
    var _topics = {};
    var keys = {
        // summary:
        //        Definitions for common key values
        BACKSPACE: 8,
        TAB: 9,
        CLEAR: 12,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        META: arale.isSafari() ? 91 : 224,        // the apple key on macs
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        INSERT: 45,
        DELETE: 46,
        HELP: 47,
        LEFT_WINDOW: 91,
        RIGHT_WINDOW: 92,
        SELECT: 93,
        NUMPAD_0: 96,
        NUMPAD_1: 97,
        NUMPAD_2: 98,
        NUMPAD_3: 99,
        NUMPAD_4: 100,
        NUMPAD_5: 101,
        NUMPAD_6: 102,
        NUMPAD_7: 103,
        NUMPAD_8: 104,
        NUMPAD_9: 105,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_PLUS: 107,
        NUMPAD_ENTER: 108,
        NUMPAD_MINUS: 109,
        NUMPAD_PERIOD: 110,
        NUMPAD_DIVIDE: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        F13: 124,
        F14: 125,
        F15: 126,
        NUM_LOCK: 144,
        SCROLL_LOCK: 145,
        // virtual key mapping
        copyKey: arale.isMac() ? (arale.isSafari() ? 91 : 224) : 17
    };
    var liveMap = {
        focus: 'focusin',
        blur: 'focusout',
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
    };
    return {
        /** @lends arale.event.core */
        /**
         * 添加事件
         * @param {Object 或 Node 或 String }.
         * element Node对象或者 element ID 或者普通的Object.
         * @param {String} event 事件名称.
         * @param {Function} handler 事件回调函数.
         * example
         * var obj = {
         *    fn: function() {
         *        console.log('name');
         *    }
         * }
         * var obj2 = {
         *    fn2: function() {
         *        console.log('name');
         *    }
         * }
         * $E.connect('div1','onclick',function(e) {
         *      alert(e)
         * });
         * $E.connect('div1','onclick',obj,obj.fn);
         * $E.connect('div1','onclick',obj,'fn');
         * $E.connect($('div1'),'onclick',function(e) {
         *      alert(e)
         * });
         * $E.connect(obj,'fn',obj2,'fn2');.
         */
        connect: function(/*Object|Node*/ obj, 
                         /*String*/ event, 
                         /*Object|null*/ context, 
                         /*String|Function*/ method) {
            event = fixEvent(event);
            if (arale.isArray(obj)) {
                //如果是绑定一个数组的话,那么取消也需要正个数组去取消
                var results = [], that = this;
                var callback = arale.hitch(context, method);
                $A(obj).each(function(o) {
                    results.push(that._connect(o, event, callback));
                });
                return results;
            } else {
                var temp = arale.hitch(context, method);
                return this._connect(obj, event, temp);
            }
        },
        /**
        * connect便捷方法
        **/
        on: function() {
            return this.connect.apply(this, arguments);
        },
        _connect: function(source, method, handler) {
            source = arale.isString(source) ? $(source) : source;
            if (source === null) {
                return null;
            }
            if (source.node) {
                source = source.node;
            }
            var f = source[method], d;
            if (!f || !source[STORE_GUID]) {
                //如果是dom元素,则f为空, 如果是普通对象的方法,f的id是空的
                d = source[method] = getDispatcher(store, source, method);
                d.target = f;
            }
            var serId = getId(source);
            store.addHandler(serId, method, handler);
            return [serId, method, handler];
        },
        /**
         * 移除某个事件下的所有方法
         * @param {Array} handler 在connect的时候返回的信息.
         * @example
         * var callback = function() { alert('test') };
         * var handler = $E.connect('div1','onclick',callback);
         * $E.code.disConnect(handlers);
         */
        disConnect: function(handler) {
            if (handler === null) {
                return;
            }
            if (arale.isArray(handler[0][0])) {
                var that = this;
                $A(handler).each(function(h) {
                    that._disConnect.apply(that, h);
                });
            } else {
                this._disConnect.apply(this, handler);
            }
        },
        /**
        * disconnect便捷方法
        **/
        off: function() {
            this.disConnect.apply(this, arguments);
        },
        _disConnect: function(serId, method, handler) {
            method = fixEvent(method);
            store.removeHandler(serId, method, handler);
        },
        /**
         * 移除所有该事件的方法
         * @param {Node || String || object} element HTML节点对象或ID.
         * @param {String} method 事件名称.
         * @example
         * $E.connect('button','onclick',callback1);
         * $E.connect('button','onclick',callback2);
         * $E.connect('button','onclick',callback3);
         * $E.disAllConnect('button','onclick');
         */
        disAllConnect: function(obj, method) {
            var serId = getId(obj);
            if (obj.node) {
                obj = obj.node;
                obj[method] = null;
            }
            method = fixEvent(method);
            store.removeAllHandler(serId, method);
        },
        /**
         * 订阅一个事件
         * @param {String} topic 事件的名称, 因为是全局事件, 所以需要控制命名.
         * @param {Object} context context.
         * @param {Function} method 当事件被发布后，需要进行的处理.
         * @example
         * var pay = {
         *  submit: function(name, value) {
         *      console.log(name, value);
         *  }
         * }
         * $E.subscribe('/pay/validata',pay, pay.submit);
         * setTimeout(function(
         *     $E.publish('/pay/validata',['name',22]);
         *    ),2000)
         */
        subscribe: function(topic, context, method) {
            var serId = getId(_topics), temp = arale.hitch(context, method);
            return [serId, topic, store.addHandler(serId, topic, temp)];
        },
        /**
         * 取消一个订阅事件
         * @param {Array} handler 注册事件时返回的句柄.
         * @example
         * var pay = {
         *  submit: function(name, value) {
         *      console.log(name, value);
         *  }
         * }
         * var handler = $E.subscribe('/pay/validata',pay, pay.submit);
         * setTimeout(function(
         *     $E.publish('/pay/validata',['name',22]);
         *   $E.unsubscribe(handler);
         *    ),2000);
         */
        unsubscribe: function(handler) {
            if (handler) {
                store.removeHandler.apply(store, handler);
            }
        },
        /**
         * 发布一个订阅事件
         * @param {String} topic 事件的名称.
         * @param {Array} args 发布给订阅者的数据.
         * @example
         * var pay = {
         *  submit: function(name, value) {
         *      console.log(name, value);
         *  }
         * }
         * var handler = $E.subscribe('/pay/validata',pay, pay.submit);
         * setTimeout(function(
         *     $E.publish('/pay/validata',['name',22]);
         *   $E.unsubscribe(handler);
         *    ),2000);
         */
        publish: function(topic, args) {
            var serId = getId(_topics);
            var f = store.getHandlers(serId, topic);
            if (f) {
                store.invoke.apply(store, [serId, topic].concat((args || [])));
            }
        },
        /**
         * 当指定的事件产生的时候发布一个特定的事件
         * @param {String} topic    待发布的事件的名称.
         * @param {Object} context    context.
         * @param {Function 或 String} event 执行的函数.
         * @example
         * var pay = {
         *  submit: function(name, value) {
         *      console.log(name, value);
         *  }
         * }
         * $E.connectPublisher('/pay/validata',pay,'submit');
         */
        connectPublisher: function(topic, context, event) {
            var pf = function() {
                $E.publish(topic, arguments);
            };
            return this.connect(context, event, pf);
        },
        trigger: function(elem, type, data) {
            type = fixEvent(type);
            if (elem.node) {
                elem = elem.node;
            }
            var fn = getDispatcher(store, elem, type);
            //fn.target = elem;
            var event = $E.getEventObject(elem, type);
            fn.apply(null, [event].concat(data));
            //fn.call(null, event, data);
            var parent = elem.parentNode || elem.ownerDocument;
            if (!event.isPropagationStopped() && parent) {
                $E.trigger(parent, type);
            }
        },
        /**
        * 添加一个需要绑定widget元素的事件
        * @param { String } event 事件名称, 绑定那个事件.
        * @param { Function } handler 具体的处理函数.
        * @param { String } selector 一个选择表达式, 用来指定widget具体响应事件的元素.
        * @example
        * @return {dom} return.
        */
        delegate: function(domNode, eventType, handler, selector) {
            //目前考虑是先把说有满足selector的元素拿出来, 然后在处理
            if (domNode.node) {
                domNode = domNode.node;
            }
            var that = this, newHandler = function(e) {
                var params = that._getLiveHandlerParam(e, selector, domNode);
                if (params) {
                     handler.apply(domNode, params);
                }
            }
            return $E.connect(domNode, eventType, newHandler);
        },
        _getLiveHandlerParam: function(e, selector, domNode) {
            var that = this;
            //返回我们handler需要的参数
            if (selector) {
                var target = e.target;
                var match = $A($$(selector, domNode)).some(function(node) {
                    var chain;
                    if (target == node.node) {
                        return true;
                    }
                    chain = that._isInDomChain(target, node.node, domNode);
                    return chain && (target = chain);
                });
                return match && [target, e];
            }
            return [domNode, e];
        },
        _isInDomChain: function(target, parent, ancestor) {
            //手动冒泡
            if (target == ancestor) {
                return false;
            }
            if (target == parent) {
                return target;
            }
            var i = 0;//防止过多嵌套
            while (target != ancestor && target != null && (i++ < 6)) {
                target = target.parentNode;
                if (target == parent) {
                    return target;
                }
            }
            return false;
        },
        live: function(domNode, eventType, handler, selector) {
            var that = this;
            //这个目前主要是用来fix focus, blur目前这两个事件的冒泡.以后可以做的更强大.
            if (domNode.node) {
                domNode = domNode.node;
            }
            var newHandler = function(e) {
                e = e || window.event;
                e = $E.getEventObject(domNode, e);
                var params = that._getLiveHandlerParam(e, selector, domNode);
                if (params) {
                    handler.apply(domNode, params);
                }
            }
            if (domNode.addEventListener) {
                domNode.addEventListener(eventType, newHandler, true);
            }else if (domNode.attachEvent) {
                domNode.attachEvent('on' + liveMap[eventType], newHandler);
            }else {
                return null;
            }
        },
        keys: keys,
        /**
         * domReady
         * @param {Function} fn 回掉函数.
         * @example
         * $E.domReady(function() {
         *     alert('dom loaded');
         * });
         */
        domReady: function(fn) {
            var core = arale.event.core;
            if (core.domReady.loaded) {
				fn();
				return;
            }
            core.domReady.observers = core.domReady.observers || [];
            var observers = core.domReady.observers;
            observers[observers.length] = fn;
            if (core.domReady.callback) {
                return;
            }
            core.domReady.callback = function() {
                if (core.domReady.loaded) {
                    return;
                }
                core.domReady.loaded = true;
                if (core.domReady.timer) {
                    clearInterval(core.domReady.timer);
                    core.domReady.timer = null;
                }
                for (var i = 0, length = observers.length; i < length; i++) {
                    var fn = observers[i];
                    observers[i] = null;
                    fn();
                }
                core.domReady.callback = core.domReady.observers = null;
            };
			//add arale.browser.Engine gecko fixed firefox domReady bug 20110322
			if (document.readyState && (arale.browser.Engine.gecko || arale.browser.Engine.webkit)) {
                core.domReady.timer = setInterval(function() {
                    var state = document.readyState;
                    if (state == 'loaded' || state == 'complete') {
                        core.domReady.callback();
                    }
                }, 50);
            }else if (document.readyState && arale.browser.Engine.trident) {
                var src = (window.location.protocol == 'https:') ? '://0' : 'javascript:void(0)';
                document.write('<script type="text/javascript" defer="defer" src="' + src + '" ' +
                'onreadystatechange="if (this.readyState == \'complete\') $E.domReady.callback();"' +
                '><\/script>');
            }else {
                if (window.addEventListener) {
                    document.addEventListener('DOMContentLoaded', core.domReady.callback, false);
                    window.addEventListener('load', core.domReady.callback, false);
                } else if (window.attachEvent) {
					if(document.readyState == 'complete') {
						core.domReady.callback();
						return;
					}
                    window.attachEvent('onload', core.domReady.callback);
                } else {
                    var fn = window.onload;
                    window.onload = function() {
                        core.domReady.callback();
                        if (fn) fn();
                    };
                }
            }
        }
    };
})(arale), '$E');
E = $E;

/**Last Changed Author: shuai.shao--Last Changed Date: Tue Nov 08 12:22:31 CST 2011**/
arale.deps.depsToModule('arale.event-1.1.js').moduleStatus(arale.deps.LOAD.loaded);
arale.deps.depsToModule('arale.event-1.1-src.js').moduleStatus(arale.deps.LOAD.loaded);
(function(arale){ if(!arale) return;var deps = arale.deps;
deps.addDependency('arale.base',['arale.base-1.1.js']);
deps.addDependency('arale.string',['arale.string-1.0.js','arale.base-1.1.js']);
deps.addDependency('arale.dom',['arale.dom-1.1.js','arale.array-1.1.js','arale.hash-1.0.js','arale.string-1.0.js','arale.base-1.1.js']);
deps.addDependency('arale.hash',['arale.hash-1.0.js','arale.base-1.1.js']);
deps.addDependency('arale.event',['arale.event-1.1.js','arale.dom-1.1.js','arale.array-1.1.js','arale.hash-1.0.js','arale.string-1.0.js','arale.base-1.1.js']);
deps.addDependency('arale.core',['arale.core-1.1.js','arale.event-1.1.js','arale.dom-1.1.js','arale.array-1.1.js','arale.hash-1.0.js','arale.string-1.0.js','arale.base-1.1.js']);
deps.addDependency('arale.array',['arale.array-1.1.js','arale.base-1.1.js']);
}((typeof arale == 'undefined') ? undefined : arale));

/**Last Changed Author: shuai.shao--Last Changed Date: Tue Nov 08 13:12:58 CST 2011**/