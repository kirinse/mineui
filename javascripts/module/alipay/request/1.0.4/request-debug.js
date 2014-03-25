define("alipay/request/1.0.4/request-debug", [ "jquery/jquery/1.7.2/jquery-debug" ], function(require) {
    var $ = require("jquery/jquery/1.7.2/jquery-debug");
    var ajax = $.ajax;
    $.ajax = function(url, options) {
        if (typeof url === "object") {
            options = url;
            url = undefined;
        }
        // 如果是 cdn 则不处理
        if (!/https?:\/\/a.alipayobjects.com/g.test(url || options.url || "")) {
            options = patch(options);
        }
        return ajax.call(this, url, options);
    };
    function patch(opt) {
        opt || (opt = {});
        opt.data || (opt.data = {});
        var ctoken = getCtokenFromCookie();
        if ($.isArray(opt.data)) {
            opt.data = $.param(opt.data, false);
        }
        if (typeof opt.data === "string") {
            if (opt.data.indexOf("_input_charset") === -1) {
                opt.data += "&_input_charset=utf-8";
            }
            if (ctoken && opt.data.indexOf("ctoken") === -1) {
                opt.data += "&ctoken=" + ctoken;
            }
        } else {
            opt.data["_input_charset"] = "utf-8";
            if (ctoken && !opt.data["ctoken"]) {
                opt.data["ctoken"] = ctoken;
            }
        }
        return opt;
    }
    function getCtokenFromCookie() {
        var cookieParts = document.cookie.split(/;\s/g);
        for (var i = 0, len = cookieParts.length; i < len; i++) {
            var cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
            if (cookieNameValue && cookieNameValue[1] === "ctoken") {
                return cookieParts[i].substring(cookieNameValue[1].length + 1);
            }
        }
    }
});
