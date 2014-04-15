/**
 * @overview
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/05/13
 */
define("alipay/sensinfo/1.2.0/sensinfo-debug", [ "./idcard-debug", "./bankcard-debug", "./mobilephone-debug" ], function(require, exports) {
    var idcard = require("./idcard-debug");
    var bankcard = require("./bankcard-debug");
    var mobile = require("./mobilephone-debug");
    var re_privacy = {
        "6...4": /^(.{6}).*(.{4})$/,
        "3...4": /^(.{3}).*(.{4})$/
    };
    /**
   * 对银行卡号码进行隐私包含。
   * @param {String} card, 需要进行隐私保密的银行卡号码。
   * @param {String} pattern, 隐私保护的格式。
   * @return {String} 隐私保密处理后的银行卡号码。
   */
    function privacy(card, pattern) {
        return String(card).replace(re_privacy[pattern], "$1...$2");
    }
    exports.scan = function(html, options) {
        var re_cards = /([0-9]\.)?\b(\d{11,19}X?)\b/g;
        var re_blank = /\s{2,}|\r|\n/g;
        var card, result, context, start, length;
        var isFloat;
        // 浮点数标志。
        var cardType;
        // 卡号类型。
        var privacy_card;
        // 隐私保护处理后的卡号。
        while (result = re_cards.exec(html)) {
            isFloat = "undefined" !== typeof result[1];
            if (isFloat) {
                continue;
            }
            card = result[2];
            start = Math.max(result.index - 30, 0);
            length = card.length + 60;
            context = html.substr(start, length);
            context = context.replace(re_blank, "");
            if (mobile.verify(card)) {
                cardType = "mobile";
                privacy_card = privacy(card, "3...4");
            } else if (idcard.verify(card)) {
                cardType = "idcard";
                privacy_card = privacy(card, "6...4");
            } else if (bankcard.verify(card)) {
                cardType = "bankcard";
                privacy_card = privacy(card, "6...4");
            } else {
                continue;
            }
            context = context.replace(card, privacy_card);
            if (options && options.hasOwnProperty("*") && "function" === typeof options["*"]) {
                options["*"].call(this, cardType, privacy_card, context);
            }
        }
    };
});

/**
 * 身份证号码校验模块
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/05/02
 */
define("alipay/sensinfo/1.2.0/idcard-debug", [], function(require, exports) {
    var DATES = [ 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    function isLeap(year) {
        return year % 4 === 0 && year % 400 !== 0 || year % 400 === 0;
    }
    function verifyDate(year, month, date) {
        if (month < 1 || month > 12) {
            return false;
        }
        var days = DATES[month];
        if (month === 2 && isLeap(year)) {
            days = 29;
        }
        return date > 0 && date <= days;
    }
    /**
   * 18位身份证号码组成：
   * `ddddddyyyymmddxxsp` 共18位，其中：
   * 其他部分都和15位的相同。年份代码由原来的2位升级到4位。最后一位为校验位。
   * 校验规则是：
   * （1）十七位数字本体码加权求和公式
   * S = Sum(Ai * Wi), i = 0, ... , 16 ，先对前17位数字的权求和
   * Ai:表示第i位置上的身份证号码数字值
   * Wi:表示第i位置上的加权因子
   * Wi: 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2
   * （2）计算模
   * Y = mod(S, 11)
   * （3）通过模得到对应的校验码
   * Y:      0 1 2 3 4 5 6 7 8 9 10
   * 校验码: 1 0 X 9 8 7 6 5 4 3 2
   *
   * 如果得到余数为 1 则最后的校验位 p 应该为对应的 0。
   * 如果校验位不是，则该身份证号码不正确。
   */
    var WI = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
    var VERIFY_CODE = "10X98765432";
    function verify18(id) {
        if (!/^[0-9]{17}[0-9xX]$/.test(id)) {
            return false;
        }
        //var region = id.substr(0,6);
        var year = parseInt(id.substr(6, 4), 10);
        var month = parseInt(id.substr(10, 2), 10);
        var date = parseInt(id.substr(12, 2), 10);
        //var rand = id.substr(14,2);
        //var sex = id.substr(16,1);
        var vcode = id.substr(17, 1);
        if (!verifyDate(year, month, date)) {
            return false;
        }
        var sum = 0;
        for (var i = 0; i < 17; i++) {
            sum += parseInt(id.charAt(i), 10) * WI[i];
        }
        var mod = sum % 11;
        return VERIFY_CODE.charAt(mod) === vcode;
    }
    // 身份证前 2位的省份区号。
    var re_region = /^(1[1-5]|2[1-3]|3[1-7]|4[1-6]|5[1-4]|6[1-5]|71|81)/;
    function verify(id) {
        if (!id) {
            return false;
        }
        id = String(id);
        return re_region.test(id) && 18 === id.length && verify18(id);
    }
    exports.verify = verify;
});

/**
 * @overview
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/05/02
 */
define("alipay/sensinfo/1.2.0/bankcard-debug", [], function(require, exports) {
    /**
   * Luhn 算法
   * @see http://en.wikipedia.org/wiki/Luhn_algorithm
   * @param {String} card, 被校验的号码。
   * @return {Boolean} `true` 如果通过校验，否则返回 `false`。
   */
    function luhn(card) {
        var sum = 0;
        for (var i = card.length - 1, c, even; i >= 0; i--) {
            c = parseInt(card.charAt(i), 10);
            even = i % 2 === card.length % 2;
            if (even) {
                c = c * 2;
                if (c > 9) {
                    c = c - 9;
                }
            }
            sum += c;
        }
        return sum % 10 === 0;
    }
    var re_card = /^[34569][0-9]{12,18}$/;
    /**
   * 校验银行卡号码是否合法。
   * @param {String} card, 校验的银行卡号码。
   * @return {Boolean} `true` 如果通过校验，否则返回 `false`。
   */
    exports.verify = function(card) {
        card = String(card);
        return re_card.test(card) && luhn(card);
    };
});

/**
 * @overview
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/05/02
 */
define("alipay/sensinfo/1.2.0/mobilephone-debug", [], function(require, exports) {
    // [电话号码规则](http://blog.csdn.net/sameplace/article/details/5054278)
    // @see [手机号码](http://baike.baidu.com/view/781667.htm)
    var re_mobile = /^(?:13[0-9]|14[57]|15[0-35-9]|18[0-9])\d{8}$/;
    exports.verify = function(phone) {
        return re_mobile.test(phone);
    };
});
