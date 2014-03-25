/** begin ---core.js---*/
/*!
 * Light JavaScript Library 0.9.0
 * The core of Light
 * 
 * @copyright Copyright 2011, alipay.com
 * @author janlay@gmail.com
 *
 * $Id: core.js 27962 2012-08-07 01:32:45Z taibo $
 */
window.light || (function(window, undefined) {
var document = window.document, navigator = window.navigator, location = window.location,
    arrayPrototype = Array.prototype;

// fetch current url, from jQuery
var urlParts, ajaxLocation,
    rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?([^?#]*))?/;

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
    ajaxLocation = location.href;
} catch(e) {
    // Use the href attribute of an A element
    // since IE will modify it given document.location 
    ajaxLocation = document.createElement('a');
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
}
urlParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

var light = {
    version: '0.9.0',
    timestamp: new Date().getTime(),
    debug: false,
    baseDomain: function() {
        var parts = urlParts[2].split('.');
		return parts.slice(-Math.max(parts.length-1, 2)).join(".");
    }(),
    urlParts: urlParts,
    toString: function() {
        var result = 'Light JavaScript Library version ' + light.version;
        if(light.debug) result += ', debug enabled';
        result += '.';
        return result;
    },
    toArray: function(list) {
        var result = [];
        if(!list.length) return result;

        for(var i = 0, len = list.length; i < len; i++)
            result[i] = list[i];

        return result;
    },
    map: function(list, callback, context) {
        if(arrayPrototype.map) return arrayPrototype.map.call(list, callback, context);

        var ret = [], len = list.length;
        if(!len) return ret;

        for(var i = 0; i < len; i++) ret[i] = callback.call(context, list[i], i, list);
        return ret;
    },
    reduce: function(list, callback, initialValue) {
        if(arrayPrototype.reduce) return arrayPrototype.reduce.call(list, callback, initialValue);

         var i = 0, len = list.length, curr;  
          
        if(!len && initialValue == undefined) // == on purpose to test 0 and false.  
            throw new TypeError("Reduce of empty array with no initial value");  

        if(initialValue == undefined){  
            curr = list[0]; // Increase i to start searching the secondly defined element in the array  
            i = 1; // start accumulating at the second element  
        } else {  
            curr = initialValue;  
        }  

        while(i < len) {  
            curr = callback.call(undefined, curr, list[i], i, list);  
            i++;
        }  

        return curr;  
    },
    // light.register('foo/bar');
    // light.register('foo/bar', window.AP);
    // light.register('foo/bar', window.AP, []);
    register: function(path, root, obj) {
        var items = path.split('/'),
            // default root is window.light
            parent = root || light;

        // path starts with '/'
        if(!items[0]) {
            // just ignore the root
            parent = window;
            // remove the first item
            items.shift();
        }

        // build the hierarchy
        var name, me = parent;
        for(var i = 0, l = items.length - 1; i < l; i++) {
            if(!(name = items[i])) continue;
            parent = parent[name] = parent[name] || {};
        }

        // the last item
        name = items[i];
        if(name) {
            parent = parent[name] = obj === undefined ? {} : obj;
        }

        return parent;
    },
    // light.extend(myObj, {a: 1, b:2});
    // light.extend({a: 1, b: 2});
    // light.extend(true, myObj, {a: {foo: 1, bar: 2}});
    extend: function(deep) {
        var args = light.toArray(arguments);
        if(typeof args[0] !== 'boolean') args.unshift((deep = false));

        if(args.length < 2) return null;

        var start = 2, o = args[1], obj;
        // extend light itself
        if(args.length === 2) {
            start = 1;
            o = light;
        }
        for(var i = start, l = args.length; i < l; i++) {
            obj = args[i];
            if(!obj || typeof obj !== 'object') continue;

            for(var prop in obj) {
                var item = obj[prop];
                if(item === o || !obj.hasOwnProperty(prop)) continue;

                if(light.isArray(item)) {
                    o[prop] = Array.prototype.concat.call(item);
                } else if(deep && item instanceof Object && !light.isFunction(item) && !item.nodeType) {
                    var tmp = o[prop] || {};
                    o[prop] = light.extend(true, tmp, obj[prop]);
                } else if(item !== undefined) {
                    o[prop] = item;
                }
            }
        }

        return o;
    },
    deriveFrom: function(superClass, instanceMembers, staticMembers) {
        if(arguments.length < 2) return superClass;

        // create constructor
        var klass = (instanceMembers && instanceMembers.init) || function() {
            superClass.constructor.apply(this, arguments);
        };

        // extend prototype
        light.extend(true, klass.prototype, superClass.prototype, instanceMembers);
        // fixup constructor identifier
        klass.constructor = klass;
        // extend static members if necessary
        // staticMembers && light.extend(klass, superClass, staticMembers);
        staticMembers && light.extend(true, klass, staticMembers);

        // set customized super class
        klass.__super = superClass;

        return klass;
    },
    // light.module('foo/bar', myObj);
    module: function(name, obj) {
        var o = light.register(name, null, obj);
        if(light.isFunction(obj)) {
            o.constructor = obj;
        }
        return o;
    },
    each: function(object, callback, args) {
        if(!object) return object;
        var length = object.length;

        if(length !== undefined && 'reverse' in object) {
            var i = 0;
            while(i < length) {
                if(callback.call(object[i], i, object[i], object) === false)  break;
                i++;
            }
        } else {
            var name;
            for(name in object) {
                if(callback.call(object[name], name, object[name], object) === false) {
                    break;
                }
            }
        }

        return object;
    },

    isFunction: function(obj) {
        return light.type(obj) === "function";
    },
    isArray: Array.isArray || function(obj) {
        return light.type(obj) === "array";
    },
	isString: function(obj) {
        return light.type(obj) === "string";
    },
	isObject: function(obj) {
        return light.type(obj) === "object";
    },
	isNull: function(obj) {
        return light.type(obj) === "null";
    },
	isUndefined: function(obj) {
        return void 0 === obj;
    },
    // A crude way of determining if an object is a window
    isWindow: function(obj) {
        return obj && typeof obj === "object" && "setInterval" in obj;
    },
    type: function(obj) {
        return (obj === null || obj === undefined) ?
            String(obj) :
            class2type[Object.prototype.toString.call(obj) ] || "object";
    },
    has: function(path) {
        if(!path) return false;
        var parts = path.split('/'), head = light, i, len;
        if(!parts[0]) {
            head = window;
            parts.shift();
        }
        for(i = 0, len = parts.length; i < len; i++) {
            head = head[parts[i]];
            if(head === undefined) return false;
        }

        return true;
    },
    noop: function() {}
};

var class2type = {};
// Populate the class2type map
light.each("Boolean Number String Function Array Date RegExp Object Null".split(" "), function(i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
});

window.light = light;

})(window);

/** end ---core.js---*/
/** begin ---util.js---*/
/*!
 * Light JavaScript Library
 * Utilities for Light
 * 
 * @copyright Copyright 2011, alipay.com
 * @author janlay@gmail.com
 *
 * $Id: util.js 26605 2012-06-28 01:38:11Z taibo $
 */
// add helper functions to light
light.extend({
	log: function() {
		if(!light.debug || !window.console || !console.log) {
			return function() {
				if(!light.debug) return;
				try {
					window.console && console.log && console.log.apply(console, arguments);
				} catch(e) {}
			};
		}
		if(Function.prototype.bind) {
			return function() {
				if(!light.debug) return;
				var fn = Function.prototype.bind.call(console.log, console);
				fn.apply(console, arguments);
			};
		} else if(console.log.apply) {
			return function() {
				if(!light.debug) return;
				console.log.apply(console, arguments);
			};
		} else {
			return light.debug ? console.log : light.noop;
		}
	}(),
	inspect: function(obj) {
		var stringify = function(obj) {
			if(!light.isObject(obj)) return light.isString(obj) ? '"'+obj+'"' : obj.toString();

			var result = [];
			for(var k in obj){
				if(light.isUndefined(obj[k])) continue;
				else if(light.isNull(obj[k])) result.push('"'+k+'":null');
				else if(light.isObject(obj[k])) result.push('"'+k+'":{'+stringify(obj[k])+'}');
				else result.push('"'+k+'":'+stringify(obj[k]));
			}
			return result.join();
		};

		if(window.JSON && JSON.stringify) {
			return JSON.stringify(obj);
		} else if(typeof obj === 'object') { 
			var result = '';
			result = stringify(obj);
			return '{'+result+'}';
		} else {
			return String(obj);
		}
	},
	track: function() {
		var buffer = [],
			send = function(seed) {
				if(window.Tracker){
					Tracker.click(seed);
				} else {
					buffer.push(seed);
					window.setTimeout(function() {
						send(buffer.shift());
					}, 100);
				}
			};
		return function(seed, withClientInfo) {
			if(!seed) return;
			if(withClientInfo) {
				var ua = light.client.info,
					ver = ua.browser.version;
				ver = ver ? ver[0] : 'na';
				seed += '-' + (ua.browser.name || 'na') + '-' + (ua.engine.name || 'na') + '-' + ver;
			}
			send(seed);
		};
	}(),
	trim: function(text) {
		if(!text) return '';
		return String.prototype.trim ? String.prototype.trim.apply(text) : text.replace(/^\s+|\s+$/g, '');
	},
	// light.substitue('bla bla {placeholder} haha', {placeholder: 'test'});
	substitute: function(template, map, preserveUnmatched) {
		if(!template) return '';
		if(!map) return template;
		if(typeof template !== 'string') throw 'invalid template';

		return template.replace(new RegExp('{\\w+}', 'gmi'), function(property) {
			var prop = property.substr(1, property.length - 2),
                value = map[prop];
            // mark undefined/null values as unmatched,
            // by default (preserveUnmatched is false), which equals to empty string
			return value != null ? value.toString() : preserveUnmatched ? '{' + prop + '}' : '';
		});
	},
	encode: encodeURIComponent || escape,
	decode: decodeURIComponent || unescape,
	// light.param({a: 1, b: 2}) ==> 'a=1&b=2')
	// light.param({a: 1, b: 2}, '|', '\n')
	param: function(obj, splitter, connector) {
		splitter = splitter || '=';
		var stack = [];
		light.each(obj, function(property, value) {
			if(!property || !obj.hasOwnProperty(property)) return;
            var entry = light.encode(property);
            if(value != null) entry += splitter + light.encode(value);
			stack.push(entry);
		});
		return stack.join(connector || '&');
	},
	unparam: function(text, splitter, connector) {
		var obj = {};
		if(!text) return obj;
		splitter = splitter || '=';
		light.each(text.split(connector || '&'), function(i, item) {
			var pair = item.split(splitter);
            if(pair.length > 2) pair[1] = pair.slice(1).join(splitter);
			if(!pair[0]) return;
			obj[light.decode(pair[0])] = pair.length > 1 ? light.decode(pair[1]) : null;
		});
		return obj;
	},
	trimTag: function(html) {
		if(!html || !document.createElement) return '';
		var el = document.createElement('DIV');
		el.innerHTML = html;
		var text = el.textContent || el.innerText || '';
		el = null;
		return text;
	},
	escapeHTML: function(html) {
		if(!html) return '';
		var str = html.replace(/>/g, '&gt;');
		str = str.replace(/</g, '&lt;');
		str = str.replace(/&/g, '&amp;');
		str = str.replace(/"/g, '&quot;');
		str = str.replace(/'/g, '&#039;');
		return str;
	},
	unescapeHTML: function(text) {
		if(!text) return '';
		var str = text.replace(/&gt;/g, '>');
		str = str.replace(/&lt;/g, '<');
		str = str.replace(/&amp;/g, '&');
		str = str.replace(/&quot;/g, '"');
		str = str.replace(/&#039;/g, '\'');
		return str;
	},
	toJSON: function(source) {
		if(typeof source !== 'string' || !source) return null;

		var data = light.trim(source);

		return window.JSON && JSON.parse ? JSON.parse(data) : (new Function("return " + data))();
	}
});

(function(){

	var queue = function() {
		this.stack = [];
		var that = this,
			args = [].slice.call(arguments, 0);
		args && light.each(args, function(arg) {
			that.add(arg);
		});
	};

	queue.prototype = {
		add: function(fn) {
			this.stack.push(fn);
		},
		clear: function(){
			this.stack = [];
		},
		invoke: function() {
			var that = this,
				args = [].slice.call(arguments, 0);
				fn = this.stack.shift();
			this.next || (this.next = function() {
				if(that.stack.length) {
					that.invoke.apply(that, args);	
				}
			});

			fn.apply(null, [this.next].concat(args));
		}
	};

	light.queue = queue;
})();

/** end ---util.js---*/
/** begin ---client/info.js---*/
/*!
 * Light JavaScript Library
 * Client information dection
 * 
 * @copyright Copyright 2011, alipay.com
 * @author janlay@gmail.com
 *
 * $Id: info.js 26685 2012-06-29 08:00:31Z taibo $
 */
(function(window, light, undefined) {
var document = window.document, navigator = window.navigator, location = window.location;

	var userAgent = navigator.userAgent ? navigator.userAgent.toLowerCase() : '',
		platform = navigator.platform || '',
		vendor = navigator.vendor || '',
		external = window.external;

	/**
	 * 客户端标识定义
	 * 格式如下：
	 * {category1: {key1: handler, key2: handler}, category2: {key3: handler}}
	 * handler 返回类型: String, RegExp, Array, Boolean or Function
	 * NOTE: String, RegExp 类型仅用于在 UA 中检测
	 **/
	var data = {
		/**
		 * 运行设备
		 **/
		device: {
			pc: 'windows',
			ipad: 'ipad',
			ipod: 'ipod',
			iphone: 'iphone',
			mac: 'macintosh',
			android: 'android',
			nokia: /nokia([^\/ ]+)/
		},
		/**
		 * 操作系统
		 **/
		os: {
			// TODO: identify windows ce/mobile
			windows: /windows nt (\d)\.(\d)/,
			macos: /mac os x (\d+)[\._](\d+)(?:[\._](\d+))?/,
			ios: /cpu(?: iphone)? os (\d)_(\d)(?:_(\d))?/,
			android: /android (\d)\.(\d)/,
			chromeos: /cros i686 (\d+)\.(\d+)(?:\.(\d+))?/,
			linux: 'linux',
			windowsce: userAgent.indexOf('windows ce ') > 0 ? (/windows ce (\d)\.(\d)/) : 'windows ce',
			symbian: /symbianos\/(\d+)\.(\d+)/,
			blackberry: 'blackberry'
		},
		/**
		 * 浏览器内核
		 **/
		engine: {
      trident: userAgent.indexOf('msie ') > 0 ? (/msie (\d+)\.(\d+)/) : (/trident\/(\d+)\.(\d+)/),
			webkit: /applewebkit\/([\d\+]+)(?:\.(\d+))?/,
			gecko: /gecko\/(\d+)/,
			presto: /presto\/(\d+).(\d+)/
		},
		/**
		 * 浏览器软件
		 * NOTE: 国产山寨浏览器一律以缩写作为 key, Internet Explorer 由于习惯原因也缩写为 ie
		 **/
		browser: {
			/**
			 * 360SE (360安全浏览器)
			 **/
			'360': function() {
				if(!info.os.windows) return false;
				if(external) {
					try {
						return external.twGetVersion(external.twGetSecurityID(window)).split('.');
					} catch(e) {
						try {
							return external.twGetRunPath.toLowerCase().indexOf('360se') !== -1 || !!external.twGetSecurityID(window);
						} catch(e) {}
					}
				}
				return (/360(?:se|chrome)/);
			},
			/**
			 * Maxthon (傲游)
			 **/
			mx: function() {
				if(!info.os.windows) return false;
				if(external) {
					try {
						return (external.mxVersion || external.max_version).split('.');
					} catch(e) {}
				}
                return userAgent.indexOf('maxthon ') !== -1 ? (/maxthon (\d)\.(\d)/) : 'maxthon';
			},
			/**
			 * Sogou (搜狗浏览器)
			 **/
			sg: / se (\d)\./,
			/**
			 * TheWorld (世界之窗)
			 * NOTE: 由于裙带关系，TW API 与 360 高度重合。若 TW 不提供标准信息，则可能会被识别为 360
			 **/
			tw: function() {
				if(!info.os.windows) return false;
				if(external) {
					try {
						return external.twGetRunPath.toLowerCase().indexOf('theworld') !== -1;
					} catch(e) {}
				}
				return 'theworld';
			},
			qq: function() {
				return userAgent.indexOf('qqbrowser/') > 0 ? (/qqbrowser\/(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/) : (/tencenttraveler (\d)\.(\d)/);
			},
			ie: userAgent.indexOf('trident/') > 0 ? (/trident\/(\d+)\.(\d+)/) : (/msie (\d+)\.(\d+)/),
			// chrome: vendor.indexOf('Google') !== -1 ? /chrome\/(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/ : null,
			// safari: vendor.indexOf('Apple') !== -1 ? /version\/(\d+)\.(\d+)(?:\.(\d+))? safari\// : null,
			chrome: / (?:chrome|crios)\/(\d+)\.(\d+)/,
			safari: /version\/(\d+)\.(\d+)(?:\.([ab\d]+))?(?: mobile(?:\/[a-z0-9]+)?)? safari\//,
			firefox: /firefox\/(\d+)\.([ab\d]+)/,
			opera: /opera.+version\/(\d+)\.([ab\d]+)/
		},
		// 64bit detection for windows only
		feature: {
			'64bitBrowser': 'win64; x64;',
			'64bitOS': /win64|wow64/,
			security: / (i|u|s|sv1)[;\)]/,
			simulator: function() {
				return info.os.ios && screen.width > 960;
			}
		}
	};

	var detected = -1, notDetected = 0, info = {},
		has = function(type, name, version) {
			var currentVersion;
			// name isn't in browser
			if(!info[type] || !(currentVersion = info[type][name])) return false;
			// version missed
			if(!version) return true;

			var v = version;
			if(typeof v === 'string') {
				v = v.split('.');
			} else if(typeof v === 'number') {
				v = [v];
			}

			var v1, v2;
			for(var i = 0, len = Math.max(v.length, currentVersion.length); i < len; i++) {
				v1 = parseInt(v[i], 10) || 0; v2 = parseInt(currentVersion[i], 10) || 0;
				if(v1 !== v2) return v1 < v2;
			}
			// version equals completely
			return true;
		};

	light.each(data, function(item, itemData) {
		// create shortcuts using capitalized naming style
		info['has' + item.charAt(0).toUpperCase() + item.slice(1)] = function(name, version) {
			return has(item, name, version);
		};
		var entry = info[item] = {name: 'n/a', version: [-1]};
		light.each(itemData, function(name, expression) {
			// initial value
			var version = [notDetected],
				// pattern is Function or pattern
				expr = light.isFunction(expression) ? expression.apply(info) : expression;

			if(expr) {
				// match from UA
				if(expr === true) {
					version = [detected];
				} else if(typeof expr === 'string') {
					version = [userAgent.indexOf(expr) !== -1 ? detected : notDetected];
				} else { // Array or RegExp
					var v = expr;
					if(expr.exec) { // RegExp
						// if not matched, null returned, use empty array instead
						v = expr.exec(userAgent) || [];
						// version matched, just keep matches
						v.length && v.shift();
					}
					// fixup version number
					for(var i = 0; i < v.length; i++) {
						version[i] = parseInt(v[i], 10) || 0;
					}
				}
			}
			var found = !!version[0];
			if(found) {
				entry[name] = entry.version = version;
				entry.name = name;
			}
			return !found;
		});
	});

	// additional
	// set IE if ActiveX detected
	if(!info.engine.name && window.ActiveXObject instanceof Function) {
		// detect document mode
		if(document.documentMode) {
			info.engine.trident = info.engine.version = [document.documentMode, 0];
		}
		// IE 7-
		else if(!info.engine.trident) {
			info.engine.trident = info.engine.version = [detected];
		}
		info.engine.name = 'trident';
	}
	// force Windows if IE 6 or above found 
	else if(!info.os.windows && info.hasEngine('trident', 6)) {
		info.os.windows = info.os.version = [detected];
		info.os.name = 'windows';
	}

	// fixup ie version to normal if detected from trident
	if(info.browser.ie && userAgent.indexOf('trident/') > 0) {
		info.browser.ie[0] = info.browser.version[0] = info.browser.version[0] + 4;
	}

	// register
	light.module('client/info', info);

})(window, light);


/** end ---client/info.js---*/
/** begin ---client/storage.js---*/
/*!
 * Light JavaScript Library
 * Cookie or cookieless storage implement
 * 
 * @copyright Copyright 2011, alipay.com
 * @author janlay@gmail.com
 *
 * $Id: storage.js 24682 2012-04-09 04:05:11Z taibo $
 */
(function(window, light, undefined) {
var document = window.document, navigator = window.navigator, location = window.location;

var userDataId = '__ud',
	userDataHtml = '<input type="hidden" id="' + userDataId + '" style="behavior:url(\"#default#userData\")"/>',
	userDataExists = false,
	getUserData = function() {
		if(!userDataExists) {
			light.write(userDataHtml);
			userDataExists = true;
		}
		return light.get(userDataId);
	};

var storage = {
	// {days: 30, domain: '', path: ''}
	// expires in 30 days, current domain, current pathname
	// days = 0 for session cookies
	// null to disable the cookie feature
	cookie: null,
	defaultStorage: (function() {
        var ls = null;
        try {
            ls = window.localStorage;
        } catch (e) {}
        return ls;
    })(),
	set: function(name, value) {
		if(storage.cookie && navigator.cookieEnabled) { // cookie
			var sCookie = name + '=' + encodeURIComponent(value);

			if(storage.cookie.days) {
				var exp = new Date(new Date().getTime() + storage.cookie.days * 24 * 60 * 60 * 1000);
				sCookie += '; expires=' + exp.toGMTString();
			}
			if(storage.cookie.domain) {
				sCookie += '; domain=' + storage.cookie.domain;
			}
			sCookie += '; path=' + (storage.cookie.path || light.urlParts[4] || '/');
			document.cookie = sCookie;
		}
		if(advanced) { // localStorge or sessionStorage
			storage.defaultStorage.setItem(name, value);
		} else { // usercookie
			var node = getUserData();
			if(node) {
				node.setAttribute(name, value);
				try { node.save(userDataId); } catch(e) {}
			}
		}
	},
	get: function(name) {
		if(storage.cookie) {
			if(navigator.cookieEnabled) {
				var cookie = document.cookie, start = cookie.indexOf(name + "=");
				if (start != - 1) {
					start += name.length + 1;
					var end = cookie.indexOf(';', start);
					if (end == - 1) end = cookie.length;
					return light.decode(cookie.substring(start, end) || '');
				} else {
					return null;
				}
			} else {
				return '';
			}
		}

		var value;
		if(advanced) { // localStorge or sessionStorage
			value = storage.defaultStorage.getItem(name);
		} else { // usercookie
			var node = getUserData();
			if(node) {
				try { node.load(userDataId); } catch(e) {}
				value = node.getAttribute(name);
			}
		}

		return value || '';
	}
};
var advanced = !!storage.defaultStorage;

light.module('client/storage', storage);

})(window, light);


/** end ---client/storage.js---*/

/**alipay.light.base-1.8**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Tue Aug 13 12:12:35 CST 2013**/
