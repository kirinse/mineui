/** begin ---riskOneKeyConfirm.js---*/
light.has('/alipay/security/riskOneKeyConfirm') || (function(security) {
  var riskOneKeyConfirm = {
    Name: 'riskOneKeyConfirm'
  };

  var members = {
    render: function(callback) {
      light.isFunction(callback) && this._readyList.push(callback);
      if (!this.ready) {
        this.element = light.node(this.options.uniqElement);
        this.container = light.node(light.get(this.options.container));
        this.ready = true;
        this.guideLink = this.container.find('.onekey-guide-link');
        this.guideImg = this.container.find('.onekey-guide-img');
      }

      var queue = this._readyList;
      while(queue.length) queue.shift().apply(this);
    },

    postInit: function() {
      this.stat = 'init';
      this.onready(function() {
        this._bindGuide();
        this._changeState('waiting');
        // 开始轮询
        var that = this;
        var h = setInterval(function() {
          light.request(that.options.queryUrl, {securityId: that.options.securityId}, {
            method: 'JSONP',
            success: function(rsp) {
              that._changeState(rsp.stat);
            },
            failure: function() {
              light.log('failure');
            }
          });
        }, 3000);

        this._intervalHandler = h;
        this._timeoutHandler = setTimeout(function() {
          that._changeState('timeout');
        }, 900000);
      });

      this._confirmedList = [];
    },

    _bindGuide: function() {
      var t = this;
      light.on(this.guideLink[0], 'click', function() {
        t.guideImg.toggleClass('fn-hide');
      });
    },

    onConfirm: function(callback) {
      if (typeof callback != 'function')
        throw new Error('onConfirm accept only function.');

      this._confirmedList.push(callback);

      if (this.stat == 'confirmed') {
        var queue = this._confirmedList;
        while(queue.length) queue.shift().apply(this);
        this._confirmedList = [];
      }
    },

    getValue: function() {
      return this.stat == 'confirmed';
    },

    _changeState: function(targetState) {
      var originalState = this.stat;
      if (targetState == originalState) return;
      /*
      switch (originalState) {
        case 'error':
          break;
        case 'created':
          break;
        case 'confirmed':
          break;
        case 'denied':
          //this.container.removeClass('error');
          break;
        case 'timeout':
          break;
        default:
          break;
      }
      */

      this.stat = targetState;

      switch (targetState) {
        case 'error':
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          this._showMsg(false, '系统繁忙，请稍侯再试。');
          light.log('一键确认：发生错误');
          break;
        case 'created':
          break;
        case 'confirmed':
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          // 确认提示
          this._showMsg(true, '已确认');
          light.log('一键确认：已确认');

          var queue = this._confirmedList;
          while(queue.length) queue.shift().apply(this);
          this._confirmedList = [];
          break;
        case 'denied':
          // 暂停轮询
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          this._showMsg(false, '账户授权失败');
          light.log('一键确认：已拒绝');

          // 这个地方和confirm一样处理，去提交表单，这样会走到错误页面
          var queue = this._confirmedList;
          while(queue.length) queue.shift().apply(this);
          this._confirmedList = [];
          // 超时提示
          break;
        case 'timeout':
          // 暂停轮询
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          this._showMsg(false, '已超时，请稍侯再试');
          light.log('一键确认：已超时');
          // 超时提示
          break;
        default:
          light.log('一键确认：未知状态');
          break;
      }
    },

    _showMsg: function(valid, msg) {
      if (valid) {
        this.element.parent().removeClass('ui-form-item-error');
      } else {
        this.element.parent().addClass('ui-form-item-error');
      }
      this.container.find('.ui-form-explain').text(msg);
    }
  };

  riskOneKeyConfirm = security.riskOneKeyConfirm = light.deriveFrom(security.base, members, riskOneKeyConfirm);
})(alipay.security);

/** end ---riskOneKeyConfirm.js---*/

/**alipay.security.riskOneKeyConfirm-1.0**/
/** CurrentDeveloper: wangwei**/
/** DeployDate: Thu Jan 02 14:05:27 CST 2014**/
