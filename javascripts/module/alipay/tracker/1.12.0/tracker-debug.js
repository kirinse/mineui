/*!
 *
 * Alipay Log Analytics Module, v1.0.4
 * @author taibo, janlay@gmail.com, Sep 20, 2011
 * @contributor tian.liang(@hotoo), 2012.
 * $Id: tracker.js 30193 2013-02-27 11:32:31Z tian.liang $
 * Copyright 2010-2011 Alipay, All Rights Reserved.
 *
 **/
/**
 * Tracker final version released!
 * ** Control the tracker manually (Auto mode):
 * tracker.stop(); // stop/pause tracking
 * tracker.start(); // start tracking
 *
 * ** Customize the user-defined attribute (Auto mode):
 * Tracker.seedName = 'anotherseedname'; // customized seed name
 *
 * ** Manual mode, invoke it whenever you want to track the event.
 * Tracker.click('seed1');
 **/
// create Tracker, do nothing if Tracker exists
this.Tracker || function(host) {
    // defines the url where track data should be sent to
    var win = host, doc = win.document, loc = win.location, URL = document.URL || "", performance = win.performance, light = win.light, t, startTime, protocol = loc.protocol === "https:" ? "https:" : "http:", SERVER_URL = protocol + "//kcart.alipay.com/web/bi.do", ACOOKIE_SERVER_URL = protocol + "//kcart.alipay.com/web/1.do", MMSTAT_SERVER_URL = protocol + "//log.mmstat.com/5.gif", MAX_READY_TIME = 2e4, SAMPLE_RATE = 8, PROFILE_NAME = "BIProfile", DEFAULT_PROFILE = "clk", PROFILES = {
        p: ""
    };
    var REF_NAME = "ref";
    var REF_UNLOAD_TIME_NAME = "ref-unload-time";
    var LOST_LOGS_NAME = "lost";
    var LOST_SPLITER = ",";
    var LOST_LOGS_DATA = [];
    // 超出指定时间的 window.name.ref 将失效。
    var REF_TIMEOUT = 1e3;
    // #6, 针对国际站的配置。
    var RE_ALIPAY_US = /^https?:\/\/intl\.alipay\.com[\/:]/;
    if (window.TRACKER_CONFIG) {
        SERVER_URL = TRACKER_CONFIG.base || SERVER_URL;
        ACOOKIE_SERVER_URL = TRACKER_CONFIG.acookie_cbase || ACOOKIE_SERVER_URL;
        MMSTAT_SERVER_URL = TRACKER_CONFIG.acookie_base || MMSTAT_SERVER_URL;
    } else if (RE_ALIPAY_US.test(URL)) {
        SERVER_URL = protocol + "//ikcart.alipay.com/web/bi.do";
        ACOOKIE_SERVER_URL = protocol + "//ikcart.alipay.com/web/1.do";
        MMSTAT_SERVER_URL = protocol + "//gj.mmstat.com/5.gif";
    }
    // use IE 9 performance instead if applicable
    if (performance && performance.timing) {
        startTime = performance.timing.navigationStart;
    } else if (win._to && _to.start) {
        startTime = _to.start.getTime();
    }
    /**
     * Tracker: represents a tracker working on the page.
     **/
    win.Tracker = t = function() {};
    /**
     * ***********************
     * helper functions
     * ***********************
     **/
    // extend from any sources that followed target into target
    t.extend = function(target) {
        for (var i = 1, l = arguments.length; i < l; i++) {
            for (var prop in arguments[i]) {
                if (arguments[i].hasOwnProperty(prop)) {
                    target[prop] = arguments[i][prop];
                }
            }
        }
        return target;
    };
    // static member
    t.version = "1.0";
    t.debug = false;
    t.seedName = "seed";
    var abVersion, metas = doc.getElementsByTagName("meta");
    for (var i = 0, name, l = metas.length; i < l; i++) {
        name = metas[i].getAttribute("name");
        if (name && name.toLowerCase() == "abtest") {
            abVersion = metas[i].getAttribute("content");
            break;
        }
    }
    function hasACookie() {
        return /\bcna=/.test(document.cookie);
    }
    function removeArrayItem(array, item) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
                return array;
            }
        }
        return array;
    }
    var sendByImg = function(url) {
        LOST_LOGS_DATA.push(url);
        var img = new Image(1, 1), rnd_id = "_img_" + Math.random();
        //在全局变量中引用 img，防止 img 被垃圾回收机制过早回收造成请求发送失败
        window[rnd_id] = img;
        img.onload = img.onerror = img.onabort = function() {
            removeArrayItem(LOST_LOGS_DATA, url);
            var img = window[rnd_id];
            img.onload = null;
            img.onerror = null;
            img.onabort = null;
            img = null;
            window[rnd_id] = null;
        };
        img.src = url;
    };
    // addEventLister implementation
    t.dispatchEvent = function(element, eventName, handler) {
        if (element.attachEvent) {
            element.attachEvent("on" + eventName, function(e) {
                handler.call(element, e);
            });
        } else if (element.addEventListener) {
            element.addEventListener(eventName, handler, false);
        } else {
            element["on" + eventName] = function(e) {
                handler.call(element, e);
            };
        }
    };
    // resolve target of event
    t.getTarget = function(e) {
        var node = e.target || e.srcElement;
        try {
            if (node && node.nodeType === 3) {
                return node.parentNode;
            }
        } catch (ex) {}
        return node;
    };
    // send into to the server
    t.send = function(page, referrer, more) {
        if (typeof page !== "string" || !page) throw new Error("Invalid page");
        var p = {
            ref: referrer || "-",
            pg: page || "",
            r: new Date().getTime(),
            v: t.version
        }, imgSrc;
        if (abVersion) {
            p.ABTest = abVersion;
            //p.ref += (p.ref.indexOf("?")>=0 ? "&" : "?") + "ABTest="+abVersion;
            p.pg += (p.pg.indexOf("?") >= 0 ? "&" : "?") + "ABTest=" + abVersion;
        }
        more && light.extend(p, more);
        p = light.param(p);
        if (protocol != "file:" && !t.debug) {
            imgSrc = SERVER_URL + "?" + p;
            sendByImg(imgSrc);
            if (!hasACookie()) {
                p = light.param({
                    url: ACOOKIE_SERVER_URL + "?" + p
                });
                imgSrc = MMSTAT_SERVER_URL + "?" + p;
                sendByImg(imgSrc);
            }
        } else {
            light.log("Tracker debug: %s.", p);
        }
    };
    t.dispatchEvent(win, "beforeunload", function() {
        if (!window.nameStorage) {
            return;
        }
        nameStorage.setItem(REF_NAME, URL);
        //nameStorage.setItem("seed", ACTIVE_SEED);
        nameStorage.setItem(REF_UNLOAD_TIME_NAME, new Date().getTime());
        nameStorage.setItem(LOST_LOGS_NAME, LOST_LOGS_DATA.join(","));
    });
    /**
     * send domready & load time properly, send pv immediately.
     **/
    if (doc && loc) {
        // prepare param
        var url = URL, ref = doc.referrer, rnd = Math.random();
        if (window.nameStorage) {
            var refTime = Number(nameStorage.getItem(REF_UNLOAD_TIME_NAME));
            if (startTime - refTime < REF_TIMEOUT) {
                if (!ref) {
                    ref = nameStorage.getItem(REF_NAME);
                }
                var lost = nameStorage.getItem(LOST_LOGS_NAME);
                if (lost) {
                    lost = lost.split(LOST_SPLITER);
                    for (var i = 0, l = lost.length; i < l; i++) {
                        sendByImg(lost[i]);
                    }
                }
            }
            nameStorage.removeItem(REF_NAME);
            nameStorage.removeItem(REF_UNLOAD_TIME_NAME);
            nameStorage.removeItem(LOST_LOGS_NAME);
        }
        // send PV
        var p = {
            screen: "-x-",
            color: "-",
            BIProfile: "page"
        };
        // if the page in an iframe , the BIProfile is "iframe"
        if (window.parent != window) {
            p.BIProfile = "iframe";
        }
        if (win.screen) {
            p.screen = screen.width + "x" + screen.height;
            p.sc = screen.colorDepth + "-bit";
        }
        p.utmhn = loc.hostname;
        p.rnd = rnd;
        if (win.analytic_var) {
            p.ana = analytic_var;
        }
        if (light.client) {
            var info = light.client.info, os, browser, engine, device, val = "";
            os = (info.os.name || "na") + "/" + (info.os.version || [ -1 ]).join(".");
            browser = (info.browser.name || "na") + "/" + (info.browser.version || [ -1 ]).join(".");
            engine = (info.engine.name || "na") + "/" + (info.engine.version || [ -1 ]).join(".");
            device = (info.device.name || "na") + "/" + (info.device.version || [ -1 ]).join(".");
            val = os + "|" + engine + "|" + browser + "|" + device;
            p._clnt = val;
        }
        t.send(url, ref, p);
        // reset for next request
        // TODO:
        ref = url;
        p = {};
        // don't send time info if not hit
        if (!parseInt(Math.random() * SAMPLE_RATE, 10)) {
            p.BIProfile = "load";
            var ready = 0, load = 0, rest = 100;
            // remove saved ref immediately
            var readyHandler = function() {
                if (readyHandler.invoked) return;
                readyHandler.invoked = true;
                ready = (win._to && _to.ready ? _to.ready.getTime() : new Date().getTime()) - startTime;
                if (ready > MAX_READY_TIME) {
                    // invalid domready
                    loadHandler.invoked = true;
                    p.tm = "-x-";
                    t.send(url, "", p);
                }
            }, loadHandler = function() {
                if (ready > MAX_READY_TIME || loadHandler.invoked) return;
                loadHandler.invoked = true;
                // read load time if it is already determined
                load = (win._to && _to.end ? _to.end.getTime() : new Date().getTime()) - startTime;
                // override load time if performance data is available
                if (performance && performance.timing) {
                    ready = performance.timing.domContentLoadedEventStart - performance.timing.navigationStart;
                    load = performance.timing.loadEventStart - performance.timing.navigationStart;
                }
                send();
            }, send = function() {
                if (!ready) {
                    setTimeout(send, 50);
                    return;
                }
                if (ready > load) ready = load - rest;
                if (ready < 10) return;
                p.tm = "" + ready + "x" + load;
                p.rnd = rnd;
                t.send(url, "", p);
            };
            if (startTime) {
                if (win._to && _to.ready) {
                    readyHandler();
                } else {
                    if (win.YAHOO && YAHOO.util && YAHOO.util.Event) {
                        // YUI 2.x
                        YAHOO.util.Event.onDOMReady(readyHandler);
                    } else if (win.jQuery) {
                        // jQuery
                        jQuery(readyHandler);
                    } else if (win.Y && Y.on) {
                        // YUI 3.x
                        Y.on("domready", readyHandler);
                    } else {
                        readyHandler();
                    }
                }
                // if load time determined, use it
                if (win._to && _to.end) {
                    loadHandler();
                } else {
                    win.setTimeout(loadHandler, MAX_READY_TIME * 8);
                    t.dispatchEvent(win, "load", loadHandler);
                    t.dispatchEvent(win, "unload", loadHandler);
                }
            }
        }
    }
    /**
     * Tracking seed
     **/
    doc && t.dispatchEvent(doc, "mousedown", function(e) {
        var node = t.getTarget(e);
        // node resolved as object but has no property if mousedown triggered from disabled element in IE.
        if (!node || !node.nodeType) return;
        // HTML's getAttribute is not available sometimes in IE.
        // and typeof node.getAttribute not a function.
        while (node && node.nodeName != "HTML" && node.getAttribute && !node.getAttribute(t.seedName)) {
            node = node.parentNode;
        }
        if (!node || node.nodeType !== 1 || node.nodeName == "HTML") return;
        var _scType, href, match;
        if (node.nodeName === "A") {
            // http://msdn.microsoft.com/en-us/library/ms536429%28v=VS.85%29.aspx
            href = node.getAttribute("href", 2) || "";
            if (href === URL || href.indexOf(URL + "#") === 0) {
                href = "";
            }
            match = href.match(/[?&]_scType=([^&#]+)/);
            if (match) {
                _scType = {
                    _scType: match[1]
                };
            }
        }
        t.click(node.getAttribute(t.seedName), _scType);
    });
    // Lower level static method for manual click handler, designed for Ajax/Flash applications.
    t.click = function() {
        // first referer is current url
        var refs = {}, // page prefix without fragment
        base_page = URL.split("?").shift();
        var idx = base_page.indexOf(";jsessionid=");
        if (idx >= 0) {
            base_page = base_page.substr(0, idx);
        }
        refs[DEFAULT_PROFILE] = URL;
        //base_page += '?seed=';
        /**
         * 页面点击监控。
         *
         * @param {String} seedName, 埋点名称，用于位置标识，如果以英文冒号分隔，
         *  则冒号前面的部分被作为 BIProfile，冒后之后的部分作为埋点名称；否则，
         *  整个作为埋点名称。
         * @param {String} extra, 扩展的自定义参数。
         */
        return function(seedName, extra) {
            if (!seedName) return;
            // extract profile and seed name.
            var parts = seedName.split(":", 2);
            parts.length >= 2 || parts.unshift(DEFAULT_PROFILE);
            var profile = parts[0];
            seedName = parts[1];
            if (!seedName) return;
            // Fix: #1, 将 seed 参数置于最后。
            var p = [];
            if (extra) {
                p.push(light.param(extra));
            }
            p.push("seed=" + encodeURIComponent(seedName));
            p = p.join("&");
            var page = base_page + "?" + p;
            // add profile
            var param;
            if (profile) param = {
                BIProfile: profile
            };
            // issue the url...
            t.send(page, refs[profile] || URL, param);
            // refresh last seed
            refs[profile] = page;
        };
    }();
    t.log = function(seed, profile) {
        t.click((profile || "syslog") + ":" + seed);
    };
    t.error = function(seed) {
        t.click("syserr:" + seed);
    };
    // 监控统计特定 seed 的最大值、最小值、平均值、中位数等。
    t.calc = function(seed, value) {
        t.click("calc:" + seed, {
            value: value
        });
    };
    if ("function" === typeof define) {
        define("alipay/tracker/1.12.0/tracker-debug", [], function(require, exports, module) {
            module.exports = Tracker;
        });
    }
}(this);
