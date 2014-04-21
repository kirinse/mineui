define("alipay/common-v1/0.9.5/robot-debug", ["gallery/jquery/1.7.2/jquery-debug", "arale/widget/0.9.16/templatable-debug", "gallery/handlebars/1.0.0/handlebars-debug", "arale/widget/0.9.16/ast-printer-debug", "arale/popup/0.9.6/dropdown-debug", "arale/popup/0.9.6/popup-debug", "arale/overlay/0.9.8/overlay-debug", "arale/position/0.9.2/position-debug", "arale/iframe-shim/0.9.3/iframe-shim-debug", "arale/widget/0.9.16/widget-debug", "arale/base/0.9.16/base-debug", "arale/class/0.9.2/class-debug", "arale/events/0.9.1/events-debug", "arale/base/0.9.16/aspect-debug", "arale/base/0.9.16/attribute-debug", "arale/widget/0.9.16/daparser-debug", "arale/widget/0.9.16/auto-render-debug"], function(require, exports, module) {

    var $ = require("gallery/jquery/1.7.2/jquery-debug");
    var Templatable = require("arale/widget/0.9.16/templatable-debug");
    var Dropdown = require("arale/popup/0.9.6/dropdown-debug");
    var Handlebars = require("gallery/handlebars/1.0.0/handlebars-debug");

    var robotReady = false;

    var global = window.GLOBAL || {};
    var URLCONFIG = {
        roboturl: global.system.personalportal + '/portal/robot/getRobotData.json?_callback=?'
    };


    var Robot = Dropdown.extend({
        Implements: Templatable,

        templateHelpers: {
            // 安全度的值和进度条
            securityContent: function() {
                if (this.securityLevel === 'LOW') {
                    return new Handlebars.SafeString(
                        '<span class="global-robot-red">低</span>'
                    );
                } else if (this.securityLevel === 'MEDIUM') {
                    return new Handlebars.SafeString(
                        '<span class="global-robot-red">中</span>'
                    );
                } else if (this.securityLevel === 'HIGH') {
                    return '高';
                } else if (this.securityLevel === 'MAX') {
                    return '极高';
                }
            },
            securityPercent: function() {
                var percent = 0;

                // 已绑定手机加 40%
                if (this.isBindedMobile) {
                     percent += 40;
                }

                // 安全等级为 HIGH, MAX 加 60%
                if (this.securityLevel === 'HIGH' || this.securityLevel === 'MAX') {
                     percent += 60;
                }

                return (percent || '2') + '%';
            },
            // 便捷度的值和进度条
            convenientContent: function() {
                if (this.fpCount > 0) {
                    return '快';
                } else {
                    return new Handlebars.SafeString(
                        '<span class="global-robot-red">慢</span>'
                    );
                }
            },
            convenientPercent: function() {
                if (this.fpCount > 0) {
                    return '100%';
                } else {
                    return '2%';
                }
            },
            // 完整度的值和进度条
            completeContent: function() {
                var percent = completePercent(this);
                if (percent <= 40) {
                    return new Handlebars.SafeString(
                        '<span class="global-robot-red">' + percent + '%</span>'
                    );
                } else {
                    return (percent || '2') + '%';
                }
            },
            completePercent: function() {
                return completePercent(this) + '%';
            },
            robotPart: function(part) {
                var p = part.split('-')[0];
                var className = 'global-robot-' + part;
                switch (p) {
                    case 'head':
                        if (this.isComplete) {
                            className += ' global-robot-' + part + '-active';
                        }
                        break;
                    case 'ear':
                        if (this.isBindedMobile) {
                            className += ' global-robot-' + part + '-active';
                        }
                        break;
                    case 'arm':
                    case 'leg':
                        if (this.fpCount > 0) {
                            className += ' global-robot-' + part + '-active';
                        }
                        break;
                    case 'body':
                        if (this.securityLevel === 'HIGH' || this.securityLevel === 'MAX') {
                            className += ' global-robot-' + part + '-active';
                        }
                        break;
                    case 'heart':
                        if (this.isCertified) {
                            className += ' global-robot-' + part + '-active';
                        }
                        break;
                }
                return className;
            }
        },

        model: {
            // 登录时且请求还未返回显示 loading 状态
            loading: true
        },

        initAttrs: function(config) {
            Robot.superclass.initAttrs.call(this, config);

            // 未登录的情况下不用再请求
            if (!this.model.isLogin) {
                this.model.loading = false;
                robotReady = true;
            }
        },

        show: function() {
            var that = this;
            if (!robotReady) {
                robotReady = true;
                $.ajax(URLCONFIG.roboturl, {
                    dataType: 'jsonp'
                }).success(function(data) {
                    if (data.stat != 'ok') {
                        Robot.superclass.show.call(that);
                        robotReady = false;
                        return;
                    }

                    robotReady = true;

                    // this.model 的值
                    // ---------------
                    // isLogin 是否登录
                    // isComplete 补全信息(支付密码): true
                    // isBindedMobile 手机绑定: false
                    // isCertified 实名认证: true
                    // securityLevel 安全等级: LOW,MEDIUM,HIGH,MAX
                    // fpCount 快捷卡数量
                    // questions 安保问题: 0,1,3
                    // activedEmail 激活的邮箱：T,F
                    $.extend(that.model, {isSuccess: true}, data);

                    that.renderPartial('.global-robot');
                }).error(function() {
                    robotReady = false;
                });

            }
            Robot.superclass.show.call(that);
            return this;
        }

    });

    module.exports = Robot;

    // Helper
    // ------

    // 完整度的计算
    function completePercent(data) {
        var percent = 0;

        // 已补全信息加 20%
        if (data.isComplete) {
            percent += 20;
        }

        // 已绑定手机加 20%
        if (data.isBindedMobile) {
            percent += 20;
        }

        // 已实名认证加 20%
        if (data.isCertified) {
            percent += 20;
        }

        // 有3个安保问题加 20%
        if (data.questions == 3) {
            percent += 20;
        }

        // 已激活邮箱加 20%
        if (data.activedEmail == 'T') {
            percent += 20;
        }

        return percent;
    }
});
