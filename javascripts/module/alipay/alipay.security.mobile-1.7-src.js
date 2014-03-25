/** begin ---mobile.js---*/
/**
 * 手机护航 倒计时组件 安全服务化
 * 
 * @name counter
 * @module counter
 * @namespace window.alipay.security.mobile
 * @param
 * @requires light
 * @author 右丞
 * @Date 2012.07.11
 */

light.has('/alipay/security/mobile') || (function(light, security) {
try{
  if(window == window.parent) {
    light.client.storage.set('mobileSendTime', -1);
  }
}catch(e){}
var mobile = {
	Name: 'mobile',
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

mobile.properties = {
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
    return {
      "mobileAckCode": this.element.value
    };
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
          lastSentTime = Number(light.client.storage.get('mobileSendTime'));
      if(curTime - lastSentTime < 0){
        this.sendSuccess(type);
        return;
      }
    }

		var	self = this, o = this.options, params = {},
			type = type || o.defaultType;

		// TODO:传入当前实例
		o.requestBefore && o.requestBefore();
		
		// 可信手机的重发短信校验码，请求时仍需带手机号码
		if(this.inputMobileNo) {
			params.inputMobileNo = this.inputMobileNo;
		}
		params.type = type;
		params.securityId = light.node(this.options.uniqElement).parent('.J-securitycoreMain').attr('data-request');
		params.rnd = Math.random();
    params.validateProductName = this.options.productName;
    light.request(o.ajaxUrl, params, {
			method: 'JSONP',
			success: function(rsp){
				if(rsp.info.sent) {

          try{
            if(window != window.parent) {
              light.client.storage.set('mobileSendTime', (new Date()).getTime());
            }else{
              light.client.storage.set('mobileSendTime', -1);
            }
          }catch(e){}

					self.sendSuccess(type);
				} else {
					self.showError(rsp.info);
				}

				if(config[type].interval <= 0){
					config[type].interval = 120;
				}

				var timer = setInterval(function(){
					config[type].interval--;
					if(config[type].interval <= 0){
						clearInterval(timer);	
					}
				},1000);

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
mobile = light.register('/alipay/security/mobile', window, light.deriveFrom(security.base, members, mobile));

})(window.light, alipay.security);

/** end ---mobile.js---*/
/** begin ---credibleMobile.js---*/
/**
 * 可信手机 手机护航 倒计时组件 安全服务化
 * @name alipay.security.credibleMobile
 * @class
 * @extends 
 * @author 右丞
 * @param {object} obj 配置参数
 * @returns {alipay.security.credibleMobile}
 * @Date 2012.07.11
 */
light.has('/alipay/security/credibleMobile') || (function(light) {
try{
  if(window == window.parent) {
    light.client.storage.set('credibleMobileSendTime', -1);
  }
}catch(e){}

var credibleMobile = function(){
	this.init.apply(this, arguments);
	this.bind();
};

credibleMobile.prototype = {
	/** @lends alipay.security.credibleMobile.prototype */
	
	/**
	 * 表单的className
	 * @type Object
	 * */
	_cg: {
		item: 'ui-form-item',
		itemSuccess: 'ui-form-item-success',
		itemError: 'ui-form-item-error',
		itemExp: 'ui-form-explain'
	},

	/**
	 * 初始化组件的对象
	 * */
	init: function(){
		var o;
		o = this.opt = arguments[0];

		o.dataId = o.id + new Date().getTime() + Math.floor(Math.random() * 1000);
		light.node('[id=' + o.id + ']:not([data-id]):first').attr("data-id", o.dataId);
		this.opt.uniqElement = light.node('[data-id=' + o.dataId + ']:first')[0];
		this.element = this.opt.uniqElement;

		this.container = light.node(this.element).parent('.' + this._cg.item);
		this.validateBtn = this.container.find('.validate-btn');
		this.itemExp = this.container.find('.' + this._cg.itemExp);
		this.preExp = this.itemExp.html() || ''; // 初始化提示文案

		if(!this.opt.mobile) {
			light.log("Mobile did not start.");
			return;
		}
		this.opt.mobile.origin = 'credible';
		this.opt.mobile.credibleValidate = false;
		this.opt.mobile.credibleMobile = this;



	},
	
	/**
	 * 绑定事件
	 * */
	bind: function(){
		var self = this;
		this.validateBtn.click(function(){
			self.validateNum();	
		})
		light.node(this.element).focus(function(){
			self.showDefault();
		});
	},

	/**
	 * 校验手机号码
	 * */
	validateNum: function() {
		var mobileValue = this.element.value, reg = /\d{11}/;
		if(mobileValue.replace(/[^\x00-\xff]/g,'**').length === 0){
			this.showError({'msg': '请输入手机号码。'});
			return;
		}else if (!reg.test(mobileValue)){
			this.showError({'msg': '手机号码有误。'});
			return;
		}
		this.request();
	},

	/**
	 * 发送Ajax校验，校验手机号码
	 * */
	request: function(){
    var	self = this, num = light.trim(this.element.value), params = {};

    if(window != window.parent) {
      var curTime = (new Date()).getTime(),
          lastSentTime = Number(light.client.storage.get('credibleMobileSendTime')),
          lastSentNo = light.client.storage.get('credibleMobileNo');

      if(num == lastSentNo && curTime - lastSentTime < 0){
        this.validateNumSuc({info: {validated: true}});
        return;
      }
    }

		params.inputMobileNo = num;
		params.securityId = light.node(this.opt.uniqElement).parent('.J-securitycoreMain').attr('data-request');
		params.validateProductName = 'ctu_mobile';
		light.request(this.opt.ajaxUrl, params, {
			method: 'JSONP',
			success: function(rsp){
        if(rsp.info.validated) {
          try{
            if(window != window.parent) {
              light.client.storage.set('credibleMobileSendTime', (new Date()).getTime());
              light.client.storage.set('credibleMobileNo', num);
            }else{
              light.client.storage.set('credibleMobileSendTime', -1);
            }
          }catch(e){}
        }

				self.validateNumSuc(rsp);
			}
		});
	},

	/**
	 * 手机号码校验成功的回调函数，此时将调用手机校验码模块
	 * @private
	 * */
	validateNumSuc: function(rsp){
		var info  = rsp.info;
		if(info.validated) {

			this.container.find('.ui-form-explain').addClass('fn-hide');
			this.container.find('.ui-form-field').addClass('ui-form-text').html(this.element.value);
			this.container.addClass(this._cg.itemSuccess);
			light.node('.mobile-section .ui-form-item-counter').removeClass('fn-hide');

			// 启动校验码重发功能
			if(!this.opt.mobile) {
				light.log("Mobile did not start.");
				return;
			}
			// 可信手机校验成功后，后台自动发送校验码，无需前端请求
			this.opt.mobile.credibleValidate = true;
			this.opt.mobile.inputMobileNo = light.trim(this.element.value);
			this.opt.mobile.sendSuccess();
		} else {
			this.error(rsp);
		}
		
	},

	/**
	 * 手机号码失败的回调函数，将通过返回状态显示相应的错误信息
	 * @private
	 * */
	error: function(rsp) {
		var data = rsp.info, msg='';
		
		if(data.errorCount >= 5){
			this.validateBtn.addClass('ui-checkcode-messagecode-disabled-btn').attr('disabled', true);
		}
		msg = msg || data.errorMessage;
		this.showError({'code':data.errorCode, 'msg': msg});
	},

	/**
	 * 显示错误信息
	 * @param {Object} info error对象，包括错误码和错误信息
	 * */
	showError: function(info){
		this.itemExp.html(info.msg);
		this.container.addClass(this._cg.itemError);
	},

	/**
	 * 显示默认提示
	 * */
	showDefault: function(){
		this.itemExp.html(this.preExp);
		this.container.removeClass(this._cg.itemError);
	}
};
light.register('/alipay/security/credibleMobile', window, credibleMobile);
})(window.light);

/** end ---credibleMobile.js---*/
/**Last Changed Author: shuai.shao--Last Changed Date: Wed Jun 19 20:32:47 CST 2013**/
/**alipay.security.mobile-1.7**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Wed Jun 19 20:33:29 CST 2013**/
