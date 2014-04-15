define("alipay/request/0.9.0/request-debug", ["$-debug", "arale/cookie/1.0.2/cookie-debug"], function(require, exports, module) {
  var $ = require('$-debug');
  var Cookie = require('arale/cookie/1.0.2/cookie-debug');


  var request = {
    setup: function(options) {
      var defaults = {
        iframe: false,
        jsonp: '_callback'
      };

      options = $.extend(defaults, options);

      var data = {'_input_charset': 'utf-8'};
      var ctoken = Cookie.get('ctoken');
      if (ctoken) {
        data['ctoken'] = ctoken;
      }
      options.data = $.extend(data, options.data || {});

      var params = {success: options.success, iframe: options.iframe};
      options.success = function(data) {
        success.call(params, data);
      }

      return options;
    },

    ajax: function(url, options) {
      // use it as jQuery
      if (typeof url === 'object') {
        options = url;
        url = undefined;
      }
      options = this.setup(options || {});
      $.ajax(url, options);
    },

    get: function(url, data, callback, type) {
      // shortcut for GET request
      makeAlias.call(this, 'get', url, data, callback, type);
    },

    post: function(url, data, callback, type) {
      // shortcut for POST request
      makeAlias.call(this, 'post', url, data, callback, type);
    }
  };


  function success(data) {
    if (!data) {
      return;
    }

    switch (data.stat) {
      case 'deny':
        if (this.iframe) {
        //如果是iframe但非box则刷新父页面
        parent.location.reload();
      } else {
        location.href = data.target;
      }
        break;
      default:
        if (this.success) {
          this.success(data);
        }
        break;
    }
  };

  function makeAlias(method, url, data, callback, type) {
    if ($.isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }
    return this.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  }

  module.exports = request;
});
