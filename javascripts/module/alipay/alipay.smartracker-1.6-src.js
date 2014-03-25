/** begin ---smartracker.js---*/
/**
 * 自动化埋点(smartracker)算法
 * (系统名|域名|home)-(页面名称|index)-(模块名称|global)-(埋点名称)
 *
 * a, img, input, button, textarea, select, map>area
 *
 * TODO: 针对特定浏览器的开关。
 */

window.Smartracker = (function(){
    // speed test init.
    var _date = new Date();
    var D = {
        getAttr: function(elem, name){
            if(!elem || "undefined"===typeof elem.getAttribute){
                return null;
            }
            var attrVal=elem.getAttribute(name, 2);
            //replace attr by lin.weng 2013.07.03
            if(attrVal&&(typeof attrVal ==='string')){
            	attrVal=attrVal.replace(/\r|\n|\t|\f|\v/g,"");
            }
            return attrVal;
        },
        hasAttr: function(elem, attr){
            if(!elem || 1!=elem.nodeType){return false;}
            if(elem.hasAttribute){return elem.hasAttribute(attr);}
            // for IE, not perfect.
            // @see http://www.patmullin.com/weblog/2006/04/06/getattributestyle-setattributestyle-ie-dont-mix/
            if("class" == attr){return "" !== elem.className;}
            if("style" == attr){return "" !== elem.style.cssText;}
            var val = D.getAttr(elem, attr);
            if(null == val){return false;}
            else if("function" == typeof(val)){
                // for IE:
                // <div onclick="alert(0);">.getAttribute("onclick")
                // <==>
                // function onclick()
                // {
                // alert(0);
                // }
                return val.toString().indexOf("function "+attr+"()") == 0;
            }else{return true;}
        },
        innerText: function(elem){
            return elem.innerText || elem.textContent || "";
        }
    };

    var doc = document,
        loc = location,
        domain = loc.hostname,
        MODES = {PRO:0, SIT:1, SATBLE:2, DEV:3, EXT:9, UNKNOW:-1},
        CURR_MODE = MODES.UNKNOW,
        seedName = "seed",
        splitChar = "-",
        classExclude = ["ui-", "fn-", "sl-"],
        re_en = /^[a-zA-Z][a-zA-Z0-9_\s-]*$/,
        re_space = /\s+/g,
        cache = {},
        debug = "file:"==loc.protocol || "#debug"==loc.hash || false,
        elems,
        ELEMENTS = [],names = ["", ""],specChars = /[\\\.~!@#\$%\^&:;,\/\+\(\)\[\]\{\}]/g;

    if("undefined"==typeof window.SMARTRACKER_WORDS){
        window.SMARTRACKER_WORDS = {};
    }

    if(domain==="alipay.com" || endsWith(domain, ".alipay.com")){
        CURR_MODE = MODES.PRO;
    }else if(endsWith(domain, ".sit.alipay.net")){
        CURR_MODE = MODES.SIT;
    }else if(endsWith(domain, ".stable.alipay.net")){
        CURR_MODE = MODES.STABLE;
    }else if(/^[a-zA-Z0-9-]+\.[pd]\d+\.alipay\.net$/){
        CURR_MODE = MODES.DEV;
    }else{
        CURR_MODE = MODES.EXT;
        return;
    }

    /**
     * Get HTMLElement's type
     * @param {HTMLElement} elem.
     * @return {String} element's type.
     */
    function getInputType(elem){
        var type = elem.type;
         // fieldset>legend, label.
        if("undefined" == typeof type){return;}
        if(type == "text"){
            type = D.getAttr(elem, "type") || "text";
        }
        return type.toUpperCase();
    }

    /**
     * each list HTMLElement node items.
     * @param {Array} list.
     * @param {Function} handler.
     */
    function each(list, handler){
        for(var i=0,l=list.length; i<l; i++){
            var type = null;
            switch(list[i].tagName.toUpperCase()){
            case 'A':
            case 'AREA': // map>area
                type = "link";
                break;
            case 'IMG':
                if("A" !== list[i].parentNode.tagName.toUpperCase()){
                    type = "image";
                }
                break;
            case 'INPUT':
                switch(getInputType(list[i])){
                case 'SUBMIT':
                case 'BUTTON':
                case 'RESET':
                case 'IMAGE':
                    type = "button";
                    break;
                case 'HIDDEN':
                    break;
                case 'TEXT':
                case 'PASSWORD':
                case 'FILE':
                case 'DATE':
                default:
                    type = "input";
                    break;
                }
                break;
            case 'BUTTON':
                type = "button";
                break;
            case 'TEXTAREA':
                type = "input";
                break;
            case 'SELECT':
                type = "input";
                break;
            default:
                break;
            }
            handler(list[i], type);
        }
    }
    /**
     * @param {HTMLElement} elem, target html element.
     * @param {String} type, [optional], element type.
     * @return {String}
     */
    function smart(elem, type){
        names[0] = moduleName(elem);
        switch(type){
        case 'link':
            names[1] = trackNameLink(elem);
            break;
        case 'image':
            names[1] = trackNameImage(elem);
            break;
        case 'input':
        case 'button':
            names[1] = trackNameInput(elem);
            break;
        default:
            return;
        }
        var seed = names.join(splitChar).replace(specChars, "");
        if(cache.hasOwnProperty(seed)){
            seed = seed + "T" + (++cache[seed]);
        }
        elem.setAttribute(seedName, seed);
        elem.setAttribute("smartracker", "on");
        cache[seed] = 0;
        return seed;
    }

    /**
     * 将字符串数组转成驼峰形式的字符串。
     * @param {Array} list, 源数据。
     * @return {String}
     */
    function camelize(list){
        if(!list || !list.length){return "";}
        for(var i=1,l=list.length; i<l; i++){
            list[i] = list[i].charAt(0).toUpperCase()+list[i].substring(1);
        }
        return list.join("");
    }
    /**
     * 计算埋点对象所在的模块名称。
     * @param {HTMLElement} elem, 目标埋点对象。
     * @return {String}
     */
    function moduleName(elem){
        var node = elem.parentNode,
            cls,
            module;
        do{
            // 判断是否存在 id 属性时，兼容模式有异常情况。
            if(D.hasAttr(node, "id") && (module = D.getAttr(node, "id"))){
                return camelize(module.split("-"));
            }else if(D.hasAttr(node, "class") &&
                (cls = namedCSS(D.getAttr(node, "class") || node.className || ""))){

                return cls;
            }
        }while(node = node.parentNode);
        return "global";
    }
    /**
     * 将 URL 转成有意义的具名名称。
     * @param {String} url, 源 URL 地址。
     * @return {String}
     */
    function namedURL(url){
        var r = [],
            uri = parseUrl(url),
            path = uri.pathname.replace(/^\//, "").split("/"),
            uri_loc = parseUrl(document.URL),
            path_loc = uri_loc.pathname.replace(/^\//, "").split("/");
        r.push(uri.domainName || uri_loc.domainName);
        path[path.length - 1] = path[path.length - 1].split(".")[0] || "index";
        //path_loc[path_loc.length - 1] = path_loc[path_loc.length - 1].split(".")[0];
        r.push.apply(r, path);
        return camelize(r);
    }
    /**
     * 计算链接的埋点名称部分。
     * @param {HTMLElement} elem, 目标元素。
     * @return {String}
     */
    function trackNameLink(elem){
        var id, text, href, uri, cls;
        if(id = D.getAttr(elem, "id")){
            return camelize(id.split("-"));
        }
        if(cls = namedCSS(D.getAttr(elem, "class") || elem.className || "")){
            return cls;
        }
        href = D.getAttr(elem, "href") || "";
        if(!href || 0==href.indexOf("#")){
            // Do nothing.
        }if(uri = namedURL(href)){
            switch(uri.protocol){
            case "http:":
            case "https:":
                return uri;
            //case "javascript:":
            //case "about:":
            //case "data:":
            //case "chrome:":
            //case "chrome-plugin:":
            //case "chrome-extension:":
            //case "mailto:"
            //case "ftp:"
            //case "ftps:"
            // ...
            default:
                break;
            }
        }
        if(text = namedText(D.innerText(elem))){
            return text;
        }
        return "link";
    }
    /**
     * 计算图片的埋点名称部分。
     * @param {HTMLElement} elem, 目标元素。
     * @return {String}
     */
    function trackNameImage(elem){
        var id, alt, cls, uri;
        if(id = D.getAttr(elem, "id")){return id;}
        if(cls = namedCSS(D.getAttr(elem, "class") || elem.className || "")){
            return cls;
        }
        if(cls = namedURL(D.getAttr(elem, "src"))){
            return cls;
        }
        if(alt = namedText(D.getAttr(elem, "alt") ||
            D.getAttr(elem, "title"))){

            return alt;
        }
        return "";
    }
    /**
     * 计算输入框/按钮/文本框/下拉框之类的埋点名称部分。
     * @param {HTMLElement} elem, 目标元素。
     * @return {String}
     */
    function trackNameInput(elem){
        var id, type, cls, r=[];
        if(id = D.getAttr(elem, "id") ||
            D.getAttr(elem, "name") || ""){

            return camelize(id.split("-"));
        }
        if(cls = namedCSS(D.getAttr(elem, "class") || elem.className || "")){
            return cls;
        }
        switch(type = getInputType(elem)){
        case 'BUTTON': // button.
        case 'SUBMIT':
        case 'RESET':
        case 'IMAGE':
            r.push("btn");
            r.push(namedText(D.innerText(elem)));
            return camelize(r);
        case 'HIDDEN':
            return "";
        case 'TEXT': // input.
        case 'DATE':
        case 'INPUT': // input without type.
        case 'SELECT':
        case 'TEXTAREA':
        default:
            r.push("ipt");
            r.push(elem.id || elem.name || "");
            return camelize(r);
        }
        return camelize(r) || "";
    }
    /**
     * 判断字符串是否以指定字串结尾。
     * @param {String} str, 目标源字符串。
     * @param {String} suffix, 目标子字串。
     * @return {Boolean}
     */
    function endsWith(str, suffix){
        return (str.substr(str.length - suffix.length) === suffix);
    }
    /**
     * 根据字典生成具有语义的英文名称。
     * @param {String} text, 源文本。
     * @return {String}
     */
    function namedText(text){
        if(!text){return "";}
        if(re_en.test(text)){return text.replace(re_space,splitChar);}
        for(var k in SMARTRACKER_WORDS){
            if(SMARTRACKER_WORDS.hasOwnProperty(k) && text.indexOf(k)>=0){
                return SMARTRACKER_WORDS[k];
            }
        }
        return "";
    }
    /**
     * 获取有效的 CSS 类名。
     * @param {String} cls, class names.
     * @return {String}
     */
    function namedCSS(cls){
        if(!cls){return "";}
        cls=cls.replace(/\r|\n|\t|\f|\v/g,"");
        var a = cls.split(" ");
        for(var i=0,l=a.length; i<l; i++){
            if( 0 === a[i].indexOf("ui-") ||
                0 === a[i].indexOf("fn-") ||
                0 === a[i].indexOf("sl-")){

                continue;
            }
            return camelize(a[i].split("-"));
        }
        return "";
    }
    /**
     * 解析 URL 成 URI 对象。
     * @param {String} url, url 字符串。
     * @return {Object}
     */
    function parseUrl(url){
        var a = document.createElement("a");
        a.setAttribute("href", url);
        var file = a.pathname.split("/").slice(-1).join(""),
            fileName = file.split(".").slice(0,1).join(""),
            domain = a.hostname,
            domainName = domain.split(".").slice(0,1).join("");
        return {
            protocol: a.protocol,
            domain: domain,
            domainName: domainName,
            path: a.pathname,
            pathname: a.pathname,
            file: file,
            fileName: fileName
        };
    }

    return {
        get: function(elem){
            return smart(elem);
        },
        init:function(){
            elems = doc.getElementsByTagName("*")
            each(elems, function(elem, type){
                var seed;
                if(D.hasAttr(elem, seedName) &&
                    (seed = (D.getAttr(elem, seedName)))
                ){
                    // cache seed exists name.
                    if(!!seed){cache[seed] = 0;}
                }else if(!!type){
                    ELEMENTS.push(elem);
                }
            });
            each(ELEMENTS, smart);
            // speed test.
            if(debug){
                _date = (new Date() - _date)+"ms";
                window.status = _date;
                if(window.console && console.log){
                    console.log("Speed:", _date);
                }
            }           
        }
    };
})();

/** end ---smartracker.js---*/
/**Last Changed Author: tian.liang--Last Changed Date: Thu Jan 24 11:28:13 CST 2013**/
/**alipay.smartracker-1.6**/
/** CurrentDeveloper: wlstyle**/
/** DeployDate: Wed Jul 17 14:31:07 CST 2013**/
