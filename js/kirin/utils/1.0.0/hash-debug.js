define("kirin/utils/1.0.0/hash-debug", [ "./khash-debug", "arale/class/1.2.0/class-debug" ], function(require, exports, module) {
    var KHash = require("./khash-debug");
    var HashFactory = function(obj) {
        return new KHash(obj);
    };
    HashFactory.fn = KHash.prototype;
    return HashFactory;
});

define("kirin/utils/1.0.0/khash-debug", [ "arale/class/1.2.0/class-debug" ], function(require, exports, module) {
    var Class = require("arale/class/1.2.0/class-debug");
    var KHash = Class(Object).extend({
        /**
     * 类初始化
     */
        initialize: function(obj) {
            this.obj = obj;
        },
        /**
     * 循环遍历
     * @param {Function} fn 回调函数
     * @param {Object} context 作用域 as this
     * @example
     * var info = $H({
     *  name : "xuning",
     *  age : 27    
     * })
     * info.each(function(key,value){
     *  alert(key);
     *  alert(value);
     * });
     * @returns {void}
     */
        each: function(fn, context) {
            for (var key in this.obj) {
                if (this.obj.hasOwnProperty(key)) {
                    fn.call(context, key, this.obj[key], this.obj);
                }
            }
        },
        /**
     * 设置key value
     * @param {String} key 键
     * @param {String} value 值
     * @example
     * var hash = $H({});
     * hash.set('name','love'); // {'name':'love'}
     * @return {Object}
     */
        set: function(key, value) {
            if (!this.obj[key] || this.obj.hasOwnProperty(key)) this.obj[key] = value;
            return this;
        },
        /**
     * 扩展Hash
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @param {Object} properties 需要压入的Hash
     * @example
     * var obj = $H({'name':'xuning', 'age':'27'});
     * obj.extend({'livein':'hangzhou'}) //return {'name':'xuning', 'age':'27', 'livein':'hangzhou'}
     * @return {Object}
     */
        extend: function(properties) {
            $H(properties || {}).each(function(key, value) {
                this.set(key, value);
            }, this);
            return this;
        },
        /**
     * 获取对象长度
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @example 
     * var info = $H({
     *  name : "xuning",
     *  age : 27    
     * })
     * info.getLength(); //return 2
     * @return {Number}
     */
        getLength: function() {
            var length = 0;
            for (var key in this.obj) {
                if (this.obj.hasOwnProperty(key)) {
                    length++;
                }
            }
            return length;
        },
        /**
     * 是否包含该键
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @param {String} key 键值
     * @example 
     * var info = $H({
     *  name : "xuning",
     *  age : 27    
     * })
     * info.has('name'); //return True
     * @return {Boolean}
     */
        has: function(key) {
            return this.obj.hasOwnProperty(key);
        },
        /**
     * 获取该值对应的key
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @param {Anything} value 任何值
     * @example 
     * var info = $H({
     *  name : "xuning",
     *  nickname : "xuning" 
     * })
     * info.keyOf('xuning'); //["name","nickname"]
     * @return {Array || null}
     */
        keyOf: function(value) {
            var keys = [];
            for (var key in this.obj) {
                if (this.obj.hasOwnProperty(key) && this.obj[key] == value) {
                    keys.push(key);
                }
            }
            return keys.length ? keys : null;
        },
        /**
     * 是否含有该值
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @param {Anything} value 任何值
     * @example 
     * var info = $H({
     *  name : "sdh",
     *  nickname : "xuning" 
     * })
     * info.hasValue('sdh'); //return true
     * @return {Boolean}
     */
        hasValue: function(value) {
            return this.keyOf(value) !== null;
        },
        /**
     * 删除某一项
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @param {String} key键
     * @example 
     * var info = $H({
     *  name : "sdh",
     *  nickname : "xuning" 
     * })
     * info.removeKey('name'); //return true
     * @return {Object}
     */
        removeKey: function(key) {
            if (this.obj.hasOwnProperty(key)) {
                delete this.obj[key];
            }
            return this;
        },
        /**
     * 获取所有key
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @example 
     * var info = $H({
     *  name : "sdh",
     *  nickname : "xuning" 
     * })
     * info.getKeys(info); //return ['name', 'nickname']
     * @return {Array}
     */
        getKeys: function() {
            var keys = [];
            this.each(function(key, value) {
                keys.push(key);
            });
            return keys;
        },
        /**
     * 获取所有值
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @example 
     * var info = $H({
     *  name : "sdh",
     *  nickname : "xuning" 
     * })
     * info.getValues(); //return ['sdh', 'xuning']
     * @return {Array}
     */
        getValues: function() {
            var values = [];
            this.each(function(key, value) {
                values.push(value);
            });
            return values;
        },
        /**
     * 将对象转化为URLString
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @example 
     * var info = $H({
     *  name : "sdh",
     *  nickname : "xuning" 
     * })
     * info.toQueryString(); //return "name=sdh@nickname=xuning"
     * @return {String}
     */
        toQueryString: function() {
            var queryString = [];
            this.each(function(key, value) {
                queryString.push(key + "=" + value);
            });
            return queryString.join("&");
        },
        /**
     * 将key进行排序
     * @param {Object} obj Object对象 如: {name:"jack",age:12}
     * @example 
     * var info = $H({
     *  a : "a",
     *  c : "c" ,
     *  b : "b"
     * })
     * info.sort(); //return {a : "a", b : "b", c : "c"}
     * @return {Object}
     */
        sort: function() {
            var result = {};
            var keys = this.getKeys();
            keys.sort();
            for (var key; key = keys.shift(); ) {
                result[key] = this.obj[key];
            }
            return $H(result);
        }
    });
    module.exports = KHash;
    KHash.prototype["toString"] = function() {
        var str = [];
        for (var key in this.obj) {
            // if(typeof(this.obj[key])!='function') {
            str.push(key + " : " + this.obj[key]);
        }
        return "{ " + str.join(",") + " }";
    };
});
