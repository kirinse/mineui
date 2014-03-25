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