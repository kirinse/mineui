/** begin ---barcode.js---*/
light.has('/alipay/security/barcode') || (function(security) {

  var barcode = {
    Name: 'barcode'
  };


  var members = {
    render: function(callback) {
      var t = this;

      light.isFunction(callback) && t._readyList.push(callback);

      seajs.use(['$', 'alipay/qrcode/1.0.3/qrcode'], function($, QRCode){
        var qrnode = new QRCode({
          text: t.options.barcode,
          width: t.options.width,
          height: t.options.height
        });
        t.element && t.element.del();
        t.container.append(qrnode);
        t.element = light.node(qrnode);
        t.element.addClass('barcode');
        
        t.ready = true;
        var queue = t._readyList;
        while(queue.length) queue.shift().apply(t);
      });

    },
    postInit: function() {
      this.container = light.node(light.node(this.options.container));
      this.stat = 'suspended';

      var t = this;
      var buttons = this.container.find('button');
      for (var i = 0; i < buttons.length; i ++) {
        light.on(buttons[i], 'click', function() {
          t._changeState('waiting');
        });
      }

      this._confirmedList = [];
    },

    start: function() {
      if (this.stat != 'confirmed') {
        this._changeState('waiting');
      }
    },

    stop: function() {
      if (this.stat != 'confirmed') {
        this._changeState('suspended');
      }
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

      // exit actions
      switch (originalState) {
        case 'scanned':
          // 去掉已拍码提示
          this.container.removeClass('scanned');
          break;
        case 'confirmed':
          // 去掉已确认提示
          this.container.removeClass('confirmed');
          break;
        case 'error':
          // 去掉错误提示
          this.container.removeClass('error');
          break;
        case 'timeout':
          this.container.removeClass('timeout');
          // 去掉超时提示
          break;
        case 'suspended':
        case 'waiting':
        default:
          break;
      }

      this.stat = targetState;

      // entry actions
      switch (targetState) {
        case 'suspended':
          // 暂停轮询
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          break;

        case 'waiting':
          // 开始轮询
          var that = this;
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          var h = setInterval(function() {
            light.request(that.options.queryUrl, {securityId: that.options.securityId}, {
              method: 'JSONP',
              success: function(rsp) {
                if (rsp.stat == 'ok') {
                  that._changeState(rsp.barcodeStatus);
                } else {
                  that._changeState('error');
                  light.log(rsp);
                }
              },
              failure: function() {
                light.log('failure');
              }
            });
          }, 3000);

          this._intervalHandler = h;
          this._timeoutHandler = setTimeout(function() {
            that._changeState('timeout');
          }, 600000);
          break;
        case 'scanned':
          this.container.addClass('scanned');
          // 已拍码提示
          break;
        case 'confirmed':
          // 暂停轮询
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          // 确认提示
          this.container.addClass('confirmed');

          var queue = this._confirmedList;
          while(queue.length) queue.shift().apply(this);
          this._confirmedList = [];
          break;
        case 'error':
          // 暂停轮询
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          // 错误提示
          this.container.addClass('error');
          break;
        case 'timeout':
          // 暂停轮询
          clearInterval(this._intervalHandler);
          clearTimeout(this._timeoutHandler);
          // 超时提示
          this.container.addClass('timeout');
          break;
        default:
          light.log('barcod error');
          break;
      }
    }
  };

  barcode = security.barcode = light.deriveFrom(security.base, members, barcode);

})(alipay.security);

/** end ---barcode.js---*/

/**alipay.security.barcode-1.0**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Thu Nov 21 22:37:39 CST 2013**/
