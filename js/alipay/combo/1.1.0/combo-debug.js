define("alipay/combo/1.1.0/combo-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    // 全局唯一使用的样式标签节点
    var StyleTag;
    //图片格式
    var picFormatList = {
        png8: "combo.png",
        png32: "combo32.png",
        jpg: "combo.jpg"
    };
    //防止图片重复请求
    if (document && document.execCommand) {
        try {
            document.execCommand("BackgroundImageCache", false, true);
        } catch (e) {}
    }
    // {Array} eles 要设置icon的dom数组，数组可由Element或Node组成.
    // {Number} size 图片的高度(现在只支持纵向合并所以只传高度).
    // {String} root
    // {String} format 生成图片的尺寸，支持png8,png32,jpg.
    var Combo = function(eles, size, root, format, timestamp) {
        this.size = size;
        this.root = root;
        this.iconPool = [];
        this.timestamp = timestamp ? "&timestamp=" + timestamp : "";
        if (format && picFormatList[format]) {
            this.comboPath = picFormatList[format];
        } else {
            this.comboPath = picFormatList["png8"];
        }
        this.append(eles);
    };
    Combo.prototype = {
        // 页面初始化后如果有新增元素需要图片合并可调用此方法
        append: function(eles) {
            var iconTmp = [], that = this;
            $(eles).each(function(index, ele) {
                var ele = $(ele);
                var attr = ele.attr("data-id");
                if (attr) {
                    var className = "icon-" + that.root.replace("/", "") + "-" + attr;
                    ele.addClass(className);
                    //去重
                    if ($.inArray(attr, that.iconPool) == -1) {
                        that.iconPool.push(attr);
                        iconTmp.push(attr);
                    }
                }
            });
            //只生成新增的样式
            var style = this._generateCSS(iconTmp);
            generateTag(style);
        },
        // 根据命名列表生成对应的样式
        _generateCSS: function(iconTmp) {
            var i, l, cssPool = [], tmp = [];
            // 重新排序
            iconTmp.sort();
            // 图片服务化的访问链接
            var url = [ getBaseUrl(), "/", this.comboPath, "?d=" + this.root, "&t=", iconTmp.join(","), this.timestamp ].join("");
            // 设置每个icon的background-position样式
            for (i = 0, l = iconTmp.length; i < l; i++) {
                var className = "icon-" + this.root.replace("/", "") + "-" + iconTmp[i], background = [ "background-position: 0px -", this.size * i, "px; " ].join(""), style = [ ".", className, " {", background, "} " ].join("");
                cssPool.push(style);
                tmp.push(className);
            }
            // 设置所有icon的通用样式
            var text = "text-indent: -9999px; ", logo = tmp.join(", ."), background = [ 'background-image: url("', url, '");' ].join(""), style = [ ".", logo, " {", text, background, "} " ].join("");
            cssPool.push(style);
            //生成style标签
            return cssPool.join("\n");
        }
    };
    module.exports = Combo;
    // Helpers
    // ------
    // apimg 的基础 URL
    function getBaseUrl() {
        var apimgBase;
        try {
            if (window.araleConfig && araleConfig.apimg_combo_path) {
                apimgBase = araleConfig.apimg_combo_path;
            } else if (window.GLOBAL && GLOBAL.system.apimg) {
                apimgBase = GLOBAL.system.apimg;
            } else if (window.AP && AP.PageVar && AP.PageVar.apimg_domain) {
                apimgBase = AP.PageVar.apimg_domain;
            } else {
                apimgBase = "https://i.alipayobjects.com";
            }
        } catch (err) {
            apimgBase = "https://i.alipayobjects.com";
        }
        return apimgBase;
    }
    // 生成 style 标签并插入到页面头部
    function generateTag(cssRules) {
        // 如果已经有了这个样式节点，则复用它
        if (StyleTag) {
            // There is a bug using innerHTML in IE
            // http://stackoverflow.com/questions/6631871/modifying-the-innerhtml-of-a-style-element-in-ie8
            if (StyleTag.styleSheet) {
                StyleTag.styleSheet.cssText += cssRules;
            } else {
                StyleTag.innerHTML += cssRules;
            }
            return;
        }
        var tag = document.createElement("style"), rules = document.createTextNode(cssRules);
        tag.type = "text/css";
        tag.className = "iconStyle";
        if (tag.styleSheet) {
            tag.styleSheet.cssText = rules.nodeValue;
        } else {
            tag.appendChild(rules);
        }
        document.getElementsByTagName("head")[0].appendChild(tag);
        StyleTag = tag;
    }
});