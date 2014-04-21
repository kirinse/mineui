define("alipay/common-v1/0.9.5/birthday-debug", ["gallery/jquery/1.7.2/jquery-debug", "arale/widget/0.9.16/widget-debug", "arale/base/0.9.16/base-debug", "arale/class/0.9.2/class-debug", "arale/events/0.9.1/events-debug", "arale/base/0.9.16/aspect-debug", "arale/base/0.9.16/attribute-debug", "arale/widget/0.9.16/daparser-debug", "arale/widget/0.9.16/auto-render-debug", "gallery/swfobject/2.2.0/swfobject-debug", "gallery/cookie/1.0.2/cookie-debug"], function(require, exports, module) {

    var $ = require("gallery/jquery/1.7.2/jquery-debug");
    var Widget = require("arale/widget/0.9.16/widget-debug");
    var swfobject = require("gallery/swfobject/2.2.0/swfobject-debug");
    var Cookie = require("gallery/cookie/1.0.2/cookie-debug");

    var global = window.GLOBAL || {};

    var Birthday = Widget.extend({

        param: {
            param: getZodiacMonth(),
            // flash 飞出的方向，向左1/向右0
            mode: 1
        },

        Statics: {
            isBirthday: isBirthday()
        },

        events: {
            'hover .global-birth-icon': 'toggleTip',
            'click .global-birth-icon': function(e) {
                e.preventDefault();
                this.showFlash(1);
            }
        },

        setup: function() {
            this.firstShow();
        },

        toggleTip: function(e) {
            if (e.type == 'mouseenter') {
                this.$('.global-birth-tip').show();
            } else {
                this.$('.global-birth-tip').hide();
            }
        },

        showFlash: function(mode) {
            var birthSwf = this.$('#global-birthSwf');
            if (birthSwf.hasClass('global-swfObj')) {
                return;
            }
            this.param.mode = mode;
            birthSwf.addClass('global-swfObj');
            var params = {
                wmode: 'transparent',
                allowFullscreen: 'true',
                allowScriptAccess: 'always'
            };
            swfobject.embedSWF(
                global.BIRTHURL + '?t=' + new Date().getTime(),
                'global-swfObj',
                '350',
                '300',
                '9.0.0',
                'expressInstall.swf',
                {},
                params
            );
        },

        hideFlash: function() {
            var birthSwf = this.$('#global-birthSwf');
            if (birthSwf.hasClass('global-swfObj')) {
                birthSwf.removeClass('global-swfObj')
                    .html('<div id="global-swfObj"></div>');
            }
        },

        firstShow: function() {
            var key = Cookie.get('global-birthshow');
            if (!key) {
                this.$('.global-birth-tip').show();
                Cookie.set('global-birthshow', 'true', {expires: 1, path: '/'});
            }
        }

    });

    module.exports = Birthday;

    // Helper

    // 获取月份，用于显示星座，传给flash的参数为星座第一天所在的月份
    function getZodiacMonth() {
        var today = global.today;
        var zodiac = {
            '01': '20',
            '02': '19',
            '03': '21',
            '04': '21',
            '05': '21',
            '06': '22',
            '07': '23',
            '08': '23',
            '09': '23',
            '10': '23',
            '11': '22',
            '12': '22'
        };

        var month = today.slice(-4, -2),
            day = today.slice(-2);

        if (Number(day) < Number(zodiac[month])) {
            month = Number(month) - 1;
            if (month == 0) {
                month = 12;
            }
        }

        return /^\d{2}$/.test(month) ? month + '' : '0' + month;
    }

    // 检测当天是否是用户生日
    function isBirthday() {
        return global.birthday && global.today.slice(4) === global.birthday;
    }
});
