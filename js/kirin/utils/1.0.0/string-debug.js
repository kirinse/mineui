define("kirin/utils/1.0.0/string-debug", [ "./kstring-debug", "arale/class/1.2.0/class-debug" ], function(require, exports, module) {
    var KString = require("./kstring-debug");
    var StringFactory = function(strr) {
        return new KString(strr);
    };
    StringFactory.fn = KString.prototype;
    return StringFactory;
});

define("kirin/utils/1.0.0/kstring-debug", [ "arale/class/1.2.0/class-debug" ], function(require, exports, module) {
    var Class = require("arale/class/1.2.0/class-debug");
    // var $A = require("./array");
    var _encodeUriRegExp = /^[a-zA-Z0-9\-_.!~*'()]*$/;
    var _amperRe = /&/g;
    var _ltRe = /</g;
    var _gtRe = />/g;
    var _quotRe = /\"/g;
    var _allRe = /[&<>\"]/;
    var character = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;"
    };
    var entity = {
        quot: '"',
        lt: "<",
        gt: ">"
    };
    var entitiesToChars = {
        "&amp;": "&",
        "&nbsp;": " ",
        "&iexcl;": "¡",
        "&cent;": "¢",
        "&pound;": "£",
        "&curren;": "¤",
        "&yen;": "¥",
        "&brvbar;": "¦",
        "&sect;": "§",
        "&uml;": "¨",
        "&copy;": "©",
        "&ordf;": "ª",
        "&laquo;": "«",
        "&not;": "¬",
        "&reg;": "®",
        "&macr;": "¯",
        "&deg;": "°",
        "&plusmn;": "±",
        "&sup2;": "²",
        "&sup3;": "³",
        "&acute;": "´",
        "&micro;": "µ",
        "&para;": "¶",
        "&middot;": "·",
        "&cedil;": "¸",
        "&sup1;": "¹",
        "&ordm;": "º",
        "&raquo;": "»",
        "&frac14;": "¼",
        "&frac12;": "½",
        "&frac34;": "¾",
        "&iquest;": "¿",
        "&Agrave;": "À",
        "&Aacute;": "Á",
        "&Acirc;": "Â",
        "&Atilde;": "Ã",
        "&Auml;": "Ä",
        "&Aring;": "Å",
        "&AElig;": "Æ",
        "&Ccedil;": "Ç",
        "&Egrave;": "È",
        "&Eacute;": "É",
        "&Ecirc;": "Ê",
        "&Euml;": "Ë",
        "&Igrave;": "Ì",
        "&Iacute;": "Í",
        "&Icirc;": "Î",
        "&Iuml;": "Ï",
        "&ETH;": "Ð",
        "&Ntilde;": "Ñ",
        "&Ograve;": "Ò",
        "&Oacute;": "Ó",
        "&Ocirc;": "Ô",
        "&Otilde;": "Õ",
        "&Ouml;": "Ö",
        "&times;": "×",
        "&Oslash;": "Ø",
        "&Ugrave;": "Ù",
        "&Uacute;": "Ú",
        "&Ucirc;": "Û",
        "&Uuml;": "Ü",
        "&Yacute;": "Ý",
        "&THORN;": "Þ",
        "&szlig;": "ß",
        "&agrave;": "à",
        "&aacute;": "á",
        "&acirc;": "â",
        "&atilde;": "ã",
        "&auml;": "ä",
        "&aring;": "å",
        "&aelig;": "æ",
        "&ccedil;": "ç",
        "&egrave;": "è",
        "&eacute;": "é",
        "&ecirc;": "ê",
        "&euml;": "ë",
        "&igrave;": "ì",
        "&iacute;": "í",
        "&icirc;": "î",
        "&iuml;": "ï",
        "&eth;": "ð",
        "&ntilde;": "ñ",
        "&ograve;": "ò",
        "&oacute;": "ó",
        "&ocirc;": "ô",
        "&otilde;": "õ",
        "&ouml;": "ö",
        "&divide;": "÷",
        "&oslash;": "ø",
        "&ugrave;": "ù",
        "&uacute;": "ú",
        "&ucirc;": "û",
        "&uuml;": "ü",
        "&yacute;": "ý",
        "&thorn;": "þ",
        "&yuml;": "ÿ",
        "&quot;": '"',
        "&lt;": "<",
        "&gt;": ">",
        "&apos;": "'",
        "&OElig;": "Œ",
        "&oelig;": "œ",
        "&Scaron;": "Š",
        "&scaron;": "š",
        "&Yuml;": "Ÿ",
        "&circ;": "ˆ",
        "&tilde;": "˜",
        "&ensp;": " ",
        "&emsp;": " ",
        "&thinsp;": " ",
        "&zwnj;": "‌",
        "&zwj;": "‍",
        "&lrm;": "‎",
        "&rlm;": "‏",
        "&ndash;": "–",
        "&mdash;": "—",
        "&lsquo;": "‘",
        "&rsquo;": "’",
        "&sbquo;": "‚",
        "&ldquo;": "“",
        "&rdquo;": "”",
        "&bdquo;": "„",
        "&dagger;": "†",
        "&Dagger;": "‡",
        "&permil;": "‰",
        "&lsaquo;": "‹",
        "&rsaquo;": "›",
        "&euro;": "€",
        "&fnof;": "ƒ",
        "&Gamma;": "Γ",
        "&Delta;": "Δ",
        "&Theta;": "Θ",
        "&Lambda;": "Λ",
        "&Xi;": "Ξ",
        "&Pi;": "Π",
        "&Sigma;": "Σ",
        "&Upsilon;": "Υ",
        "&Phi;": "Φ",
        "&Psi;": "Ψ",
        "&Omega;": "Ω",
        "&alpha;": "α",
        "&beta;": "β",
        "&gamma;": "γ",
        "&delta;": "δ",
        "&epsilon;": "ε",
        "&zeta;": "ζ",
        "&eta;": "η",
        "&theta;": "θ",
        "&iota;": "ι",
        "&kappa;": "κ",
        "&lambda;": "λ",
        "&mu;": "μ",
        "&nu;": "ν",
        "&xi;": "ξ",
        "&omicron;": "ο",
        "&pi;": "π",
        "&rho;": "ρ",
        "&sigmaf;": "ς",
        "&sigma;": "σ",
        "&tau;": "τ",
        "&upsilon;": "υ",
        "&phi;": "φ",
        "&chi;": "χ",
        "&psi;": "ψ",
        "&omega;": "ω",
        "&thetasym;": "ϑ",
        "&upsih;": "ϒ",
        "&piv;": "ϖ",
        "&bull;": "•",
        "&hellip;": "…",
        "&prime;": "′",
        "&Prime;": "″",
        "&oline;": "‾",
        "&frasl;": "⁄",
        "&weierp;": "℘",
        "&image;": "ℑ",
        "&real;": "ℜ",
        "&trade;": "™",
        "&alefsym;": "ℵ",
        "&larr;": "←",
        "&uarr;": "↑",
        "&rarr;": "→",
        "&darr;": "↓",
        "&harr;": "↔",
        "&crarr;": "↵",
        "&lArr;": "⇐",
        "&uArr;": "⇑",
        "&rArr;": "⇒",
        "&dArr;": "⇓",
        "&hArr;": "⇔",
        "&forall;": "∀",
        "&part;": "∂",
        "&exist;": "∃",
        "&empty;": "∅",
        "&nabla;": "∇",
        "&isin;": "∈",
        "&notin;": "∉",
        "&ni;": "∋",
        "&prod;": "∏",
        "&sum;": "∑",
        "&minus;": "−",
        "&lowast;": "∗",
        "&radic;": "√",
        "&prop;": "∝",
        "&infin;": "∞",
        "&ang;": "∠",
        "&and;": "∧",
        "&or;": "∨",
        "&cap;": "∩",
        "&cup;": "∪",
        "&int;": "∫",
        "&there4;": "∴",
        "&sim;": "∼",
        "&cong;": "≅",
        "&asymp;": "≈",
        "&ne;": "≠",
        "&equiv;": "≡",
        "&le;": "≤",
        "&ge;": "≥",
        "&sub;": "⊂",
        "&sup;": "⊃",
        "&nsub;": "⊄",
        "&sube;": "⊆",
        "&supe;": "⊇",
        "&oplus;": "⊕",
        "&otimes;": "⊗",
        "&perp;": "⊥",
        "&sdot;": "⋅",
        "&lceil;": "⌈",
        "&rceil;": "⌉",
        "&lfloor;": "⌊",
        "&rfloor;": "⌋",
        "&lang;": "〈",
        "&rang;": "〉",
        "&loz;": "◊",
        "&spades;": "♠",
        "&clubs;": "♣",
        "&hearts;": "♥",
        "&diams;": "♦"
    };
    var charToEntities = {
        "&": "&amp;",
        " ": "&nbsp;",
        "¡": "&iexcl;",
        "¢": "&cent;",
        "£": "&pound;",
        "¤": "&curren;",
        "¥": "&yen;",
        "¦": "&brvbar;",
        "§": "&sect;",
        "¨": "&uml;",
        "©": "&copy;",
        "ª": "&ordf;",
        "«": "&laquo;",
        "¬": "&not;",
        "®": "&reg;",
        "¯": "&macr;",
        "°": "&deg;",
        "±": "&plusmn;",
        "²": "&sup2;",
        "³": "&sup3;",
        "´": "&acute;",
        "µ": "&micro;",
        "¶": "&para;",
        "·": "&middot;",
        "¸": "&cedil;",
        "¹": "&sup1;",
        "º": "&ordm;",
        "»": "&raquo;",
        "¼": "&frac14;",
        "½": "&frac12;",
        "¾": "&frac34;",
        "¿": "&iquest;",
        "À": "&Agrave;",
        "Á": "&Aacute;",
        "Â": "&Acirc;",
        "Ã": "&Atilde;",
        "Ä": "&Auml;",
        "Å": "&Aring;",
        "Æ": "&AElig;",
        "Ç": "&Ccedil;",
        "È": "&Egrave;",
        "É": "&Eacute;",
        "Ê": "&Ecirc;",
        "Ë": "&Euml;",
        "Ì": "&Igrave;",
        "Í": "&Iacute;",
        "Î": "&Icirc;",
        "Ï": "&Iuml;",
        "Ð": "&ETH;",
        "Ñ": "&Ntilde;",
        "Ò": "&Ograve;",
        "Ó": "&Oacute;",
        "Ô": "&Ocirc;",
        "Õ": "&Otilde;",
        "Ö": "&Ouml;",
        "×": "&times;",
        "Ø": "&Oslash;",
        "Ù": "&Ugrave;",
        "Ú": "&Uacute;",
        "Û": "&Ucirc;",
        "Ü": "&Uuml;",
        "Ý": "&Yacute;",
        "Þ": "&THORN;",
        "ß": "&szlig;",
        "à": "&agrave;",
        "á": "&aacute;",
        "â": "&acirc;",
        "ã": "&atilde;",
        "ä": "&auml;",
        "å": "&aring;",
        "æ": "&aelig;",
        "ç": "&ccedil;",
        "è": "&egrave;",
        "é": "&eacute;",
        "ê": "&ecirc;",
        "ë": "&euml;",
        "ì": "&igrave;",
        "í": "&iacute;",
        "î": "&icirc;",
        "ï": "&iuml;",
        "ð": "&eth;",
        "ñ": "&ntilde;",
        "ò": "&ograve;",
        "ó": "&oacute;",
        "ô": "&ocirc;",
        "õ": "&otilde;",
        "ö": "&ouml;",
        "÷": "&divide;",
        "ø": "&oslash;",
        "ù": "&ugrave;",
        "ú": "&uacute;",
        "û": "&ucirc;",
        "ü": "&uuml;",
        "ý": "&yacute;",
        "þ": "&thorn;",
        "ÿ": "&yuml;",
        '"': "&quot;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&apos;",
        "Œ": "&OElig;",
        "œ": "&oelig;",
        "Š": "&Scaron;",
        "š": "&scaron;",
        "Ÿ": "&Yuml;",
        "ˆ": "&circ;",
        "˜": "&tilde;",
        " ": "&ensp;",
        " ": "&emsp;",
        " ": "&thinsp;",
        "‌": "&zwnj;",
        "‍": "&zwj;",
        "‎": "&lrm;",
        "‏": "&rlm;",
        "–": "&ndash;",
        "—": "&mdash;",
        "‘": "&lsquo;",
        "’": "&rsquo;",
        "‚": "&sbquo;",
        "“": "&ldquo;",
        "”": "&rdquo;",
        "„": "&bdquo;",
        "†": "&dagger;",
        "‡": "&Dagger;",
        "‰": "&permil;",
        "‹": "&lsaquo;",
        "›": "&rsaquo;",
        "€": "&euro;",
        "ƒ": "&fnof;",
        "Γ": "&Gamma;",
        "Δ": "&Delta;",
        "Θ": "&Theta;",
        "Λ": "&Lambda;",
        "Ξ": "&Xi;",
        "Π": "&Pi;",
        "Σ": "&Sigma;",
        "Υ": "&Upsilon;",
        "Φ": "&Phi;",
        "Ψ": "&Psi;",
        "Ω": "&Omega;",
        "α": "&alpha;",
        "β": "&beta;",
        "γ": "&gamma;",
        "δ": "&delta;",
        "ε": "&epsilon;",
        "ζ": "&zeta;",
        "η": "&eta;",
        "θ": "&theta;",
        "ι": "&iota;",
        "κ": "&kappa;",
        "λ": "&lambda;",
        "μ": "&mu;",
        "ν": "&nu;",
        "ξ": "&xi;",
        "ο": "&omicron;",
        "π": "&pi;",
        "ρ": "&rho;",
        "ς": "&sigmaf;",
        "σ": "&sigma;",
        "τ": "&tau;",
        "υ": "&upsilon;",
        "φ": "&phi;",
        "χ": "&chi;",
        "ψ": "&psi;",
        "ω": "&omega;",
        "ϑ": "&thetasym;",
        "ϒ": "&upsih;",
        "ϖ": "&piv;",
        "•": "&bull;",
        "…": "&hellip;",
        "′": "&prime;",
        "″": "&Prime;",
        "‾": "&oline;",
        "⁄": "&frasl;",
        "℘": "&weierp;",
        "ℑ": "&image;",
        "ℜ": "&real;",
        "™": "&trade;",
        "ℵ": "&alefsym;",
        "←": "&larr;",
        "↑": "&uarr;",
        "→": "&rarr;",
        "↓": "&darr;",
        "↔": "&harr;",
        "↵": "&crarr;",
        "⇐": "&lArr;",
        "⇑": "&uArr;",
        "⇒": "&rArr;",
        "⇓": "&dArr;",
        "⇔": "&hArr;",
        "∀": "&forall;",
        "∂": "&part;",
        "∃": "&exist;",
        "∅": "&empty;",
        "∇": "&nabla;",
        "∈": "&isin;",
        "∉": "&notin;",
        "∋": "&ni;",
        "∏": "&prod;",
        "∑": "&sum;",
        "−": "&minus;",
        "∗": "&lowast;",
        "√": "&radic;",
        "∝": "&prop;",
        "∞": "&infin;",
        "∠": "&ang;",
        "∧": "&and;",
        "∨": "&or;",
        "∩": "&cap;",
        "∪": "&cup;",
        "∫": "&int;",
        "∴": "&there4;",
        "∼": "&sim;",
        "≅": "&cong;",
        "≈": "&asymp;",
        "≠": "&ne;",
        "≡": "&equiv;",
        "≤": "&le;",
        "≥": "&ge;",
        "⊂": "&sub;",
        "⊃": "&sup;",
        "⊄": "&nsub;",
        "⊆": "&sube;",
        "⊇": "&supe;",
        "⊕": "&oplus;",
        "⊗": "&otimes;",
        "⊥": "&perp;",
        "⋅": "&sdot;",
        "⌈": "&lceil;",
        "⌉": "&rceil;",
        "⌊": "&lfloor;",
        "⌋": "&rfloor;",
        "〈": "&lang;",
        "〉": "&rang;",
        "◊": "&loz;",
        "♠": "&spades;",
        "♣": "&clubs;",
        "♥": "&hearts;",
        "♦": "&diams;"
    };
    var KString = Class(String).extend({
        /**
     * 类初始化
     */
        initialize: function(str) {
            this.str = str;
        },
        /**
     * 将字符串转化成整数
     * @param {base, 可选, 默认10} base 数字类型
     * @example
     * $S("1em").toInt(); // return 1
     * $S("10px").toInt(); // return 10
     * $S("100.00").toInt(); // return 100
     * @returns {Number}
     */
        toInt: function(base) {
            return parseInt(this.str, base || 10);
        },
        /**
     * 将颜色值转换成RGB格式
     * @param {Boolean} array 是否已数组格式返回
     * @example
     * $S("#123").hexToRgb(); // return "rgb(17,34,51)"
     * $S("112233").hexToRgb(); // return "rgb(17,34,51)"
     * $S("#112233").hexToRgb(true); // return [17, 34, 51]
     * @returns {String || Array}
     */
        hexToRgb: function(array) {
            var hex = this.str.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
            return hex ? $A(hex.slice(1)).hexToRgb(array) : null;
        },
        /**
     * 将RGB转换成对应的颜色值
     * @param {Boolean} array 是否已数组格式返回
     * @example
     * $S("rgb(17,34,51)").rgbToHex(); // return "#112233"
     * $S("rgb(17,34,51)").rgbToHex(true); // return ["11","22","33"];
     * $S("rgba(17,34,51)").rgbToHex(); // return "transparent"
     * @returns {String || Array}
     */
        rgbToHex: function(array) {
            var rgb = this.str.match(/\d{1,3}/g);
            return rgb ? $A(rgb).rgbToHex(array) : null;
        },
        /**
     * 将rgb 或者 "#xxx" 转换成 "#xxxxxx"
     * @param {String} co 异常情况下返回的值
     * @example
     * $S('#fff').parseColor();  //return '#ffffff'
     * $S('#ff2').parseColor('#ffffff'); //return '#ffffff'
     * @returns {String} 返回自生或者指定值
     */
        parseColor: function(co) {
            if (this.str.slice(0, 4) == "rgb(") {
                var color = this.rgbToHex();
            } else {
                var color = "#";
                if (this.str.slice(0, 1) == "#") {
                    if (this.str.length == 4) for (var i = 1; i < 4; i++) color += (this.str.charAt(i) + this.str.charAt(i)).toLowerCase();
                    if (this.str.length == 7) color = this.str.toLowerCase();
                }
            }
            return color.length == 7 ? color : co || this.str;
        },
        /**
     * 过滤script并返回剩余的字符串
     * @param {Function || Boolean, 可选} option 执行script程序，或者返回函数调用
     * @example
     * var str = $S("<script>var a = 1; alert(a);</script> this is a test");
     * str.stripScripts(); // alert(1) then return "this is a test"
     * str.stripScripts(function(sc,txt){
     *    alert(sc) //return "var a = 1; alert(a)"
     *    alert(txt) //return "this is a test"
     * });
     * @returns {String}
     */
        stripScripts: function(option, override) {
            var scripts = "";
            var text = this.str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function() {
                scripts += arguments[1];
                return "";
            });
            // if (option === true){
            //     arale.exec(scripts);
            // }
            // else
            if (typeof option == "function") {
                option.call(override, scripts, text);
            }
            return text;
        },
        /**
     * 字符串中的占位符替换
     * @param {Object} object 待替换的数据对象
     * @param {Regexp, 可选} regexp 描述占位符的正则表达式 默认"/\?{([^}]+)}/g"
     * @example
     * var myString = $S("{subject} is {property_1} and {property_2}.");
     * var myObject = {subject: 'Jack Bauer', property_1: 'our lord', property_2: 'savior'};
     * myString.substitute(myObject); //Jack Bauer is our lord and savior
     * @returns {String}
     */
        substitute: function(object, regexp) {
            var str = this.str.replace(regexp || /\{([^}]+)\}/gm, function(match, name) {
                //if (match.charAt(0) == '$') return match.slice(1);
                return object[name] != undefined ? object[name] : "";
            });
            return str;
        },
        /**
     * 清除左边空格
     * @example
     * var str = $S("  this is a example");
     * str.trimLeft(); //return "this is a example"
     * @returns {String}
     */
        trimLeft: function() {
            return this.str.replace(/^[\s\xa0]+/, "");
        },
        /**
     * 清除右边空格
     * @example
     * var str = "  this is a example   ";
     * str.trimRight(); //return "  this is a example"
     * @return {String}
     */
        trimRight: function() {
            return this.str.replace(/[\s\xa0]+$/, "");
        },
        /**
     * 对字符串进行urlEncode
     * @example
     * var str = $S(" . 我 this is a example");
     * str.urlEncode(); //return "%20.%20%E6%88%91%20this%20is%20a%20example"
     * @returns {String}
     */
        urlEncode: function() {
            // this.str = String(this.str);
            if (!_encodeUriRegExp.test(this.str)) {
                return encodeURIComponent(this.str);
            }
            return this.str;
        },
        /**
     * 对字符串进行urlDecode
     * @example
     * var str = $S("%20.%20%E6%88%91%20this%20is%20a%20example");
     * str.urlDecode(str); //return " . 我 this is a example"
     * @returns {String}
     */
        urlDecode: function() {
            return decodeURIComponent(this.str.replace(/\+/g, " "));
        },
        /**
     * 对字符串进行html转码
     * @example
     * var str = $S("<html><body>Go Go");
     * str.htmlEscape(str); //return "&lt;html&gt;&lt;body&gt;Go Go"
     * @returns {String}
     */
        escapeHTML: function() {
            if (!_allRe.test(this.str)) return this.str;
            var str = this.str;
            if (str.indexOf("&") != -1) {
                str = str.replace(_amperRe, "&amp;");
            }
            if (str.indexOf("<") != -1) {
                str = str.replace(_ltRe, "&lt;");
            }
            if (str.indexOf(">") != -1) {
                str = str.replace(_gtRe, "&gt;");
            }
            if (str.indexOf('"') != -1) {
                str = str.replace(_quotRe, "&quot;");
            }
            return str;
        },
        /**
     * 反转义HTML
     * @param {String} str 需要操作的字符串
     * @example
     * var str = $S("&lt;html&gt;&lt;body&gt;Go Go");
     * str.unescapeHTML(); //return "<html><body>Go Go"
     * @returns {String}
     */
        unescapeHTML: function() {
            if (!this.trim().length) return this.str;
            return this.str.replace(/&([^;]+);/g, function(s, entity) {
                switch (entity) {
                  case "amp":
                    return "&";

                  case "lt":
                    return "<";

                  case "gt":
                    return ">";

                  case "quot":
                    return '"';

                  default:
                    if (entity.charAt(0) == "#") {
                        // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
                        var n = Number("0" + entity.substr(1));
                        if (!isNaN(n)) {
                            return String.fromCharCode(n);
                        }
                    }
                    // For invalid entities we just return the entity
                    return s;
                }
            });
        },
        /**
  	 * 检测是否包含相关字符
  	 * @param {String} string 需要搜索的字符
  	 * @param {String|可选} separator 分隔符 (如element中的className用空格分隔)
  	 * @example
  	 * 
  	 * @returns {Boolean}
  	 */
        contains: function(string, separator) {
            return separator ? (separator + this.str + separator).indexOf(separator + string + separator) > -1 : this.str.indexOf(string) > -1;
        },
        /**
     * 去除前后空格
     * @example
     * $S("   I love mac  ").trim(); // return "I love mac"
     * @returns {String}
     */
        trim: function() {
            var str = this.str.replace(/^\s+/, "");
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        },
        /**
     * 去除前后无相干的空白符如:\n \t引起的空行
     * @example
     * $S('   I love mac  \n\n).clean(); // return "I love mac"
     * @returns {String}
     */
        clean: function() {
            return this.trim(this.str.replace(/\s+/g, " "));
        },
        /**
     * 根据指定次数重复字符串
     * @param {Number} num 需要重复的次数
     * @example
     * var str = $S("***");
     * str.rep(str,3); //return "*********"
     * @returns {String}
     */
        rep: function(num, text) {
            if (text) this.str = text;
            if (num <= 0 || !this.str) {
                return "";
            }
            var buf = [];
            for (;;) {
                if (num & 1) {
                    buf.push(this.str);
                }
                if (!(num >>= 1)) {
                    break;
                }
                this.str += this.str;
            }
            return buf.join("");
        },
        /**
     * 通过我们给定的备选字符去填充一个字符串，确保他的长度至少是我们指定的长度，默认是在前面填充
     * @param {Number} times 需要被填充到的长度 
     * @param {String||可选} ch  被填充的字符，
     * @param {Boolean||可选} end 如果是后填充，为true
     * @example
     * var str = $S("abc");
     * str.pad(7,"*"); //return "****abc"
     * str.pad(7,"*",true); //return "abc***"
     * @returns {String}
     */
        pad: function(size, ch, end) {
            if (!ch) {
                ch = "0";
            }
            var out = String(this.str);
            var pad = this.rep(Math.ceil((size - out.length) / ch.length), ch);
            return end ? out + pad : pad + out;
        },
        /**
  	 * 将每个词的首字母大写
  	 * @example
  	 * $S("i like cookies").capitalize(); //return "I Like Cookies"
  	 * @returns {String}
  	 */
        capitalize: function() {
            var str = this.str.replace(/\b[a-z]/g, function(match) {
                return match.toUpperCase();
            });
            return str;
        },
        /**
  	 * 全角字符转半角
  	 * @param {String} both, left, right, all;
  	 * * @example
  	 * 'ａｂｃ'.ftoh(); //return abc
  	 * @returns {String}
  	 */
        ftoh: function(isTrim) {
            var result = "", str, c, isTrim = isTrim || "both";
            switch (isTrim) {
              case "all":
              case "both":
                str = this.trim();
                break;

              case "left":
                str = this.trimLeft();
                break;

              case "right":
                str = this.trimRight();
                break;

              default:
                str = this.str;
            }
            for (var i = 0, len = str.length; i < len; i++) {
                c = str.charCodeAt(i);
                if (c == 12288) {
                    if (isTrim != "all") {
                        result += String.fromCharCode(c - 12256);
                    }
                    continue;
                }
                if (c > 65280 && c < 65375) {
                    result += String.fromCharCode(c - 65248);
                } else {
                    if (c == 32 && isTrim == "all") {
                        continue;
                    }
                    result += String.fromCharCode(str.charCodeAt(i));
                }
            }
            return result;
        },
        /**
     * 合并用横杠分隔的字符串并驼峰风格
     * @example
     * $S("i-love-you").camelCase(); // return "ILoveYou"
     * @returns {String}
     */
        camelCase: function() {
            var str = this.str.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
            return str;
        },
        /**
     * 将驼峰风格的支付串用"-"分隔
     * @example
     * $("iLoveYou").hyphenate(); // return "I-love-you"
     * @returns {String}
     */
        hyphenate: function() {
            var str = this.replace(/[A-Z]/g, function(match) {
                return "-" + match.charAt(0).toLowerCase();
            });
            return str;
        },
        /**
     * 将驼峰风格的字符串用指定符号分隔
     * @example
     * $("iLoveYou").slug(','); // return "i,love,you"
     * @returns {String}
     */
        slug: function(spacer) {
            spacer = spacer || "-";
            var str = String(this.str);
            str = str.replace(/([A-Z])/g, function($1) {
                return " " + $1.toLowerCase();
            });
            str = str.replace(/([^a-z0-9]+)/g, " ");
            str = str.replace(/\s+/g, " ");
            str = str.trim().replace(/ +/g, spacer);
            return str;
        },
        /**
     * 将字符串转化成正则格式
     * @example
     * $S("animals.sheep[1]").escapeRegExp(); // return "animals\.sheep\[1\]"
     * @returns {String}
     */
        escapeRegExp: function() {
            return this.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
        },
        /**
     * 将字符串转化成浮点数
     * @example
     * $S("99.9%").toFloat(); // return 99.9
     * $S("100.11").toFloat(); // return 100.11
     * @returns {Number}
     */
        toFloat: function() {
            return parseFloat(String(this.str));
        }
    });
    module.exports = KString;
    KString.prototype["toString"] = function() {
        return this.str;
    };
});
