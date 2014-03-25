define("alipay/message-panel/1.0.1/message-panel-debug", [ "./message-panel-debug.css", "arale/popup/1.1.5/popup-debug", "$-debug", "arale/overlay/1.1.3/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/templatable/0.9.2/templatable-debug", "gallery/handlebars/1.0.2/handlebars-debug", "./message-panel-debug.handlebars" ], function(require, exports, module) {
    require("./message-panel-debug.css");
    // 闹钟动画css，为了防止被styleBox添加外层class，这里单独定义
    seajs.importStyle("@-moz-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@-webkit-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@-o-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@-ms-keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}@keyframes spaceboots{1%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}2%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}3%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}4%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}5%{-webkit-transform:rotate(8deg);-moz-transform:rotate(8deg);-o-transform:rotate(8deg);-ms-transform:rotate(8deg);transform:rotate(8deg)}6%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}7%{-webkit-transform:rotate(-8deg);-moz-transform:rotate(-8deg);-o-transform:rotate(-8deg);-ms-transform:rotate(-8deg);transform:rotate(-8deg)}8%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}}.message-clock-animate{-webkit-animation:spaceboots 5s infinite;-moz-animation:spaceboots 5s infinite;-o-animation:spaceboots 5s infinite;-ms-animation:spaceboots 5s infinite;animation:spaceboots 5s infinite;display:block}.message-clock-animate:hover{-webkit-animation:none;-moz-animation:none;-o-animation:none;-ms-animation:none;animation:none;text-decoration:none}");
    var Popup = require("arale/popup/1.1.5/popup-debug"), $ = require("$-debug"), Templatable = require("arale/templatable/0.9.2/templatable-debug"), // Tip = require("tip"), 
    Position = require("arale/position/1.0.1/position-debug");
    var MessagePanel = Popup.extend({
        Implements: Templatable,
        templateHelpers: {
            spec_tag: function(str) {
                return MessagePanel.tagFilter(str, this.allowTag);
            }
        },
        attrs: {
            personalServer: !!window.GLOBAL && GLOBAL.system && GLOBAL.system.personalServer || "https://lab.alipay.com/",
            couriercoreServer: !!window.GLOBAL && GLOBAL.system && GLOBAL.system.couriercoreServer || "https://xiaoxi.alipay.com/",
            // 获取消息数量接口 
            apiCount: "{personalServer}/user/msgcenter/getMsgInfosNew.json",
            // 获取消息列表接口 
            apiList: "{couriercoreServer}/messager/getNewMsg.json",
            // 设置已读和忽略接口 
            apiModify: "{couriercoreServer}/messager/modifyMsgStatus.json",
            // 查看全部消息
            viewAll: "{couriercoreServer}/messager/new.htm",
            model: {},
            template: require("./message-panel-debug.handlebars"),
            showEmergencyMsg: false,
            // 用来记录消息数量，和闹钟状态
            messageSummary: {},
            allowTag: [ "br", "a" ],
            align: {
                value: {
                    baseXY: [ "50%", 0 ],
                    selfXY: [ "50%", 0 ]
                }
            },
            // effect: "fade", 
            duration: 500,
            triggerType: "hover",
            zIndex: 101
        },
        initialize: function(config) {
            // superclass init 
            MessagePanel.superclass.initialize.call(this, config);
            // 捕获ajax请求异常
            this.on("messageError", function(stat, type) {
                if (type == "list") {
                    if (stat == "deny") {
                        this.set("model", {
                            denyMsg: true,
                            errorMsg: true
                        });
                    } else if (stat == "fail") {
                        this.set("model", {
                            failMsg: true,
                            errorMsg: true
                        });
                    }
                    this.renderPartial(".message-panel");
                }
            });
            // 获取消息数量 
            this.getMessageCount();
            this.before("show", function() {
                var model = this.get("model");
                if ("emptyMsg" in model && model.emptyMsg) {
                    return false;
                }
                if (this.get("_visible")) {
                    return false;
                }
                this.set("_visible", true);
            });
            this.after("show", function() {
                // 展开面板后，先请求数据
                this._getMessageList();
                // 调整tip位置
                this._adjustUI();
                // 执行动画效果
                this._processDragDown();
            });
            // 隐藏时增加动画
            this.before("hide", this._hideAnimated);
            // 动画结束后做些补丁工作
            this.on("animated", this._onAnimated);
            // 如果消息为0时，跳转到消息中心
            var that = this;
            this.get("trigger").on("click", function(ev) {
                if (that.get("messageSummary").total > 0) ev.preventDefault();
            });
        },
        events: {
            "mouseover .message-panel-list tr": function(e) {
                $("td", e.currentTarget).addClass("message-panel-item-hover");
            },
            "mouseout .message-panel-list tr": function(e) {
                $("td", e.currentTarget).removeClass("message-panel-item-hover");
            },
            "click .message-panel-list .message-panel-delete a": function(ev) {
                ev.preventDefault();
            },
            "click .message-emergency-delete": function(ev) {
                ev.preventDefault();
            },
            "click .message-emergency a": function(ev) {
                // 点击链接或点击x，将消息置为已处理
                this.setMessageStatus($(ev.currentTarget).data("id"), "2");
                this._emergencyMsgDeleted = true;
                // 删除model中的数据
                var model = this.get("model");
                model.emergencyMsg = false;
                this.set("model", model);
                this.set("messageSummary", {
                    total: this.get("messageSummary").total - 1
                });
                this.hide();
            },
            "click .message-panel-list a": "_processDelete",
            "click .message-panel-toggle": function(ev) {
                this.hide();
            },
            "transitionend .message-panel": "_onAnimated",
            "webkitTransitionEnd .message-panel": "_onAnimated"
        },
        _onChangeModel: function(data) {
            var unread = 0, total = 0;
            if (!!data && "msgList" in data) {
                // 只有当msgList存在时才重新统计数量
                $(data.msgList).each(function(i, msg) {
                    if (msg.status == "0") {
                        unread++;
                    }
                    // 只要不是已处理，就计入显示条数
                    if (msg.status != "2") {
                        total++;
                    }
                });
                this.set("messageSummary", {
                    total: total,
                    unread: unread
                });
                // 数量为空时显示数量为空
                if (total == 0) {
                    data.errorMsg = true;
                    data.emptyMsg = true;
                    data.msgList = null;
                } else {
                    data.errorMsg = false;
                    data.emptyMsg = false;
                }
                return data;
            }
        },
        /**
         * 消息数量辩护，统一修改messageSummary
         * 只在此触发 messageChange 事件
         */
        _onChangeMessageSummary: function(stat, me) {
            // 允许参数只传入数量或未读状态
            if (typeof stat.total == "undefined") stat.total = this.get("messageSummary").total;
            if (typeof stat.unread == "undefined") stat.unread = this.get("messageSummary").unread;
            // 通知入口变更
            var argc = {
                total: stat.total < 0 ? 0 : stat.total,
                unread: stat.total > 0 && stat.unread
            };
            // 重设自己
            this.trigger("messageChange", argc);
            return argc;
        },
        /**
         * 处理为已读
         */
        _processRead: function(e) {
            var ids = [], model_after = [];
            // model_after 用来记录jsonp处理完后，需要处理的消息指针
            var model = this.get("model");
            !!model && "msgList" in model && $(model.msgList).each(function(i, msg) {
                if ("status" in msg && msg.status * 1 == 0) {
                    ids.push(msg.id);
                    model_after.push(msg);
                }
            });
            var that = this;
            this.setMessageStatus(ids, "1", function() {
                // 处理成功后将 model 内未读重置为已读
                $(model_after).each(function(i, msg) {
                    msg.status = "1";
                });
                // 触发changeModel
                that.set("model", model);
            });
        },
        /**
         * 处理删除
         */
        _processDelete: function(e) {
            var that = this;
            // 判断是否可删除
            if ($(e.currentTarget).data("delete")) {
                this.setMessageStatus($(e.currentTarget).data("id"), "2", function(id) {
                    this.$("#J-msg-delete-" + id).remove();
                    // 让 messagelist 适应table的高度，让IE6达到max-height的效果，好恶心
                    if (this.$("table").height() < 348) {
                        this.$(".message-panel-list").height(this.$("table").height());
                        this._setPosition();
                    }
                    var model = that.get("model");
                    $(model.msgList).each(function(i, msg) {
                        if (msg.id == id) {
                            msg.status = "2";
                            // 下次模板渲染的时候就不显示了
                            msg.deleted = true;
                            return false;
                        }
                    });
                    // 修改model
                    that.set("model", model);
                    // 消息为空时
                    if (that.get("messageSummary").total == 0) {
                        that.renderPartial(".message-panel");
                    }
                });
            }
        },
        _transitionEnabled: function(ele) {
            var style = ele.style;
            return "transition" in style || "webkitTransition" in style || "WebkitTransition" in style || "mozTransition" in style || "MozTransition" in style || "oTransition" in style || "OTransition" in style || "msTransition" in style || "MsTransition" in style;
        },
        /**
         * do transition animate.
         * @param `isShow` 显示还是隐藏？
         */
        _processDragDown: function() {
            // 动画效果，执行场景：message-panel存在 并且 浏览器支持css3动画，
            // 并且 当前是loading状态或者当前面板没显示的时候才执行动画
            if (!!this.$(".message-panel")[0] && this._transitionEnabled(this.element[0]) && this.get("_visible") == true) {
                // 弹出
                this._transitionAnimate(true);
                this.set("visible", true);
            } else if (!this._transitionEnabled(this.element[0])) {
                this.$(".message-panel").css("visibility", "visible");
            }
        },
        _transitionAnimate: function(isShow) {
            var that = this;
            this.element.css("display", "block");
            var _height = this.$(".message-panel").height() + this.$(".message-panel-toggle").height();
            // this.element.height(_height);
            this.$(".message-panel").css({
                top: isShow ? _height * -1 : 0
            });
            // 执行动画
            setTimeout(function() {
                // 激活动画
                that._cssTransition(that.$(".message-panel").css({
                    visibility: "visible",
                    top: isShow ? 0 : _height * -1
                }), "top " + that.get("duration") / 1e3 + "s ease-in-out");
            }, 0);
        },
        _cssTransition: function(ele, code) {
            ele.css({
                transition: code,
                "-webkit-transition": code,
                "-moz-transition": code,
                "-o-transition": code,
                "-ms-transition": code
            });
        },
        _hideAnimated: function() {
            this.set("_visible", false);
            // 动画效果
            if (!!this.$(".message-panel")[0] && this._transitionEnabled(this.element[0]) && this.element.css("display") == "block") {
                this._transitionAnimate(false);
                return false;
            }
        },
        _onAnimated: function() {
            if (this.$(".message-panel")[0] && this.$(".message-panel").position().top < 0) {
                this.set("visible", false);
            }
        },
        /** 
         * 替换 {xxx} 为对应值 
         */
        _urlRender: function(url) {
            var that = this;
            if (!url) return url;
            return url.replace(/\{(.*?)\}/g, function(pat, key, pos, orig) {
                return !!that.get(key) ? that.get(key) : "";
            });
        },
        show: function() {
            // 添加查看全部消息链接；
            var model = this.get("model");
            model.viewAll = this._urlRender(this.get("viewAll"));
            // 给外层加上padding，以容纳显示阴影效果
            this.element.css({
                padding: "0 10px 25px 10px",
                overflow: "hidden"
            });
            if (this.get("messageSummary").total == 0) return false;
            this.renderPartial();
            return MessagePanel.superclass.show.call(this);
        },
        // 重新矫正 poptip 的位置
        _adjustUI: function() {
            var that = this;
            // ie6 的max-height
            if (this.$(".message-panel-list").height() > 348) {
                this.$(".message-panel-list").height(348);
                this._setPosition();
            }
            // 矫正tips
            MessagePanel.adjustContentTip(this.element);
        },
        /** 
         * 获取消息数量方法实现 
         * event: messageChange 
         */
        getMessageCount: function(force) {
            var that = this, model = this.get("model");
            if (!!model && !!model.msgList) return;
            // 有数据了就不请求服务器，直接返回
            $.ajax({
                url: this._urlRender(this.get("apiCount")),
                jsonpCallback: "callback",
                // 主要是模拟json测试用 
                jsonp: "_callback",
                dataType: "jsonp",
                success: function(rsp) {
                    if (rsp.stat != "ok") return that.trigger("messageError", rsp.stat, "count");
                    /** 
                     * 将消息条数和是否已读广播出去 
                     * 参数： 
                     * total - 全部消息数量； 
                     * unread - 是否存在未读消息； 
                     */
                    var argc = {
                        total: rsp.totalCount || 0,
                        unread: rsp.isRead == false || rsp.isRead == "false"
                    };
                    that.set("messageSummary", argc);
                    // 处理紧急消息 
                    if (that.get("showEmergencyMsg") && !!rsp.popMsg && rsp.infos.length > 0) {
                        // 因为紧急消息一个页面仅需弹一次，所以这里条件满足后，将showEmergencyMsg手动置为false 
                        that.set("showEmergencyMsg", false);
                        // 弹出浮层
                        that._showEmergencyMsg(rsp.infos[0]);
                    }
                }
            });
        },
        _getMessageList: function() {
            var model = this.get("model");
            // 消息数量为0时，不请求数据，也不展开面板
            if (this.get("messageSummary").total == 0) return false;
            // 紧急消息还没删，或者msgList已经存在，不要去请求message list
            if (!this._emergencyMsgDeleted || !!model && !!model.msgList) {
                return true;
            }
            // 失败和登录超时用户重试时也需要重新抓取数据
            if (!!model && !model.emergencyMsg || !!model.errorMsg) {
                var that = this;
                $.ajax({
                    url: this._urlRender(this.get("apiList")),
                    jsonpCallback: "callback",
                    jsonp: "_callback",
                    dataType: "jsonp",
                    success: function(rsp) {
                        if (rsp.stat != "ok") return that.trigger("messageError", rsp.stat, "list");
                        /**
                         * 对获取的数据做一些处理：
                         * 1. 是否为当前进度节点
                         * 2. 失败节点上的提示
                         * 3. 是否为 9 优先级的消息；
                         */
                        var msgList = rsp.info;
                        // 1. 是否为当前进度节点
                        $(msgList).each(function(i, msg) {
                            if (msg.appearance == 1) {
                                var cur_step;
                                $(msg.stepList).each(function(k, step) {
                                    if (step.stepOrder == msg.currentStep) {
                                        step.isCurrentStep = true;
                                        // 当前节点是否错误节点
                                        if (!msg.correct) {
                                            step.isFailStep = true;
                                        }
                                        cur_step = step;
                                        return false;
                                    } else {
                                        // 如果是不是当前节点，那之前的节点也应该是绿色
                                        step.isHistoryStep = true;
                                    }
                                });
                                // 2. 处理是否需要显示备注提示
                                if (!!cur_step) msg.contentTip = cur_step.content || "";
                                // 计算节点数
                                msg.stepLength = msg.stepList.length;
                            }
                            // 3. 是否为 9 优先级的消息；
                            msg.isEmergency = msg.priority * 1 == 9;
                            // 把allowTag给附加进去
                            msg.allowTag = that.get("allowTag");
                        });
                        model.msgList = msgList;
                        that.set("model", model);
                        that.renderPartial(".message-panel");
                        that.$(".message-panel").css("visibility", "visible");
                        // 调整Tip
                        that._adjustUI();
                        // 未读处理为已读
                        that._processRead();
                    }
                });
            }
        },
        /** 
         * 设置消息为已读
         *
         * 未读消息标识：0
         * 已读消息标识：1
         * 已处理消息标识：2
         */
        setMessageStatus: function(ids, status, callback) {
            if (!ids || ids.length == 0) return;
            var data = {
                status: status,
                ids: ids instanceof Array ? ids.join(",") : ids
            };
            var that = this;
            $.ajax({
                url: this._urlRender(this.get("apiModify")),
                data: data,
                jsonpCallback: "callback",
                jsonp: "_callback",
                dataType: "jsonp",
                success: function(rsp) {
                    if (rsp.stat != "ok") return that.trigger("messageError", rsp.stat, "modify");
                    if (typeof callback == "function") callback.call(that, ids);
                }
            });
        },
        _emergencyMsgDeleted: true,
        _showEmergencyMsg: function(msg) {
            var that = this, model = this.get("model") || {};
            if ("content" in msg && msg.content.length == 0) return;
            // 兼容老数据，这里如果content内容为空，不弹出消息
            if (msg.content.length + msg.title.length > 42) {
                msg.content = msg.content.substr(0, 41 - msg.title.length) + "...";
            }
            model.emergencyMsg = msg;
            this.set("model", model);
            this._emergencyMsgDeleted = false;
            this.before("hide", function() {
                // 如果不是用户点删除按钮，阻止掉关闭动作
                if (!this._emergencyMsgDeleted) {
                    return false;
                }
            });
            this.show();
        }
    });
    /**
     * 静态方法：矫正错误提示，消息中心首页也能用
     */
    MessagePanel.adjustContentTip = function(baseElement) {
        // 如果当前元素display为none，可能到只获取不到正确的position，所以在这里直接返回
        if ("width" in $(baseElement) && !$(baseElement).width()) return;
        $(baseElement).find(".ui-poptip").each(function(i, e) {
            var cur_node = $(".message-step-current .message-step-point", e.parentNode);
            if (typeof cur_node[0] == "undefined") return;
            // 重新设置max-width，避免超限而被重新渲染
            var _w = $(e.parentNode).width() - 93;
            // 考虑到恶心的ie6，还是老老实实用js写判断
            if ($(e).width() > _w) {
                $(e).width(_w);
            }
            // 重新叫placeholder高度设置得跟tip高度一样
            $(".message-step-fail-placeholder", e.parentNode).height($(e).height());
            Position.pin(e, {
                element: cur_node,
                x: "100%-" + ($(e).width() - 12) + "px",
                y: "100%-" + ($(e).height() + 28) + "px"
            });
            // 如果超过界限，自动转换为向右展开箭头7点钟方向
            var _h = $(e).height();
            if ($(e).position().left < -12) {
                $(".ui-poptip-arrow", e).removeClass("ui-poptip-arrow-5").addClass("ui-poptip-arrow-7");
                // 先调整宽度为当前位置剩余的宽度
                _w = $(e.parentNode).width() - cur_node.position().left;
                if ($(e).width() > _w) {
                    $(e).width(_w);
                }
                // 重新叫placeholder高度设置得跟tip高度一样
                $(".message-step-fail-placeholder", e.parentNode).height($(e).height());
                Position.pin(e, {
                    element: $(".message-step-current .message-step-point", e.parentNode),
                    x: "-10px",
                    y: "100%-" + ($(e).height() + 28) + "px"
                });
            }
        });
    };
    /**
     * 静态方法：替换不允许的标签，消息中心页面用得到
     */
    MessagePanel.tagFilter = function(str, tags) {
        var tags = "(" + tags.join("|") + ")";
        if (typeof str != "string") return;
        return str.replace(/<[\/]?([a-z]+)[ ]?[^<]*[\/]?>/gi, function(match, tag) {
            if (!tag.match(new RegExp(tags, "i"))) {
                return match.replace("<", "&lt;").replace(">", "&gt;");
            }
            return match;
        });
    };
    module.exports = MessagePanel;
    module.exports.outerBoxClass = "alipay-message-panel-1_0_1";
});

define("alipay/message-panel/1.0.1/message-panel-debug.css", [], function() {
    seajs.importStyle(".alipay-message-panel-1_0_1 table,.alipay-message-panel-1_0_1 tr,.alipay-message-panel-1_0_1 td,.alipay-message-panel-1_0_1 h3,.alipay-message-panel-1_0_1 h4,.alipay-message-panel-1_0_1 .message-panel p{margin:0;padding:0;border-spacing:0}.alipay-message-panel-1_0_1 .ui-poptip{float:left}.alipay-message-panel-1_0_1 .ui-poptip-box{margin-left:0;min-height:0;_height:auto}.alipay-message-panel-1_0_1 .message-panel{width:842px;border:1px solid #b4b4b4;border-top:0;background:#fafafa;border-radius:0 0 5px 5px;box-shadow:0 6px 10px #999;font-size:12px;line-height:18px;font-family:tahoma,arial,'Hiragino Sans GB','Microsoft Yahei','\\u5B8B\\u4F53';position:relative;visibility:hidden}.alipay-message-panel-1_0_1 .message-panel-container{zoom:1}.alipay-message-panel-1_0_1 .message-panel-title,.alipay-message-panel-1_0_1 .message-panel-viewall{background:#edf0f7;color:#647892;font-size:13px;font-weight:bolder;padding:8px 20px;margin:0}.alipay-message-panel-1_0_1 .message-panel-toggle{width:90px;height:25px;overflow:hidden;text-align:center;position:absolute;margin-left:376px}.alipay-message-panel-1_0_1 .message-panel-toggle .iconfont-back{display:block;line-height:78px;font-size:76px;margin:0 auto;top:-58px;position:relative;cursor:pointer;color:#fc6621;text-shadow:0 3px 10px #999}.alipay-message-panel-1_0_1 .message-panel-toggle .iconfont-fold{position:relative;display:block;width:100%;text-align:center;float:left;margin-top:-80px;color:#fff;font-size:12px;line-height:16px;cursor:pointer}.alipay-message-panel-1_0_1 .message-panel-list{overflow:auto;overflow-x:hidden;max-height:348px;width:100%;position:relative;border-top:1px solid #e2e2e2;border-bottom:1px solid #e2e2e2}.alipay-message-panel-1_0_1 .message-panel-list table{margin-top:-1px}.alipay-message-panel-1_0_1 .message-panel-list a{color:#4c4c4c;text-decoration:none}.alipay-message-panel-1_0_1 .message-panel-list a:hover{text-decoration:underline}.alipay-message-panel-1_0_1 .message-panel-list td{padding:11px 15px 10px 20px;vertical-align:middle;border-top:1px solid #e2e2e2}.alipay-message-panel-1_0_1 .message-panel-item-content{position:relative;zoom:1}.alipay-message-panel-1_0_1 .message-panel-list .message-panel-item-hover{background:#f2f2f2}.alipay-message-panel-1_0_1 .message-panel-item-title{border-right:1px dotted #c8c8c8;color:#9a9a9a;width:21%}.alipay-message-panel-1_0_1 .message-panel-item-title h4{font-weight:bolder;font-size:14px;color:#353034;line-height:23px}.alipay-message-panel-1_0_1 .message-panel-item-title p{padding-bottom:3px}.alipay-message-panel-1_0_1 .ui-msgpael-warn,.alipay-message-panel-1_0_1 .ui-msgpael-warn a{font-weight:bolder;color:#e10a1f}.alipay-message-panel-1_0_1 .message-panel-viewall{text-align:right;-moz-border-radius:0 0 3px 3px;-webkit-border-radius:0 0 3px 3px;border-radius:0 0 3px 3px}.alipay-message-panel-1_0_1 .message-panel-viewall a{color:#1589cd;font-weight:400;font-size:12px}.alipay-message-panel-1_0_1 table tr td .message-panel-delete{vertical-align:50%;float:right;width:18px;height:18px;line-height:18px;overflow:hidden;display:none;margin-top:-9px;position:absolute;right:3px;top:50%}.alipay-message-panel-1_0_1 a.message-panel-detail{color:#1589ca;float:right;margin:-10px 10px 0 0;top:50%;position:absolute;right:23px;z-index:100}.alipay-message-panel-1_0_1 .message-panel-delete a.iconfont{font-size:18px;color:#ccc;text-decoration:none;cursor:pointer}.alipay-message-panel-1_0_1 .message-panel .message-panel-delete a.iconfont:hover{color:#666;text-decoration:none}.alipay-message-panel-1_0_1 table tr td.message-panel-item-hover .message-panel-delete{display:block}.alipay-message-panel-1_0_1 .message-panel .fn-clear{zoom:1}.alipay-message-panel-1_0_1 .message-panel .fn-clear:before,.alipay-message-panel-1_0_1 .message-panel .fn-clear:after{content:\"\";display:table}.alipay-message-panel-1_0_1 .message-panel .fn-clear:after{clear:both}.alipay-message-panel-1_0_1 .message-step{padding:18px 50px 10px 20px}.alipay-message-panel-1_0_1 .message-step-item{width:250px;border-top:2px solid #999;color:#999;float:left}.alipay-message-panel-1_0_1 .message-step-2{width:476px}.alipay-message-panel-1_0_1 .message-step-3{width:238px}.alipay-message-panel-1_0_1 .message-step-4{width:158px}.alipay-message-panel-1_0_1 .message-step-5{width:119px}.alipay-message-panel-1_0_1 .message-step-point{width:25px;height:30px;overflow:hidden;position:relative;left:10px;text-align:center;margin-top:-19px;font-size:25px;line-height:30px;_line-height:32px;float:right}.alipay-message-panel-1_0_1 .message-step-desc{width:66%;position:relative;left:67%;text-align:center;line-height:14px;padding-top:2px;clear:both}.alipay-message-panel-1_0_1 .message-step-title{display:block}.alipay-message-panel-1_0_1 .message-step-first{width:20px;border-top:0;padding-top:2px;*overflow:hidden}.alipay-message-panel-1_0_1 .message-step-first .message-step-desc{width:100px;left:-35px}.alipay-message-panel-1_0_1 .message-step-current{border-color:#b9d384;color:#b9d384}.alipay-message-panel-1_0_1 .message-step-done{border-color:#b9d384;color:#999}.alipay-message-panel-1_0_1 .message-step-done .message-step-point{color:#b9d384}.alipay-message-panel-1_0_1 .message-step-fail{border-color:#fd985a;color:#fc6521}.alipay-message-panel-1_0_1 .message-step-fail .message-step-point{color:#fd985a}.alipay-message-panel-1_0_1 .message-step-date{color:#999;font-size:11px;line-height:12px}.alipay-message-panel-1_0_1 .message-step-pointmask{font-size:9px;position:relative;top:-19px}.alipay-message-panel-1_0_1 .message-step-fail-placeholder{line-height:30px;height:30px;visibility:hidden;overflow:hidden}.alipay-message-panel-1_0_1 .message-emergency{background:#fb6720;padding:6px 10px;border-top:1px solid #d6561a;color:#fff;font-size:12px;border-radius:0 0 3px 3px;box-shadow:0 2px 6px #666;line-height:20px;width:580px}.alipay-message-panel-1_0_1 .message-emergency a,.alipay-message-panel-1_0_1 .message-emergency span{color:#fff;text-decoration:none;float:left}.alipay-message-panel-1_0_1 .message-emergency a:hover{text-decoration:underline}.alipay-message-panel-1_0_1 .message-emergency em{font-size:13px;font-weight:700;font-style:normal;margin-right:16px;float:left}.alipay-message-panel-1_0_1 .message-emergency .message-emergency-delete{font-size:12px;margin-left:10px;float:right}.alipay-message-panel-1_0_1 .message-emergency .message-emergency-delete .iconfont{cursor:pointer}.alipay-message-panel-1_0_1 .message-emergency .message-emergency-delete:hover{text-shadow:0 0 3px #fff;text-decoration:none}.alipay-message-panel-1_0_1 .ui-poptip{color:#DB7C22;z-index:101;font-size:12px;line-height:1.5;zoom:1}.alipay-message-panel-1_0_1 .ui-poptip-shadow{background-color:rgba(229,169,107,.15);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#26e5a96b, endColorstr=#26e5a96b);border-radius:2px;padding:2px;zoom:1;_display:inline}.alipay-message-panel-1_0_1 .ui-poptip-container{position:relative;background-color:#FFFCEF;border:1px solid #ffbb76;border-radius:2px;padding:5px 15px;zoom:1;_display:inline}.alipay-message-panel-1_0_1 .ui-poptip:after,.alipay-message-panel-1_0_1 .ui-poptip-shadow:after,.alipay-message-panel-1_0_1 .ui-poptip-container:after{visibility:hidden;display:block;font-size:0;content:\" \";clear:both;height:0}.alipay-message-panel-1_0_1 a.ui-poptip-close{position:absolute;right:3px;top:3px;border:1px solid #ffc891;text-decoration:none;border-radius:3px;width:12px;height:12px;font-family:tahoma;color:#dd7e00;line-height:10px;*line-height:12px;text-align:center;font-size:14px;background:#ffd7af;background:-webkit-gradient(linear,left top,left bottom,from(#FFF0E1),to(#FFE7CD));background:-moz-linear-gradient(top,#FFF0E1,#FFE7CD);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF0E1', endColorstr='#FFE7CD');background:-o-linear-gradient(top,#FFF0E1,#FFE7CD);background:linear-gradient(top,#FFF0E1,#FFE7CD);overflow:hidden}.alipay-message-panel-1_0_1 a.ui-poptip-close:hover{border:1px solid #ffb24c;text-decoration:none;color:#dd7e00;background:#ffd7af;background:-webkit-gradient(linear,left top,left bottom,from(#FFE5CA),to(#FFCC98));background:-moz-linear-gradient(top,#FFE5CA,#FFCC98);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFE5CA', endColorstr='#FFCC98');background:-o-linear-gradient(top,#FFE5CA,#FFCC98);background:linear-gradient(top,#FFE5CA,#FFCC98)}.alipay-message-panel-1_0_1 .ui-poptip-arrow{position:absolute;z-index:10;*zoom:1}.alipay-message-panel-1_0_1 .ui-poptip-arrow em,.alipay-message-panel-1_0_1 .ui-poptip-arrow span{position:absolute;*zoom:1;width:0;height:0;border-color:rgba(255,255,255,0);border-color:transparent\\0;*border-color:transparent;_border-color:tomato;_filter:chroma(color=tomato);border-style:solid;overflow:hidden;top:0;left:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-10{left:-6px;top:10px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-10 em{top:0;left:-1px;border-right-color:#ffbb76;border-width:6px 6px 6px 0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-10 span{border-right-color:#FFFCEF;border-width:6px 6px 6px 0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-2{top:10px;right:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-2 em{top:0;left:1px;border-left-color:#ffbb76;border-width:6px 0 6px 6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-2 span{border-left-color:#FFFCEF;border-width:6px 0 6px 6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-11 em,.alipay-message-panel-1_0_1 .ui-poptip-arrow-1 em{border-width:0 6px 6px;border-bottom-color:#ffbb76;top:-1px;left:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-11 span,.alipay-message-panel-1_0_1 .ui-poptip-arrow-1 span{border-width:0 6px 6px;border-bottom-color:#FFFCEF}.alipay-message-panel-1_0_1 .ui-poptip-arrow-11{left:14px;top:-6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-1{right:28px;top:-6px}.alipay-message-panel-1_0_1 .ui-poptip-arrow-5 em,.alipay-message-panel-1_0_1 .ui-poptip-arrow-7 em{border-width:6px 6px 0;border-top-color:#ffbb76;top:1px;left:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-5 span,.alipay-message-panel-1_0_1 .ui-poptip-arrow-7 span{border-width:6px 6px 0;border-top-color:#FFFCEF}.alipay-message-panel-1_0_1 .ui-poptip-arrow-5{right:28px;bottom:0}.alipay-message-panel-1_0_1 .ui-poptip-arrow-7{left:14px;bottom:0}:root .alipay-message-panel-1_0_1 .ui-poptip-shadow{FILTER:none\\9}.alipay-message-panel-1_0_1 .ui-poptip-blue{color:#4d4d4d}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-shadow{background-color:rgba(0,0,0,.05);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000)}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-container{background-color:#F8FCFF;border:1px solid #B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-10 em{border-right-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-11 em,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-1 em{border-bottom-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-2 em,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-4 em{border-left-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-5 em,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-7 em{border-top-color:#B9C8D3}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-10 span{border-right-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-11 span,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-1 span{border-bottom-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-2 span,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-4 span{border-left-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-5 span,.alipay-message-panel-1_0_1 .ui-poptip-blue .ui-poptip-arrow-7 span{border-top-color:#F8FCFF}.alipay-message-panel-1_0_1 .ui-poptip-white{color:#333}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-shadow{background-color:rgba(0,0,0,.05);FILTER:progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000)}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-container{background-color:#fff;border:1px solid #b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-10 em{border-right-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-11 em,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-1 em{border-bottom-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-2 em,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-4 em{border-left-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-5 em,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-7 em{border-top-color:#b1b1b1}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-10 span{border-right-color:#fff}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-11 span,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-1 span{border-bottom-color:#fff}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-2 span,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-4 span{border-left-color:#fff}.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-5 span,.alipay-message-panel-1_0_1 .ui-poptip-white .ui-poptip-arrow-7 span{border-top-color:#fff}.alipay-message-panel-1_0_1 .ui-loading{width:50px;height:50px;background-repeat:no-repeat;background-image:url('data:image/gif;base64,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');*background-image:url(https://i.alipayobjects.com/e/201305/M9UQl3TuH.gif);text-align:center;line-height:50px;font-size:11px;color:#777}");
});

define("alipay/message-panel/1.0.1/message-panel-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing;
        function program1(depth0, data) {
            var buffer = "", stack1, stack2;
            buffer += '\n<div class="message-emergency fn-clear">\n    <a href="#delete" data-id="' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.id), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + '" class="message-emergency-delete" target="_blank"><i class="iconfont" title="关闭">&#xF028;</i></a>\n    <em>' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.title), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "</em> ";
            stack2 = helpers.unless.call(depth0, (stack1 = depth0.emergencyMsg, stack1 == null || stack1 === false ? stack1 : stack1.url), {
                hash: {},
                inverse: self.noop,
                fn: self.program(2, program2, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += " ";
            stack2 = helpers["if"].call(depth0, (stack1 = depth0.emergencyMsg, stack1 == null || stack1 === false ? stack1 : stack1.url), {
                hash: {},
                inverse: self.noop,
                fn: self.program(4, program4, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += " \n<div>\n";
            return buffer;
        }
        function program2(depth0, data) {
            var buffer = "", stack1;
            buffer += "<span>" + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, stack1 == null || stack1 === false ? stack1 : stack1.content), 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "</span>";
            return buffer;
        }
        function program4(depth0, data) {
            var buffer = "", stack1;
            buffer += '<a href="' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.url), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + '" data-id="' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.id), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + '" target="_blank">' + escapeExpression((stack1 = (stack1 = depth0.emergencyMsg, 
            stack1 == null || stack1 === false ? stack1 : stack1.content), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "</a>";
            return buffer;
        }
        function program6(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n<div class="message-panel">\n    <div class="message-panel-container">\n        <h3 class="message-panel-title">消息</h3>\n        <div class="message-panel-list">\n            <table width="100%">\n                <tbody>\n                    ';
            stack1 = helpers.unless.call(depth0, depth0.msgList, {
                hash: {},
                inverse: self.noop,
                fn: self.program(7, program7, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            stack1 = helpers.each.call(depth0, depth0.msgList, {
                hash: {},
                inverse: self.noop,
                fn: self.program(17, program17, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += '\n                </tbody>\n            </table>\n        </div>\n        <div class="message-panel-viewall">\n            <a href="';
            if (stack1 = helpers.viewAll) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.viewAll;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" target="_blank" seed="msg-whole-detail-v1">查看全部消息 <i class="iconfont">&#xF036;</i></a>\n        </div>\n    </div>\n    <div class="message-panel-toggle fn-clear" seed="msg-fold"><i class="iconfont iconfont-back" title="收起">&#xF044;</i><i class="iconfont iconfont-fold" title="收起">&#xF03B;</i></div>\n</div>\n';
            return buffer;
        }
        function program7(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                    <tr>\n                        <td align="center">\n                            ';
            stack1 = helpers["if"].call(depth0, depth0.errorMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(8, program8, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            stack1 = helpers.unless.call(depth0, depth0.errorMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(15, program15, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                        </td>\n                    </tr>\n                    ";
            return buffer;
        }
        function program8(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                            ";
            stack1 = helpers["if"].call(depth0, depth0.denyMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(9, program9, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            stack1 = helpers["if"].call(depth0, depth0.failMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(11, program11, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            stack1 = helpers["if"].call(depth0, depth0.emptyMsg, {
                hash: {},
                inverse: self.noop,
                fn: self.program(13, program13, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            ";
            return buffer;
        }
        function program9(depth0, data) {
            return "\n                            <div>登录超时，请登录后重试。</div>\n                            ";
        }
        function program11(depth0, data) {
            return "\n                            <div>加载失败，请重试。</div>\n                            ";
        }
        function program13(depth0, data) {
            return '\n                            <div>\n                               <img src="https://i.alipayobjects.com/e/201310/1HC4IMqPGJ.png" width="80" height="75" alt="没有新消息" align="absmiddle"> &nbsp;&nbsp;&nbsp; 没有发现新消息。\n                            </div>\n                            ';
        }
        function program15(depth0, data) {
            return '\n                            <div class="ui-loading">Loading</div>\n                            ';
        }
        function program17(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                    ";
            stack1 = helpers["if"].call(depth0, depth0.appearance, {
                hash: {},
                inverse: self.noop,
                fn: self.program(18, program18, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            stack1 = helpers.unless.call(depth0, depth0.appearance, {
                hash: {},
                inverse: self.noop,
                fn: self.program(35, program35, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            return buffer;
        }
        function program18(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                    ";
            stack1 = helpers.unless.call(depth0, depth0.deleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(19, program19, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            return buffer;
        }
        function program19(depth0, data) {
            var buffer = "", stack1, stack2, options;
            buffer += '\n                    <tr id="J-msg-delete-';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '">\n                        <td class="message-panel-item-title">\n                            <h4>';
            if (stack1 = helpers.title) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.title;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</h4>\n                            <p>";
            options = {
                hash: {},
                data: data
            };
            stack2 = (stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.content, options) : helperMissing.call(depth0, "spec_tag", depth0.content, options));
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '</p>\n                        </td>\n                        <td>\n                            <div class="message-panel-item-content">\n                                ';
            stack2 = helpers["if"].call(depth0, depth0.canDeleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(20, program20, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "\n                                ";
            stack2 = helpers["if"].call(depth0, depth0.url, {
                hash: {},
                inverse: self.noop,
                fn: self.program(22, program22, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "\n                                ";
            stack2 = helpers["if"].call(depth0, depth0.contentTip, {
                hash: {},
                inverse: self.noop,
                fn: self.program(24, program24, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '\n                                <div class="message-step fn-clear">\n                                    ';
            stack2 = helpers.each.call(depth0, depth0.stepList, {
                hash: {},
                inverse: self.noop,
                fn: self.programWithDepth(26, program26, data, depth0),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "\n                                </div>\n                            </div>\n                        </td>\n                    </tr>\n                    ";
            return buffer;
        }
        function program20(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                                <div class="message-panel-delete">\n                                    <a class="iconfont" data-delete="true" data-id="';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" href="#" title="删除消息">&#xF045;</a>\n                                </div>\n                                ';
            return buffer;
        }
        function program22(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                                <a href="';
            if (stack1 = helpers.url) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.url;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-delete="';
            if (stack1 = helpers.deleteOnClick) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.deleteOnClick;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-id="';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" class="message-panel-detail" target="_blank" seed="msg-detail-v1">详情</a>\n                                ';
            return buffer;
        }
        function program24(depth0, data) {
            var buffer = "", stack1, stack2, options;
            buffer += '\n                                <div class="ui-poptip ui-poptip-yellow">\n                                    <div class="ui-poptip-shadow">\n                                        <div class="ui-poptip-container">\n                                            <div class="ui-poptip-arrow ui-poptip-arrow-5" data-role="arrow">\n                                                <em></em>\n                                                <span></span>\n                                            </div>\n                                            <div class="ui-poptip-box ui-poptip-box-text" data-role="content">\n                                                <div class="ui-poptip-text" data-role="text">';
            options = {
                hash: {},
                data: data
            };
            stack2 = (stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.contentTip, options) : helperMissing.call(depth0, "spec_tag", depth0.contentTip, options));
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '</div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div class="message-step-fail-placeholder">';
            options = {
                hash: {},
                data: data
            };
            stack2 = (stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.contentTip, options) : helperMissing.call(depth0, "spec_tag", depth0.contentTip, options));
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "</div>\n                                ";
            return buffer;
        }
        function program26(depth0, data, depth1) {
            var buffer = "", stack1, stack2;
            buffer += '\n                                    <div class="message-step-item message-step-' + escapeExpression((stack1 = depth1.stepLength, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + " ";
            stack2 = helpers.unless.call(depth0, data.index, {
                hash: {},
                inverse: self.noop,
                fn: self.program(27, program27, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            stack2 = helpers["if"].call(depth0, depth0.isHistoryStep, {
                hash: {},
                inverse: self.noop,
                fn: self.program(29, program29, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            stack2 = helpers["if"].call(depth0, depth0.isFailStep, {
                hash: {},
                inverse: self.noop,
                fn: self.program(31, program31, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            stack2 = helpers["if"].call(depth0, depth0.isCurrentStep, {
                hash: {},
                inverse: self.noop,
                fn: self.program(33, program33, data),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '">\n                                        <div class="message-step-point">&#9679;</div>\n                                        <div class="message-step-desc">\n                                            <span class="message-step-title">';
            if (stack2 = helpers.title) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.title;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            buffer += escapeExpression(stack2) + '</span>\n                                            <span class="message-step-date">';
            if (stack2 = helpers.stepTime) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.stepTime;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            buffer += escapeExpression(stack2) + "</span>\n                                        </div>\n                                    </div>\n                                    ";
            return buffer;
        }
        function program27(depth0, data) {
            return " message-step-first";
        }
        function program29(depth0, data) {
            return " message-step-done";
        }
        function program31(depth0, data) {
            return " message-step-fail";
        }
        function program33(depth0, data) {
            return " message-step-current";
        }
        function program35(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n                    ";
            stack1 = helpers.unless.call(depth0, depth0.deleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(36, program36, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                    ";
            return buffer;
        }
        function program36(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n                    <tr id="J-msg-delete-';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '">\n                        <td class="message-panel-item-title">\n                            <h4>';
            if (stack1 = helpers.title) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.title;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '</h4>\n                        </td>\n                        <td>\n                            <div class="message-panel-item-content';
            stack1 = helpers["if"].call(depth0, depth0.isEmergency, {
                hash: {},
                inverse: self.noop,
                fn: self.program(37, program37, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += '">\n                                ';
            stack1 = helpers["if"].call(depth0, depth0.canDeleted, {
                hash: {},
                inverse: self.noop,
                fn: self.program(20, program20, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                                ";
            stack1 = helpers["if"].call(depth0, depth0.url, {
                hash: {},
                inverse: self.noop,
                fn: self.program(39, program39, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                                ";
            stack1 = helpers.unless.call(depth0, depth0.url, {
                hash: {},
                inverse: self.noop,
                fn: self.program(41, program41, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n                            </div>\n                        </td>\n                    </tr>\n                    ";
            return buffer;
        }
        function program37(depth0, data) {
            return " ui-msgpael-warn";
        }
        function program39(depth0, data) {
            var buffer = "", stack1, options;
            buffer += '\n                                <a href="';
            if (stack1 = helpers.url) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.url;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-delete="';
            if (stack1 = helpers.deleteOnClick) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.deleteOnClick;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-id="';
            if (stack1 = helpers.id) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.id;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" target="_blank" seed="msg-detail-v1">';
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.content, options) : helperMissing.call(depth0, "spec_tag", depth0.content, options))) + "</a>\n                                ";
            return buffer;
        }
        function program41(depth0, data) {
            var buffer = "", stack1, options;
            buffer += "\n                                <span>";
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.spec_tag, stack1 ? stack1.call(depth0, depth0.content, options) : helperMissing.call(depth0, "spec_tag", depth0.content, options))) + "</span>\n                                ";
            return buffer;
        }
        buffer += '<div class="message-wrapper">\n';
        stack1 = helpers["if"].call(depth0, depth0.emergencyMsg, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n";
        stack1 = helpers.unless.call(depth0, depth0.emergencyMsg, {
            hash: {},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n</div>";
        return buffer;
    });
});
