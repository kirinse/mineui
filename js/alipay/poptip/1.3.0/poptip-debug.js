define("alipay/poptip/1.3.0/poptip-tpl-debug", [ "gallery/handlebars/1.0.0/handlebars-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.0/handlebars-debug");
    (function() {
        var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
        module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
            this.compilerInfo = [ 2, ">= 1.0.0-rc.3" ];
            helpers = helpers || Handlebars.helpers;
            data = data || {};
            var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression;
            buffer += '<div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '">\n    <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-shadow">\n    <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-container">\n        <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-arrow" data-role="arrow">\n            <em>◆</em>\n            <span>◆</span>\n        </div>\n        <a class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-close" href="javascript:;" data-action="close" data-role="close">×</a>\n        <img class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-icon" data-role="icon" alt="poptip-icon" />\n        <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-box" data-role="content">\n            <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-text" data-role="text"></div>\n            <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-link" data-role="link">\n                <a target="_blank" href="javascript:;" data-action="close"></a>\n            </div>\n        </div>\n    </div>\n    </div>\n</div>\n';
            return buffer;
        });
    })();
});

define("alipay/poptip/1.3.0/poptip-debug", [ "./poptip-tpl-debug", "arale/overlay/1.0.0/overlay-debug", "$-debug", "arale/position/1.0.0/position-debug", "arale/iframe-shim/1.0.0/iframe-shim-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug", "arale/widget/1.0.3/templatable-debug", "gallery/handlebars/1.0.0/handlebars-debug" ], function(require, exports, module) {
    var Overlay = require("arale/overlay/1.0.0/overlay-debug");
    var Templatable = require("arale/widget/1.0.3/templatable-debug");
    require("alipay/poptip/1.3.0/poptip-icon.css");
    var ICONS = {
        notice: "https://i.alipayobjects.com/e/201207/32UMBEuECH.png",
        trade: "https://i.alipayobjects.com/e/201207/3coEJviyzD.png",
        text: ""
    };
    // 气泡提示组件
    // 依赖样式 alice.components.ui-poptip
    var Poptip = Overlay.extend({
        Implements: Templatable,
        attrs: {
            template: require("./poptip-tpl-debug.js"),
            // 提示指向的目标元素
            target: null,
            // 提示内容
            content: "",
            // 提示类型 [notice|trade|text]
            type: "notice",
            // 到达链接
            link: null,
            // 到达链接文字
            linkText: "现在使用",
            // 提示框右上角是否有关闭按钮
            closable: true,
            // 箭头位置
            // 按钟表点位置，目前支持1、2、5、7、10、11点位置
            arrowPosition: 10,
            // 提示框相对目标的位置 [x, y]
            offset: null,
            // 颜色 [yellow|blue]
            theme: "yellow",
            // 默认样式前缀
            classPrefix: "ui-poptip"
        },
        events: {
            "click [data-action=close]": "hide"
        },
        parseElement: function() {
            if (!this.model) {
                this.model = {
                    classPrefix: this.get("classPrefix")
                };
            }
            Poptip.superclass.parseElement.call(this);
        },
        setup: function() {
            Poptip.superclass.setup.call(this);
            if (!this.get("link")) {
                this.$("[data-role=link]").remove();
            }
        },
        // 用于 set 属性后的界面更新
        _onRenderContent: function(val) {
            this.$("[data-role=text]").empty().append(val);
        },
        _onRenderLink: function(val) {
            this.$("[data-role=link] a").attr("href", val);
        },
        _onRenderLinkText: function(val) {
            this.$("[data-role=link] a").html(val);
        },
        _onRenderType: function(val) {
            var icon = this.$("[data-role=icon]");
            if (ICONS[val]) {
                icon.attr("src", ICONS[val]);
            } else {
                icon.remove();
                this.$("[data-role=content]").addClass(this.get("classPrefix") + "-box-text");
            }
        },
        _onRenderClosable: function(val) {
            this.$("[data-role=close]")[val ? "show" : "hide"]();
        },
        _onRenderArrowPosition: function(val, prev) {
            var arrow = this.$("[data-role=arrow]");
            arrow.removeClass(this.get("classPrefix") + "-arrow-" + prev).addClass(this.get("classPrefix") + "-arrow-" + val);
            var selfXY = [ 0, 0 ], baseXY = [];
            if (val === 10) {
                baseXY = [ "100%+8", "50%-20" ];
            } else if (val === 11) {
                baseXY = [ "50%-22", "100%+8" ];
            } else if (val === 1) {
                selfXY = [ "100%-22", 0 ];
                baseXY = [ "50%", "100%+8" ];
            } else if (val === 2) {
                selfXY = [ "100%", 0 ];
                baseXY = [ "-10", "4" ];
            } else if (val === 5) {
                selfXY = [ "100%-22", "100%+8" ];
                baseXY = [ "50%", 0 ];
            } else if (val === 7) {
                selfXY = [ "26", "100%+8" ];
                baseXY = [ "50%", 0 ];
            }
            this.set("align", {
                selfXY: selfXY,
                baseElement: this.get("target"),
                baseXY: baseXY
            });
        },
        _onRenderOffset: function(val) {
            this.set("align", {
                baseElement: this.get("target"),
                baseXY: val
            });
        },
        _onRenderTheme: function(val, prev) {
            this.element.removeClass(this.get("classPrefix") + "-" + prev);
            this.element.addClass(this.get("classPrefix") + "-" + val);
        }
    });
    module.exports = Poptip;
});
define('alipay/poptip/1.3.0/poptip-icon.css', [], function() {
  function importStyle(cssText) {
    var element = document.createElement('style')
    document.getElementsByTagName('head')[0].appendChild(element)

    if (element.styleSheet) {
      element.styleSheet.cssText = cssText
    } else {
      element.appendChild(document.createTextNode(cssText))
    }
  }
  importStyle('@charset "utf-8";.ui-poptip{color:#DB7C22;z-index:101;font-size:12px;line-height:1.5;zoom:1}.ui-poptip-shadow{background-color:rgba(229,169,107,.15);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#26e5a96b, endColorstr=#26e5a96b);border-radius:2px;padding:2px;zoom:1;_display:inline}.ui-poptip-container{position:relative;background-color:#FFFCEF;border:1px solid #ffbb76;border-radius:2px;padding:5px 22px 5px 10px;zoom:1;_display:inline}.ui-poptip:after,.ui-poptip-shadow:after,.ui-poptip-container:after{visibility:hidden;display:block;font-size:0;content:" ";clear:both;height:0}a.ui-poptip-close{position:absolute;right:3px;top:3px;border:1px solid #ffc891;text-decoration:none;border-radius:3px;width:12px;height:12px;font-family:tahoma;color:#dd7e00;line-height:10px;*line-height:12px;text-align:center;font-size:14px;background:#ffd7af;background:-webkit-gradient(linear,left top,left bottom,from( #FFF0E1),to( #FFE7CD));background:-moz-linear-gradient(top, #FFF0E1, #FFE7CD);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#FFF0E1", endColorstr="#FFE7CD");background:-o-linear-gradient(top, #FFF0E1, #FFE7CD);background:linear-gradient(top, #FFF0E1, #FFE7CD);overflow:hidden}a.ui-poptip-close:hover{border:1px solid #ffb24c;text-decoration:none;color:#dd7e00;background:#ffd7af;background:-webkit-gradient(linear,left top,left bottom,from( #FFE5CA),to( #FFCC98));background:-moz-linear-gradient(top, #FFE5CA, #FFCC98);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#FFE5CA", endColorstr="#FFCC98");background:-o-linear-gradient(top, #FFE5CA, #FFCC98);background:linear-gradient(top, #FFE5CA, #FFCC98)}.ui-poptip-arrow,.ui-poptip-arrow em,.ui-poptip-arrow span{position:absolute;font-size:14px;font-family:SimSun,Hiragino Sans GB;font-style:normal;line-height:21px;z-index:10;*zoom:1}.ui-poptip-arrow em{color:#ffbb76}.ui-poptip-arrow span{color:#FFFCEF;top:0;left:0}.ui-poptip-arrow-10{top:6px;left:-6px}.ui-poptip-arrow-10 em{top:0;left:-1px}.ui-poptip-arrow-2{top:6px;right:8px;*right:7px;right:7px\\0}.ui-poptip-arrow-2 em{top:0;left:1px}.ui-poptip-arrow-11{left:14px;top:-10px;top:-9px\\0}.ui-poptip-arrow-11 em{top:-1px;left:0}.ui-poptip-arrow-1{right:28px;top:-10px;top:-9px\\0}.ui-poptip-arrow-1 em{top:-1px;left:0}.ui-poptip-arrow-7{left:14px;bottom:10px}.ui-poptip-arrow-7 em{top:1px;left:0}.ui-poptip-arrow-5{right:28px;bottom:10px}.ui-poptip-arrow-5 em{top:1px;left:0}:root .ui-poptip-shadow{FILTER:none\9}.ui-poptip-blue{color:#4d4d4d}.ui-poptip-blue .ui-poptip-shadow{background-color:rgba(0,0,0,.05);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000)}.ui-poptip-blue .ui-poptip-container{background-color:#F8FCFF;border:1px solid #B9C8D3}.ui-poptip-blue .ui-poptip-arrow em{color:#B9C8D3}.ui-poptip-blue .ui-poptip-arrow span{color:#F8FCFF}.ui-poptip-white{color:#333}.ui-poptip-white .ui-poptip-shadow{background-color:rgba(0,0,0,.05);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000)}.ui-poptip-white .ui-poptip-container{background-color:#fff;border:1px solid #b1b1b1}.ui-poptip-white .ui-poptip-arrow em{color:#b1b1b1}.ui-poptip-white .ui-poptip-arrow span{color:#fff}.ui-poptip-icon{position:absolute;top:5px;left:10px;height:42px}.ui-poptip-box{margin-left:61px;min-height:40px;_height:40px;_display:inline;_zoom:1}.ui-poptip-box-text{margin-left:0;min-height:auto;_height:auto}.ui-poptip-text,.ui-poptip-link{line-height:1.8}');
});
