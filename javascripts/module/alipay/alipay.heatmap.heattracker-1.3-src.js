/** begin ---heattracker.js---*/
// HeatMap Client Script.
// @param {String}, orig, coordinate origin html element #id.
// @param {Number} rate, send user click data rate, [0,1].
// @version 1.0, 2011/10/20
//
// Usage:
//      *[coor=name]
//      *[coor=default]
//      *[coor=default:also-use-for-area]

var md5 = (function(){

/**********************************************************
* md5.js
*
* A JavaScript implementation of the RSA Data Security, Inc. MD5
* Message-Digest Algorithm.
*
* Copyright (C) Paul Johnston 1999. Distributed under the LGPL.
***********************************************************/
/* to convert strings to a list of ascii values */
var sAscii = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var sAscii = sAscii + "[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
/* convert integer to hex string */
//var sHex = "0123456789ABCDEF";
var sHex = "0123456789abcdef";
function hex(i) {
    var h = "";
    for(var j = 0; j <= 3; j++) {
        h +=sHex.charAt((i>>(j*8+4))&0x0F)+sHex.charAt((i>>(j*8))&0x0F);
    }
    return h;
}

/* add, handling overflows correctly */
function add(x, y) {
    return ((x&0x7FFFFFFF) + (y&0x7FFFFFFF)) ^ (x&0x80000000) ^ (y&0x80000000);
}

/* MD5 rounds functions */
function R1(A, B, C, D, X, S, T) {
    var q = add(add(A, (B & C) | (~B & D)), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
}

function R2(A, B, C, D, X, S, T) {
    var q = add(add(A, (B & D) | (C & ~D)), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
}

function R3(A, B, C, D, X, S, T) {
    var q = add(add(A, B ^ C ^ D), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
}

function R4(A, B, C, D, X, S, T) {
    var q = add(add(A, C ^ (B | ~D)), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
}


/* main entry point */
function calcMD5(sInp) {
    /* Calculate length in machine words, including padding */
    var wLen = (((sInp.length + 8) >> 6) + 1) << 4;
    var X = new Array(wLen);

    /* Convert string to array of words */
    var j = 4;
    for (var i = 0; (i * 4) < sInp.length; i++) {
        X[i] = 0;
        for (j = 0; (j < 4) && ((j + i * 4) < sInp.length); j++) {
            X[i] += (sAscii.indexOf(sInp.charAt((i * 4) + j)) + 32) << (j * 8);
        }
    }

    /* Append padding bits and length */
    if (j == 4) {
        X[i++] = 0x80;
    }
    else {
        X[i - 1] += 0x80 << (j * 8);
    }

    for(; i < wLen; i++) { X[i] = 0; }
    X[wLen - 2] = sInp.length * 8;

    /* hard-coded initial values */
    var a = 0x67452301,
        b = 0xefcdab89,
        c = 0x98badcfe,
        d = 0x10325476,
        aO, bO, cO, dO;

    /* Process each 16-word block in turn */
    for (var i = 0; i < wLen; i += 16) {
        aO = a;
        bO = b;
        cO = c;
        dO = d;

        a = R1(a, b, c, d, X[i+ 0], 7 , 0xd76aa478);
        d = R1(d, a, b, c, X[i+ 1], 12, 0xe8c7b756);
        c = R1(c, d, a, b, X[i+ 2], 17, 0x242070db);
        b = R1(b, c, d, a, X[i+ 3], 22, 0xc1bdceee);
        a = R1(a, b, c, d, X[i+ 4], 7 , 0xf57c0faf);
        d = R1(d, a, b, c, X[i+ 5], 12, 0x4787c62a);
        c = R1(c, d, a, b, X[i+ 6], 17, 0xa8304613);
        b = R1(b, c, d, a, X[i+ 7], 22, 0xfd469501);
        a = R1(a, b, c, d, X[i+ 8], 7 , 0x698098d8);
        d = R1(d, a, b, c, X[i+ 9], 12, 0x8b44f7af);
        c = R1(c, d, a, b, X[i+10], 17, 0xffff5bb1);
        b = R1(b, c, d, a, X[i+11], 22, 0x895cd7be);
        a = R1(a, b, c, d, X[i+12], 7 , 0x6b901122);
        d = R1(d, a, b, c, X[i+13], 12, 0xfd987193);
        c = R1(c, d, a, b, X[i+14], 17, 0xa679438e);
        b = R1(b, c, d, a, X[i+15], 22, 0x49b40821);

        a = R2(a, b, c, d, X[i+ 1], 5 , 0xf61e2562);
        d = R2(d, a, b, c, X[i+ 6], 9 , 0xc040b340);
        c = R2(c, d, a, b, X[i+11], 14, 0x265e5a51);
        b = R2(b, c, d, a, X[i+ 0], 20, 0xe9b6c7aa);
        a = R2(a, b, c, d, X[i+ 5], 5 , 0xd62f105d);
        d = R2(d, a, b, c, X[i+10], 9 , 0x2441453);
        c = R2(c, d, a, b, X[i+15], 14, 0xd8a1e681);
        b = R2(b, c, d, a, X[i+ 4], 20, 0xe7d3fbc8);
        a = R2(a, b, c, d, X[i+ 9], 5 , 0x21e1cde6);
        d = R2(d, a, b, c, X[i+14], 9 , 0xc33707d6);
        c = R2(c, d, a, b, X[i+ 3], 14, 0xf4d50d87);
        b = R2(b, c, d, a, X[i+ 8], 20, 0x455a14ed);
        a = R2(a, b, c, d, X[i+13], 5 , 0xa9e3e905);
        d = R2(d, a, b, c, X[i+ 2], 9 , 0xfcefa3f8);
        c = R2(c, d, a, b, X[i+ 7], 14, 0x676f02d9);
        b = R2(b, c, d, a, X[i+12], 20, 0x8d2a4c8a);

        a = R3(a, b, c, d, X[i+ 5], 4 , 0xfffa3942);
        d = R3(d, a, b, c, X[i+ 8], 11, 0x8771f681);
        c = R3(c, d, a, b, X[i+11], 16, 0x6d9d6122);
        b = R3(b, c, d, a, X[i+14], 23, 0xfde5380c);
        a = R3(a, b, c, d, X[i+ 1], 4 , 0xa4beea44);
        d = R3(d, a, b, c, X[i+ 4], 11, 0x4bdecfa9);
        c = R3(c, d, a, b, X[i+ 7], 16, 0xf6bb4b60);
        b = R3(b, c, d, a, X[i+10], 23, 0xbebfbc70);
        a = R3(a, b, c, d, X[i+13], 4 , 0x289b7ec6);
        d = R3(d, a, b, c, X[i+ 0], 11, 0xeaa127fa);
        c = R3(c, d, a, b, X[i+ 3], 16, 0xd4ef3085);
        b = R3(b, c, d, a, X[i+ 6], 23, 0x4881d05);
        a = R3(a, b, c, d, X[i+ 9], 4 , 0xd9d4d039);
        d = R3(d, a, b, c, X[i+12], 11, 0xe6db99e5);
        c = R3(c, d, a, b, X[i+15], 16, 0x1fa27cf8);
        b = R3(b, c, d, a, X[i+ 2], 23, 0xc4ac5665);

        a = R4(a, b, c, d, X[i+ 0], 6 , 0xf4292244);
        d = R4(d, a, b, c, X[i+ 7], 10, 0x432aff97);
        c = R4(c, d, a, b, X[i+14], 15, 0xab9423a7);
        b = R4(b, c, d, a, X[i+ 5], 21, 0xfc93a039);
        a = R4(a, b, c, d, X[i+12], 6 , 0x655b59c3);
        d = R4(d, a, b, c, X[i+ 3], 10, 0x8f0ccc92);
        c = R4(c, d, a, b, X[i+10], 15, 0xffeff47d);
        b = R4(b, c, d, a, X[i+ 1], 21, 0x85845dd1);
        a = R4(a, b, c, d, X[i+ 8], 6 , 0x6fa87e4f);
        d = R4(d, a, b, c, X[i+15], 10, 0xfe2ce6e0);
        c = R4(c, d, a, b, X[i+ 6], 15, 0xa3014314);
        b = R4(b, c, d, a, X[i+13], 21, 0x4e0811a1);
        a = R4(a, b, c, d, X[i+ 4], 6 , 0xf7537e82);
        d = R4(d, a, b, c, X[i+11], 10, 0xbd3af235);
        c = R4(c, d, a, b, X[i+ 2], 15, 0x2ad7d2bb);
        b = R4(b, c, d, a, X[i+ 9], 21, 0xeb86d391);

        a = add(a, aO);
        b = add(b, bO);
        c = add(c, cO);
        d = add(d, dO);
    }
    return hex(a) + hex(b) + hex(c) + hex(d);
}

return calcMD5;
})();

window.HeatTracker || (window.HeatTracker = function(orig, rate){
    if(HeatTracker.invoked){return;}
    HeatTracker.invoked = true;

    var D = {
        hasAttr: function(elem, attr){
            if(!elem || 1!=elem.nodeType){return false;}
            if("function"===typeof elem.hasAttribute){return elem.hasAttribute(attr);}
            if("function"!==typeof elem.getAttribute){return false;}
            return null != elem.getAttribute(attr);
        }
    };
    function hit(rate){
        return (0 == Math.floor(Math.random()/rate));
    }

    var win = window,
        doc = win.document,
        //H = win.HeatTracker = function(){},
        BIProfile="heatTracker",
        coorAttr = "coor",
        coorDefault = "default",
        //! Don't ues colon(:) in tracker.
        coorPrefix = "-",
        coorRateAttr = "coor-rate",
        zero = {},
        multipleOrigin = false;


    // Init coordinate names for new version, by:
    function initCoor(){
        var elems = doc.getElementsByTagName("*");
        for(var i=0,val,offset,l=elems.length; i<l; i++){
            if(!D.hasAttr(elems[i], coorAttr)){continue;}
            val = elems[i].getAttribute(coorAttr);
            if(!val){continue;}
            offset = getOffset(elems[i]);
            zero[val] = offset;
            if(coorDefault == val){
                rate = parseFloat(elems[i].getAttribute(coorRateAttr), 10) || 0;
            }else if(0 == val.indexOf(coorDefault+coorPrefix)){
                if(!zero.hasOwnProperty(coorDefault)){
                    zero[coorDefault] = offset;
                    rate = parseFloat(elems[i].getAttribute(coorRateAttr), 10) || 0;
                }
            }
        }
    }
    var coorOrig;
    if("undefined" == typeof orig){
        initCoor();
        multipleOrigin = true;
    }else if(coorOrig = doc.getElementById(orig)){
        zero[coorDefault] = zero[orig] = getOffset(coorOrig);
        multipleOrigin = false;
    }else{
        //throw new Error("#"+orig+" not exist.");
        return;
    }

    // 以指定的概率执行监控脚本。
    if("undefined" === typeof rate){rate = 0;}
    if(!hit(rate)){return;}
    if(!zero.hasOwnProperty(coorDefault)){return;}


    // Event.addEventListener.
    // @param {HTMLElement} elem, target HTMLElement.
    // @param {String} evt, event name.
    // @param {Function} handler, event handler function.
    function E_add(elem, evt, handler){
        if(elem.attachEvent) {
            elem.attachEvent('on'+evt, handler);
        }else if(elem.addEventListener){
            elem.addEventListener(evt, handler, false);
        }
        //! Warning: Don't use elem["on"+evt] = function(){};
        //! Don't inject & effect main code.
    }
    // Get target element's offset position.
    // @param {HTMLElement} o, target HTMLElement.
    // @return {Array} [x, y].
    function getOffset(o){
        var x=0, y=0;
        do{
            x += o.offsetLeft;
            y += o.offsetTop;
        }while(o = o.offsetParent);
        return [x,y];
    }
    // Get mouse click position.
    // @param {MouseEvent} e.
    // @return {Array} [x, y].
    function getPos(e){
        var o = "CSS1Compat"==doc.compatMode ? doc.documentElement : doc.body,
            x = e.pageX || (o.scrollLeft+e.clientX),
            y = e.pageY || (o.scrollTop+e.clientY);
        return [x, y];
    }
    // Find elem in which coordinate.
    // @param {HTMLElement} elem, target HTMLElement.
    // @return {String} target element's nearst coordinate name.
    //                  when can'not find it, return default coordinate name.
    function findCoor(elem){
        if(!multipleOrigin){
            return orig;
        }
        do{
            if(D.hasAttr(elem, coorAttr)){
                return elem.getAttribute(coorAttr);
            }
        }while(elem = elem.parentNode);
        return coorDefault;
    }
    // Get Seed Name.
    // @param {HTMLElement} elem
    function findSeed(elem){
        var seed = "seed";
        do{
            if(D.hasAttr(elem, seed)){
                return elem.getAttribute(seed);
            }
        }while(elem = elem.parentNode);
        return null;
    }

    var w = screen.width,
        h = screen.height,
        // 某一次访问当前页面的全球唯一 ID(GUID)，
        sid = md5(location.href + doc.cookie + navigator.userAgent +
            new Date().toString() + Math.random());
    E_add(doc, 'mousedown', function(e){
        e = window.event || e;
        var click = {
                left:   e.which ? e.which==1 : e.button==1,
                middle: e.which ? e.which==2 : e.button==4,
                right:  e.which ? e.which==3 : e.button==2
            },
            elem = e.target || e.srcElement,
            seedName = findSeed(elem) || "";
        // Ignore middle mouse click key.
        if(!click.left && !click.right){return;}
        var coorName = findCoor(elem),
            pos = getPos(e),
            zeroX = pos[0]-zero[coorName][0],
            zeroY = pos[1]-zero[coorName][1];
        try{
            // "heatTracker:x,y@origin^w,h"
            var target = [BIProfile,":",(zeroX),"x",
                (zeroY),"^",coorName,"^",w,"x",h,"^",sid].join('');
            Tracker.click(target, {"target": seedName});
        }catch(ex){
            if(window.console){
                console.log(target);
            }else{
                window.status = target;
            }
        }
    });
});

window.setTimeout(function(){
    // auto invoke for new version.
    HeatTracker();
}, 200);

/** end ---heattracker.js---*/
/**Last Changed Author: tian.liang--Last Changed Date: Wed Oct 17 13:20:31 CST 2012**/
/**alipay.heatmap.heattracker-1.3**/
/** CurrentDeveloper: hotoo**/
/** DeployDate: Wed Oct 17 13:59:22 CST 2012**/
