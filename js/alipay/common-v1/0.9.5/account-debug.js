define("alipay/common-v1/0.9.5/account-debug", ["gallery/jquery/1.7.2/jquery-debug", "arale/popup/0.9.6/dropdown-debug", "arale/popup/0.9.6/popup-debug", "arale/overlay/0.9.8/overlay-debug", "arale/position/0.9.2/position-debug", "arale/iframe-shim/0.9.3/iframe-shim-debug", "arale/widget/0.9.16/widget-debug", "arale/base/0.9.16/base-debug", "arale/class/0.9.2/class-debug", "arale/events/0.9.1/events-debug", "arale/base/0.9.16/aspect-debug", "arale/base/0.9.16/attribute-debug", "arale/widget/0.9.16/daparser-debug", "arale/widget/0.9.16/auto-render-debug", "gallery/handlebars/1.0.0/handlebars-debug", "alipay/xbox/0.9.5/xbox-debug", "arale/overlay/0.9.8/mask-debug"], function(require, exports, module) {

    var $ = require("gallery/jquery/1.7.2/jquery-debug");
    var Dropdown = require("arale/popup/0.9.6/dropdown-debug");
    var Handlebars = require("gallery/handlebars/1.0.0/handlebars-debug");
    var Xbox = require("alipay/xbox/0.9.5/xbox-debug");

    var accountReady = false;

    var global = window.GLOBAL || {};
    var URLCONFIG = {
        loginurl: global.system.authcenter + '/login/xbox.htm?loginScene=x&change=true&logonId=',
        accounturl: global.system.personal + '/home/statusbar/getRelativeAccounts.json?_callback=?'
    };

    var Account = Dropdown.extend({

        events: {
            'click .global-xbox-item': 'changeLogin'
        },

        setup: function() {
            Account.superclass.setup.call(this);

            // 对过长的账号进行处理
            var email = this.$('#global-username');
            email.html(limitEmail(email.html()));
            limitName(this.get('trigger').find('#global-toplink-username'));
        },

        show: function() {
            var accountList = this.$('#global-users');

            // 浮层显示的时候才去请求关联账号，只请求一次
            if (accountList.attr('data-user') === 'true' && !accountReady) {
                accountReady = true;
                $.ajax(URLCONFIG.accounturl, {
                    dataType: 'jsonp'
                }).success(function(data) {
                    if (data.stat != 'ok') {
                        accountReady = false;
                        accountList.hide();
                        return;
                    }
                    accountReady = true;
                    renderAccount(data, accountList.find('#global-list-user'));
                }).error(function() {
                    accountReady = false;
                    accountList.hide();
                });
            }
            return Account.superclass.show.call(this);
        },

        changeLogin: function(e) {
            e.preventDefault();
            getXbox().set('content', e.currentTarget.href).show();
        }
    });

    module.exports = Account;

    // Helper
    // ------

    // 限制 email 的长度，整个字符最长为19，@ 字符左边最长11，右边7
    function limitEmail(text) {
        text = text.replace(/^\s*(.*?)\s*$/g, '$1');
        var defaults = {
                regxp: /(^.*)(.{3}$)/g,
                placeholder: '$1...',
                leftLimit: 11,
                rightLimit: 7,
                totalLimit: 19
            };

        var list = text.split('@');
        var left = list[0];
        var right = list[1];

        if ((list.length > 1) && (text.length > defaults.totalLimit)) {
            if (left.length > defaults.leftLimit) {
                left = left.slice(0, defaults.leftLimit)
                    .replace(defaults.regxp, defaults.placeholder);
            }
            if (right.length > defaults.rightLimit) {
                right = right.slice(0, defaults.rightLimit)
                    .replace(defaults.regxp, defaults.placeholder);
            }
            return [left, '@', right].join('').toLowerCase();
        } else {
            return text.toLowerCase();
        }
    }

    function limitName(ele) {
        if (ele && ele.outerWidth() > 147) {
            var realText = ele.html();
            var userText = limitEmail(realText);
            if (userText.length === realText.length) {
                userText = userText.slice(0, 10) + '...';
            }
            ele.html(userText);
        }
    }

    var xbox;
    function getXbox() {
        if (!xbox) {
            xbox = new Xbox({
                type: 'iframe',
                classPrefix: 'global-xbox',
                isOld: true,
                height: '300px'
            }).render(); // 待 overlay 改造后去掉 hide #106
        }
        return xbox;
    }

    function renderAccount(data, parentNode) {
        var i = 0;
        Handlebars.registerHelper('accountContent', function() {
            var name = limitEmail(this);
            var url = URLCONFIG.loginurl + this;
            // 最多显示10个账户
            if (i++ < 10) {
                return '<li><a href="' + url + '" class="global-xbox-item" target="_blank" title="' + this + '">' + name + '</a></li>';
            }
        });
        var template = Handlebars.compile('{{#accts}}{{{accountContent}}}{{/accts}}');
        parentNode.html(template(data)).removeClass('global-loading');
    }

});
