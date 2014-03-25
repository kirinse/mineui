/** begin ---riskMobileAccount.js---*/
/**
 * @namespace window.alipay.security.riskMobileAccount
 * @param
 * @requires light
 */

light.has('/alipay/security/riskMobileAccount') || (function(light, security, undefined) {
try{
	if(window == window.parent) {
		light.client.storage.set('riskMobileAccoutSendTime', -1);
	}
}catch(e){}

var riskMobileAccount = {
	Name: 'riskMobileAccount',
	defaults: {
		id: '',
		autoSend: true,
		isBind: '',
		ajaxUrl: '',
		countdownBefore: null,
		countdownAfter: null,
		requestBefore: null,
		requestAfter: null
	}
}, config = {
	'sms': {
		className: '.sms-btn',
		btnText: '重新获取短信',
		interval: 120,
		prompt_send: '校验码已发送，30分钟内输入有效，请勿泄露',
		prompt_default: '校验码是6位数字，30分钟内输入有效，请勿泄露'
	}, 'phone': {
		className: '.phone-btn',
		btnText: '使用语音获取',
		interval: 120,
		prompt_send: '支付宝将向您的手机拨打电话并播报校验码。<br />来电号码为：0571-26883721,请稍候...',
		prompt_default: '校验码是6位数字，30分钟内输入有效，请勿泄露'
	}
};

riskMobileAccount.properties = {
	targets: []
};

var members = {
	ready: true,
	render: function(callback) {
		light.isFunction(callback) && this._readyList.push(callback);
		this.element = this.options.uniqElement;
		var queue = this._readyList;
		while(queue.length) queue.shift().apply(this);
	},
	getValue: function() {
		return {mobileAckCode : this.element.value};
	},
	postInit: function() {
		var self = this, o = this.options;
		this.container = light.node(this.options.uniqElement).parent('.ui-form-item');
		this.itemExp = this.container.find('.ui-form-explain');
		light.each(config, function(type, item) {
			var element = self.container.find(item.className);
			if(element.length){
				element.type = type;
				!o.defaultType && (o.defaultType = type);
				self.targets.push(element);
			}
		});
		this.targets.length || light.log('No mode used.');

		o.autoSend && this.request('sms');
		this.bind();
	},
	/**
	 * 事件绑定
	 */
	bind: function(){
		var self = this, o = this.options;
		// manully send sms
		this.options.autoSend || this.container.find('.send-btn').click(function(e) {
			light.node(this).addClass('fn-hide');
			self.container.find('.ui-form-field, .ui-form-explain').removeClass('fn-hide');
			self.request('sms');
		});

		// reSend 按钮实际不会发送请求，但是会开始倒计时
		this.container.find('.reSend-btn').click(function(e){
			e.cancel();
			light.node(this).addClass('fn-hide');
			self.container.find('.sms-btn, .phone-btn').removeClass('fn-hide');
			self.sendSuccess(o.defaultType);
			self.countdown(o.defaultType);
		});

		light.each(this.targets, function(i, item) {
			item.click(function() {
				self.send(item.type);
			});
		});

		//  语音按钮绑定pop事件
		light.ready(function(){
			if(light.node('.phone-btn').length) {
				self.pop = new light.pop({
					targets: light.node('.phone-btn'),
					className: 'ui-securitycore',
					width: 400
				});
			}
		});
	},

	/**
	 * 根据传入的手机校验码类型，进入发送校验的状态。
	 *
	 * @param {String} type 手机校验码类型
	 */
	send: function(type) {
		var type = type || this.options.defaultType;
		this.countdown(type);
		this.request(type);
	},

	/**
	 * 根据传入的手机校验码类型，开始倒计时。
	 *
	 * @param {String} type 手机校验码类型
	 */
	countdown: function(type){
		var self = this, o = self.options,
			type = type || o.defaultType,
			counter = config[type].interval;
		o.countdownBefore && o.countdownBefore();

		(function(){
			if(counter-- > 0) { // counting
				self.toggleBtnUI(counter);
				setTimeout(arguments.callee, 1000);
				return;
			} else { // finished
				self.updatePrompt(type, 'prompt_default');
				self.toggleBtnUI(counter, true);
				self.container.removeClass('ui-form-item-success');
				o.countdownAfter && o.countdownAfter();
			}
		})();

	},

	/**
	 * 更新发送校验码按钮的状态。
	 *
	 * @param {Boolean} stop 是否停止倒计时
	 */
	toggleBtnUI: function(counter, stop) {
		var self = this, o = this.options, value,
			method = stop ? 'removeClass' : 'addClass';
		light.each(this.targets, function(i, item) {
			value = stop ? config[item.type].btnText : '（' + counter + '秒后）' + config[item.type].btnText;
			// 在按钮失效前触发hide方法隐藏pop
			stop || (self.pop && self.pop.hide());
			item[method]('ui-checkcode-messagecode-disabled-btn').attr('disabled', !stop).attr('value', value);
		});
	},

	/**
	 * 根据传入的手机校验码类型，更新提示文案，type为空时，则为默认文案。
	 *
	 * @param {String} type 手机校验码类型
	 */
	updatePrompt: function(type, status) {
		this.container.find('.ui-form-explain').html(config[type][status]);
	},

	/**
	 * 根据传入的手机校验码类型，发送Ajax请求
	 *
	 * @param {String}
	 *            type 手机校验码类型
	 */

	request: function(type){

    if(window != window.parent) {
      var curTime = (new Date()).getTime(),
          lastSentTime = Number(light.client.storage.get('riskMobileAccoutSendTime'));
      if(curTime - lastSentTime < 0){
        this.sendSuccess(type);
        return;
      }
    }

		var	self = this, o = this.options, params = {},
			type = type || o.defaultType;

		o.requestBefore && o.requestBefore();

		// 请求时仍需带手机号码
		if(this.inputMobileNo) {
			params.inputMobileNo = this.inputMobileNo;
		}
		params.type = type;
		params.securityId = light.node(this.options.uniqElement).parent('.J-securitycoreMain').attr('data-request');
		params.rnd = Math.random();
		params.validateProductName = 'risk_mobile_account';
		light.request(o.ajaxUrl, params, {
			method: 'JSONP',
			success: function(rsp){
				if(rsp.info.sent) {

          try{
            if(window != window.parent) {
              light.client.storage.set('riskMobileAccoutSendTime', (new Date()).getTime());
            }else{
              light.client.storage.set('riskMobileAccoutSendTime', -1);
            }
          }catch(e){}

					self.sendSuccess(type);
				}else {
					self.showError(rsp.info);
				}
				o.requestAfter && self.options.requestAfter(rsp);
			}
		});
	},
	/**
	 * 显示错误信息
	 * @param {Object} info error对象，包括错误码和错误信息
	 * */
	showError: function(info){
		this.itemExp.html(info.errorMessage);
		this.container.removeClass('ui-form-item-success').addClass('ui-form-item-error');
	},
	sendSuccess: function(type) {
		var type = type || this.options.defaultType;
		this.container.removeClass('ui-form-item-error').addClass('ui-form-item-success');
		this.updatePrompt(type, 'prompt_send');
	}
};
riskMobileAccount = light.register('/alipay/security/riskMobileAccount', window, light.deriveFrom(security.base, members, riskMobileAccount));

})(window.light, alipay.security);

/** end ---riskMobileAccount.js---*/
/**Last Changed Author: shuai.shao--Last Changed Date: Wed Jun 19 20:37:32 CST 2013**/
/**alipay.security.riskMobileAccount-1.3**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Wed Jun 19 20:38:17 CST 2013**/
