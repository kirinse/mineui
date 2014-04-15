define("alipay/date-slider/1.0.2/date-slider-debug", [ "$-debug", "gallery/moment/1.6.2/moment-debug", "alipay/slider/1.1.1/slider-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug", "arale/position/1.0.0/position-debug", "./date-slider-debug.css", "./date-slider-debug.tpl" ], function(require, exports, module) {
    var $ = require("$-debug"), moment = require("gallery/moment/1.6.2/moment-debug"), Slider = require("alipay/slider/1.1.1/slider-debug"), Position = require("arale/position/1.0.0/position-debug"), Widget = require("arale/widget/1.0.3/widget-debug");
    var maxValue = 720;
    require("./date-slider-debug.css");
    var DateSlider = Widget.extend({
        maxValue: maxValue,
        attrs: {
            template: require("./date-slider-debug.tpl"),
            endDate: {
                value: moment().sod().format("YYYY-MM-DD"),
                getter: function(val) {
                    if (val.length && val.indexOf(".") !== -1) {
                        return moment(val, "YYYY.MM.DD").add("days", 1);
                    } else {
                        return moment(val).add("days", 1);
                    }
                }
            },
            value: [ 0, 0 ]
        },
        render: function() {
            DateSlider.superclass.render.call(this);
            this._addHandleSeed();
            // 添加用户埋点信息
            this._showHandleDates();
            return this;
        },
        setup: function() {
            var that = this;
            this._slider = new Slider({
                element: this.element.find(".ui-slider-line"),
                range: true,
                animate: false,
                min: 0,
                max: this.maxValue - 2,
                step: .001,
                allowCross: true,
                values: [ 0, this.maxValue ]
            });
            this._slider.on("start", function(e, ui) {
                $("#J-slider-handle-date-" + $(ui.handle).index(".ui-slider-handle")).css("z-index", 10);
            }).on("stop", function(e, ui) {
                $("#J-slider-handle-date-" + $(ui.handle).index(".ui-slider-handle")).css("z-index", 1);
            }).on("slide", function(e, ui) {
                that._showHandleDate(ui.value, $(ui.handle).index(".ui-slider-handle"));
            }).on("change", function(e, ui) {
                that._showHandleDate(ui.value, $(ui.handle).index(".ui-slider-handle"));
                that.trigger("select", that._selectedDates);
            });
        },
        _setDateScale: function(startDate) {
            var month, html;
            // 添加时间刻度条
            this.element.find(".ui-date-slider-scale").each(function(i, item) {
                html = "";
                item = $(item);
                month = startDate.month() + i;
                month = month % 12 + 1;
                html += '<span class="ui-date-slider-month">' + month + "</span>";
                html += '<span class="ui-date-slider-line"></span>';
                if (month === 1) {
                    html += '<span class="ui-date-slider-year">' + (startDate.year() + (i === 0 ? 0 : 1)) + "</span>";
                    html = html.replace("slider-line", "slider-line ui-date-slider-line-long");
                }
                item.append(html);
            });
            // 根据日子调节时间刻度的位置
            var shiftPos = (startDate.date() - 1) / startDate.daysInMonth() * 50;
            this.element.find(".ui-date-slider-scales").css("margin-left", -shiftPos);
            // 将第一个刻度隐藏
            if (shiftPos > 0) {
                this.element.find(".ui-date-slider-scale").eq(0).css("visibility", "hidden");
            }
        },
        _showHandleDates: function() {
            var values = this._slider.get("values");
            for (var i = 0; i < values.length; i++) {
                this._showHandleDate(values[i], i);
            }
        },
        _showHandleDate: function(value, i) {
            if (i !== 0 && i !== 1) {
                return;
            }
            var date, handleDate, handle, that = this;
            this._selectedDates = this._selectedDates || [];
            this._selectedDates[i] = changeValueToDate(value, this.get("endDate").subtract("years", 1));
            date = this._selectedDates[i].format("MM.DD");
            handleDate = this.element.find("#J-slider-handle-date-" + i);
            if (!handleDate[0]) {
                handleDate = $('<span class="ui-slider-handle-date" id="J-slider-handle-date-' + i + '"></span>');
                this.element.append(handleDate);
            }
            handleDate.html(date);
            handle = this.element.find(".ui-slider-handle").eq(i);
            var temp = parseInt(35 - this._slider.values()[1] + this._slider.values()[0], 10) / 2;
            if (temp <= 0) {
                temp = 0;
            }
            positionDate(i, temp);
            function positionDate(index, temp) {
                // 给当前的滑块标签定位
                Position.pin({
                    element: handleDate,
                    x: "50%",
                    y: "50%"
                }, {
                    element: handle,
                    x: "50%" + (index == 0 ? "-" : "+") + temp,
                    y: -10
                });
                // 修正另一个标签的位置以避免遮挡
                var another = that.element.find("#J-slider-handle-date-" + (index == 0 ? "1" : "0"));
                another[0] && Position.pin({
                    element: another,
                    x: "50%",
                    y: "50%"
                }, {
                    element: handle[index == 0 ? "next" : "prev"](),
                    x: "50%" + (index == 0 ? "+" : "-") + temp,
                    y: -10
                });
            }
        },
        _addHandleSeed: function() {
            this._slider.handles.eq(0).attr("seed", "f-consume-standard-youbiao1");
            this._slider.handles.eq(1).attr("seed", "f-consume-standard-youbiao2");
        },
        // Render
        // ---
        _onRenderEndDate: function(val) {
            this._setDateScale(val.subtract("years", 1));
        },
        _onRenderValue: function(val) {
            for (var i = 0; i < val.length; i++) {
                if (!val[i]) continue;
                if (val[i].indexOf(".") !== -1) {
                    val[i] = moment(val[i], "YYYY.MM.DD");
                } else {
                    val[i] = moment(val[i]);
                }
                val[i] = val[i].sod();
                this._slider.values(i, changeDateToValue(val[i], this.get("endDate").subtract("years", 1)));
            }
        }
    });
    // Helper
    // ---
    // 转换 value 到 日期
    function changeValueToDate(value, startDate) {
        var startValue = startDate.unix();
        var aYearAfter = startDate.clone().add("years", 1).unix();
        var days = (aYearAfter - startValue) * value / 720;
        return startDate.add("days", Math.round(days / 86400));
    }
    // 转换 日期 到 value
    function changeDateToValue(date, startDate) {
        var startValue = startDate.unix();
        var aYearAfter = startDate.clone().add("years", 1).unix();
        var value = date.unix();
        return (value - startValue) * 720 / (aYearAfter - startValue);
    }
    // 做接口测试，所以暴露出来
    DateSlider.changeValueToDate = changeValueToDate;
    DateSlider.changeDateToValue = changeDateToValue;
    module.exports = DateSlider;
});

define("alipay/date-slider/1.0.2/date-slider-debug.css", [], function() {
    seajs.importStyle(".ui-date-slider,.ui-date-slider *{margin:0;padding:0;-webkit-text-size-adjust:none}.ui-date-slider{width:650px;position:relative;zoom:1}.ui-slider{height:3px;background:#eee;width:600px;border-top:1px solid #BBB;border-left:1px solid #BBB;border-bottom:1px solid #fff;border-radius:2px;position:absolute;z-index:1;top:35px;left:25px}.ui-slider:after{clear:both;content:\" \";display:block;font-size:0;height:0;visibility:hidden}.ui-slider-range{background-color:#8BC7F0;border:1px solid #7DA9DC;height:3px;position:absolute;z-index:1;top:-1px;zoom:1;overflow:hidden}.ui-slider-range:after{content:'';position:absolute;height:1px;background-color:#B7E1FF;top:0;left:0;width:100%}.ui-slider-handle{position:absolute;height:15px;width:10px;background:url(https://i.alipayobjects.com/e/201211/1dh1jloUCL.png) no-repeat;cursor:pointer;z-index:2;top:-6px;margin-left:-5px}.ui-slider-handle:hover,.ui-state-focus{background-position:-10px 0}.ui-slider-handle-date{position:absolute;color:#fff;background-color:#96D1F9;font-size:10px;line-height:1;padding:2px 3px;border-radius:2px;border:1px solid #62A3E8}.ui-slider-handle-date-active{border:1px solid #62A3E8}.ui-date-slider-scales{overflow:hidden;position:relative;zoom:1}.ui-date-slider-scale{width:50px;float:left;height:60px;text-align:center;position:relative}.ui-date-slider-line{height:4px;border-left:1px solid #aaa;width:0;position:absolute;top:32px;left:25px;overflow:hidden}.ui-date-slider-line-long{height:14px;top:22px}.ui-date-slider-month{color:#aaa;font-size:10px;position:absolute;bottom:3px;left:15px;width:20px}.ui-date-slider-year{color:#aaa;font-size:10px;position:absolute;top:6px;left:15px;width:20px}");
});

define("alipay/date-slider/1.0.2/date-slider-debug.tpl", [], '<div class="ui-date-slider">\n    <div class="ui-slider-line" seed="f-consume-standard-shijianzhou"></div>\n    <div class="ui-date-slider-scales">\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n        <div class="ui-date-slider-scale"></div>\n    </div>\n</div>\n');
