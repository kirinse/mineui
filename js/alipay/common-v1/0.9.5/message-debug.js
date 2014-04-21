define("alipay/common-v1/0.9.5/message-debug", ["gallery/jquery/1.7.2/jquery-debug", "arale/widget/0.9.16/templatable-debug", "gallery/handlebars/1.0.0/handlebars-debug", "arale/widget/0.9.16/ast-printer-debug", "arale/popup/0.9.6/dropdown-debug", "arale/popup/0.9.6/popup-debug", "arale/overlay/0.9.8/overlay-debug", "arale/position/0.9.2/position-debug", "arale/iframe-shim/0.9.3/iframe-shim-debug", "arale/widget/0.9.16/widget-debug", "arale/base/0.9.16/base-debug", "arale/class/0.9.2/class-debug", "arale/events/0.9.1/events-debug", "arale/base/0.9.16/aspect-debug", "arale/base/0.9.16/attribute-debug", "arale/widget/0.9.16/daparser-debug", "arale/widget/0.9.16/auto-render-debug", "alipay/common-v1/0.9.5/count-debug"], function(require, exports, module) {

    var $ = require("gallery/jquery/1.7.2/jquery-debug");
    var Templatable = require("arale/widget/0.9.16/templatable-debug");
    var Dropdown = require("arale/popup/0.9.6/dropdown-debug");
    var Handlebars = require("gallery/handlebars/1.0.0/handlebars-debug");
    var Position = require("arale/position/0.9.2/position-debug");
    var Count = require("alipay/common-v1/0.9.5/count-debug");

    var global = window.GLOBAL || {}, messageReady = false;

    var URLCONFIG = {
        redirecturl: global.system.personal + '/user/msgcenter/modifyStatusAndRedirect.htm',
        getmessage: global.system.personal + '/user/msgcenter/getMsgInfosNew.json?_callback=?',
        popmessage: global.system.personal + '/user/msgcenter/popMsgInfos.json?_callback=?',
        readmessage: global.system.personal + '/user/msgcenter/readMsg.json?_callback=?&historySource=I&msgIds='
    };

    var Message = Dropdown.extend({

        Implements: Templatable,

        Statics: {
            getMessageCount: getMessageCount
        },

        events: {
            'click #global-msg-isee': 'markAllRead',
            'click #global-list-msg a.global-list-msg-content': function(e) {
                // 标记单条消息为已读
                setMsgRead.call(this, e.currentTarget);
            },
            'click #global-list-msg a.global-list-close': 'markRead',
            'click #global-msg-confirm-ok': 'confirmOk',
            'click #global-msg-confirm-cancel': 'confirmCancel',
            'mouseenter .global-list li': function(e) {
                $(e.currentTarget).addClass('global-list-hover');
            },
            'mouseleave .global-list li': function(e) {
                $(e.currentTarget).removeClass('global-list-hover');
            }
        },

        show: function() {
            var that = this;

            if (!messageReady) {
                $.ajax(URLCONFIG.popmessage, {
                    dataType: 'jsonp'
                }).success(function(data) {
                    if (data.stat !== 'ok') {
                        return;
                    }
                    Count.setCount(data.totalCount);
                    that.renderMsg(data);
                });
            }

            // 如果消息数为 0 则不显示浮层
            if (Count.getCount() > 0) {
                return Message.superclass.show.call(this);
            } else {
                return this;
            }
        },

        // 局部渲染消息列表，此方法只执行一次
        renderMsg: function(data) {
            if (!messageReady) {
                this.$('.global-toplink-msgCount')
                    .html(data.totalCount);

                this.$('#global-list-msg')
                    .html(renderMessage(data))
                    .removeClass('global-loading');

                messageReady = true;
            }
            return this;
        },

        // 以下为事件回调方法
        // ------------------

        // 标记所有为已读
        markAllRead: function(e) {
            e.preventDefault();
            Count.setCount(0);
            var msgIds = this.$('#global-list-msg li').map(function() {
                return $(this).attr('data-id');
            }).get().join(',');
            this.hide();
            this.$('#global-list-msg').html();
            $.ajax(URLCONFIG.readmessage + msgIds, {dataType: 'jsonp'});
        },

        // 标记单条消息为已读
        markRead: function(e) {
            var ele = e.currentTarget, parentNode = $(ele).parent();
            var msgConfirm = this.$('#global-msg-confirm');
            var msgId = parentNode.attr('data-id');

            // `this.currentConfirmMsg` 储存了需要二次确认的消息的 DOM，每次显示二次确认浮层
            // 才会储存，点击取消或 level 小于3的消息时会清空
            if (this.currentConfirmMsg) {
                $(this.currentConfirmMsg).parent().css('height', 'auto');
                this.currentConfirmMsg = null;
            }

            // level 为3会显示二次确认浮层
            if (parentNode.attr('data-level') == 3) {
                this.currentConfirmMsg = ele;
                parentNode.css('height', msgConfirm.height() - 16);
                msgConfirm.show();
                Position.pin(msgConfirm[0], parentNode[0]);
            } else {
                msgConfirm.hide();
                setMsgRead.call(this, ele);
                $.ajax(URLCONFIG.readmessage + msgId, {dataType: 'jsonp'});
            }
        },

        // 二次确认浮层，确定按钮
        confirmOk: function(e) {
            e.preventDefault();
            var msgId = $(this.currentConfirmMsg).parent().attr('data-id');
            this.$('#global-msg-confirm').hide();
            setMsgRead.call(this, this.currentConfirmMsg);
            $.ajax(URLCONFIG.readmessage + msgId, {dataType: 'jsonp'});
        },

        // 二次确认浮层，取消按钮
        confirmCancel: function(e) {
            e.preventDefault();
            $(this.currentConfirmMsg).parent().css('height', 'auto');
            this.currentConfirmMsg = null;
            this.$('#global-msg-confirm').hide();
        }
    });

    module.exports = Message;

    // Helper
    // ------

    // 获取消息数
    function getMessageCount(callback) {
        $.ajax(URLCONFIG.getmessage, {
            dataType: 'jsonp'
        }).success(function(data) {
            if (data.stat === 'ok') {
                var totalCount = parseInt(data.totalCount, 10);
                Count.setCount(totalCount);
                callback(data);
            } else {
                Count.hideCount();
            }
        });
    }

    function sortMessage(list) {
        return list.sort(function(a, b) {
            // 消息级别高的排前
            return b.level - a.level;
        });
    }

    // 渲染消息模版
    function renderMessage(model) {
        var i = 0, infoModel = {infos: sortMessage(model.infos)};
        var template = Handlebars.compile('{{#infos}}<li class="{{messageClass}} global-list-level{{level}}" data-id="{{id}}" data-level="{{level}}">{{{messageContent this}}}<a href="javascript:void(0);" class="global-list-close" seed="global-msg-close">X</a></li>{{/infos}}');

        // 只显示最近三条消息
        Handlebars.registerHelper('messageClass', function() {
            if (i++ >= 3) {
                return 'fn-hide';
            } else {
                return '';
            }
        });
        Handlebars.registerHelper('messageContent', function(context) {
            var url = context.url;
            var content = context.content.length > 46 ? context.content.replace(/^(.{43}).*$/, '$1...') : context.content;

            if (/^(http|https)/i.test(url)) {
                url = URLCONFIG.redirecturl + '?msgId=' + context.id + '&url=' + url;
                return '<a href="' + url + '" target="_blank" class="global-list-msg-content" seed="global-msg-item">' + content + '</a>';
            } else {
                return '<span class="global-list-msg-content">' + content + '</span>';
            }
        });
        return template(infoModel);
    }

    // 设置某条记录已读
    function setMsgRead(element) {
        var msgCount = this.$('.global-toplink-msgCount');
        var msgList = this.$('#global-list-msg');
        var count = msgList.children().length;

        msgCount.html(count - 1);
        Count.setCount(count - 1);

        if (count > 3) {
            msgList.children('.fn-hide:first').removeClass('fn-hide');
        }
        $(element).parent().hide(400, 'swing', function() {
            $(this).remove();
        });
    }

});
