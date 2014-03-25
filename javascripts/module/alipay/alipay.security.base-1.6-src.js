/** begin ---base.js---*/
light.has('/alipay/security/base') || (function(light) {

var ua = light.client.info,
	guid = 0,
	passport = [],
	prod = function(credential) {
		// make sure the caller is prod.create, the factory.
		if(credential !== passport) throw 'invalid constructor, use create() instead.';
	},
	has = function(element, api) {
		return element && api &&
			element.nodeType === 1 && typeof element[api] !== 'undefined';
	};
	light.register('alipay/security/base', window, prod);
	var security = alipay.security;

// 强制定向到 alipay
security.downloadServer = security.downloadServer || '//download.' + light.baseDomain;
security.securityCenterServer = security.securityCenterServer || '//securitycenter.' + light.baseDomain;

prod.defaults = {
	id: '',
	container: null,
	msgMode: 'quiet', // 'dialog', 'tooltip', 'form', 'custom', 'quiet'
	msgTitle: '',
	msgNormalAttribute: 'data-explain',
	msgFormItemContainer: null,
	msgClass: 'fm-explain',
	msgErrorClass: 'fm-error',
	msgHandler: null 
};

// 不能使用 name， Firefox 无法动态创建 Function 的 name 属性
prod.Name = 'base';
// do NOT put this member in prototype as it would share in all instances
prod.properties = {
	element: null,
	_readyList: []
};

security.monitor = function(productName, code) {
	// send to Monitor
	window.monitor && monitor.log('sc', productName || 'unknown', code);

	// also send to Tracker
	light.track('sc-' + productName + '-' + code);
};

// how to show message
// {do: 'dialog', myAction: 'quiet'}
// prod.actions = {};

// simple factory instantiate any security product
security.create = prod.create = function(type, options) {
	if(!type) throw 'invalid param';

	var obj = new type(passport);
	obj.__type = type;

	var defaults = prod.defaults;
	if(type.defaults) type.defaults = defaults = light.extend({}, prod.defaults, type.defaults);
	var o = obj.options = light.extend({}, defaults, options);
	if(!o.id) {
		guid++;
		o.id = '_secprd_' + guid;
	}else{

		/*
		 * 对于手机验证码这样的产品，在创建安全产品的时候需要发送校验码请求，这个请求里需要传递securityId作为请求参数，而这个时候产品实例是不知道要加入到哪个核心实例的，在多核心实例的情况下不能取得正确的securityId，这里通过对element向上找.J-securitycoreMain来确定对应的securityId
		 *
		 * 由于在创建安全产品的时候，多个安全产品可能在同一微秒，所以在dataId上增加一个随机数来保证唯一性。
		 * */ 

		o.dataId = o.id + new Date().getTime() + Math.floor(Math.random() * 1000);

		/*
		 * 每次创建安全产品的时候，给当前产品添加唯一的data-id属性。
		 * */
		light.node('[id=' + o.id + ']:not([data-id]):first').attr("data-id", o.dataId);

		/*
		 * 获取该dom节点
		 * */
		o.uniqElement = light.node('[data-id=' + o.dataId + ']:first')[0];
	}

	if(!light.get(o.id)) {
		if(typeof o.container === 'string') {
			o.container = light.get(o.container);
		}
	}

	// populate referenced properties
	light.extend(obj, prod.properties, type.properties);
	// call 'event' after initialize
	type.prototype.postInit && type.prototype.postInit.call(obj);

	return obj;
};


security.activeXEnabled = prod.activeXEnabled = function() {
	if(!window.ActiveXObject instanceof Function) return false;
	var external = window.external;
	try { // Some error occurred in homemade IE 7
		if (external && typeof external.msActiveXFilteringEnabled != "undefined" && external.msActiveXFilteringEnabled()) {
			return false;
		}
	} catch(e) {}
	return true;
}();


security.refreshStatus = prod.refreshStatus = function(product) {
	var flag = product.installed = false;
	var name = ua.engine.trident ? product.info.activex : product.info.plugin;
	if(!name) return false;

	if(ua.engine.trident) {
		if(!security.activeXEnabled) return false;
		var obj;
		try {
			obj = new ActiveXObject(name);
			flag = !!obj;
			obj = null;
		} catch(e) {} finally { obj = null; }
	} else {
		// if plugin disabled, it should miss in plugins collection
		// Opera, go the hell
		if(ua.engine.presto) name = name.replace(/,/, '');
		flag = !!(navigator.plugins && navigator.plugins[name]);
	}
	return product.installed = flag;
};

prod.prototype = {
	toString: function() {
		return this.__type.Name + ' (' + this.options.id + ')';
	},	
	ready: false,
	onready: function(callback) {
		if(this.ready) {
			callback.apply(this);
		} else {
			this._readyList.push(callback);
		}
	},
	hasAPI: function(api) {
		return has(this.element, api);
	},
	dispose: function() {
		if(this.element) {
			this.element.parentNode.removeChild(this.element);
			this.element = null;
		}
		this.ready = false;
		this._readyList.length = 0;
	},
	api: function(property, value) {
		if(!this.hasAPI(property)) throw 'Property is not available: ' + property;
		try {
			return value === undefined ? this.element[property] : this.element[property] = value;
		} catch(e) {
			this.catchError.call(this, property, e);
		}
		return null;
	},
	render: function() {
		var stop = false, check = function() {
			var me = this, el = light.get(this.options.id);
			if(!has(el, this.__type.defaultMethod)) {
				stop || setTimeout(function() {
					check.call(me);
				}, 0);
			} else {
				this.element = el;
				this.ready = true;

				if(this.__type.renderHandler) {
					stop = this.__type.renderHandler.call(this, false) === false;
				}

				var queue = this._readyList;
				while(queue.length) queue.shift().apply(this);
			}
		},
		render = function(html, callback, el) {
			this.__type.renderingHandler && this.__type.renderingHandler.call(this, true);
			// append callback
			light.isFunction(callback) && this._readyList.push(callback);

			if(!el) {
				var container = this.options.container || document.body;
				// append to non-empty container
				if(container.childNodes.length) {
					el = document.createElement('span');
					el.innerHTML = html;
					container.appendChild(el);
				} else { // replace empty container
					container.innerHTML = html;
				}
			}

			check.call(this);
		},
		pluginWatcher = function() {
			var me = this, obj = this.__type;
			security.refreshStatus(obj);
			if(obj.installed) {
				light.log('Plugin just installed.');
				obj.installedHandler && obj.installedHandler.call(this);
			} else {
				setTimeout(function() {
					pluginWatcher.call(me);
				}, 10);
			}
		};
		return function(callback, el) {
			// prevent duplicated rendering
			if(this.alive) return;
			this.alive = true;

			var info = light.extend({}, this.__type.info, this.options), me = this;

			// check plugin installation in page
			this.__type.installed || pluginWatcher.call(this);

			// render plugin
			light.ready(function() {
				render.call(me, light.substitute(me.__type.template, info), callback, el);
			});
		};
	}(),
	getMessage: function(number) {
		var message, type = this.__type;
		light.each(type.message, function(key, msg) {
			if(key.indexOf('-') !== -1) {
				var range = key.split('-', 2),
					from = parseInt(range[0], 10) || Number.MIN_VALUE,
					to = parseInt(range[1], 10) || Number.MAX_VALUE;
				found = number >= from && number <= to;
			} else {
				found = key == number;
			}
			if(found) message = msg;
			return !found;
		});
		if(!message) message = type.message[0];
		return message;
		// return message + ' (' + (number > 0 ? number : ('0x' + number.toString(16))) + ')';
	},
	showMessage: function(obj) {
		var code = 0, message = '', container = null, handler = null, mode = this.options.msgMode;
		if(typeof obj === 'string') {
			message = obj;
		} else if(typeof obj === 'object') {
			if(obj.status !== undefined) { // cdo control message
				code = obj.status;
				message = obj.msg;
			} else if(obj.number !== undefined) { // Error instance
				code = obj.number;
				message = obj.description;
			}
		}
		if(!message) {
			message = '未知错误';
			light.log('Cannot determine message %s.', obj);
		}

		var config = {title: '运行过程中发生错误', type: 'string', content: message, code: code, show: true};
		if(container) {
			config.content = container;
			config.type = 'dom';
		}
		switch(mode) {
			case 'dialog':
			case 'tooltip':
				light.page.ui[mode](config);
				break;
			case 'form':
				showFormMessage.call(this, obj);
				break;
			case 'custom':
				handler ? handler(obj) : light.log('Handler not found.');
				break;
			default: // quiet
				light.log("%d, %s", config.code, config.content);
				break;
		}
	},
	catchError: function(action, e, preventMessage) {
		var obj = this.__type, number = e.status || e.number || 0;
		// convert dec to hex
		if(number < 0) number = (0xffffffff + number + 1).toString(16);

		light.log('Caught error %s from %s in action %s.', number, obj.Name, action);
		security.monitor(obj.Name, number);

		// prevent if asked
		preventMessage || this.showMessage(e);
	}
};

var showFormMessage = function(config) {
	var options = this.options;
};

})(window.light);


/** end ---base.js---*/

/**alipay.security.base-1.6**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Wed Aug 14 17:20:38 CST 2013**/
