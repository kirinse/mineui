/** begin ---riskSudoku.js---*/
light.has('/alipay/security/riskSudoku') || (function(security) {
  var riskSudoku = {
    Name: 'riskSudoku'
  };

  var members = {
    render: function(callback) {
      light.isFunction(callback) && this._readyList.push(callback);
      if (!this.ready) {
        this.element = light.node(this.options.uniqElement);
        this.container = light.node(light.get(this.options.container));
        this.keyboard = this.container.find('.risk-sudoku-keyboard');
        this.resendBtn = this.container.find('.risk-sudoku-resend-btn');
        this.clearInputIcon = this.container.find('.clear-input');
        this.ready = true;
      }

      var queue = this._readyList;
      while(queue.length) queue.shift().apply(this);
    },

    postInit: function() {
      this.onready(function() {
        this._bindKeyboardEvents();
        this._bindResendBtn();
        this._bindClearInput();
        this._sendSMS();
      });
    },

    getValue: function() {
      return this.element.val();
    },

    _bindKeyboardEvents: function() {
      var keys = light.node('table tr td a', this.keyboard);
      var t = this,
          parent = t.element.parent();
      light.each(keys, function(i, key) {
        light.on(key, 'click', function(e) {
          e.cancel();
          parent.removeClass('fn-hide');
          var letter = light.node(e.target).text();
          var input = t.element;
          if (input.val().length >= t.options.ackNum) return;
          input.val(input.val() + letter);
        });
      });
    },

    _bindClearInput: function() {
      var t = this;
      light.on(this.clearInputIcon[0], 'click', function(e) {
        e.cancel();
        t.element.val('');
      });
    },

    _bindResendBtn: function() {
      var t = this;
      light.on(this.resendBtn[0], 'click', function(e) {
        t._sendSMS();
      });
    },

    _sendSMS: function() {
      var t = this;

      this.resendBtn.attr('disabled', 'disabled');
      this.resendBtn.addClass('ui-checkcode-messagecode-disabled-btn');
      var data = {
        securityId: t.options.securityId,
        validateProductName: this.options.productName
      };
      t._smsTip(true, '校验码已发送，15分钟内输入有效。');
      light.request(this.options.resendUrl, data, {
        method: 'JSONP',
        success: function(rsp) {
          if (rsp.stat == 'ok') {
            if (rsp.info) {
              if (!rsp.info.sent) {
                t._smsTip(false, rsp.info.errorMessage);
                light.log(rsp.info.errorMessage);
                t._enableResendBtn();
              }

              if (rsp.info.sudoku) {
                t.letters = {}; // 'a' => 1, '&' => 5, ..
                var keys = light.node('table tr td a', t.keyboard);
                light.each(rsp.info.sudoku, function(i, v) {
                  t.letters[v.code] = v.index;
                  light.node(keys[i]).text(v.code);
                });
              } else {
                t._smsTip(false, rsp.info.errorMessage || '网络繁忙，请稍侯再试。');
                light.log('服务器错误，未返回可选字符结果');
                t._enableResendBtn();
              }
            }
          } else {
            light.log('error');
          }
        },
        failure: function() {
          light.log('failure');
        }
      });

      var totalSeconds = 120;//
      clearInterval(t._intervalHandler);
      this._intervalHandler = setInterval(function() {
        if (totalSeconds == 0) {
          t._enableResendBtn();
        } else {
          var text = totalSeconds-- + '秒后重发短信';
          t.resendBtn.text(text);
        }
      }, 1000);
    },

    _enableResendBtn: function() {
      var text = '重新获取短信';
      this.resendBtn.text(text).attr('disabled', false).removeClass('ui-checkcode-messagecode-disabled-btn');
      clearInterval(this._intervalHandler);
    },

    _smsTip: function(valid, msg) {
      msg = msg || '';
      var explain = this.resendBtn.next('.ui-form-explain');
      explain.text(msg);

      var resendGroup = this.resendBtn.parent('.resend-group');
      if (valid) {
        resendGroup.removeClass('ui-form-item-error');
      } else {
        resendGroup.addClass('ui-form-item-error');
      }
    }

  };

  riskSudoku = security.riskSudoku = light.deriveFrom(security.base, members, riskSudoku);
})(alipay.security);

/** end ---riskSudoku.js---*/

/**alipay.security.riskSudoku-1.0**/
/** CurrentDeveloper: wangwei**/
/** DeployDate: Thu Jan 02 12:25:25 CST 2014**/
