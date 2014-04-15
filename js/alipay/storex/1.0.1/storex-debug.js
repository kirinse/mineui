define("alipay/storex/1.0.1/storex-debug", [ "gallery/json/1.0.3/json-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "gallery/store/1.3.7/store-debug" ], function(require, exports, module) {
    /**
     * 这里JSON会暴露给window，require("store")的时候需要JSON套件，
     * 否则无法返回正确的disable和enable值 
     */
    require("gallery/json/1.0.3/json-debug");
    // 提供必要的JSON处理方法
    var Base = require("arale/base/1.1.1/base-debug"), Store = require("gallery/store/1.3.7/store-debug");
    var StoreX = Base.extend({
        /**
         * super instance
         */
        _super: false,
        /**
         * events
         * - full
         * - broken
         * - expired
         * - queue_key_added
         * - queue_key_removed
         * - queue_key_updated
         * - queue_key_shifted
         */
        /**
         * init
         */
        initialize: function(_super) {
            this._super = _super;
            // 代理 serlerlize 和 deserialize
            // 封装过的
            //this._super.serialize = this.serialize;
            /**
             * serialize内部访问的，因为store.js执行serialize的时候将this环境改为了store本身，
             * 所里这里需要将函数中需要的其他函数带进去，下同
             */
            //this._super._serialize = this._serialize;
            this._super.deserialize = this.deserialize;
        },
        /**
         * safe set.
         * expire - 指定过期时间，接受Date实例或13位时间戳，不指定过期时间的将永不过期；
         * force - 如果设置为true，将会强制删除最先压入堆的数据，直至写入正确；
         * _maxRetry - 最大尝试删除次数，避免无限循环；
         */
        _maxRetry: 15,
        set: function(key, value, expire, force) {
            try {
                // 为存储数据增加过期时间expire
                if (expire instanceof Date) expire = expire.getTime();
                this._super.set(key, this.serialize({
                    value: value,
                    expire: expire || -1
                }));
                this.addQKey(key);
                return value;
            } catch (e) {
                this.trigger("full");
                if (force) {
                    // 开始强制写入
                    var max = this._maxRetry;
                    // 最大尝试删除的次数
                    while (max > 0) {
                        max--;
                        var qkey = this.shiftQKey();
                        if (qkey) {
                            this._super.remove(qkey);
                            if (this.set(key, value, expire) != null) {
                                this.addQKey(key);
                                return value;
                            }
                        } else {
                            // 如果得到的 qkey 为undefined了，说明已经删除完了，没得可删了
                            break;
                        }
                    }
                }
                return null;
            }
        },
        /**
         * safe get.
         * 数据过期删除
         */
        get: function(key) {
            // 如果读出的数据已过期，删除该数据
            var value = this._super.get(key);
            var rtnval = !value ? null : typeof value.value != "undefined" ? value.value : value;
            if (value && value.expire && value.expire > 0 && value.expire < new Date().getTime()) {
                // 已过期，删除该值
                this.remove(key);
                rtnval = null;
                this.trigger("expired");
            }
            return rtnval;
        },
        /**
         * status.
         */
        status: function() {
            return {
                queueCount: this.getQueueCount(),
                enabled: this._super.enabled
            };
        },
        /**
         * 本地存储队列
         */
        _queueKey: "__queue__",
        getQueue: function(isString) {
            var queue_str = this.get(this._queueKey);
            var queue = queue_str && queue_str.split("|");
            if (queue != null) {
                for (var i = 0; i < queue.length; i++) {
                    queue[i] = unescape(queue[i]);
                }
            }
            return queue || [];
        },
        setQueue: function(que) {
            try {
                for (var i = 0; i < que.length; i++) {
                    que[i] = escape(que[i]);
                }
                this._super.set(this._queueKey, que.join("|"));
            } catch (e) {}
        },
        addQKey: function(key, silent) {
            var que = this.getQueue();
            if (this._getIndexOfArray(que, key) == -1) {
                // key 不存在，新增
                que.push(key);
                this.setQueue(que);
                if (!silent) this.trigger("queue_key_added");
            } else {
                this.removeQKey(key, true);
                this.addQKey(key, true);
                this.trigger("queue_key_updated");
            }
        },
        shiftQKey: function() {
            var que = this.getQueue();
            var key = que.shift();
            this.setQueue(que);
            this.trigger("queue_key_removed");
            this.trigger("queue_key_shifted");
            return key;
        },
        /**
         * silent - 不希望触发事件时置为true
         */
        removeQKey: function(key, silent) {
            var que = this.getQueue();
            var ind;
            while ((ind = this._getIndexOfArray(que, key)) !== -1) {
                que.splice(ind, 1);
            }
            this.setQueue(que);
            if (!silent) this.trigger("queue_key_removed");
        },
        getQueueCount: function() {
            return this.getQueue().length;
        },
        _getIndexOfArray: function(arr, value) {
            if (arr.indexOf) return arr.indexOf(value);
            var i = 0, L = arr.length;
            while (i < L) {
                if (arr[i] === value) return i;
                ++i;
            }
            return -1;
        },
        /**
         * 序列化工具，将过期时间、长度校验等加入进去
         */
        _serialize: function(value) {
            if ("JSON" in window && JSON.stringify) return JSON.stringify(value);
        },
        /** 给上面序列化的结果一层包装，增加length **/
        serialize: function(value) {
            var out = this._serialize(value);
            return out.length + "|" + out;
        },
        /**
         * 反序列化工具，将过期时间、长度校验检出
         */
        deserialize: function(value) {
            // 先剔除length字段, lf = length field
            if (value != null) {
                try {
                    value = JSON.parse(value);
                } catch (e) {}
                if (typeof value != "string") return value;
                var lf = value.match(/^(\d+?)\|/);
                if (lf != null && lf.length == 2) {
                    // matched
                    var len = lf[1] * 1;
                    value = value.replace(lf[0], "");
                    if (len != value.length) {
                        // throw exception
                        storex.trigger("broken");
                        return null;
                    }
                    // storex格式的数据解析
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        // throw exception 
                        storex.trigger("broken");
                        return null;
                    }
                }
            }
            return value;
        },
        /**
         * 常用函数代理
         */
        remove: function(key) {
            // 先从队列中剔除
            this.removeQKey(key);
            this._super.remove(key);
        },
        clear: function() {
            this._super.clear();
            this.trigger("queue_key_removed");
        },
        getAll: function() {
            return this._super.getAll();
        }
    });
    var storex = new StoreX(Store);
    module.exports = storex;
});
