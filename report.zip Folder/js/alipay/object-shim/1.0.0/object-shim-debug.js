define("alipay/object-shim/1.0.0/object-shim-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var OBJECT_SHIM_CLASS = "object-shim-class";
    seajs.importStyle("body .object-shim-class{display:inline-block;*display:inline;*zoom:1;height:22px;width:198px;border:1px solid #999}body .object-shim-class object,body .object-shim-class embed{display:none}", "alipay/object-shim/1.0.0/object-shim.css");
    // target 支持 jquery Element 或 Overlay 及子组件
    // className 为安全控件的样式名
    function ObjectShim(target, className) {
        this.target = $(target.element || target).eq(0);
        this.className = className || "alieditContainer";
        // 如果是 Overlay 及子组件则绑定 show/hide，不需要调用 sync
        if (isOverlay(target)) {
            var that = this;
            this._callbacks = {
                show: function() {
                    that.hide();
                },
                hide: function() {
                    that.show();
                }
            };
            this._overlay = target;
            target.after("show", this._callbacks.show);
            target.after("hide", this._callbacks.hide);
        }
    }
    ObjectShim.prototype.sync = function() {
        var target = this.target;
        // 如果未传 target 则不处理
        if (!target.length) return this;
        // 如果目标元素隐藏，则 iframe 也隐藏
        // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
        // http://api.jquery.com/hidden-selector/
        if (!target.outerHeight() || !target.outerWidth() || target.is(":hidden")) {
            this.show();
        } else {
            this.hide();
        }
        return this;
    };
    ObjectShim.prototype.show = function() {
        $("." + this.className).removeClass(OBJECT_SHIM_CLASS);
        return this;
    };
    ObjectShim.prototype.hide = function() {
        $("." + this.className).addClass(OBJECT_SHIM_CLASS);
        return this;
    };
    ObjectShim.prototype.destroy = function() {
        if (this._callbacks) {
            this._overlay.off("after:show", this._callbacks.show);
            this._overlay.off("after:hide", this._callbacks.hide);
        }
        // reset className
        this.show();
    };
    module.exports = function(target, className) {
        return new ObjectShim(target, className);
    };
    // Helper
    // ------
    function isOverlay(overlay) {
        return !!(overlay._setupShim && overlay._setPosition);
    }
});