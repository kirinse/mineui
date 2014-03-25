/** begin ---dom.js---*/
light.extend({
	get: function(elementId) {
		// invalid param
		if(!elementId) return null;

        // param as string
        // light.get('myElementId') -> element's ID
        // light.get('#root .className') -> any sizzle selector
        // light.get('myElementId') equals to light.get('#myElementId') but faster
        if(typeof elementId === 'string') {
            // make sure light.node is available
            return !light.node || /^[\w-]+$/.test(elementId) ? document.getElementById(elementId) : light.node(elementId)[0];
        }

        // is a node instance?
        // light.get(myNodeInstace)
        if(elementId.getConfig) return elementId[0] || null;

        // fallback to param itself
        // light.get(anyObject)
		return elementId;
	},
	write: function(html) {
		// firefox 4- does not support document.readyState
		if(document.readyState === 'complete') {
			var node = document.createElement('span');
			node.innerHTML = html;
			document.body.appendChild(node);
		} else {
			document.write(html);
		}
	},
	isHTMLElement: function(element) {
		return element && (element.nodeType === 1 || element.nodeType === 9);
	},
    hasClass: function (element, klass) {
        return element ? RegExp("(\\s|^)" + klass + "(\\s|$)").test(element.className) : false;
    },
	setStyle: function(element, styles) {
		var  match;
		if(light.type(styles) === 'string' && arguments.length == 2) {
			var tmp = {};
			tmp[arguments[0]] = arguments[1];
			styles = tmp;
		}
		for(var property in styles) {
			var value = styles[property];
            if(typeof value === 'number') value += 'px';
			if(property == 'opacity') {
				if(value <1 && value > 0) {
					if( isIE && light.client.info.browser.version[0] < 9) {
						element.style.filter = 'alpha(opacity=' + value*100 + ')';
					} else {
						element.style.opacity = (value < 0.00001) ? 0 : value;
					}
				}
			}else{
				element.style[(property == 'float' || property == 'cssFloat') ? 
					(typeof element.style.styleFloat === undefined ? 'cssFloat' : 'styleFloat') : property] = value;
			}
		}
		return this;
	},
	getStyle: function(obj, pro) {
        var result = obj.currentStyle ? obj.currentStyle[pro] : document.defaultView.getComputedStyle(obj,null)[pro];
        if(typeof result === 'string' && result.slice(-2) === 'px') result = parseInt(result, 10);
		return result;
	},
  // check if the specified element exists in DOM
  // ref: http://stackoverflow.com/a/5629730/323831
  exists: function(element) {
    var el = light.get(element);
    if(!el) return false;

    while (el = el.parentNode) {
        if (el == document) {
            return true;
        }
    }
    return false;
  }
	
});



/** end ---dom.js---*/
/** begin ---event.js---*/
(function(light, document) {

    // fix event, borrowed from jQuery
    var fixEvent = function(e, extraData) {
        // do nothing if already fixed
        if(e._fixed) return;
        e._fixed = true;

        // Fixes #1925 (jQuery) where srcElement might not be defined either
        if(!e.target) {
            e.target = e.srcElement || document;
        }

        // Extra data
        e.data = extraData || {};

        // check if target is a textnode (safari)
        if(e.target.nodeType === 3) {
            e.target = e.target.parentNode;
        }

        // Add relatedTarget, if necessary
        if(!e.relatedTarget && e.fromElement) {
            e.relatedTarget = e.fromElement === e.target ? e.toElement : e.fromElement;
        }

        // Calculate pageX/Y if missing and clientX/Y available
        if(e.pageX === undefined && e.clientX !== undefined) {
            var eventDocument = e.target.ownerDocument || document,
            doc = eventDocument.documentElement,
            body = eventDocument.body;

            e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            e.pageY = e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
        }

        // Add which for key events
        if(!e.which && (e.charCode || e.keyCode)) {
            e.which = e.charCode || e.keyCode;
        }

        // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
        if(!e.metaKey && e.ctrlKey ) {
            e.metaKey = e.ctrlKey;
        }

        // Add which for click: 1 === left; 2 === middle; 3 === right
        // Note: button is not normalized, so don't use it
        // button defines: http://msdn.microsoft.com/en-us/library/ms533544(v=vs.85).aspx
        if(!e.which && e.button !== undefined ) {
            e.which = (e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0 )));
        }

        // event behavior
        e.cancel = function() {
            if(e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
                e.defaultPrevented = true;
            }
        };
        e.stop = function() {
            if(e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        };
    };

    // define the regexp only once
    var eventSeparator = /\s+/, attr = '_light_events', guid = -1, map = {},
    eventOptions = {
        data: null, // extra data pass to event handler
        capturing: false, // using capturing
        timeout: 0 // delay the handler
    };

    light.extend({
        // light.on('myId', 'click', fn);
        // light.on(myElement, 'click dblclick', fn, {data: {foo: 'bar'}, capturing: true);
        on: function(target, event, handler, options) {
            var el = typeof target === 'string' ? light.get(target) : target;
            if(!el) return;

            if(!event || typeof event !== 'string') return;

            // bind the same handler to multi event
            if(eventSeparator.test(event)) {
                light.each(event.split(eventSeparator), function(i, ev) {
                    light.on(target, ev, handler, options);
                });
                return;
            }

            var o = light.extend({}, eventOptions, options);
            var handlerWapper = function(e) {
                //if(e.defaultPrevented || e.returnValue === false) return false;

                fixEvent(e, o.extraData);

                var ret;
                if(o.timeout) { // delay and async, return statement ignored
                    light.log('timeout event: %d', o.timeout);
                    setTimeout(function() {
                        handler.call(el, e);
                    }, o.timeout);
                } else {
                    ret = handler.call(el, e);
                }
                return ret !== false && !e.defaultPrevented;
            };

            if(el.addEventListener) {
                el.addEventListener(event, handlerWapper, o.capturing ? true : false);
            } else if(el.attachEvent) {
                if(o.capturing) {
                    if(event === 'focus') event = 'focusin';
                    else if(event === 'blur') event = 'focusout';
                }
                el.attachEvent('on' + event, handlerWapper);
            }

            var events = map[event] = map[event] || [];
            events.push([el, handler, handlerWapper]);
        },

        // light.listen('#container .class', 'click', fn);
        // light.listen('#container img', 'click', fn);
        // light.listen('.js-hook', 'click', fn);
        listen: function(simpleSelector, event, handler) {
            var root = document, selector = simpleSelector, pattern = simpleSelector.split(eventSeparator, 2);
            // container specified
            if(pattern.length === 2) {
                // resolve the container element
                root = light.get(pattern[0].substr(1));
                selector = pattern[1];
            }

            var kernel = light.client.info.engine,
            hn = function(e) {
                // resolve the element which fired the event
                var el = e.target;
                while(el) {
                    // defined as css class
                    if(selector.charAt(0) === '.') {
                        // class matched
                        if(light.hasClass(el, selector.substr(1))) break;
                        // defined as tag name, and matched
                    } else if(el.tagName === selector.toUpperCase()) {
                        break;
                        // stop traversing if root reached
                    } else if(el === root) {
                        // mark as out of range
                        el = null;
                        break;	
                    }
                    // continue traversing
                    el = el.parentNode;
                }
                // execute the handler if found
                el && handler.call(el, e);
            };

            // manually invoke onchange events for old IE
            if(event === 'change' && kernel.trident && kernel.trident[0] < 9) {
                var fields = light.toArray(root.getElementsByTagName('input'));
                fields.concat(root.getElementsByTagName('select'));
                fields.concat(root.getElementsByTagName('textarea'));
                light.log('%d fields captured', fields.length);
                light.each(fields, function() {
                    light.on(this, event, hn);
                });
            } else {
                light.on(root, event, hn, {capturing: true});
            }
        },

        // light.removeEvent('myId', 'click', fn);
        removeEvent: function(target, event, handler) {
            var el = light.get(target);
            if(!el) return;

            var fn = handler, found = -1;
            map[event] && light.each(map[event], function(index, entry) {
                if(entry[0] === el && entry[1] === handler) {
                    fn = entry[2];
                    found = index;
                    return false;
                }
            });

            found >= 0 && map[event].splice(found, 1);

            if(el.removeEventListener) {
                el.removeEventListener(event, fn, false);
            } else {
                el.detachEvent('on' + event, fn);
            }
        },

        // manually fire event for specified element
        // ref: http://stackoverflow.com/a/136810
        // light.fire('myId', 'change', {which: 13});
        fire: function(element, event, eventData) {
            var evt, el = light.get(element);
            if(!el || !event) return false;

            if(document.createEvent) {
                // dispatch for firefox + others
                evt = document.createEvent("HTMLEvents");
                eventData && light.extend(evt, eventData);
                evt.initEvent(event, true, true); // event type, bubbling, cancelable
                return !el.dispatchEvent(evt);
            } else {
                // dispatch for IE
                evt = document.createEventObject();
                eventData && light.extend(evt, eventData);
                return el.fireEvent('on' + event, event);
            }
        },

        // light.cancelEvent(e);
        cancelEvent: function(e) {
            e.cancel && e.cancel();
        }
    });

})(window.light, window.document);

/** end ---event.js---*/
/** begin ---ajax.js---*/
(function(light) {
	var defaultOptions = {
		method: 'GET',
		success: light.noop,
		failure: light.noop,
		finish: light.noop,
		timeoutHandler: light.noop,
		format: 'json',
		force: true,
		async: true,
		timeout: - 1,
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
	},
	config = {
		text: {
			parser: light.trim
		},
		json: {
			parser: light.toJSON,
			handler: function(obj) {
				return obj && obj.stat === 'ok';
			},
			redirector: function(data) {
				if (data && data.redirectUrl) {
					window[data.target || 'self'].location.href = data.redirectUrl;
				}
			}
		}
	},
	count = 0;

	// light.request('/path/to/api.extension', {foo: 1, bar: 2}, {method: 'POST', success: fn, fail: aFn});
	// light.request('/path/to/api.extension', {foo: 1, bar: 2}, {format: 'jsonp', success: fn});
	var ajax = function(url, data, options) {
		if (options.method == 'JSONP' || options.format == 'jsonp') {
			data = data || {};
			count++;
			light.request._callbacks['callback' + count] = options.success || light.noop;
			data[options.hook || '_callback'] = 'light.request._callbacks.callback' + count;
			var script = document.createElement('script');
			script.setAttribute('type', 'text/javascript');
			script.setAttribute('charset', 'utf-8');
			var t = url.indexOf('?');
			if (t > - 1) {
				light.extend(data, light.unparam(url.slice(t + 1)));
				url = url.slice(0, t);
			}
			script.setAttribute('src', url + '?' + light.param(data));
			document.getElementsByTagName('head')[0].appendChild(script);
			return null;
		}
        var d = typeof data === 'string' ? data : light.param(data),
            o = light.extend({}, defaultOptions, options);

        // ensure method
        o.method = o.method ? o.method.toUpperCase() : defaultOptions.method;
        var get = o.method === 'GET', request = null;

		// backforward compatibility
		if (o.fail) o.failure = o.fail;

		if (get && o.force) {
            d += (d ? '&' : '') + 't=' + new Date().getTime().toString(36);
		}

		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
		} else if (window.ActiveXObject instanceof Function) {
			request = new ActiveXObject('Microsoft.XMLHTTP');
		}

		if (get && d) {
			url += (url.indexOf('?') > 0 ? '&': '?') + d;
		}

		request.open(o.method, url, o.async);
		get || request.setRequestHeader('Content-type', o.contentType);

		request.onreadystatechange = function() {
			if (request.readyState != 4) return;
			light.log('Get response with code %d.', request.status);

			var data = {},
                success = true,
                callback = o.failure,
			handler;
			if (request.status == 200) {
				data = config[o.format].parser(request.responseText);

				// handle redirecting response
				handler = config[o.format].redirector;
				handler && handler(data);

				// route handler
				handler = config[o.format].handler;
                success = !handler || handler(data) !== false;
				if (success) {
					callback = o.success;
				}
			}
			callback.call(request, data);
			o.finish.call(request, data, success);
		};

		light.log('Send ajax %s request to %s.', o.format, url);
		request.send(get ? null: d);

		return request;
	};

	ajax.config = config;
	light.request = ajax;
	light.request._callbacks = {};
})(window.light);


// 按照固定的格式，将指定的数据据根据浏览器所限制的长度分包发送
(function(light){
	var	timeout = 10000,
		timeoutTimer = null, 
		count = 0;
	
	var getLimitLen = function() {
		var len,
			info = light.client.info,
			docMode = document.documentMode; 
		if(info.hasEngine('trident', 6) || info.hasEngine('trident', 7) || (docMode && docMode <= 7)){
			len = 2048 - (count + 10).toString().length;
		} else {
			len = 3500 - (count + 10).toString().length;
		}
		return len;
	},
	//  分包发送需要对param方法做特殊处理，不适用公共的light.param
	param = function(obj, splitter, connector) {
		splitter = splitter || '=';
		var stack = [];
		light.each(obj, function(property, value) {
			if(!property || !obj.hasOwnProperty(property)) return;
			// 对于dataContent的value值不进行encode
			if(property == 'dataContent') {
				stack.push(light.encode(property) + splitter + value);
			} else {
				stack.push(light.encode(property) + splitter + light.encode(value));
			}
		});
		return stack.join(connector || '&');
	},
	request = function(url, count, data, callback) {
		light.packetRequest._packetCallbacks['callback' + count] = callback || light.noop;
		url = url + '?' + param(data);
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('charset', 'utf-8');
		script.setAttribute('src', url);
		document.getElementsByTagName('head')[0].appendChild(script);
		light.log('Send ajax request to %s.', url);
	},

	packetRequest = function(url, param, data, options) {
		var	callback = 'light.packetRequest._packetCallbacks.callback',
			params = [],
			defaultParam = {
				packet: {
					sendCount: 3,
					dataId: new Date().getTime(),
					dataSize: 0,
					dataIndex: 0,
					dataContent: '',
					_callback: callback
				}
			};
		defaultParam.packet = light.extend(defaultParam.packet, param);
		data = light.encode(light.inspect(data));
		var len = getLimitLen() - (url + '?' + light.param(defaultParam.packet)).length,
			size = defaultParam.packet.dataSize = Math.ceil(data.length/len);
		for(var i=0; i<size; i++) {
			var param = light.extend(true, {}, defaultParam), packet=param.packet;
			packet.dataIndex = i;
			packet.dataContent = data.slice(0, len);
			packet._callback = callback + count;
			param.count = count++;
			data = data.slice(len);
			params.push(param);
		}
		request(url, params[0].count, params[0].packet, function(rsp){ success(rsp, 0); });
		light.log("0: packet request sent.");

		function success(rsp, i) {
			var info = rsp.info, param;
			if( info.packet == 'fail' ) {
				param = params[i];
				if( param.packet.sendCount > 1 ) {
					param.packet.sendCount--;
					request(url, param.count, param.packet, function(rsp){ success(rsp, i); });
					light.log("%d: packet request sent again.", i);
				}
			} else if( info.packet == 'success' ){
				param = params[++i];
				request(url, param.count, param.packet, function(rsp){ success(rsp, i); });
				light.log("%d: packet request sent.", i);
			} else if( info.packet == 'all' ){
				timeoutTimer && clearTimeout(timeoutTimer);
				options.success(rsp); 
				light.log("all packet request sent successfully.");
			}
		};

		// 进行超时处理
		timeoutTimer = setTimeout(function(){
			options.abort("网络异常，请重新操作");
		}, timeout);
	};

	light.packetRequest = packetRequest;
	light.packetRequest._packetCallbacks={};
})(window.light);

/** end ---ajax.js---*/
/** begin ---domready.js---*/
(function(window, light) {
	var isReady = document.readyState === 'complete' || document.readyState === 'loaded', interval = 20,
		advanced = !!document.addEventListener,
		eventName = advanced ? 'DOMContentLoaded' : 'readystatechange',
		list = window.lightReady = window.lightReady || [],
		flush = function() {
			isReady = true;
			while(list.length) execute(list.shift());
        }, execute = function(fn) {
            fn.call(window, light, light.node, light.page);
        }, testDOMReady = advanced ? flush : function() {
            if(document.readyState == 'loaded' || document.readyState == 'complete') {
                flush();
            }
        };
	
	// bind domready
	light.on(document, eventName, testDOMReady);

	// trick for old IE
	if(!advanced && window == window.top) {
		window.setTimeout(function() {
			try {
				//在IE下用能否执行doScroll判断dom是否加载完毕
				isReady || document.documentElement.doScroll('left');
				setTimeout(flush, 0);
			} catch(e) {
				setTimeout(arguments.callee, interval);
			}
		}, interval);
	}

	var doFlush = function(){
		/in/.test(document.readyState) ? setTimeout(doFlush,9) : flush();
	};

	light.ready = function(handler) {
		if(isReady) {
            execute(handler);
        } else {
            list.push(handler);
			doFlush();
        }
	};

})(window, light);

/** end ---domready.js---*/
/** begin ---dimension.js---*/
// aboute dimesional
(function(light){
    var isIE     = light.client.info.engine.trident,
        isOpera  = light.client.info.engine.presto,
        isSafari = light.client.info.engine.webkit,
        isBody   = function(element){
            return (/^(?:body|html)$/i).test(element.tagName);
        };

    light.extend({
        getViewportHeight : function(element) {
            var el = light.get(element) || window;
            if(el == window || el == document || isBody(el)){
                var height = self.innerHeight, // Safari, Opera
                mode = document['compatMode'];
                if ( (mode || isIE) && !isOpera ) { // IE, Gecko
                    height = (mode == 'CSS1Compat') ?
                        document.documentElement.clientHeight : // Standards
                        document.body.clientHeight; // Quirks
                }
                return height;
            }

            return el.offsetHeight;
        },
        getViewportWidth : function(element) {
            var el = light.get(element) || window;
            if(el == window || el == document || isBody(el)){
                var width = self.innerWidth,  // Safari
                mode = document['compatMode'];

                if (mode || isIE) { // IE, Gecko, Opera
                    width = (mode == 'CSS1Compat') ?
						Math.max(document.documentElement.clientWidth, document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth): //Standards 
                        document.body.clientWidth; // Quirks
                }
                return width;
            }
            return el.offsetWidth;
        },
        getScroll : function(element) {
            var el = light.get(element) || window;
            if(el == window || el == document || isBody(el)){	
                return {
                    left : Math.max(document['documentElement'].scrollLeft, document.body.scrollLeft),
                    top  : Math.max(document['documentElement'].scrollTop, document.body.scrollTop)
                }
            }
            return {left : el.scrollLeft, top : el.scrollTop};
        },
        viewport: function() {
            return {width: this.getViewportWidth(), height: this.getViewportHeight()};
        },
        scroll: function(element) {
            var dim = this.getScroll(element);
            return {x: dim.left, y: dim.top};
        },
        xy: function(element) {
            var dim = this.getOffsets(element);
            return {x: dim.left, y: dim.top};
        },
        size: function(element) {
            return {width: this.getViewportWidth(element), height: this.getViewportHeight(element)};
        }, 
        getOffsets : function(element) {
            var el = light.get(element);
            if ( "getBoundingClientRect" in document.documentElement ) {
                try {
                    var box = el.getBoundingClientRect();
                } catch(e) {}

                var doc = el && el.ownerDocument || document,
                body = doc.body,
                docElem = doc.documentElement,
                clientTop  = docElem.clientTop  || body.clientTop  || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                scrollTop  = window.pageYOffset || docElem.scrollTop  || body.scrollTop,
                scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,

                top  =  scrollTop  - clientTop,
                left = scrollLeft - clientLeft;
                if(box){
                    top += box.top;
                    left += box.left
                }

                return { top: top, left: left };

            } else {

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
                if( typeof( el.offsetParent ) != 'undefined' ) {
                    var originalElement = el;
                    for( var posX = 0, posY = 0 ; el; el = el.offsetParent ) {
                        posX += el.offsetLeft;
                        posY += el.offsetTop;
                    }
                    if( !originalElement.parentNode || !originalElement.style || typeof( originalElement.scrollTop ) == 'undefined' ) {
                        return {left : posX, top : posY };
                    }
                    el = getNextAncestor(originalElement);
                    while( el && el != document.body && el != document.documentElement ) {
                        posX -= el.scrollLeft;
                        posY -= el.scrollTop;
                        el = getNextAncestor(el);
                    }
                    return { left : posX, top : posY };
                } else {
                    return { left : el.x, top : el.y };
                }
            }
        },
        region: function(element) {
            var position = light.getOffsets(element);
            var obj = {
                left   : position.left,
                top    : position.top,
                width  : light.getViewportWidth(element),
                height : light.getViewportHeight(element)
            };
            return obj;
        }
    });
})(window.light);


/** end ---dimension.js---*/
/** begin ---ui.js---*/
(function(light){

var adapters = {
	arale: {
		exists: function() {
			return !!window.arale;
		},
		dialog: function() {
			var api = { page: 'IframeXbox', string: 'StringXbox', dom: 'DomXbox' };
			return function(options) {
				var method = api[options.type];
				if(!method) throw 'Invalid dialog type: ' + options.type;

				var dialog, config = light.extend({}, options);

				config.isOld = true;
				if(options.trigger) {
					config.el = options.trigger;
				}
				if(options.type == 'string') {
					if( module.dialog.template) {
						options.content = light.substitute(module.dialog.template, options);
					} else if(typeof options.content != 'string') {
						var wrap = document.createElement('div'),
							newNode = options.content.cloneNode(true);
						wrap.appendChild(newNode); 
						options.content = wrap.innerHTML;
					}
				}
				config.value = function() {
					return options.content;
				};

				Loader.use(['aralex.xbox'], function(){
					dialog = new aralex.xbox[method](config);
					options.trigger || dialog.show();
				});

				return this.page.dialog = dialog;
			};
		}(),
		closeDialog: function(instance) {
			var which = instance || this.page.dialog;
			which && which.hide();
		},
		tooltip: function(options) {
			var tooltip, el = options.trigger, config = { targets: el };
			if(light.isHTMLElement(el)) config.targets = [el];
			if(options.content) config.getValue = function() {
				return options.content;
			};
			Loader.use(['aralex.apop'], function(){
				tooltip = new aralex.apop.Tip(config);
				options.trigger || tooltip.show();
			});
		}
	},
	alipay: {
		exists: function() {
			return !!window.AP;
		},
		dialog: function(options) {
			var defaults = {autoShow: true, type: 'dom', modal: true };
			return function(options) {
				// this.page.dialog && module.closeDialog();
					
				var dialog, config = light.extend({}, defaults, options);
				if(options.trigger) {
					config.el = options.trigger;
				}
				if(config.type == 'page') {
					config.type = 'iframe';
				} else if(config.type == 'dom') {
					// config.value = function() {
						// light.node(options.content).removeClass('fn-hide');
						// return options.content;
					// };
				} else if(config.type == 'string') {
					if(module.dialog.template) {
						options.content = light.substitute(module.dialog.template, options);
					} else if(typeof options.content != 'string') {
						var wrap = document.createElement('div'),
							newNode = options.content.cloneNode(true);
						wrap.appendChild(newNode); 
						options.content = wrap.innerHTML;
					}
					// 避免在旧版 xbox 中使用 title
					config.title = '';
				}
				config.value = function() {
					return options.content;
				};

				dialog = this.page.dialog = new AP.widget.xBox(config);
				// Arale has the bug
				config.autoShow && dialog.show();

				return dialog;
			};
		}(),
		closeDialog: function() {
			light.page.dialog = null;
			AP.widget.xBox.hide();
		}, 
		tooltip: function(options) {
			var elements = options.trigger, config = { width: 'auto' };
			if(light.isHTMLElement(elements)) elements = [el];
			if(options.content) config.message = options.content;
			return (new AP.widget.popNotice(elements, config));
		}
	},
  arale2: {
    exists: function() {
      return !!window.seajs;
    },
    dialog: (function() {
      // {title: '运行过程中发生错误', type: 'string|page|dom', content: message, code: code, show: true}
      return function(options) {
    	// 提前加载一遍
    	seajs.use('alipay/xbox/1.0.2/xbox', function(Xbox) {});
        var xbox;
        var config = light.extend({isOld:true}, options);
        if (config.type == 'page') {
          config.type = 'iframe';
        }
        //todo
        //航旅安全中心用  待调试
        if(options.type == 'string') {
          if( module.dialog.template) {
            options.content = light.substitute(module.dialog.template, options);
          } else if(typeof options.content != 'string') {
            var wrap = document.createElement('div'),
                newNode = options.content.cloneNode(true);
            wrap.appendChild(newNode);
            options.content = wrap.innerHTML;
          }
        }
        var that = this;
        seajs.use('alipay/xbox/1.0.2/xbox', function(Xbox) {
          xbox = that.page.dialog = new Xbox(config);
          options.autoShow && xbox.show();
          return xbox;
        });
        
      };
    }()),
    //验过了
    closeDialog: function(instance) {
      var which = instance || this.page.dialog;
      which && which.hide();
    },
    tooltip: function(options) {
      // TODO   atip
    },
    closed: function(){
    	var which = instance || this.page.dialog;
        which && which.hide();
    }
  },
	'default': {
		exists: function() {
			return true;
		},
		dialog: function(options) {
			options && options.title && alert(options.title);
		},
		closeDialog: function(instance) { },
		tooltip: function(options) {
			options && options.content && alert(options.content);
		}
	}
};

var module = light.module('page/ui', {
	detect: function() {
		var adapter;
		light.each(adapters, function(name, adp) {
			if(adp.exists()) {
				adapter = adp;
				return false;
			}
		});
		return adapter;
	}
});

light.each(['dialog', 'tooltip'], function(i, api) {
	module[api] = function(options) {
		var adapter = module.detect();
		if(!adapter) return;
		
		adapter[api].call(light, options);
	};
});

module.closeDialog = function() {
	var adapter = module.detect();
	if(!adapter) return;
	
	adapter.closeDialog.call(light);
};

})(window.light);


/** end ---ui.js---*/
/** begin ---node/node.js---*/
(function(light, undefined) {

	var methodException = 'method not supported';
	// new node() == node()
	// node(myElement)
	// node(myElements)
	// node(css3Selector)
	// node(aNodeObject)
	var node = function(source, context) {
		// Allow instantiation without the 'new' keyword
		if(!this.getConfig) {
			return new node(source, context);
		}

		// paramless constructor
		if(!arguments.length) return this;

		// return empty list if source is empty
		if(!source) return this;

		// source is a node instance
		if(source.getConfig) return source;

		// new light.node(aElement);
        // try to get node instance from cache
        if(light.isHTMLElement(source)) return source._light_node || this.add(source);

		// or new light.node(aList);
		if(typeof source !== 'string' && source.length) return this.add(source);

		// query
		if(typeof source === 'string') {
			var s = node.getSizzle(), list, ctx = light.get(context) || document;

			if(s) {
				list = s(source, ctx);
			} else if(document.querySelectorAll) { // native selector
				list = ctx.querySelectorAll(source);
			} else {
				throw methodException;
			}

			list.length && this.add(list);
		}
		return this;
	};

	node.getSizzle = function() {
		var sizzle;
		return function() {
			if(sizzle) return sizzle;
            if(light.Sizzle) {
                sizzle = light.Sizzle;
            } else if(window.YAHOO) {
				sizzle = YAHOO.util.Dom.query;
			} else if(window.arale && arale.dom && arale.dom.sizzle) { 
				sizzle = arale.dom.sizzle;
			}
			return sizzle || window.Sizzle;
		};
	}();

	node.prototype = {
		length: 0,
		each: function(callback) {
			var i = 0;
			while(i < this.length) {
				if(callback.call(this[i], i, this[i]) === false) {
					break;
				}
                i++;
			}

			return this;
		},
        map: function(callback) { return light.map(this, callback); },
        reduce: function(callback, initialValue) { return light.reduce(this, callback, initialValue); },
		toArray: function() { return light.toArray(this); },
		add: function(item) {
			var element;
			if(typeof item === 'string') {
				element = light.get(item);
			} else if(typeof item === 'object') {
				// check nodeType to ensure HTMLCollection object recognized as an HTMLElement
				if(!item.nodeType && item.length && item[0]) {
					for(var i = 0, len = item.length; i < len; i++) {
						var el = item[i];
						if(light.isHTMLElement(el)) {
							this[this.length] = el;
							this.length++;

                            // cache this element
                            var cache = new node();
                            cache[0] = el;
                            cache.length = 1;
                            el._light_node = cache;
						}
					}
				} else {
					element = item;
				}
			}
			if(light.isHTMLElement(element)) {
				this[this.length] = element;
				this.length++;
			}
			return this;
		},
		clear: function() {
            for(var i = 0; i < this.length; delete this[i++]);
			this.length = 0;
			return this;
		},
        clone: function() {
            var newNode = new node(), i = newNode.length = this.length;
            while(i--) newNode[i] = this[i];
            return newNode;
        },
		on: function(event, handler, options) {
			return this.each(function() {
				light.on(this, event, handler, options);
			});
		},
		show: function() {
			return this.each(function() {
				this.style.display = '';
			});
		},
		hide: function() {
			return this.each(function() {
				this.style.display = 'none';
			});
		},
		toggle: function(expression) {
            var style, lazy = false;
            if(expression !== undefined) {
                if(light.isFunction(expression)) {
                    lazy = true;
                } else {
                    style = expression ? '' : 'none';
                }
            }
			return this.each(function() {
                var value = style;
                if(value === undefined) {
                    value = lazy ? (expression.apply(this) ? '' : 'none') :
                       (this.style.display === 'none' ? '' : 'none');
                }
				this.style.display = value;
			});
		},
		item: function(index) {
			var newNode = new node();
			this[index] && newNode.add(this[index]);
			return newNode;
		},
        // param: begin[, end], just like Array.slice
        slice: function() {
            return new node(Array.prototype.slice.apply(this, arguments));
		}
	};

	// register popular events
	light.each(['mouseover', 'mouseout', 'change'], function(i, event) {
		node.prototype[event] = function(handler) {
			return this.on(event, handler);
		};
	});

	light.each(['click', 'submit', 'focus', 'blur'], function(i, event) {
		node.prototype[event] = function(handler, options) {
			if(handler === undefined) {
				return this.each(function() {
					this[event]();
				});
			} else {
				return this.on(event, handler, options);
			}
		};
	});

	light.node = node;
})(window.light);

/** end ---node/node.js---*/
/** begin ---node/dom.js---*/
(function(document, node) {

	// creates an element and wraps by light.node
	// node.build('select', {checked: true});
    // node.build('<a href="#">foo</a>');
	node.build = function() {
        // define a collector for all 'partial' tag names.
        var wrapper  = {
            td: ['<table><tbody><tr>', '</tr></tbody></table>', 'table>tbody>tr'],
            tr: ['<table><tbody>', '</tbody></table>', 'table>tbody'],
            option: ['<select>', '</select>', 'select'],
            optgroup: ['<select>', '</select>', 'select']
        },
        // precompile the regexp
        tagRe = /<(.+?)\b/;
        return function(source, attributes) {
            var div = document.createElement('div'), el;
            // determine HTML or just a simple tag name
            if(tagRe.test(source)) {
                var html = source, tagName = html.match(tagRe)[1].toLowerCase(), item = wrapper[tagName];
                // need to wrap the partial dom string
                if(item) {
                    html = item[0] + html + item[1];
                }

                // resolve the dom element
                div.innerHTML = html;
                return node((item ? item[2] : '') + '>*', div);
            } else {
                var nodeName = light.trim(source);
                // build the element from scratch
                el = document.createElement(nodeName);
                light.each(attributes, function(name, value) {
                    // handle 'class' attribute
                    if(name === 'className') {
                        el[name] = value;
                    } else {
                        // handle boolean attributes
                        if(typeof value === 'boolean') {
                            value = value ? name : '';
                        }
                        el.setAttribute(name, value);
                    }
                });
            }
            return new node(el);
        };
    }();

	var methodException = 'method not supported';
	var match = function(simpleSelector, element) {
		var s = node.getSizzle();
		if(!s || !s.filter) throw methodException;
		return s.filter(simpleSelector, [element]).length;
	},
	walk = function(simpleSelector, property, firstMatch) {
		var el = this[0], ret = new node();
		if(!el) return ret;

		while((el = el[property])) {
			if(el.nodeType !== 1) continue;
			if(!simpleSelector || match(simpleSelector, el)) {
				ret.add(el);
				if(firstMatch) break;
			}
		}

		return ret;
	},
    modify = function(action, element, passive) {
        var c = element;
        if(c instanceof node) {
            c = c[0];
        } else if(!light.isHTMLElement(c)) {
            return false;
        }
        return this.each(function() {
            passive ? c[action](this) : this[action](c);
        });
    },
    filterInternal = function(expression, remove) {
        var list = [];
        if(typeof expression === 'string') {
            var s = node.getSizzle();
            if(!s || !s.filter) throw methodException;
            list = s.filter(expression, this, false, remove);
        } else {
            this.each(function(index) {
                expression.call(this, index, this) && list.push(this);
            });
        }

        return this.clear().add(list);
    };

	light.extend(node.prototype, {
		find: function(selector) {
			return new node(selector, this);
		},
		filter: function(expression) {
            return filterInternal.call(this, expression, false);
		},
		remove: function(expression) {
            return filterInternal.call(this, expression, true);
		},
        del: function() {
            return this.each(function() {
                this.parentNode && this.parentNode.removeChild(this);
            }).clear();
        },
        append: function(element) {
            return modify.call(this, 'appendChild', element);
        },
		appendTo: function(element) {
            return modify.call(this, 'appendChild', element, true);
		},
        after: function(element) {
            var el = this[0], dst = light.get(element);
            if(!el || !dst) return this;

            var next = node(dst).next();
            if(next.length)
                dst.parentNode.insertBefore(el, next[0]);
            else
                dst.parentNode.appendChild(el);

            return this;
        },
		text: function(newText) {
            var prop = 'innerText' in document.createElement('div') ? 'innerText' : 'textContent';
			if(newText === undefined) {
				var el = this[0];
				if(!el) return '';

				return light.trim(el[prop]);
			} else {
                return this.each(function() {
					this[prop] = newText;
				});
			}
		},
		html: function(newHTML) {
			if(newHTML === undefined) {
				var el = this[0];
				if(!el) return '';

				return light.trim(el.innerHTML);
			} else {
				return this.each(function() {
					this.innerHTML = newHTML;
				});
			}
		},
        outerHTML: function(newHTML) {
			if(newHTML === undefined) {
				var el = this[0];
				if(!el) return '';

				return light.trim(el.outerHTML || new XMLSerializer().serializeToString(el));
			} else {
				return this.each(function() {
                    // TODO
				});
			}
        },
		next: function(simpleSelector) {
			return walk.call(this, simpleSelector, 'nextSibling', true);
		},
		nextAll: function(simpleSelector) {
			return walk.call(this, simpleSelector, 'nextSibling', false);
		},
		prev: function(simpleSelector) {
			return walk.call(this, simpleSelector, 'previousSibling', true);
		},
		prevAll: function(simpleSelector) {
			return walk.call(this, simpleSelector, 'previousSibling', false);
		},
		siblings: function(simpleSelector) {
			return walk.call(this, simpleSelector, 'previousSibling', false).add(walk.call(this, simpleSelector, 'nextSibling', false));
		},
		parent: function(simpleSelector) {
			return walk.call(this, simpleSelector, 'parentNode', true);
		},
		children: function(simpleSelector) {
            var el = this[0], ret = new node();
            if(!el || !el.firstChild) return ret;
            el = el.firstChild;

            do {
                if(el.nodeType !== 1) continue;
                if(!simpleSelector || match(simpleSelector, el)) {
                    ret.add(el);
                }
            } while((el = el.nextSibling))

            return ret;
		},
        style: function(property) {
            if(property === undefined) return this;
			if(typeof property === 'string') {
				var el = this[0];
				if(!el) return '';

				return light.getStyle(el, property);
			} else { // set style as key-value pair
                return this.each(function() {
                    light.setStyle(this, property);
				});
			}
        }
	});

})(window.document, light.node);




/** end ---node/dom.js---*/
/** begin ---node/attributes.js---*/
light.extend(light.node.prototype, {
  // borrowed from jQuery
  attr: function(name, value) {

    if(value === undefined) {
      var el = this[0];
      if(!el) return '';

      return typeof el.getAttribute !== "undefined" && typeof el[name] !== "boolean" ? el.getAttribute(name) : el[name];
    } else {
      return this.each(function() {
        // TODO: set attr on multipul elements
        if (typeof this.setAttribute !== "undefined") {
          // If the user is setting the value to false
          if (value === false) {
            // empty attribute first
            this.setAttribute(name, '');
            // then completely remove the attribute
            this.removeAttribute(name);
            // finally set proper value
            if(name in this) this[name] = false;

            // Otherwise set the attribute value
          } else {
            // If the user is setting the value to true,
            // Set it equal to the name of the attribute
            // (handles boolean attributes nicely)
            this.setAttribute(name, value === true ? name : value);
            if(name !== 'src' && (name in this)) this[name] = value;
          }

          // If it doesn't, then we're likely dealing with window or document
          // (or some other object entirely)
        } else {
          if(name in this) this[name] = value;
        }
      });
    }
  },
  // get object from key-value pair, used to retrieve string values
  // <div data-config="foo=bar&a=1">...</div>
  getConfig: function(attribute, converter) {
    var value = this.attr(attribute || 'data-config'), obj = {};
    if(value) {
      obj = light.unparam(value);
      converter && light.each(obj, converter);
    }
    return obj;
  },
  updateConfig: function(attribute, newProperties) {
    var attr, obj;
    if(arguments.length < 2 && light.isObject(attribute)) {
      attr = 'data-config';
      obj = attribute;
    } else {
      attr = attribute || 'data-config';
      obj = newProperties;
    }

    return this.each(function() {
      var el = light.node(this);
      el.attr(attr, light.param(light.extend(el.getConfig(attr), obj)));
    });
  },
  hasClass: function(name) {
    var el = this[0];
    if(!el || !el.className) return false;

    var reg = new RegExp('(?:^|\\s)' + name + '(?:\\s|$)');
    return reg.test(el.className);
  },
  addClass: function(name) {
    if(!name) return this;
    var reg = new RegExp('(?:^|\\s)' + name + '(?:\\s|$)');
    return this.each(function() {
      var className = this.className;
      if(!className) {
        this.className = name;
      } else if(!reg.test(className)) {
        this.className += ' ' + name;
      }
    });
  },
  removeClass: function(name) {
    if(!name) return this;
    var reg = new RegExp('(?:^|\\s)' + name + '(\\s|$)');
    return this.each(function() {
      var className = this.className;
      if(className && reg.test(className)) {
        this.className = className.replace(reg, '$1');
      }
    });
  },
  toggleClass: function(name, expression) {
    var add = 'addClass', remove = 'removeClass';
    if(expression === undefined) {
      return this.each(function() {
        var n = light.node(this);
        n[n.hasClass(name) ? remove : add](name);
      });
    } else {
      return this[expression ? add : remove](name);
    }
  }
});


/** end ---node/attributes.js---*/
/** begin ---node/form.js---*/
light.extend(light.node.prototype, {
	val: function(newValue) {
		if(newValue === undefined) {
			var el = this[0];
			if(!el) return '';

			var value = el.value || '';
			if(value) value = light.unescapeHTML(light.trim(value));
			return value;
		} else {
			return this.each(function() {
                if(this.tagName === 'SELECT') {
                    var select = this;
                    light.node(this).find('option').each(function(i, option) {
                        if(option.value !== newValue) return true;
                        select.selectedIndex = i;
                        return false;
                    });
                } else {
                    this.value = newValue;
                }
			});
		}
	},
	field: function(name, value) {
		if(value === undefined) {
			if(!name) return '';
			var form = this[0];
			if(!form) return '';

			var el;
            if(form.elements) el = form.elements[name];
            else if(form.item) el = form.item(name);

			if(!el || !el.value) return '';

			return light.unescapeHTML(light.trim(el.value));
		} else {
			return this.each(function() {
                // first, use normal method
				var el;
                if(this.elements) el = this.elements[name];
                else if(this.item) el = this.item(name);

                // finally, find the element
                if(!el) el = light.node('[name=' + name + ']', this)[0];

				if(el) el.value = value;
			});
		}
	},
    serialize: function() {
        var el = this[0];
        if(!el) return '';

        var entries = [];
        light.node(':input[name]', el).each(function(i, field) {
            var name = field.name, value = field.value;
            // exclude disabled field, unchecked radio/checkbox
            if(field.disabled || (field.type == 'radio' || field.type == 'checkbox') && !field.checked) return;
            entries.push(light.encode(name) + '=' + light.encode(value));
        });
        return entries.join('&');
    }
});


/** end ---node/form.js---*/
/** begin ---node/plugins.js---*/
(function(node) {
	// myImg.captcha('J_next_captcha');
	node.prototype.captcha = function(trigger) {
		var el = typeof trigger === 'string' ? light.get(trigger) : trigger;
		if(!el) return this;
		if(el.length) el = el[0];

		var img = this[0];
		if(!img) return this;

		light.on(trigger, 'click', function(e) {
			e.cancel();
			var path = img.src.split('?'), param = light.unparam(path[1] || '');
			param.t = new Date().getTime();
			img.src = path[0] + '?' + light.param(param);
		});

		return this;
	};
})(light.node);


/** end ---node/plugins.js---*/
/** begin ---validator.js---*/
(function(light, node, undefined) {
    // customized atrribute
    var attrName = 'data-validate';
    var members = {
        types: { // RegExp or [RegExp, type_name]
            email:      [/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, '邮件地址'],
            phone:      [/^(\d{3,4}-)\d{7,8}(-\d{1,6})?$/, '电话号码'],
            mobile:     [/^1\d{10}$/, '手机号码'],
            date:       [/^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$/, '日期'],
            integer:    [/^[1-9][0-9]*$/, '数字'],
            number:     [/^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/, '数值'],
            money:      [/^\d+(\.\d{0,2})?$/, '金额'],
            cnID:       [/^\d{15}$|^\d{17}[0-9a-zA-Z]$/, '身份证号'],
            chinese:    [/^[\u2E80-\uFE4F]+$/, '汉字'],
            zip:        [/^[0-9]{6}$/, '邮政编码'],
            bankname:   /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
            name:       /^([\u4e00-\u9fa5|A-Z|\s]|\u3007)+([\.\uff0e\u00b7\u30fb]?|\u3007?)+([\u4e00-\u9fa5|A-Z|\s]|\u3007)+$/,
            realName:   /^([\u4e00-\u9fa5|a-zA-Z|\s]|\u3007)+([\.\uff0e\u00b7\u30fb]?|\u3007?)+([\u4e00-\u9fa5|a-zA-Z|\s]|\u3007)+$/
        },
        // global options
        options: {
            enabled:            true, // boolean or function
            required:           false, // boolean or function(el)
            autoTrim:           true,
            checkOnBlur:        false,
            visibleOnly:        false,
            skipReadOnly:       true,
            skipDisabled:       true,
            stopOnError:        false, 
            autoFocus:          true,
            containerSelector:  undefined, // control's container, use empty string to select parent node
            labelHandler:       undefined, // function(el)
            errorClass:         'fm-error',
            tipSelector:        undefined, // string
            tipTemplate:        '<div class="fm-explain">{text}</div>',
            message:            '{label}填写不正确'
        },
        messages: {
            '1': '', // reserved
            '2': '请填写{label}',
            '3': '填写的{label}不能被识别为{type}',
            '4': '{label}的长度不能小于{minLength}',
            '5': '{label}的长度不能大于{maxLength}',
            '6': '两次输入{label}不匹配',
            '7': '输入的数值不在正确的范围内'
        },
        ruleOptions: {
            // rules
            maxLength:      undefined, // number
            minLength:      undefined, // number
            sameWith:       undefined, // string, field name or id
            type:           undefined, // string, see types above, join with '|' for multiple (match any one)
            message:        undefined, // string, customized message
            label:          undefined
        }
    },
    userHandler = function() {
        var args = light.toArray(arguments), callback = args.shift();
            if(typeof callback === 'string') callback = eval(callback);
            return callback.apply(this, args);
    };

    // constructor
    validator = function(options, rules) {
        this.form = light.get(options.form);
        if(!this.form) throw 'form not found';

        this.rules = rules || {};
        this.options = light.extend({}, members.options, options);

        // result after validation
        this.result = {};

        this.init();

        var me = this;
        this.form.tagName === 'FORM' && light.on(this.form, 'submit', function(e) {
            // light.log('submitting form...');
            me.validate() || e.cancel();
        });
    };

    // all predefined rules
    members.rules = {
        minLength: function(el, value, config) {
            if(value.length < config)
                return 4;
        },
        maxLength: function(el, value, config) {
            if(value.length > config)
                return 5;
        },
        sameWith: function(el, value, config) {
            var field = this.form.field(config);
            field = field.length ? field[0] : light.get(config);
            if(!field) return false;
            return value === field.value ? 0 : 6;
        },
        range: function(el, value, config) {
            var data = config.split('|');
            value = parseInt(value, 10);
            if(data.length !== 2) return 0;

            var num1 = data[0].length ? parseInt(data[0], 10) : Number.MIN_VALUE;
                num2 = data[1].length ? parseInt(data[1], 10) : Number.MAX_VALUE;
            if(isNaN(num1) || isNaN(num2)) return 0;

            return !isNaN(value) && value >= num1 && value <= num2 ? 0 : 7;
        },
        regexp: function(el, value, config) {
            if(!value || !config) return 0;
            return new RegExp(config).test(value) ? 0 : 1;
        },
        expression: function(el, value, config) {
            if(!config) return 0;
            var expr = light.decode(config);
            if(expr.indexOf('#') === -1)
                expr = value + ' ' + expr;
            else
                expr = expr.replace(/#/g, value);

            light.log('evaluating %s', expr);
            try {
                return eval(expr) ? 0 : 1;
            } catch(e) {
                return 1;
            }
        },
        type: function(el, value, config) {
            var ok = false;
            light.each(config.split('|'), function(index, type) {
                if(!type) return 0;
                var pattern = members.types[type];
                if(!pattern) return 0;
                if(light.isArray(pattern)) pattern = pattern[0];

                ok = pattern.test(value);

                // stop if any pattern matched
                return ok;
            });
            return ok ? 0 : 1;
        }
    };

    // instance members
    validator.prototype = function() {
        var eventMap = {
                focus: 'onfocusin',
                blur: 'onfocusout'
            },
            guid = 0,
            inputSelector = 'input, select, textarea',
            inputPattern =  /^(INPUT|SELECT|TEXTAREA)$/,
            errorFieldClass = 'validating',
            bind = function(type, handler) {
                var me = this,
                    ieEvent = eventMap[type],
                    wrapper = function(e) {
                        var el = e.target || e.srcElement;
                        // light.log('event %s on %s', type, el.name || el.tagName);
                        inputPattern.test(el.tagName) && handler.call(me, el);
                    };
                ieEvent in this.form ? this.form.attachEvent(ieEvent, wrapper) : this.form.addEventListener(type, wrapper, true);
            },
            getConfig = function(name, rule, options) {
                var config = rule[name];
                return config === undefined ? options[name] : config;
            },
            getValue = function(el) {
                var value = '';
                switch(el.tagName) {
                    case 'SELECT':
                        value = el.multiple ? node('option:selected', el).map(function(option) {
                                return option.value;
                            }).join() : el.value;
                        break;
                    case 'INPUT':
                        var type = el.type.toLowerCase();
                        if(type === 'radio' || type === 'checkbox') {
                            value = node(el).parent('form').find('[name="' + el.name + '"]:checked').map(function(input) {
                                return input.value;
                            }).join();
                            break;
                        }
                    default:
                        value = el.value;
                        break;
                }
                return value;
            },
            converter = function(key, value, obj) {
                if(value === 'false')
                    obj[key] = false;
            },
            // check against the passed element, return 0 if no error found.
            checkItem = function(el) {
                var options = this.options, prop = el.getAttribute(attrName), key = el.name, element = node(el);

                // ignore field if removed from DOM
                if(!light.exists(el)) return 0;

                // skip field as soon as possible
                if(!(options.required || prop)) return 0;

                // combine rules
                if(!key) key = '_lv' + guid++;
                var config = this.rules[key] = light.extend({}, members.ruleOptions, element.getConfig(attrName, converter));

                // check readonly & disabled status
                if(el.readOnly && getConfig('skipReadOnly', config, options) || el.disabled && getConfig('skipDisabled', config, options)) return 0;

                // check enabled status
                if(!getConfig('enabled', config, options)) return 0;

                // determine if blur-checking required
                if(!getConfig('checkOnBlur', config, options) && !this.submitting) return 0;

                // stop validating if previous errors found
                if(this.submitting && element.prev('.' + errorFieldClass).length) return 0;

                // ignore hidden field if visible required
                if(getConfig('visibleOnly', config, options) && !el.offsetHeight) return 0;

                // get value
                var value, code = 0, messageType = 'default', userMessage = config.message;

                // before validate
                if(config.before) {
                    value = getValue(el);
                    // trim if necessary
                    if(getConfig('autoTrim', config, options)) value = light.trim(value);
                    code = userHandler.call(this, config.before, el, value);
                    code = code === false ? 10 : 0;
                }

                if(!code) {
                    // re-get value after before called
                    value = getValue(el);

                    // trim if necessary
                    if(getConfig('autoTrim', config, options)) value = light.trim(value);

                    // check required
                    var required = getConfig('required', config, options);
                    // eval function if necessary
                    if(light.isFunction(required)) required = required.call(this, el);

                    if(!value) {
                        if(required) code = 2;
                    } else {
                        // validate all rules
                        light.each(config, function(name, rule) {
                            if(rule === undefined || !members.rules[name]) return true;

                            code = members.rules[name].call(this, el, value, rule); 
                            // light.log('check rule %s with config %s for element %s: %s', name, rule, key, message);
                            // get the last rule type, overwrite previous type
                            if(code && name === 'type') messageType = rule;
                            return !code;
                        });

                        // after validate
                        if(!code && config.after) {
                            code = userHandler.call(this, config.after, el, value);
                            if(typeof code === 'string' && code) {
                                userMessage = code;
                                code = 10;
                            } else {
                                code = code === false ? 10 :  0;
                            }
                        }
                    }
                }
                if(code) {
                    var message = members.messages[code],
                        data = {value: value};
                    if(code != 2 && userMessage) message = userMessage;

                    if(!message) {
                        // if relevant type name defined
                        if(messageType && members.types[messageType] && members.types[messageType][1]) {
                            data.type = members.types[messageType][1];
                            message = members.messages[3];
                        } else { // use default message
                            message = options.message;
                        }
                    }

                    var container = element.addClass(errorFieldClass).parent(options.containerSelector);
                    if(options.tipSelector) container = node(options.tipSelector, container);
                    container.addClass(options.errorClass);

                    // retrieve label
                    var label = config.label;
                    if(!label && options.labelHandler)
                        label = options.labelHandler.call(this, el);

                    data.label = (label || '此项').replace(/[：:]/g, '');
					message = light.substitute(message, light.extend({}, config, data));

                    light.log('error found in %s: %s (%d)', key, message, code);

                    var parentNode = el.parentNode;
                    parentNode._tip && light.exists(parentNode._tip) && parentNode._tip.del();
                    parentNode._tip = node.build(light.substitute(options.tipTemplate, {text: message})).appendTo(options.tipSelector ? container : parentNode);

                    // set focus if necessary
                    try {
                        visible && options.autoFocus && this.submitting && !this.focused && el.focus();
                        this.focused = true;
                    } catch(e) {
                        this.focused = false;
                    }

                    this.result[key] = { code: code, message: message };

                } else {
                    if(this.result[key]) delete this.result[key];
                    resetItem.call(this, el, true);
                }
                
                return code;
            },
            resetItem = function(el, forceReset) {
                if(!forceReset && (this.submitting || !this.options.enabled || !(this.options.required || el.getAttribute(attrName)))) return;

                // combine rules
                var options = this.options;

                // light.log('reset item...');
                node(el).removeClass(errorFieldClass).parent(options.containerSelector).removeClass(options.errorClass);
                var tip = el.parentNode._tip;
                tip && tip.del();
            };
        return {
            init: function() {
                bind.call(this, 'blur', checkItem);
                bind.call(this, 'focus', resetItem);
            },
            addRule: function(name, config) {
                var rules = this.rules;
                if(!rules[name]) rules[name] = {};
                light.extend(rules[name], config);
            },
            // check specified fields
            // v.checkItem('name1', 'name2', field3);
            checkItem: function() {
                var me = this, form = this.form;
                light.each(light.toArray(arguments), function() {
                    var el = light.isString(this) ? node('[name="' + this + '"]', form)[0] : light.get(this);
                    el && checkItem.call(me, el);
                });
            },
            // reset specified fields
            // v.resetItem('name1', 'name2', field3);
            resetItem: function() {
                var me = this, form = this.form;
                light.each(light.toArray(arguments), function() {
                    var el = light.isString(this) ? node('[name="' + this + '"]', form)[0] : light.get(this);
                    el && resetItem.call(me, el, true);
                });
            },
            // reset all fields in the form
            resetForm: function() {
                var options = this.options, me = this;

                // before validate
                options.before && userHandler.call(this, options.before);

                node(inputSelector, this.form).each(function() {
                    resetItem.call(me, this, true);
                });

                // after validate
                options.after && userHandler.call(this, options.after, true);
            },
            // check all fields in the form, include before/after handler
            validate: function() {
                var me = this, options = this.options, code = 0, stop = options.stopOnError, enabled = options.enabled;

                if(!light.exists(this.form)) return true;

                // reset result
                this.result = {};

                // check status
                if(light.isFunction(enabled)) enabled = !!enabled.call(this);
                if(!enabled) return true;

                // stop validation if form is being validating
                if(this.submitting) return false;
                this.submitting = true;

                // before validate
                if(options.before) {
                    var result = userHandler.call(this, options.before) === false ? 10 : 0;
                    if(result) this.result._before = { code: result };
                    code += result;
                }

                this.focused = false;
                (stop && code) || node(inputSelector, this.form).each(function() {
                    code += checkItem.call(me, this) || 0;
                    return !stop || !code;
                });

                // after validate
                if(options.after) {
                    result = userHandler.call(this, options.after, !code) === false ? 11 : 0;
                    if(result) this.result._after = { code: result };
                    code += result;
                }

                // wait for focus event, and make sure element get focused if failed
                setTimeout(function() {
                    me.submitting = false;
                }, 100);

                return !code;
            }
        };
    }();

    // register entry point
    light.validator = light.extend(validator, members);
})(light, light.node);


/** end ---validator.js---*/
/** begin ---ui/dialog.js---*/
(function(light) {
		
		light.dialog = function(options){
			// prevent client from duplicating instance
			if(light.page._dialog) return light.page._dialog;

			var config = {
				targetFrame: document,
				title: '安全控件提示',
				bodyId: 'light-dialog',
				bodyClass: 'light-dialog',
				iframeId: 'light-dialog-iframe',
				overlayId: 'light-dialog-shadow',
				overlayClass: 'light-dialog-shadow',
				loadingId: 'light-load',
				loadClass: 'light-load',
				loadingSrc: 'https://i.alipayobjects.com/e/201310/1Lb7eeFa4r.gif',
				iframeSrc: 'https://securitycenter.alipay.com/sc/aliedit/xbox.htm',
				timeout: 20000
			};
			this.config = light.extend({}, config, options);
			var targetFrame = this.config.targetFrame;

			this.body = targetFrame.getElementById(this.config.bodyId);
			this.overlay = targetFrame.getElementById(this.config.overlayId);
			this.load = targetFrame.getElementById(this.config.loadingId);

			var d = function () {
				var cWidth = '',
					cHeight = '',
					mode = targetFrame['compatMode'],
					ua = light.client.info;

				if (mode || ua.engine.trident) {
					if (mode == 'CSS1Compat') {
						cWidth = targetFrame.documentElement['clientWidth'];
						cHeight = targetFrame.documentElement['clientHeight'];
					} else {
						cWidth = targetFrame.body['clientWidth'];
						cHeight = targetFrame.body['clientHeight'];
					}
				}

				if(document.all) { // Check it if is Internet Explorer
					var scrollTop = document.body.scrollTop;
					var scrollLeft = document.body.scrollLeft;
				}else {
					var scrollTop = window.pageYOffset;
					var scrollLeft = window.pageXOffset;
				}

				return {
					maxWidth: Math.max(
					targetFrame.documentElement['clientWidth'], targetFrame.body['scrollWidth'], targetFrame.documentElement['scrollWidth'], targetFrame.body['offsetWidth'], targetFrame.documentElement['offsetWidth']),
					maxHeight: Math.max(
					targetFrame.documentElement['clientHeight'], targetFrame.body['scrollHeight'], targetFrame.documentElement['scrollHeight'], targetFrame.body['offsetHeight'], targetFrame.documentElement['offsetHeight']),
					clientWidth: cWidth,
					clientHeight: cHeight,
					scrollTop : scrollTop,
					scrollLeft : scrollLeft
				};
			}

			var t = this;
			light.page._dialog = t;

			light.ready(function() {	
				if(!t.body) {
					t.body = createDom('div', {
						'id': t.config.bodyId,
						'class': t.config.bodyClass,
						'style': {
							'left': Math.max((d().clientWidth - 620) / 2 + d().scrollLeft, 0) + 'px',
							'top': Math.max((d().clientHeight - 400) / 2 + d().scrollTop, 0) + 'px'
						},
						'appendTo': targetFrame.body
					}, targetFrame);

					// document resize, reposition the mock
					var repositionBody = function(){
						t.body.style.left = Math.max((d().clientWidth - 620) / 2 + d().scrollLeft, 0) + 'px';
						t.body.style.top = Math.max((d().clientHeight - 400) / 2 + d().scrollTop, 0) + 'px';
					}

					light.on(window, 'resize', repositionBody);
					light.on(window, 'scroll', repositionBody);

					t.body.innerHTML = '<div class="light-dialog-top"><div class="light-dialog-title"><h2>' + t.config.title +'</h2><a href="#" id="light-dialog-close"><s></s><em>关闭</em></a></div></div>';
					t.iframe = createDom('iframe', {
						'id': t.config.iframeId,
						'frameBorder': 'no',
						'scrolling': 'no',
						'src': '',
						'appendTo': t.body
					}, targetFrame);
				}

				if(!t.overlay) {
					t.overlay = createDom('div', {
						'id': t.config.overlayId,
						'class': t.config.overlayClass,
						'innerHTML': '<iframe src="javascript:\'\'"></iframe>',
						'style': {
							'width': d().maxWidth + 'px',
							'height': d().maxHeight + 'px'
						},
						'appendTo': targetFrame.body
					}, targetFrame);

					light.on(window, 'resize', function(){
						t.overlay.style.width = d().maxWidth + 'px';	
						t.overlay.style.height = d().maxHeight + 'px';	
					})
				}


				if(!t.load) {
					t.load = createDom('div', {
						'id': t.config.loadingId,
						'class': t.config.loadClass,
						'innerHTML': '<img src="' + t.config.loadingSrc + '">',
						'style': {
							'left': (d().clientWidth - 208) / 2 + 'px',
							'top': (d().clientHeight - 50) / 2 + 'px'
						},
						'appendTo': targetFrame.body
					}, targetFrame);
				}
			});


		}

		light.dialog.prototype = {
			show: function() {
				var t = this;
				this.load.style.visibility = 'visible';
				this.overlay.style.visibility = 'visible';
				light.on(this.iframe, 'load', function () {
					t.body.style.visibility = 'visible';
					t.load.style.visibility = 'hidden';
					var close = t.config.targetFrame.getElementById('light-dialog-close') || {};
					light.on(close, 'click', function() {
						t.hide();
					});
					//ESC键绑定关闭事件,依赖alieditcontrol-update.js文件AC.on 方法
					light.on(t.config.targetFrame, 'keydown', function(e){
						if(e.which == 27) {
							t.hide();
							e.cancel();
						}
					});
				});
				this.iframe.src = this.config.iframeSrc;
			},
			hide: function() {
				this.body['style'].visibility = 'hidden';
				this.overlay['style'].visibility = 'hidden';
			},
			dispose: function() {
				targetFrame.body.removeChild(this.load);
				targetFrame.body.removeChild(this.body);
				targetFrame.body.removeChild(this.overlay);
			},
			onShow: light.noop
		}
		
		light.dialog.prototype.constructor = light.dialog;



		function createDom (tagName, prop, target) {
			var ele = target.createElement(tagName);
			if (prop === null) return ele;
			for (p in prop) {
				if (p == 'class' || p == 'className') {
					ele.className = prop[p];
				} else if (p == 'style') {
					for (s in prop[p]) {
						ele.style[s] = prop[p][s];
					}
				} else if (p === 'innerHTML') {
					ele.innerHTML = prop[p];
				} else if (p === 'appendTo') {
					prop[p].appendChild(ele);
				} else if (p === 'append') {
					ele.appendChild(prop[p]);
				} else {
					ele.setAttribute([p], prop[p]);
				}
			}
			return ele;
		}
		
})(window.light);

/** end ---ui/dialog.js---*/
/** begin ---ui/pop.js---*/
/*
 * pop init: 
		<a href="#" class="showCertTip" data-content="pop-content">?</a>
 *
 * pop struct:
 * <div id="{id}" class="{className}">
	<div class="ui-tiptext-container ui-tiptext-container-message">
		<span class="ui-tiptext-arrowup"></span>
		<span class="ui-tiptext-icon"></span>
		<div class="ui-tiptext-content">pop-content</div>
	</div>
	</div>
 *
 *
 * */

(function(light){
	light.pop = function(options) {
		var defaults = {
			targets: [],
			id: '',
			className: '',
			width: 280,
			height: null,
			type: 'message', // 'message', 'warning'
			event: 'mouseover', //'click'
			direction: 'up' // 'up', 'down', 'left', 'right'
		};
		this.options = light.extend({}, defaults, options);
		this.pop = null;
		this.init();
	};
	
	light.pop.position = {
		'up' : function(dir, d, t, r, a) {
			a.direction = dir;
			if( (d.height + d.top - t.top - t.height) < (r.height + a.height) ) {
				a.direction = 'down';
			} else if( (t.top - d.top) < (r.height + a.height) ) {
				a.direction = 'up';
			}

			if( a.direction == 'up') {
				r.top = t.top + t.height + a.height;
				a.top = 1 - a.height;
			} else {
				r.top = t.top - a.height - r.height;
				a.top = r.innerHeight - 1;
			}
			
			if( t.left < (d.left + parseInt(r.width/2) - t.width) ) {
				r.left = d.left;
			} else if(t.left > (d.left + d.width - parseInt(r.width/2)) ) {
				r.left = d.left + d.width - r.width;
			} else {
				r.left = t.left + parseInt(t.width/2) - parseInt(r.width/2);
			}

			if( t.left < r.left ) {
				a.left = 0;
			} else if( t.left > (r.left + r.width) ) {
				a.left = r.width - a.width;
			} else if( t.width < r.width ){
				a.left = t.left + parseInt((t.width - a.width)/2) - r.left;
			} else {
				a.left = parseInt(r.width/2);
			}
			
			return {'rect': r, 'arrow': a};
		},

		'left' : function() {
		}
	};
	
	light.pop.position.down = light.pop.position.up;
	light.pop.position.left = light.pop.position.right;


	light.pop.prototype = {
		init: function() {
			var _self = this;
			this.initDom();
			light.each(this.options.targets, function(i, target){
				var target = light.node(target);
				target.mouseover(function(){
					_self.show(target);
				}).mouseout(function(){
					_self.hide(target);
				});
			});
		},

		initDom: function() {
			var template = '<div id="{id}" class="{className}"><div class="ui-tiptext-container ui-tiptext-container-{type}">' + 
							 '<span class="ui-tiptext-arrow ui-tiptext-arrowup"></span>' +
							 '<span class="ui-tiptext-icon"></span>' +
							 '<div class="ui-tiptext-content"></div>' + 
							 '</div></div>';

			this.wrap = light.node.build(light.substitute(template, {
					id: this.options.id, 
					className: this.options.className,
					type: this.options.type
				})).appendTo(document.body).hide();
			
			this.pop = light.node('.ui-tiptext-container', this.wrap);
			this.arrow = light.node('.ui-tiptext-arrow', this.pop);
			this.content = light.node('.ui-tiptext-content', this.pop);
		},

		show: function(target) {
			this.content.html(target.attr('data-content'));
			this.setSize();
			this.wrap.show();
			this.setPosition(target[0]);
		},

		hide: function(target) {
			this.wrap.hide();
		},

		setSize: function() {
			this.options.width && (this.pop[0].style.width = this.options.width + 'px');
			this.options.height && (this.pop[0].style.height = this.options.height + 'px');
		},

		setPosition: function(t) {
			var result,
				doc = light.getScroll(),
				target = light.region(t),
				rect = light.region(this.pop[0]),
				arrow = light.region(this.arrow[0]);

			rect.innerHeight = this.pop[0].clientHeight;

			doc.width = light.getViewportWidth();
			doc.height = light.getViewportHeight();

			result = light.pop.position[this.options.direction](this.options.direction, doc, target, rect, arrow);

			light.setStyle(this.pop[0], {
				'position': 'absolute',
				'zIndex': '9999',
				'left': result.rect.left + 'px',
				'top': result.rect.top + 'px'
			});

			light.setStyle(this.arrow[0], {
				'left': result.arrow.left + 'px',
				'top': result.arrow.top + 'px'
			});
			this.arrow[0].className = 'ui-tiptext-arrow ui-tiptext-arrow' + result.arrow.direction;
		}
	};

})(window.light);

/** end ---ui/pop.js---*/
/** begin ---sizzle/sizzle.js---*/
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function( window, undefined ) {

var document = window.document,
	docElem = document.documentElement,

	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,

	toString = Object.prototype.toString,
	strundefined = "undefined",

	hasDuplicate = false,
	baseHasDuplicate = true,

	// Regex
	rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
	chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,

	rbackslash = /\\/g,
	rnonWord = /\W/,
	rstartsWithWord = /^\w/,
	rnonDigit = /\D/,
	rnth = /(-?)(\d*)(?:n([+\-]?\d*))?/,
	radjacent = /^\+|\s*/g,
	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,
	rtnfr = /[\t\n\f\r]/g,

	characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
	matchExpr = {
		ID: new RegExp("#(" + characterEncoding + "+)"),
		CLASS: new RegExp("\\.(" + characterEncoding + "+)"),
		NAME: new RegExp("\\[name=['\"]*(" + characterEncoding + "+)['\"]*\\]"),
		TAG: new RegExp("^(" + characterEncoding.replace( "[-", "[-\\*" ) + "+)"),
		ATTR: new RegExp("\\[\\s*(" + characterEncoding + "+)\\s*(?:(\\S?=)\\s*(?:(['\"])(.*?)\\3|(#?" + characterEncoding + "*)|)|)\\s*\\]"),
		PSEUDO: new RegExp(":(" + characterEncoding + "+)(?:\\((['\"]?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\2\\))?"),
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
	},

	origPOS = matchExpr.POS,

	leftMatchExpr = (function() {
		var type,
			// Increments parenthetical references
			// for leftMatch creation
			fescape = function( all, num ) {
				return "\\" + ( num - 0 + 1 );
			},
			leftMatch = {};

		for ( type in matchExpr ) {
			// Modify the regexes ensuring the matches do not end in brackets/parens
			matchExpr[ type ] = new RegExp( matchExpr[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
			// Adds a capture group for characters left of the match
			leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + matchExpr[ type ].source.replace( /\\(\d+)/g, fescape ) );
		}

		// Expose origPOS
		// "global" as in regardless of relation to brackets/parens
		matchExpr.globalPOS = origPOS;

		return leftMatch;
	})(),

	// Used for testing something on an element
	assert = function( fn ) {
		var pass = false,
			div = document.createElement("div");
		try {
			pass = fn( div );
		} catch (e) {}
		// release memory in IE
		div = null;
		return pass;
	},

	// Check to see if the browser returns elements by name when
	// querying by getElementById (and provide a workaround)
	assertGetIdNotName = assert(function( div ) {
		var pass = true,
			id = "script" + (new Date()).getTime();
		div.innerHTML = "<a name ='" + id + "'/>";

		// Inject it into the root element, check its status, and remove it quickly
		docElem.insertBefore( div, docElem.firstChild );

		if ( document.getElementById( id ) ) {
			pass = false;
		}
		docElem.removeChild( div );
		return pass;
	}),

	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return div.getElementsByTagName("*").length === 0;
	}),

	// Check to see if an attribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Determines a buggy getElementsByClassName
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='test e'></div><div class='test'></div>";
		if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
			return false;
		}

		// Safari caches class attributes, doesn't catch changes (in 3.2)
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length !== 1;
	});


// Check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results ) {
	results = results || [];
	context = context || document;
	var match, elem, contextXML,
		nodeType = context.nodeType;

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	contextXML = isXML( context );

	if ( !contextXML ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( match[1] ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( match[1] );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === match[1] ) {
							return makeArray( [ elem ], results );
						}
					} else {
						return makeArray( [], results );
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( match[1] )) &&
						contains( context, elem ) && elem.id === match[1] ) {
						return makeArray( [ elem ], results );
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				// Speed-up: Sizzle("body")
				if ( selector === "body" && context.body ) {
					return makeArray( [ context.body ], results );
				}
				return makeArray( context.getElementsByTagName( selector ), results );
			// Speed-up: Sizzle(".CLASS")
			} else if ( assertUsableClassName && match[3] && context.getElementsByClassName ) {
				return makeArray( context.getElementsByClassName( match[3] ), results );
			}
		}
	}

	// All others
	return select( selector, context, results, undefined, contextXML );
};

var select = function( selector, context, results, seed, contextXML ) {
	var m, set, checkSet, extra, ret, cur, pop, i,
		origContext = context,
		prune = true,
		parts = [],
		soFar = selector;

	do {
		// Reset the position of the chunker regexp (start from head)
		chunker.exec( "" );
		m = chunker.exec( soFar );

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
			set = posProcess( parts[0] + parts[1], context, seed, contextXML );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}

				set = posProcess( selector, set, seed, contextXML );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				matchExpr.ID.test( parts[0] ) && !matchExpr.ID.test( parts[parts.length - 1] ) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray( seed ) } :
				Sizzle.find( parts.pop(), (parts.length >= 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode) || context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

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
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains( context, checkSet[i] )) ) {
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
		select( extra, origContext, results, seed, contextXML );
		uniqueSort( results );
	}

	return results;
};

var isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Slice is no longer used
// It is not actually faster
// Results is expected to be an array or undefined
// typeof len is checked for if array is a form nodelist containing an element with name "length" (wow)
var makeArray = function( array, results ) {
	results = results || [];
	var i = 0,
		len = array.length;
	if ( typeof len === "number" ) {
		for ( ; i < len; i++ ) {
			results.push( array[i] );
		}
	} else {
		for ( ; array[i]; i++ ) {
			results.push( array[i] );
		}
	}
	return results;
};

var uniqueSort = Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

// Element contains another
var contains = Sizzle.contains = docElem.compareDocumentPosition ?
	function( a, b ) {
		return !!(a.compareDocumentPosition( b ) & 16);
	} :
	docElem.contains ?
	function( a, b ) {
		return a !== b && ( a.contains ? a.contains( b ) : false );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.matches = function( expr, set ) {
	return select( expr, document, [], set, isXML( document ) );
};

Sizzle.matchesSelector = function( node, expr ) {
	return select( expr, document, [], [ node ], isXML( document ) ).length > 0;
};

Sizzle.find = function( expr, context, contextXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];

		if ( (match = leftMatchExpr[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rbackslash, "" );
				set = Expr.find[ type ]( match, context, contextXML );

				if ( set != null ) {
					expr = expr.replace( matchExpr[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== strundefined ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = leftMatchExpr[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice( 1, 1 );

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
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

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

					expr = expr.replace( matchExpr[ type ], "" );

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
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
	var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {

	match: matchExpr,
	leftMatch: leftMatchExpr,

	order: [ "ID", "NAME", "TAG" ],

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: assertHrefNotNormalized ?
			function( elem ) {
				return elem.getAttribute( "href" );
			} :
			function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function( checkSet, part ) {
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rnonWord.test( part ),
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

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rnonWord.test( part ) ) {
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

		"": function( checkSet, part, xml ) {
			dirCheck( "parentNode", checkSet, part, xml );
		},

		"~": function( checkSet, part, xml ) {
			dirCheck( "previousSibling", checkSet, part, xml );
		}
	},

	find: {
		ID: assertGetIdNotName ?
			function( match, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( match[1] );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( match, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( match[1] );

					return m ?
						m.id === match[1] || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").nodeValue === match[1] ?
							[m] :
							undefined :
						[];
				}
			},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				var ret = [],
					results = context.getElementsByName( match[1] ),
					i = 0,
					len = results.length;

				for ( ; i < len; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: assertTagNameNoComments ?
			function( match, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( match[1] );
				}
			} :
			function( match, context ) {
				var results = context.getElementsByTagName( match[1] );

				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [],
						i = 0;

					for ( ; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}

					results = tmp;
				}
				return results;
			}
	},

	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, xml ) {
			match = " " + match[1].replace( rbackslash, "" ) + " ";

			if ( xml ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace( rtnfr, " " ).indexOf( match ) >= 0) ) {
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

		ID: function( match ) {
			return match[1].replace( rbackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rbackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace( radjacent, "" );

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = rnth.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!rnonDigit.test( match[2] ) && "0n+" + match[2] || match[2] );

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, xml ) {
			var name = match[1] = match[1].replace( rbackslash, "" );

			if ( !xml && Expr.attrMap[ name ] ) {
				match[1] = Expr.attrMap[ name ];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not, xml ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec( match[3] ) || "" ).length > 1 || rstartsWithWord.test( match[3] ) ) {
					match[3] = select( match[3], document, [], curLoop, xml );

				} else {
					var ret = Sizzle.filter( match[3], curLoop, inplace, !not );

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( matchExpr.POS.test( match[0] ) || matchExpr.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},

	filters: {
		enabled: function( elem ) {
			return elem.disabled === false;
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return rheader.test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === null || attr.toLowerCase() === type );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		focus: function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
		},

		active: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		},

		contains: function( elem, i, match ) {
			return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( match[3] ) >= 0;
		}
	},

	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},

	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "not" ) {
				var not = match[3],
					j = 0,
					len = not.length;

				for ( ; j < len; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					if ( type === "first" ) {
						return true;
					}

					node = elem;

					/* falls through */
				case "last":
					while ( (node = node.nextSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}

					doneName = match[0];
					parent = elem.parentNode;

					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;

						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}

						parent[ expando ] = doneName;
					}

					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: assertGetIdNotName ?
			function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			} :
			function( elem, match ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return elem.nodeType === 1 && node && node.nodeValue === match;
			},

		TAG: function( elem, match ) {
			return ( match === "*" && elem.nodeType === 1 ) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},

		CLASS: function( elem, match ) {
			return ( " " + ( elem.className || elem.getAttribute("class") ) + " " ).indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf( check ) >= 0 :
				type === "~=" ?
				( " " + value + " " ).indexOf( check ) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf( check ) === 0 :
				type === "$=" ?
				value.substr( value.length - check.length ) === check :
				type === "|=" ?
				value === check || value.substr( 0, check.length + 1 ) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

// Add getElementsByClassName if usable
if ( assertUsableClassName ) {
	Expr.order.splice( 1, 0, "CLASS" );
	Expr.find.CLASS = function( match, context, xml ) {
		if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
			return context.getElementsByClassName( match[1] );
		}
	};
}

var sortOrder, siblingCheck;

if ( docElem.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

if ( document.querySelectorAll ) {
	(function(){
		var oldSelect = select,
			id = "__sizzle__",
			rrelativeHierarchy = /^\s*[+~]/,
			rapostrophe = /'/g,
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			rbuggyQSA = [];

		assert(function( div ) {
			div.innerHTML = "<select><option selected></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push("\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10/IE - ^= $= *= and empty values
			div.innerHTML = "<p class=''></p>";
			// Should not select anything
			if ( div.querySelectorAll("[class^='']").length ) {
				rbuggyQSA.push("[*^$]=[\\x20\\t\\n\\r\\f]*(?:\"\"|'')");
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, contextXML ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !contextXML && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
				if ( context.nodeType === 9 ) {
					try {
						return makeArray( context.querySelectorAll( selector ), results );
					} catch(qsaError) {}
				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						parent = context.parentNode,
						relativeHierarchySelector = rrelativeHierarchy.test( selector );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( rapostrophe, "\\$&" );
					}
					if ( relativeHierarchySelector && parent ) {
						context = parent;
					}

					try {
						if ( !relativeHierarchySelector || parent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + selector ), results );
						}
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, contextXML );
		};
	})();
}

function dirCheck( dir, checkSet, part, xml ) {
	var elem, match, isElem, nodeCheck,
		doneName = done++,
		i = 0,
		len = checkSet.length;

	if ( typeof part === "string" && !rnonWord.test( part ) ) {
		part = part.toLowerCase();
		nodeCheck = part;
	}

	for ( ; i < len; i++ ) {
		elem = checkSet[i];

		if ( elem ) {
			match = false;
			elem = elem[ dir ];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[ elem.sizset ];
					break;
				}

				isElem = elem.nodeType === 1;
				if ( isElem && !xml ) {
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( nodeCheck ) {
					if ( elem.nodeName.toLowerCase() === part ) {
						match = elem;
						break;
					}
				} else if ( isElem ) {
					if ( typeof part !== "string" ) {
						if ( elem === part ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( part, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[ dir ];
			}

			checkSet[i] = match;
		}
	}
}

var posProcess = function( selector, context, seed, contextXML ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [ context ] : context,
		i = 0,
		len = root.length;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = matchExpr.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( matchExpr.PSEUDO, "" );
	}

	if ( Expr.relative[ selector ] ) {
		selector += "*";
	}

	for ( ; i < len; i++ ) {
		select( selector, root[i], tmpSet, seed, contextXML );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

light.Sizzle = Sizzle;

})( window );


/** end ---sizzle/sizzle.js---*/
/** begin ---sizzle/wrapper.js---*/
// extend sizzle
light.extend(light.Sizzle.selectors.filters, {
    checkable: function(element) {
        return element.nodeName.toLowerCase() === "input" && "undefined" !== typeof element.type;
    },
    hasValue: function(element) {
        var value = element.value;
        return typeof value === 'string' && value !== '';
    },
    filled: function(element) {
        return !element.readOnly && !!light.trim(element.value);
    }
});

// register interface
light.node.getSizzle = function() {
	return light.Sizzle;
};


/** end ---sizzle/wrapper.js---*/

/**alipay.light.page-1.12**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Tue Oct 22 17:28:02 CST 2013**/
