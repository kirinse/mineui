define("alipay/slider/1.1.1/mouse-debug", [ "$-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Widget = require("arale/widget/1.0.3/widget-debug");
    var Mouse = Widget.extend({
        attrs: {
            cancel: "input,textarea,button,select,option",
            distance: 1,
            delay: 0
        },
        _mouseInit: function() {
            var that = this;
            //element鏄紶鏍囧姩浣滅殑瑙﹀彂鍣�
            this.element.on("mousedown." + this.cid, function(e) {
                return that._mouseDown(e);
            }).on("click." + this.cid, function(e) {
                if (true === $.data(e.target, that.cid + ".preventClickEvent")) {
                    $.removeData(e.target, that.cid + ".preventClickEvent");
                    e.stopImmediatePropagation();
                    return false;
                }
            });
            this.started = false;
        },
        // TODO: make sure destroying one instance of mouse
        // doesn't mess with other instances of mouse
        _mouseDestroy: function() {
            this.element.unbind("." + this.cid);
            if (this._mouseMoveDelegate) {
                $(document).unbind("mousemove." + this.cid, this._mouseMoveDelegate).unbind("mouseup." + this.ci, this._mouseUpDelegate);
            }
        },
        _mouseDown: function(e) {
            // don't let more than one widget handle mouseStart
            if (Mouse.handled) {
                return;
            }
            // we may have missed mouseup (out of window)
            this._mouseStarted && this._mouseUp(e);
            this._mouseDownEvent = e;
            var that = this, btnIsLeft = e.which === 1, cancel = that.get("cancel"), delay = that.get("delay"), // e.target.nodeName works around a bug
            // in IE 8 with disabled inputs (#7620)
            elIsCancel = typeof cancel === "string" && e.target.nodeName ? $(e.target).closest(cancel).length : false;
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(e)) {
                return true;
            }
            this.mouseDelayMet = !delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function() {
                    that.mouseDelayMet = true;
                }, delay);
            }
            if (this._mouseDistanceMet(e) && this._mouseDelayMet(e)) {
                this._mouseStarted = this._mouseStart(e) !== false;
                if (!this._mouseStarted) {
                    e.preventDefault();
                    return true;
                }
            }
            // Click e may never have fired (Gecko & Opera)
            if (true === $.data(e.target, this.cid + ".preventClickEvent")) {
                $.removeData(e.target, this.cid + ".preventClickEvent");
            }
            this._mouseMoveDelegate = $.proxy(this, "_mouseMove");
            this._mouseUpDelegate = $.proxy(this, "_mouseUp");
            $(document).on("mousemove." + this.cid, this._mouseMoveDelegate).on("mouseup." + this.cid, this._mouseUpDelegate);
            e.preventDefault();
            Mouse.handled = true;
            return true;
        },
        _mouseMove: function(e) {
            // IE mouseup check - mouseup happened when mouse was out of window
            if ($.browser.msie && !(document.documentMode >= 9) && !e.button) {
                return this._mouseUp(e);
            }
            if (this._mouseStarted) {
                this._mouseDrag(e);
                return e.preventDefault();
            }
            if (this._mouseDistanceMet(e) && this._mouseDelayMet(e)) {
                this._mouseStarted = this._mouseStart(this._mouseDownEvent) !== false;
                this._mouseStarted ? this._mouseDrag(e) : this._mouseUp(e);
            }
            return !this._mouseStarted;
        },
        _mouseUp: function(e) {
            e || (e = $.Event("mouseup"));
            $(document).unbind("mousemove." + this.cid, this._mouseMoveDelegate).unbind("mouseup." + this.cid, this._mouseUpDelegate);
            if (this._mouseStarted) {
                this._mouseStarted = false;
                if (e.target === this._mouseDownEvent.target) {
                    $.data(e.target, this.cid + ".preventClickEvent", true);
                }
                this._mouseStop(e);
            }
            return false;
        },
        _mouseDistanceMet: function(e) {
            return Math.max(Math.abs(this._mouseDownEvent.pageX - e.pageX), Math.abs(this._mouseDownEvent.pageY - e.pageY)) >= this.get("distance");
        },
        _mouseDelayMet: function(e) {
            return this.mouseDelayMet;
        },
        // These are placeholder methods, to be overriden by extending plugin
        _mouseStart: function(e) {},
        _mouseDrag: function(e) {},
        _mouseStop: function(e) {},
        _mouseCapture: function(e) {
            return true;
        }
    });
    Mouse.handled = false;
    $(document).mouseup(function() {
        Mouse.handled = false;
    });
    module.exports = Mouse;
});

define("alipay/slider/1.1.1/slider-debug", [ "./mouse-debug", "$-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Mouse = require("./mouse-debug");
    var Slider = Mouse.extend({
        attrs: {
            animate: true,
            distance: 0,
            max: 100,
            min: 0,
            orientation: "horizontal",
            allowCross: false,
            range: false,
            step: 1,
            value: 0,
            values: null
        },
        setup: function() {
            var i, handleCount, disabled = this.get("disabled"), range = this.get("range"), values = this.get("values"), min = this.get("min"), existingHandles = this.element.find(".ui-slider-handle").addClass("ui-state-default"), handle = "<a class='ui-slider-handle ui-state-default' href='#'></a>", handles = [], that = this;
            this._mouseSliding = false;
            this._animateOff = true;
            this._handleIndex = null;
            this._detectOrientation();
            this._mouseInit();
            this.element.addClass("ui-slider" + " ui-slider-" + this.orientation + (disabled ? " ui-slider-disabled ui-disabled" : ""));
            this.range = $([]);
            if (range) {
                if (range === true) {
                    if (!values) {
                        values = [ min, min ];
                    }
                    if (values.length && values.length !== 2) {
                        values = [ values[0], values[0] ];
                    }
                }
                this.range = $("<div></div>").appendTo(this.element).addClass("ui-slider-range" + (// note: this isn't the most fittingly semantic framework class for this element,
                // but worked best visually with a variety of themes
                range === "min" || range === "max" ? " ui-slider-range-" + range : ""));
            }
            handleCount = values && values.length || 1;
            for (i = existingHandles.length; i < handleCount; i++) {
                handles.push(handle);
            }
            this.handles = existingHandles.add($(handles.join("")).appendTo(this.element));
            this.handle = this.handles.eq(0);
            this.handles.add(this.range).filter("a").click(function(e) {
                e.preventDefault();
            }).mouseenter(function() {
                if (!disabled) {
                    $(this).addClass("ui-state-hover");
                }
            }).mouseleave(function() {
                $(this).removeClass("ui-state-hover");
            }).focus(function() {
                if (!disabled) {
                    $(".ui-slider .ui-state-focus").removeClass("ui-state-focus");
                    $(this).addClass("ui-state-focus");
                } else {
                    $(this).blur();
                }
            }).blur(function() {
                $(this).removeClass("ui-state-focus");
            });
            this.handles.each(function(i) {
                $(this).data("ui-slider-handle-index", i);
            });
            that._refreshValue();
            this._animateOff = false;
        },
        destroy: function() {
            this.handles.remove();
            this.range.remove();
            this.element.removeClass("ui-slider" + " ui-slider-horizontal" + " ui-slider-vertical" + " ui-slider-disabled");
            this._mouseDestroy();
            Slider.superclass.destroy.call(this);
        },
        _mouseCapture: function(e) {
            var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle, that = this;
            var min = this.get("min");
            var max = this.get("max");
            if (this.get("disabled")) {
                return false;
            }
            this.elementSize = {
                width: this.element.outerWidth(),
                height: this.element.outerHeight()
            };
            this.elementOffset = this.element.offset();
            position = {
                x: e.pageX,
                y: e.pageY
            };
            normValue = this._normValueFromMouse(position);
            if (this.values(0) === this.values(1)) {
                if (normValue > this.values(0)) {
                    index = 1;
                } else if (normValue < this.values(0)) {
                    index = 0;
                } else {
                    index = this._last_index;
                }
                closestHandle = $(this.handles[index]);
            } else {
                distance = max - min + 1;
                this.handles.each(function(i) {
                    var thisDistance = Math.abs(normValue - that.values(i));
                    if (distance > thisDistance) {
                        distance = thisDistance;
                        closestHandle = $(this);
                        index = i;
                    }
                });
            }
            // workaround for bug #3736 (if both handles of a range are at 0,
            // the first is always used as the one with least distance,
            // and moving it is obviously prevented by preventing negative ranges)
            if (this.get("range") === true && this.values(1) === this.get("min")) {
                index = 1;
                closestHandle = $(this.handles[index]);
            }
            // saving last index
            this._last_index = index;
            allowed = this._start(e, index);
            if (allowed === false) {
                return false;
            }
            this._mouseSliding = true;
            this._handleIndex = index;
            closestHandle.addClass("ui-state-active").focus();
            offset = closestHandle.offset();
            mouseOverHandle = !$(e.target).parents().andSelf().is(".ui-slider-handle");
            this._clickOffset = mouseOverHandle ? {
                left: 0,
                top: 0
            } : {
                left: e.pageX - offset.left - closestHandle.width() / 2,
                top: e.pageY - offset.top - closestHandle.height() / 2 - (parseInt(closestHandle.css("borderTopWidth"), 10) || 0) - (parseInt(closestHandle.css("borderBottomWidth"), 10) || 0) + (parseInt(closestHandle.css("marginTop"), 10) || 0)
            };
            if (!this.handles.hasClass("ui-state-hover")) {
                this._slide(e, index, normValue);
            }
            this._animateOff = true;
            return true;
        },
        _mouseStart: function() {
            return true;
        },
        _mouseDrag: function(e) {
            var position = {
                x: e.pageX,
                y: e.pageY
            }, normValue = this._normValueFromMouse(position);
            // two handle can cross their position
            // add by pianyou
            // 2012-11-26
            if (this.get("range") && this.get("allowCross") && this.values(0) === this.values(1)) {
                var originIndex = this._handleIndex;
                if (normValue < this.values(0)) {
                    this._handleIndex = 0;
                } else if (normValue > this.values(1)) {
                    this._handleIndex = 1;
                }
                this.trigger("slide", e, {
                    handle: this.handles[originIndex],
                    value: this.values(0),
                    values: this.values()
                });
                this.handles.eq(this._handleIndex).focus();
            }
            this._slide(e, this._handleIndex, normValue);
            return false;
        },
        _mouseStop: function(e) {
            this.handles.removeClass("ui-state-active");
            this._mouseSliding = false;
            this._stop(e, this._handleIndex);
            this._change(e, this._handleIndex);
            this._handleIndex = null;
            this._clickOffset = null;
            this._animateOff = false;
            return false;
        },
        _detectOrientation: function() {
            this.orientation = this.get("orientation") === "vertical" ? "vertical" : "horizontal";
        },
        _normValueFromMouse: function(position) {
            var pixelTotal, pixelMouse, percentMouse, valueTotal, valueMouse, min = this.get("min"), max = this.get("max");
            if (this.orientation === "horizontal") {
                pixelTotal = this.elementSize.width;
                pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
            } else {
                pixelTotal = this.elementSize.height;
                pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
            }
            percentMouse = pixelMouse / pixelTotal;
            if (percentMouse > 1) {
                percentMouse = 1;
            }
            if (percentMouse < 0) {
                percentMouse = 0;
            }
            if (this.orientation === "vertical") {
                percentMouse = 1 - percentMouse;
            }
            valueTotal = max - min;
            valueMouse = min + percentMouse * valueTotal;
            return this._trimAlignValue(valueMouse);
        },
        _start: function(e, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            }, values = this.get("values");
            if (values && values.length) {
                uiHash.value = this.values(index);
                uiHash.values = this.values();
            }
            return this.trigger("start", e, uiHash);
        },
        _slide: function(e, index, newVal) {
            var otherVal, newValues, allowed, range = this.get("range"), values = this.get("values");
            if (values && values.length) {
                otherVal = this.values(index ? 0 : 1);
                if (values.length === 2 && range === true && (index === 0 && newVal > otherVal || index === 1 && newVal < otherVal)) {
                    newVal = otherVal;
                }
                if (newVal !== this.values(index)) {
                    newValues = this.values();
                    newValues[index] = newVal;
                    // A slide can be canceled by returning false from the slide callback
                    allowed = this.trigger("slide", e, {
                        handle: this.handles[index],
                        value: newVal,
                        values: newValues
                    });
                    otherVal = this.values(index ? 0 : 1);
                    if (allowed !== false) {
                        this.values(index, newVal, true);
                    }
                }
            } else {
                if (newVal !== this.value()) {
                    // A slide can be canceled by returning false from the slide callback
                    allowed = this.trigger("slide", e, {
                        handle: this.handles[index],
                        value: newVal
                    });
                    if (allowed !== false) {
                        this.value(newVal);
                    }
                }
            }
        },
        _stop: function(e, index) {
            var uiHash = {
                handle: this.handles[index],
                value: this.value()
            }, values = this.get("values");
            if (values && values.length) {
                uiHash.value = this.values(index);
                uiHash.values = this.values();
            }
            this.trigger("stop", e, uiHash);
        },
        _change: function(e, index) {
            if (!this._mouseSliding) {
                var uiHash = {
                    handle: this.handles[index],
                    value: this.value()
                }, values = this.get("values");
                if (values && values.length) {
                    uiHash.value = this.values(index);
                    uiHash.values = this.values();
                }
                this.trigger("change", e, uiHash);
            }
        },
        value: function(newValue) {
            if (arguments.length) {
                this.set("value", this._trimAlignValue(newValue));
                this._refreshValue();
                this._change(null, 0);
                return;
            }
            return this._value();
        },
        values: function(index, newValue) {
            var vals, newValues, i, values = this.get("values");
            if (arguments.length > 1) {
                values[index] = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, index);
                return;
            }
            if (arguments.length) {
                if ($.isArray(arguments[0])) {
                    vals = values;
                    newValues = arguments[0];
                    for (i = 0; i < vals.length; i += 1) {
                        vals[i] = this._trimAlignValue(newValues[i]);
                        this._change(null, i);
                    }
                    this._refreshValue();
                } else {
                    if (values && values.length) {
                        return this._values(index);
                    } else {
                        return this.value();
                    }
                }
            } else {
                return this._values();
            }
        },
        //internal value getter
        // _value() returns value trimmed by min and max, aligned by step
        _value: function() {
            var val = this.get("value");
            val = this._trimAlignValue(val);
            return val;
        },
        //internal values getter
        // _values() returns array of values trimmed by min and max, aligned by step
        // _values( index ) returns single value trimmed by min and max, aligned by step
        _values: function(index) {
            var val, vals, i, values = this.get("values");
            if (arguments.length) {
                val = values[index];
                val = this._trimAlignValue(val);
                return val;
            } else {
                // .slice() creates a copy of the array
                // this copy gets trimmed by min and max and then returned
                vals = values.slice();
                for (i = 0; i < vals.length; i += 1) {
                    vals[i] = this._trimAlignValue(vals[i]);
                }
                return vals;
            }
        },
        // returns the step-aligned value that val is closest to, between (inclusive) min and max
        _trimAlignValue: function(val) {
            var min = this.get("min");
            var max = this.get("max");
            var step = this.get("step");
            if (val <= min) {
                return min;
            }
            if (val >= max) {
                return max;
            }
            var step = step > 0 ? step : 1, valModStep = (val - min) % step, alignValue = val - valModStep;
            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += valModStep > 0 ? step : -step;
            }
            // Since JavaScript has problems with large floats, round
            // the final value to 5 digits after the decimal point (see #4124)
            return parseFloat(alignValue.toFixed(5));
        },
        _refreshValue: function() {
            var lastValPercent, valPercent, value, valueMin, valueMax, oRange = this.get("range"), values = this.get("values"), min = this.get("min"), max = this.get("max"), that = this, oriAnimate = this.get("animate"), animate = !this._animateOff ? oriAnimate : false, _set = {};
            if (values && values.length) {
                this.handles.each(function(i) {
                    valPercent = (that.values(i) - min) / (max - min) * 100;
                    _set[that.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                    $(this).stop(1, 1)[animate ? "animate" : "css"](_set, oriAnimate);
                    if (oRange === true) {
                        if (that.orientation === "horizontal") {
                            if (i === 0) {
                                that.range.stop(1, 1)[animate ? "animate" : "css"]({
                                    left: valPercent + "%"
                                }, oriAnimate);
                            }
                            if (i === 1) {
                                that.range[animate ? "animate" : "css"]({
                                    width: valPercent - lastValPercent + "%"
                                }, {
                                    queue: false,
                                    duration: oriAnimate
                                });
                            }
                        } else {
                            if (i === 0) {
                                that.range.stop(1, 1)[animate ? "animate" : "css"]({
                                    bottom: valPercent + "%"
                                }, oriAnimate);
                            }
                            if (i === 1) {
                                that.range[animate ? "animate" : "css"]({
                                    height: valPercent - lastValPercent + "%"
                                }, {
                                    queue: false,
                                    duration: oriAnimate
                                });
                            }
                        }
                    }
                    lastValPercent = valPercent;
                });
            } else {
                value = this.value();
                valueMin = min;
                valueMax = max;
                valPercent = valueMax !== valueMin ? (value - valueMin) / (valueMax - valueMin) * 100 : 0;
                _set[this.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, oriAnimate);
                if (oRange === "min" && this.orientation === "horizontal") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        width: valPercent + "%"
                    }, oriAnimate);
                }
                if (oRange === "max" && this.orientation === "horizontal") {
                    this.range[animate ? "animate" : "css"]({
                        width: 100 - valPercent + "%"
                    }, {
                        queue: false,
                        duration: oriAnimate
                    });
                }
                if (oRange === "min" && this.orientation === "vertical") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        height: valPercent + "%"
                    }, oriAnimate);
                }
                if (oRange === "max" && this.orientation === "vertical") {
                    this.range[animate ? "animate" : "css"]({
                        height: 100 - valPercent + "%"
                    }, {
                        queue: false,
                        duration: oriAnimate
                    });
                }
            }
        }
    });
    module.exports = Slider;
});