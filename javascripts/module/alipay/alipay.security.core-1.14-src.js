/** begin ---page.js---*/
light.has('/alipay/security/page') || (function(light, N, security){
  security.page = {};

  // 安全通用逻辑：处理证书中可能用到的链接。
  // 主要逻辑包括：
  // 1. 如果是页面已经在 xbox 中，改为在新页面中打开
  // 2. 加 isNewCtrl=true 或者 isNewCtrl=false
  security.page.processCertLink = function(certLink) {
    if( !certLink.length ) return;
    // 判断当前页面是否在iframe中
    try{
      if( window.frameElement ) {
        certLink.attr('data-href') && certLink.attr('href', certLink.attr('data-href'));
        certLink.attr('target', '_blank');
      } else {
        for(i=0, l=certLink.length; i<l; i++) {
          var ele = certLink[i];
          if(!(/isNewCtrl/).test(ele.href)) {
            var separator = /\?(.*)/.test(ele.href) ? '&' : '?';
            if(security.cdo.installed) {
              ele.href += separator + 'isNewCtrl=true';
            } else {
              ele.href += separator + 'isNewCtrl=false';
            }
          }
          light.page.ui.dialog({
            type: 'page',
            trigger: ele,
            width: 612,
            content: ele.href,
            autoShow: false
          });
        }
      }
    }catch(e){
      certLink.attr('data-href') && certLink.attr('href', certLink.attr('data-href'));
      certLink.attr('target', '_blank');
    }

  };

})(window.light, light.node, alipay.security);

/** end ---page.js---*/
/** begin ---core.js---*/
/*
 * 安全服务化脚本，主要用于安全产品的校验
 *
 * 链式：
 * 安全产品的检验都是基于异步的，因此在主体函数中采用链式的方式调用各个安全产品的方法，即light.queue；
 * 链式中，一个方法执行完，需执行next()，即调用链式中的下一个方法；
 *
 * 通知机制：
 * 在调用的过程中，如果出现异常或者检验失败，需要通知主体函数检验已中止，通过设置requestContext.stop = true；
 * 这种通知机制主用防止重复检验，保证检验的完整性。
 * */

light.has('/alipay/security/core') || (function(win, dialog, security){

var core = (function(){
	var	_defaults = {
			form: null, 
			loadingClass: 'ui-form-status',
			validateUrl: '', 
			reCheckUrl: '', 
			beforeAjaxValidate: light.noop,
			afterAjaxValidate: light.noop,
			block: light.noop,
			reCheckSuccess: light.noop,
			stopSubmit: false,
			validatedSuccess: null,
			beforeSubmit: null
		}; 

		
		if(win != win.top && light.client.storage.get('overLimit') != "true"){
			try{
				light.client.storage.set('overLimit', "false");
				light.client.storage.set('blockReason', '');
        light.client.storage.set('overLimitedProduct', '');
      }catch(e){}
		}

	var members = {
		bind: function() {
			if(win != win.top && light.client.storage.get('overLimit') == "true"){
				this.overLimit(light.client.storage.get('blockReason'), light.client.storage.get('overLimitedProduct'));
			}
			light.on(document, 'click keyup', function(e) {
				var flag = 0;
				if(e.which == 27) {
					flag = 1;
				} else if (e.target && e.target.className && e.target.className.indexOf('xbox-close-link') !== -1) {
					flag = 1;
					e.cancel();
				}
				flag && light.page.ui.closeDialog();
			});
				
			// placeholder
			var placeholder = function(item) {
				var item = light.node(item);
				if(!item.val()) {
					item.val(item.attr('placeholder')).addClass('ui-form-item-placeholder');
				}
			},
			clearPlaceholder = function(item) {
				if(item.val() == item.attr('placeholder')) {
					item.val('');
				}
        item.removeClass('ui-form-item-placeholder');
			};
			light.node('.J-securitycoreMain [placeholder]').each(function(){
				placeholder(light.node(this));
			}).click(function(){
				clearPlaceholder(light.node(this));
			}).blur(function(){
				placeholder(light.node(this));
			});
		},
		execute: function() {
			if(!this.requestContext.stoped) return;
			
			var self = this,
				scProducts = this.scProducts,
				isBlock = light.node('.J-securitycoreMain', this.form).attr('data-status');

			// 支持securitycore局部刷新，目前用于硬证书实时检测
			if(scProducts.length && !this.inited) {
				security.core.init.call(this, this.options);
			}

			this.requestContext.stoped = false;

			this._q.clear();
	
			light.each(this._products, function(key, item){
				self._q.add(function(next){
					item.execute(next, self.requestContext);
				});
			});

			this._q.add(function(next){
				// 如果当前场景无安全产品需校验，仍业务提交表单
				if( scProducts.length) { // 如果是barcodeOnly也跳过ajaxValidate
          if (self.barcodeOnly || self.riskOneKeyConfirmOnly) {
            self.options.validatedSuccess && self.options.validatedSuccess();
            next();
          } else {
            self.ajaxValidate(next, self.requestContext.params);
          }
				}else if(isBlock != 'true'){
					next();
				}
			});

			this._q.add(function(next){
				self.formSuccess();
			});

			this._q.invoke();
			this.requestContext.stoped = true;
		},
		ajaxValidate: function(next, data) {
			if(this.validated){
				next();
				return;	
			}
			light.log("Begin ajax validat.");
			this.showLoadingBar();
			this.options.beforeAjaxValidate();

			var	self = this,
				url = this.options.validateUrl;

			light.packetRequest(url, {
				securityId: light.node('.J-securitycoreMain', this.form).attr('data-request')
				}, data, {
				success: function(rsp){self.ajaxValidateSucc(next, rsp);},
				abort: function(msg){self.ajaxValidateFail(msg);}
			});

		},
		overLimit: function(blockReason, overLimitedProduct){
			var reasons = blockReason.split(',');
			for(var i=0, len=reasons.length; i<len; i++){
				if(reasons[i] == 'risk_validate_over_limit_times'){

					var coreData = light.node('.J-securitycoreMain'),
						blockReasonDiv = light.node('.' + overLimitedProduct + '-blockReason');

          if (blockReasonDiv.length <= 0) {
            blockReasonDiv = light.node('#blockReason');
          }

					coreData.children().hide();

					blockReasonDiv.appendTo(coreData);

					if(coreData.parent('form').length) {
						var form = coreData.parent('form');
						form.children().hide();
						form[0].insertBefore(coreData[0], form[0].firstChild);
						coreData.show();
					}

					coreData[0].insertBefore(blockReasonDiv[0], coreData[0].firstChild);
					blockReasonDiv.show();

					coreData.show();
					light.node('.loading-text').hide();
					try{
						light.client.storage.set('overLimit', "true");
						light.client.storage.set('blockReason', blockReason);
            light.client.storage.set('overLimitedProduct', overLimitedProduct);
          }catch(e){}
				}
			}
		},
		updateRdsToken: function(rsp) {
			if(rsp && rsp.info && rsp.info.rdsToken){
				window.form_tk = rsp.info.rdsToken;		
				UA_Opt.setToken(window.form_tk);
				UA_Opt.reload();
			}
		},
		ajaxValidateSucc: function(next, rsp) {
			var	info = rsp.info, allValidated = true, cert = null;

			if(rsp.blockReason){
        var overLimitedProduct = '';
        if( info.product && info.product.length) {
          for(var i=0, l = info.product.length; i<l; i++) {
            var item = info.product[i];
            if (item.overLimited) {
              overLimitedProduct = item.name;
              break;
            }
          }
        }
        this.overLimit(rsp.blockReason, overLimitedProduct);
			}else{
				try{
					light.client.storage.set('overLimit', "false");
					light.client.storage.set('overLimitedProduct', '');
				}catch(e){}
				if( info.product && info.product.length) {
					// 分包发送完成，返回校验结果			
					for(var i=0, l = info.product.length; i<l; i++) {
						var item = info.product[i], 
							name = core.ajaxParams[item.name];
						if('ukey,thirdkey,cert'.indexOf(name)>=0 && !item.validated) {
							cert = item; 
						} else if(name == "checkCode") {
							this._products[name].afterValidate(item.validated, item.message);
						} else{
							this._products[name].afterValidate(item.validated, item.message, item.validated);
						}
						!item.validated && (allValidated = item.validated);
						light.log('%s validate %s', name, item.validated);
					}
					// 证书类检验错误，最后显示错误信息，因为有可能显示在密码控件的提示区域，需要覆盖密码检验的错误信息
					if(cert) this._products[cert.name].afterValidate(cert.validated, cert.message, cert.validated);
					
					// 判断安全产品是否全部校验通过
					if(allValidated) {
						this.validated = true;
						next();
					} else {
						this.stopSubmit(rsp);
					}
				} else if( info.exception ) {
					// 校验异常
					this.ajaxValidateFail(info.exception);
				}
				if(this.validated) {
					this.options.validatedSuccess && this.options.validatedSuccess();
				}
			}
			this.updateRdsToken(rsp); 
		},
		ajaxValidateFail: function(msg) {
			this.stopSubmit();
			if(this._products.edit){
				this._products.edit.afterValidate(false, msg);
			} else {
				alert(msg);
			}
		},
		stopSubmit: function(rsp) {
			this.requestContext.stoped = true;
			this.hideLoadingBar();
			this.options.afterAjaxValidate(rsp);
		},
		showLoadingBar: function(){
			this.loading && this.loading.removeClass('fn-hide');
		},
		hideLoadingBar: function(){
			this.loading && this.loading.addClass('fn-hide');
		},
		formSuccess: function() {
			this.options.beforeSubmit && this.options.beforeSubmit();

      // 清除 rsa 密码框中的明文密码，防止被提交
      var products = window.light.page.products,
          product;
      for (var name in products) {
        product = products[name];
        if (product.__type.Name == 'rsainput') {
          product.element.value = '';
        }
      }

			if(!this.options.stopSubmit){
				this.options.form.submit();
			}
		},
		getStatus: function(){
			return window.um && window.um.getStatus();	
		}
	}

	return {
		init: function(options){

			if ( !(this instanceof core.init) ) {
				return new core.init( options );
			}

			light.extend(this, members);

			this.inited = false;
			
			this._products = {};

			// 各个安全产品和主体函数交互的对象
			this.requestContext = {
				stoped: true,
				params: {}
			};
			this._q = new light.queue();
			this.validated = false;

			var opt, self = this;

			// 不要修改_defaults, 之前是直接扩充_defaults;
			//this.options = opt = light.extend(_defaults, options);
			this.options = opt = light.extend({}, _defaults, options);
			this.form = opt.form;

			var coreData = light.node('.J-securitycoreMain', this.form),
				isBlock = coreData.attr('data-status'),
				server = coreData.attr('data-server');	

			// 云模式外围无需传校验地址，则使用默认地址， 端模式根据外围传的地址
			opt.reCheckUrl = opt.reCheckUrl ? opt.reCheckUrl : (server + '/securityAjaxCertRecheck.json');
			opt.validateUrl = opt.validateUrl ? opt.validateUrl : (server + '/securityAjaxValidate.json');

			this.loading = light.node('.'+opt.loadingClass, opt.form);

			this.scProducts = light.page.scProducts;

			if(isBlock == 'true') {
				security.core.block(opt.reCheckUrl, opt.reCheckSuccess, opt.preventDefaultReCheckSuccess);
				opt.block();
				return this;
			}

      if (this.scProducts.length == 1 && this.scProducts[0].__type.Name == 'barcode') {
        this.barcodeOnly = true;
        if (this.barcodeOnly && this.options.barcodeAutoSubmit) {
          this.scProducts[0].onConfirm(function() {
            self.options.validatedSuccess && self.options.validatedSuccess();
            self.formSuccess();
          });
        }
      } else {
        this.barcodeOnly = false;
      }

      if (this.scProducts.length == 1 && this.scProducts[0].__type.Name == 'riskOneKeyConfirm') {
        this.riskOneKeyConfirmOnly = true;
        // 风险产品在二阶段，所以不会有场景中的表单项，如果是only的时候可放心提交。
        if (this.riskOneKeyConfirmOnly) {
          this.scProducts[0].onConfirm(function() {
            self.options.validatedSuccess && self.options.validatedSuccess();
            self.formSuccess();
          });
        }
      } else {
        this.riskOneKeyConfirmOnly = false;
      }

			light.each(this.scProducts, function(i, element){
				var type = core.prodConfig[element.__type.Name], 
					options = this.options ? this.options[type] : null;

				if(!(options && options.skipChecking)) {
					// new a sc producat instance
					self._products[type] = core.base.create(core[type], element, options);
				}
			});
			security.core.visualTip();
			members.bind();
			light.page.scProducts = [];
			this.inited = true;
			return this;
		}
	}

})();

light.register('alipay/security/core', win, core);

})(window, light.page.ui.dialog, alipay.security);

/** end ---core.js---*/
/** begin ---config.js---*/
(function(win, dialog, core){
	// 安全产品组件名和核心中处理类的对应关系
	core.prodConfig = {
		'control.edit': 'edit',
		'control.npedit': 'edit',
    'rsainput': 'edit',
		'noedit': 'edit',
		'mobile': 'mobile',
		'ctuMobile': 'ctuMobile',
		'otp': 'otp',
		'cert': 'cert',
		'ukey': 'ukey',
		'thirdkey': 'thirdkey',
		'riskMobileBank': 'riskMobileBank',
		'riskMobileAccount': 'riskMobileAccount',
		'riskMobileCredit': 'riskMobileCredit',
		'riskCertificate': 'riskCertificate',
		'riskSecurityQa': 'riskSecurityQa',
		'riskExpressPrivacy': 'riskExpressPrivacy',
    'riskOneKeyConfirm': 'riskOneKeyConfirm',
    'riskSudoku': 'riskSudoku',
		'checkCode': 'checkCode',
		'rds': 'rds',
		'barcode': 'barcode'
	};

	// 安全核心后台返回的产品名和核心处理类的对应关系
	core.ajaxParams = {
		'cert': 'cert',
		'ukey': 'ukey', 
		'thirdkey': 'thirdkey',
		'payment_password': 'edit',
		'query_password': 'edit',
		'operation_password': 'edit',
		'otp': 'otp',
		'mobileotp': 'otp',
		'ctu_mobile': 'ctuMobile',
		'mobile_replace': 'mobile',
		'mobile_free': 'mobile',
		'mobile_pay': 'mobile',
		'mobile_bank': 'mobile',
		'mobile_special_bank': 'mobile',
		'risk_mobile_bank': 'riskMobileBank',
		'risk_mobile_account': 'riskMobileAccount',
		'risk_mobile_credit': 'riskMobileCredit',
		'risk_certificate': 'riskCertificate',
		'risk_security_qa': 'riskSecurityQa',
		'risk_express_privacy': 'riskExpressPrivacy',
    'risk_onekey_confirm': 'riskOneKeyConfirm',
    'risk_mobile_account_sudoku': 'riskSudoku',
    'risk_mobile_bank_sudoku': 'riskSudoku',
		'check_code': 'checkCode',
		'rds': 'rds',
		'barcode': 'barcode'
	};

})(window, light.page.ui.dialog, alipay.security.core);

/** end ---config.js---*/
/** begin ---recheck.js---*/
/**
 * @description 证书类实时检测
 * @author 异草
 * @date 2012-5-10
 */
light.has('/alipay/security/core/recheck') || (function(light, N, security){

// 实时检测
security.core.certCheck = function(opt, callback) {
	var data = opt.data,
		signedData = '';
	var signCertByCdo = function() {
		security.cdo.handlers['*'] = security.cdo.handlers[12004] = function(){
			callback({'certCmdOutput': ''});
		};
		security.create(security.cdo).render(function(){
			this.execute(light.unescapeHTML(data.attr('data-cmd')), function(obj){
				callback({'certCmdOutput': obj.rawData});
			});
		});
	},
	signCertByPta = function() {
		security.create(security.pta).render(function(){
			var	sns = data.attr('data-sn').split('&');
			for(var i = 0, l = sns.length; i < l; i++) {
				signedData = this.sign(data.attr('data-random'), sns[i], data.attr('data-issuer'));
				if(signedData) {
					callback({'signedData': signedData});
					return;
				}
			}
			callback({'signedData': ''});
		});
	},
	signKeyByPta = function() {
		security.create(security.pta).render(function(){
			signedData = this.sign(data.attr('data-random'), data.attr('data-sn'), data.attr('data-issuer'), '', data.attr('data-subject'));
			if(signedData) {
				callback({'signedData': signedData});
			} else {
				callback();
			}
		});
  },
  signKeyByCdo = function() {
    security.cdo.handlers['*'] = security.cdo.handlers[12004] = function(){
      callback();
    };
    security.create(security.cdo).render(function(){
      this.execute(light.unescapeHTML(data.attr('data-cmd')), function(obj){
        callback({'certCmdOutput': obj.rawData});
      });
    });
  };

  if (opt.type == 'cert') {
    if (security.cdo.installed) {
      signCertByCdo();
    } else if (security.pta.installed) {
      signCertByPta();
    } else {
      callback({});
    }
  } else if (opt.type == 'ukey') {
    // 一箭双雕中ukey升级为优先使用cdo发布兼容性逻辑：data-cmd 里面的内容用于cdo签名，但是如果后台没发布，这个字段是没有的，还要继续使用 pta
    // TODO: 以后去掉
    if (security.cdo.installed && light.unescapeHTML(data.attr('data-cmd'))) {
      signKeyByCdo();
    } else if (security.pta.installed) {
      if (light.client.info.engine.trident) {
        signKeyByPta();
      }
    }

  } else if (opt.type == 'thirdkey') {
    if (light.client.info.engine.trident && security.pta.installed) {
      signKeyByPta();
    }
  }
};

/*
 * security.core.recheck 进行证书类实时检测
 * @param opt
 *		{type: 实时检测的类型, 'ukey'、'cert', 'thirdkey'
 *		element: 检测过程对应的Dom结点, 
 *		data: 实时检测所需数据的对象，目前是写在对应的Dom结构上, 
 *		url: 实时检测的地址, 
 *		callback: 检测成功的回调函数}
 * */
security.core.recheck = function (opt) {
	var show = function (index) {
		opt.element.addClass('fn-hide');
		opt.element.item(index).removeClass('fn-hide');
	}, check = function () {
		timer && clearTimeout(timer);
		show(4);
		security.core.certCheck(opt, function(result){
			if(typeof result != 'undefined'){
				show(3);
				light.packetRequest(opt.url, {
					securityId: N('.J-securitycoreMain').attr('data-request')
				}, result, {
					success: done,
					abort: notFound
				});
			} else {
				notFound();
			}
		});

	}, notFound = function() {
		timer && clearTimeout(timer);
		timer = setTimeout(function() {
			show(1);
      if (opt.type == 'ukey' || opt.type == 'thirdkey') {
        timer = setTimeout(check, 5000);
      }
		}, 800);
	}, done = function(rsp) {
		var info = rsp.info, msg = info.message;
		timer && clearTimeout(timer);
		// 分包发送完成，返回校验结果			
		light.log(msg);

		if(msg == 'block' || msg == 'success'){

      if (msg == 'block' || (msg == 'success' && !opt.preventDefaultReCheckSuccess)) {
        var newcore = document.createElement('div'),
            oldcore = N('.J-securitycoreMain'),
            oldtip = N('.J-securitycoreTip');
        newcore.innerHTML=info.html;
        oldcore.parent()[0].insertBefore(N('.J-securitycoreMain', newcore)[0], oldcore[0]);
        oldtip.length && oldtip.parent()[0].insertBefore(N('.J-securitycoreTip', newcore)[0], oldtip[0]);
        oldcore.del();
        oldtip.length && oldtip.del();
        light.each(N('script', N('.J-securitycoreMain')), function(){
          eval(this.text);
        });
      }

			if(msg == 'block') {
				// 当返回的还是拦截模式，需要调用security.core.block, 代码有点绕
				security.core.block(opt.url, opt.callback);
			} else if(msg == 'success') {
				N('.ui-securitycore').removeClass('fn-hide');
				security.core.visualTip();
				opt.callback && opt.callback();
			}
		} else {
			notFound();
		}
	};

	var	timer = setTimeout(check, 100);

	N('.J_reCheck').click(function(e){
		e.cancel();
		check(e);
	});
	
	opt.element.item(1).mouseover(function(e){
		e && timer && clearTimeout(timer);	
	}).mouseout(function(e){
		timer = setTimeout(check, 4000);	
	});
};


})(window.light, light.node, alipay.security);

/** end ---recheck.js---*/
/** begin ---block.js---*/
/**
 * @description 安全产品不支持，不可用出现拦截页面
 * @author 异草
 * @date 2012-5-10
 */
light.has('/alipay/security/core/block') || (function(light, N, security){

// 显示模块
var exist = function (id) {
	return light.get(id);
},
showTip = function (elems) {
	for(var i=0, l=elems.length; i<l; i++) {
		var elem = elems[i];
		if(elem.rule(elem.id)) {
			N('#' + elem.id).removeClass('fn-hide');
			elem.callback && elem.callback(N('#' + elem.id));
			// cashier系统需要区分计算加后缀
			if(systemName == 'cashier') elem.seed += '_cashier';
			light.track(elem.seed);
			return;
		}
	}
};

// 数字证书
certElems = [
	{id: 'J_certOs', rule: exist, seed: 'AQ_CA_OSnotSupport'},
	{
    id: 'J_certNoPta',
    rule: function(){
      // 当手机宝令和证书不共存且没装 pta 的时候才显示 noPta
      // 换言之，一旦是共存，就放过；否则走老逻辑，根据 pta 安装与否决定是否放出 nopta 提示。
      return !(light.node('#J-cert-section').attr('data-alternative') === 'true') && (!security.pta.installed && !security.cdo.installed);
    },
    seed: 'AQ_CA_noPta'
  },
	{id: 'J_certNotUse', rule: exist, seed: 'AQ_CA_no'},
	{id: 'J_certChecking', 
	 rule: exist, 
	 seed: 'AQ_CA_no',
	 callback: function(data){
		var certRecheckeElems = N('#J_certNo, #J_certNotFound, #J_certFound, #J_certValidating, #J_certChecking'),
			option={type:'cert', element:certRecheckeElems, data:data, url:reCheckUrl, callback:reCheckSuccess, preventDefaultReCheckSuccess: preventDefaultReCheckSuccess};
		security.core.recheck(option); 
	}},
	{id: 'J_certOverdue', rule: exist, seed: 'AQ_CA_update'},
	{id: 'J_certException', rule: exist, seed: ''},
	{id: 'J_publicException', rule: exist, seed: ''}
];

// 支付盾
ukeyElems = [
	{id: 'J_ukeyOs', rule: exist, seed: 'AQ_KEY_OSnotSupport'},
	{id: 'J_ukeyBrowser', rule: exist, seed: 'AQ_KEY_notSupport'},
  {id: 'J_ukeyNoPta', rule: function(){ return !security.cdo.installed && (!security.pta.installed || !security.hwpta.installed); }, seed: 'AQ_KEY_noPta'},
  {id: 'J_ukeyInActive', rule: exist, seed: 'AQ_KEY_inActive'},
  {id: 'J_ukeyChecking',
	 rule: exist, 
	 seed: 'AQ_KEY_noKey', 
	 callback: function(data){ 
		var ukeyRecheckeElems = N('#J_ukeyNoKey, #J_ukeyNotFound, #J_ukeyFound, #J_ukeyValidating, #J_ukeyChecking'),
		  	option={type:'ukey', element:ukeyRecheckeElems, data:data, url:reCheckUrl, callback:reCheckSuccess, preventDefaultReCheckSuccess: preventDefaultReCheckSuccess};
		security.core.recheck(option); 
	}},
	{id: 'J_ukeyInLost', rule: exist, seed: 'AQ_KEY_cancel'},
	{id: 'J_ukeyOverdue', rule: exist, seed: 'AQ_KEY_update'},
	{id: 'J_ukeyException', rule: exist, seed: ''},
	{id: 'J_publicException', rule: exist, seed: ''}
];

// 第三方盾
thirdkeyElems = [
	{id: 'J_thirdkeyOs', rule: exist, seed: 'AQ_UKEY_OSnotSupport'},
	{id: 'J_thirdkeyBrowser', rule: exist, seed: 'AQ_UKEY_notSupport'},
	{id: 'J_thirdkeyNoPta', rule: function(){ return !security.pta.installed; }, seed: 'AQ_UKEY_noPta'},
	{id: 'J_thirdkeyChecking', 
	 rule: exist, 
	 seed: 'AQ_UKEY_noKey', 
	 callback: function(data){ 
	 	var thirdkeyRecheckeElems = N('#J_thirdkeyNo, #J_thirdkeyNotFound, #J_thirdkeyFound, #J_thirdkeyValidating, #J_thirdkeyChecking'),
		 	option={type:'thirdkey', element:thirdkeyRecheckeElems, data:data, url:reCheckUrl, callback:reCheckSuccess, preventDefaultReCheckSuccess: preventDefaultReCheckSuccess};
		security.core.recheck(option); 
	}},
	{id: 'J_thirdkeyOverdue', rule: exist, seed: 'AQ_UKEY_update'},
	{id: 'J_thirdkeyLogoff', rule: exist, seed: 'AQ_UKEY_cancel'},
	{id: 'J_thirdkeyException', rule: exist, seed: ''},
	{id: 'J_publicException', rule: exist, seed: ''}
];

var reCheckUrl, reCheckSuccess, systemName, preventDefaultReCheckSuccess;
security.core.block = function(url, callback, preventDefaultReSuccess){
	reCheckUrl = url;
	reCheckSuccess = callback;
  preventDefaultReCheckSuccess = preventDefaultReSuccess;
	systemName = N('.J-securitycoreMain').attr('data-system');

	N("#J_scCheck").addClass('fn-hide');
	if(N('.cert-section').length) {
		showTip(certElems);
	} else if(N('.ukey-section').length) {
		showTip(ukeyElems);
		N('.ukeyDownLink').attr('href', security.cdo.info.downloadUrl);
	} else if(N('.thirdkey-section').length) {
		showTip(thirdkeyElems);
		N('.thirdkeyDownLink').attr('href', security.pta.info.downloadUrl);
	}

	N('.downLinkFirst').click(function(){
		var item = N(this).parent('.ui-tip');
		item.addClass('fn-hide');
		N('#' + item.attr('id') + 'Clicked').removeClass('fn-hide');
	});

	security.page.processCertLink(N('.linkInXbox'));

	new light.pop({
		targets: N('.showCertTip'), 
		className: 'ui-securitycore', 
		width: 340,
		direction: 'down'
	});

	// cashier系统需要区分计算加后缀
	if(systemName == 'cashier') { 
		N('.J-securitycoreMain [seed]').each(function(i, item){
			var item = N(item),
				seed = item.attr('seed');
			item.attr('seed', seed+'_cashier');
		});
	}
}

})(window.light, light.node, alipay.security);

/** end ---block.js---*/
/** begin ---visualTip.js---*/
/**
 * @description 安全产品可感知提示
 * @author 异草
 * @date 2012-7-10
 */

light.has('/alipay/security/core/visualTip') || (function(win, N, security){
	security.core.visualTip = function() {
		setTimeout(function(){
			if(light.node('.J-securitycoreTip').length){
				var visualTip = light.node('.J-securitycoreTip'),
            resultDom = light.node('.J-checkResult', visualTip),
            resultHtml = resultDom.html(),
            resultStatusClass = 'ui-form-item-' + (resultDom.attr('data-status') || 'success');

        light.node('.ui-form-item', visualTip).removeClass('ui-form-item-loading').addClass(resultStatusClass);

        if (light.node('.J-security-cert-is-not-use').length && !security.pta.installed && !security.cdo.installed) {

          var certCtrlDownloadAddress = security.securityCenterServer + '/cert/downLoadCtrl.htm',
              certManageAddress = security.securityCenterServer + '/cert/manage.htm',
              linkInXbox = visualTip.attr('data-link-in-xbox');

          resultHtml = '尚未安装数字证书控件，您可以使用宝令进行校验 或 <a href="' + (linkInXbox ? certCtrlDownloadAddress : certManageAddress) + '" class="' + linkInXbox + '" seed="AQ_CA_noPtaClick" target="_blank" data-href="' + certManageAddress + '">安装数字证书控件</a>。';
        }

				light.node('.ui-form-explain', visualTip).html(resultHtml);
        // 处理链接
        security.page.processCertLink(N('.linkInXbox'));
      }
		}, 2000);
	};

})(window.light, light.node, alipay.security);

/** end ---visualTip.js---*/
/** begin ---module/base.js---*/
// 安全产品基本模型
light.has('/alipay/security/core/base') || (function(win, dialog, core){
	var base, passport = [];
	base = core.base = function(credential){
		if(credential !== passport) throw 'invalid constructor, use create() instead.';
	};

	base.defaults = {
		errorMsg: '',
		rule: function(val) { return !(light.trim(val).length) ? false : true; },
		itemClass: "ui-form-item",
		notifyClass: "ui-form-explain",
		errorClass: "ui-form-item-error",
		successClass: "ui-form-item-success",
		focusClass: "ui-form-item-focus"
	};

	base.create = function(type, product, options) {
		if(!type) {
			throw 'this security product not exist';
			return;
		}

		var prod = new type(passport);
		prod.__type = type;
		type.defaults = light.extend({}, base.defaults, type.defaults);
		prod.options = light.extend({}, type.defaults, options);
		prod.product = product;
		prod.postInit();
		return prod;
	};

	base.prototype = {
		postInit: function() {
			var self = this;
			this.element = light.node('#'+this.product.options.id);
			this.parent = this.element.parent('.'+this.options.itemClass);
			this.msg = this.parent.find('.'+ this.options.notifyClass);
			this.defaultMsg = this.element.attr('data-explain') || '';
			this.bind();
			light.track('sc_' + this.product.__type.Name);
		},
		bind: function() {
			var self = this;
			light.on(this.product.options.id, 'focus', function() {
				self.afterValidate(true);
			});
		},
		execute: function(next, requestContext) {
			this.getValue(requestContext);
			if(this.validate()) {
				next();
			} else {
				requestContext.stoped = true;
			}
		},
		getValue: function(requestContext) { 
			var self = this;
			this.product.render(function(){
				self.value = this.getValue();
				requestContext.params[self.options.paramName] = self.value;
			});
		},
		validate: function() {
			var rule = this.options.rule,
				placeholder = light.node(this.product.element).attr('placeholder');
			if(this.value == placeholder) {
				this.value = '';
			}
			this.isValid = light.isFunction(rule) ? rule(this.value) : rule.test(this.value);
			this.afterValidate(this.isValid);
			return this.isValid;
		},
		// 校验成功后，是否锁定输入框，手机动态口令、宝令、手机宝令需要锁定
		lock: function(isChecked) {
			if(isChecked) { 
				light.node(this.product.element).addClass('ui-input-unwrite').attr('disabled', true);
			}
		},
		afterValidate: function(isValid, errorMsg, isChecked) {
			var opt = this.options,
				errorMsg = errorMsg || opt.errorMsg;
			
			this.lock(isChecked);	

			if(isValid) {
				this.parent.removeClass(opt.successClass).removeClass(opt.errorClass);
				this.msg.html(this.defaultMsg);
			} else {
				this.parent.removeClass(opt.successClass).addClass(opt.errorClass);
				this.msg.html(light.trim(errorMsg));
			}
		}
	};

})(window, light.page.ui.dialog, alipay.security.core);

/** end ---module/base.js---*/
/** begin ---module/edit.js---*/
light.has('/alipay/security/core/edit') || (function(win, core){
	var edit; 
	core.edit = edit = light.deriveFrom(core.base, {
		postInit: function() {
			var self = this;
			this.parent = light.node('#'+this.product.options.hidnId).parent('.'+this.options.itemClass);
			this.msg = this.parent.find('.'+ this.options.notifyClass);
			this.defaultMsg = this.msg.html();
			this.bind();
			light.track('sc_' + this.product.__type.Name);
		},
		getValue: light.noop,
		execute: function(next, requestContext) {
			var	self = this,
				pwdId = this.parent.find('input[name=J_aliedit_key_hidn]')[0].value,
				uId= this.parent.find('input[name=J_aliedit_uid_hidn]')[0].value,
				isEdit = this.parent.find('input[name=J_aliedit_using]')[0].value,
				prodType = this.parent.find('input[name=J_aliedit_prod_type]')[0].value;

			if(isEdit=='true' && !(alipay.security.edit.installed || alipay.security.npedit.installed)) {
				alipay.security.edit.detect();
				requestContext.stoped = true;
				return;
			}
			this.product.onready(function(){
				light.get(pwdId).value = self.value = this.getPassword();
				if(isEdit=='true') {
					isEdit && self.parent.find("input[name=_seaside_gogo_]").val(this.getCi1());
				}

        if(self.validate()) {
          var data = {
            'J_aliedit_key_hidn': pwdId,
            'J_aliedit_uid_hidn': uId,
            'J_aliedit_using': isEdit,
            '_seaside_gogo_': isEdit == 'true' ? this.getCi1() : ''
          };
          data[pwdId] = self.value;
          data[uId] = light.get(uId).value;
          self.ajaxData = light.extend({}, data);
          self.ajaxData[prodType] = light.extend({}, data);
          requestContext.params = light.extend(requestContext.params, self.ajaxData);
          next();
        }
				requestContext.stoped = true;
			});
		},
		lock: light.noop,

    afterValidate: function(isValid, errorMsg, isChecked) {
      var pwdId = this.parent.find('input[name=J_aliedit_key_hidn]')[0].value,
          prodType = this.parent.find('input[name=J_aliedit_prod_type]')[0].value;

      var opt = this.options,
          errorMsg = errorMsg || opt.errorMsg[prodType];

      this.lock(isChecked);

      if(isValid) {
        this.parent.removeClass(opt.successClass).removeClass(opt.errorClass);
        this.msg.html(this.defaultMsg);
      } else {
        this.parent.removeClass(opt.successClass).addClass(opt.errorClass);
        this.msg.html(light.trim(errorMsg));
      }
    }
	});

	edit.defaults = { 
		errorMsg: {
      payment_password:'请填写支付密码。',
      query_password: '请填写登录密码。',
      operation_password: '请填写操作密码。'
    }
	};

})(window, alipay.security.core);


/** end ---module/edit.js---*/
/** begin ---module/mobile.js---*/
light.has('/alipay/security/core/mobile') || (function(win, core){
	var mobile = light.deriveFrom(core.base, {
		execute: function(next, requestContext) {
			// 判断可信手机是否校验通过，如果没有校验通过或还未来校验，自动触发可信手机的校验
			if(this.product.origin && this.product.origin == 'credible' && !this.product.credibleValidate) {
				var credibleMobile = this.product.credibleMobile;
				credibleMobile.validateNum.call(credibleMobile);
				requestContext.stoped = true;
				return;
			}
			this.getValue(requestContext);
			if(this.validate()) {
				next();
			} else {
				requestContext.stoped = true;
			}
		},
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        requestContext.params[self.options.paramName] = self.value;

        // 扁平的数据格式暂时保留，所有场景接入决策中心后，把下面去掉即可
        requestContext.params.mobileAckCode = self.value.mobileAckCode;
      });
    }
	});
	mobile.defaults = { 
		errorMsg: '请输入6位数字校验码。',
    rule: function(val){
      return /^\d{6}$/.test(val.mobileAckCode);
    }
  };
	core.mobile = mobile;
})(window, alipay.security.core);


/** end ---module/mobile.js---*/
/** begin ---module/ctuMobile.js---*/
light.has('/alipay/security/core/ctuMobile') || (function(win, core){
	var ctuMobile= light.deriveFrom(core.base, {
		execute: function(next, requestContext) {
			// 判断可信手机是否校验通过，如果没有校验通过或还未来校验，自动触发可信手机的校验
			if(this.product.origin && this.product.origin == 'credible' && !this.product.credibleValidate) {
				var credibleMobile = this.product.credibleMobile;
				credibleMobile.validateNum.call(credibleMobile);
				requestContext.stoped = true;
				return;
			}
			this.getValue(requestContext);
			if(this.validate()) {
				next();
			} else {
				requestContext.stoped = true;
			}
		},
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        requestContext.params[self.options.paramName] = self.value;

        // 兼容ctu_mobile的核心3和决策中心的两种参数要求，所有场景接入后可以去掉
        light.extend(requestContext.params, self.value);
      });
    }
	});
	ctuMobile.defaults = { 
		errorMsg: '请输入6位数字校验码。',
		rule: function(val){
			return /^\d{6}$/.test(val.mobileAckCode);	
		}, 
		paramName: 'ctu_mobile'
	};
	core.ctuMobile = ctuMobile;
})(window, alipay.security.core);

/** end ---module/ctuMobile.js---*/
/** begin ---module/otp.js---*/
light.has('/alipay/security/core/core/otp') || (function(core){
	var otp = light.deriveFrom(core.base, {
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        requestContext.params[self.options.paramName] = self.value;
        light.extend(requestContext.params, self.value);
      });
    }
  });
	otp.defaults = { 
		errorMsg: '请输入6位数字校验码。',
		rule: function(val) {
      return /^\d{6}$/.test(val.otpPassword);
    },
    paramName: 'otp'
	};
	core.otp = otp;
})(alipay.security.core);

/** end ---module/otp.js---*/
/** begin ---module/cert.js---*/
light.has('/alipay/security/core/baseCert') || (function(win, dialog, security, core){
	var baseCert;
	core.baseCert = baseCert = light.deriveFrom(core.base, {
		bind: light.noop,
		getValue: light.noop,
		validate: light.noop,
		lock: light.noop,
		postInit: function() {
			// 证书类的提示，优先级：总提示区域，密码控件的提示区域，证书类的提示区域
			var wrap= light.node('.J-securitycoreTip')[0] || light.node('.edit-section')[0] || light.node('.cert-section, .ukey-section, .thirdkey-section')[0];
			this.parent = light.node('.'+ this.options.itemClass, wrap);
			this.msg = this.parent.find('.'+ this.options.notifyClass);
			var defaultMsgWrap = light.node('.J-checkResult', wrap)[0] || this.msg[0];
			this.defaultMsg = defaultMsgWrap.innerHTML;
			light.track('sc_' + this.product.__type.Name);
		},
		/**
		 * 无界面控件默认的信息提示方式，常见的信息有：无控件，无盾，控件错误。
		 * */
		showMessage: function(status, error) {
			var label = this.options.label, otherCont = '';
			
			if(this.product.__type.Name == 'ukey') {
				otherCont = ', <a href="'+ this.product.exeDownloadUrl +'">立即安装</a>';
			}
			var keyError = error ? '，错误代码：' + error.number : '',
				errorMsg = {
				'noPta': '您的电脑还未装控件，请<a href="'+ this.product.__type.info.downloadUrl +'">立即安装</a>，安装后请刷新或重启浏览器。',
				'noKey': '没有检测到您的'+ label +'，请插入后重试或请尝试安装驱动' + otherCont,
				'keyError': label +'出现异常'+ keyError 
			};
			this.afterValidate(false, errorMsg[status]);
		}
	});
	baseCert.defaults = {paramName: 'signedData'};

	core.cert= light.deriveFrom(baseCert, {
		execute: function(next, requestContext){
			// 数字证书后期也需要实时校验，因此也需向后台发送jsonp请求，后台不使用这个值，
			requestContext.params[this.options.paramName] = {singedData: 'cert'};
      light.extend(requestContext.params, {singedData: 'cert'});
			next();
		}
	});
	core.cert.defaults = light.extend({}, baseCert.defaults, {label: '数字证书', paramName: 'cert'});

	core.ukey = light.deriveFrom(baseCert, {
    execute: function(next, requestContext){
      if(!this.product.__type.installed) {
        this.showMessage('noPta');
        requestContext.stoped = true;
        return;
      }

      var	that = this;
      this.product.onready(function(){
        // 一箭双雕中ukey升级为优先使用cdo发布兼容性逻辑：cmd 里面的内容用于cdo签名，但是如果后台没发布，这个字段是没有的，还要继续使用 pta
        // TODO: 以后去掉
        if (security.cdo.installed && this.cmd) {
          var self = this;

          this.handlers['*'] = function(e){
            that.showMessage.call(that, 'keyError', e);
            requestContext.stoped = true;
          };

          this.handlers[12004] = function (e) {
            that.showMessage.call(that, 'noKey', e);
            requestContext.stoped = true;
          };

          this.execute(light.unescapeHTML(this.cmd), function (obj) {
            that.certCmdOutput = obj.rawData;
            if(requestContext.stoped) return;

            if(!that.certCmdOutput) {
              that.showMessage('noKey');
              requestContext.stoped = true;
            } else {
              light.get(self.id).value = that.certSign;
              requestContext.params[that.options.paramName] = {certCmdOutput: that.certCmdOutput};
              light.extend(requestContext.params, {certCmdOutput: that.certCmdOutput});
              that.afterValidate(true);
              next();
            }
          });
        } else {
          this.handlers['*'] = function(e) {
            that.showMessage.call(that, 'keyError', e);
            requestContext.stoped = true;
          };
          this.handlers['-2147483135'] = this.handlers['-2146434962'] = function() {
            requestContext.stoped = true;
          };

          that.certSign = this.sign(this.src, this.certSn, this.issuerDn, '', this.subjectCN);
          if(requestContext.stoped) return;

          if(!that.certSign) {
            that.showMessage('noKey');
            requestContext.stoped = true;
          } else {
            light.get(this.id).value = that.certSign;
            requestContext.params[that.options.paramName] = {signedData: that.certSign};
            light.extend(requestContext.params, {signedData: that.certSign});
            that.afterValidate(true);
            next();
          }
        }

      });
    }
  });
	core.ukey.defaults = light.extend({}, baseCert.defaults, {label: '支付盾', paramName: 'ukey'});

	core.thirdkey = light.deriveFrom(baseCert, {
    execute: function(next, requestContext){
      if(!this.product.__type.installed) {
        this.showMessage('noPta');
        requestContext.stoped = true;
        return;
      }

      var	that = this;
      this.product.onready(function(){
        this.handlers['*'] = function(e) {
          that.showMessage.call(that, 'keyError', e);
          requestContext.stoped = true;
        };
        this.handlers['-2147483135'] = this.handlers['-2146434962'] = function() {
          requestContext.stoped = true;
        };

        that.certSign = this.sign(this.src, this.certSn, this.issuerDn, '', this.subjectCN);

        if(requestContext.stoped) return;

        if(!that.certSign) {
          that.showMessage('noKey');
          requestContext.stoped = true;
        } else {
          light.get(this.id).value = that.certSign;
          requestContext.params[that.options.paramName] = {signedData: that.certSign};
          light.extend(requestContext.params, {signedData: that.certSign});
          that.afterValidate(true);
          next();
        }
      });
    }
  });
	core.thirdkey.defaults = light.extend({}, baseCert.defaults, {label: 'U盾', paramName: 'thirdkey'});

})(window, light.page.ui.dialog, alipay.security, alipay.security.core);


/** end ---module/cert.js---*/
/** begin ---module/riskMobileBank.js---*/
light.has('/alipay/security/core/riskMobileBank') || (function(win, core){
	var riskMobileBank = light.deriveFrom(core.base, {
		execute: function(next, requestContext) {
			this.getValue(requestContext);
			if(this.validate()) {
				next();
			} else {
				requestContext.stoped = true;
			}
		}
	});
	riskMobileBank.defaults = { 
		errorMsg: '请输入6位数字校验码。',
		rule: function(val){
			return /\d{6}/.test(val.mobileAckCode);	
		}, 
		paramName: 'risk_mobile_bank'
	};
	core.riskMobileBank = riskMobileBank;
})(window, alipay.security.core);


/** end ---module/riskMobileBank.js---*/
/** begin ---module/riskMobileAccount.js---*/
light.has('/alipay/security/core/riskMobileAccount') || (function(win, core){
	var riskMobileAccount = light.deriveFrom(core.base, {
		execute: function(next, requestContext) {
			this.getValue(requestContext);
			if(this.validate()) {
				next();
			} else {
				requestContext.stoped = true;
			}
		}
	});
	riskMobileAccount.defaults = { 
		errorMsg: '请输入6位数字校验码。',
		rule: function(val){
			return /\d{6}/.test(val.mobileAckCode);	
		}, 
		paramName: 'risk_mobile_account'
	};
	core.riskMobileAccount = riskMobileAccount;
})(window, alipay.security.core);


/** end ---module/riskMobileAccount.js---*/
/** begin ---module/riskMobileCredit.js---*/
light.has('/alipay/security/core/riskMobileCredit') || (function(win, core){
	var riskMobileCredit = light.deriveFrom(core.base, {
		execute: function(next, requestContext) {
			this.getValue(requestContext);
			if(this.validate()) {
				next();
			} else {
				requestContext.stoped = true;
			}
		}
	});
	riskMobileCredit.defaults = { 
		errorMsg: '请输入6位数字校验码。',
		rule: function(val){
			return /\d{6}/.test(val.mobileAckCode);	
		}, 
		paramName: 'risk_mobile_credit'
	};
	core.riskMobileCredit = riskMobileCredit;
})(window, alipay.security.core);



/** end ---module/riskMobileCredit.js---*/
/** begin ---module/riskCertificate.js---*/
light.has('/alipay/security/core/core/riskCertificate') || (function(core){
	var riskCertificate = light.deriveFrom(core.base, {});
	riskCertificate.defaults = { 
		errorMsg: '请填写证件的最后6位。',
		rule: function(val){
			return /^.{6}$/.test(val.inputCertificateNo);	
		}, 
		paramName: 'risk_certificate'
	};
	core.riskCertificate = riskCertificate;
})(alipay.security.core);

/** end ---module/riskCertificate.js---*/
/** begin ---module/riskSecurityQa.js---*/
light.has('/alipay/security/core/core/riskSecurityQa') || (function(core){
	var riskSecurityQa = light.deriveFrom(core.base, {});
	riskSecurityQa.defaults = { 
		errorMsg: '请填写答案。',
		rule: function(val){
			return /\S+/.test(val.securityAnswer);	
		}, 
		paramName: 'risk_security_qa'
	};
	core.riskSecurityQa = riskSecurityQa;
})(alipay.security.core);

/** end ---module/riskSecurityQa.js---*/
/** begin ---module/riskExpressPrivacy.js---*/
light.has('/alipay/security/core/riskExpressPrivacy') || (function(core){
	var baseRiskExpressPrivacy;
	var riskExpressPrivacy = light.deriveFrom(core.base, {});

	core.baseRiskExpressPrivacy = baseRiskExpressPrivacy = light.deriveFrom(core.base, {
		errorMsg: '正确请填写银行卡号。',
		rule: function(val){
				return /\d{16,24}/.test(val);	
		}, 
		paramName: 'risk_express_privacy',
		validate: function(){
			var rule = this.rule,
				el = light.node(this.element),
				placeholder = el.attr('placeholder');
				this.value = el.val().replace(/\D/g, ''); 
			if(this.value == placeholder) {
				this.value = '';
			}
			this.isValid = light.isFunction(rule) ? rule(this.value) : rule.test(this.value);
			this.afterValidate(this.isValid, this.errorMsg);
			return this.isValid;
		},
		execute: function(next, requestContext){
			if(!this.validate()) {
				requestContext.stoped = true;
			}
			if(requestContext.stoped) return;

			var	self = this;
			this.product.queryValue(function(data){
				if(data.message){
					self.afterValidate(false, data.message);
				}else{
					var type = data.type,
						value = data.value;
					requestContext.params[self.paramName] = data;
					self.afterValidate(true);
					next();
				}
			});
		}
	});
	core.riskExpressPrivacy = light.deriveFrom(baseRiskExpressPrivacy,{});
})(alipay.security.core);

/** end ---module/riskExpressPrivacy.js---*/
/** begin ---module/riskSudoku.js---*/
light.has('/alipay/security/core/core/riskSudoku') || (function(core){
	var riskSudoku = light.deriveFrom(core.base, {
		postInit: function() {
			var self = this;
      this.product.onready(function() {
        self.element = self.product.element;
        self.parent = self.element.parent('.'+self.options.itemClass);
        self.msg = self.parent.find('.'+ self.options.notifyClass);
        self.defaultMsg = self.element.attr('data-explain') || '';
        self.bind();
      });
      light.track('sc_' + this.product.__type.Name);
		},
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        var arr = [],
            letters = this.letters;
        light.each(self.value.split(''), function(i, v) {
          arr.push(letters[v]);
        });
        requestContext.params[this.options.paramName] = {
          index: arr
        };
      });
    },

    bind: function() {
      var self = this;
      var keys = light.node('table tr td a', this.product.keyboard);
      light.each(keys, function(i, key) {
        light.on(key, 'click', function(e) {
          e.cancel();
          self.afterValidate(true);
        });
      });
    },

    afterValidate: function(isValid, errorMsg, isChecked) {
      var opt = this.options,
          errorMsg = errorMsg || opt.errorMsg;

      var parent = this.element.parent('.input-container');
          explain = parent.find('.' + this.options.notifyClass);

      this.lock(isChecked);

      if(isValid) {
        parent.removeClass(opt.successClass).removeClass(opt.errorClass);
        explain.html(this.defaultMsg);
      } else {
        parent.removeClass(opt.successClass).addClass(opt.errorClass);
        explain.html(light.trim(errorMsg));
      }
    }
  });
	riskSudoku.defaults = { 
		errorMsg: '请点击左侧输入校验码。',
		rule: function(value) {
      return !!value;
    }
	};
	core.riskSudoku = riskSudoku;
})(alipay.security.core);

/** end ---module/riskSudoku.js---*/
/** begin ---module/riskOneKeyConfirm.js---*/
light.has('/alipay/security/core/core/riskOneKeyConfirm') || (function(core){
	var riskOneKeyConfirm = light.deriveFrom(core.base, {
		postInit: function() {
			var self = this;
      this.product.onready(function() {
        self.element = self.product.element;
        self.parent = self.element.parent();
        self.msg = self.parent.find('.'+ self.options.notifyClass);
        self.defaultMsg = self.element.attr('data-explain') || '';
        self.bind();
      });
      light.track('sc_' + this.product.__type.Name);
		},
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        //requestContext.params[self.options.paramName] = self.value;
      });
    }
  });
	riskOneKeyConfirm.defaults = { 
		errorMsg: '请先在支付宝钱包确认后再提交。',
		rule: function(validated) {
      return validated;
    },
    paramName: 'risk-onekey-confirm'
	};
	core.riskOneKeyConfirm = riskOneKeyConfirm;
})(alipay.security.core);

/** end ---module/riskOneKeyConfirm.js---*/
/** begin ---module/checkCode.js---*/
light.has('/alipay/security/core/core/checkCode') || (function(core){
	var checkCode = light.deriveFrom(core.base, {
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        requestContext.params[self.options.paramName] = self.value;

        light.extend(requestContext.params, self.value);

      });
    }
  });
	checkCode.defaults = { 
		errorMsg: '请正确填写校验码。',
		rule: function(val){
			return /^[a-zA-Z0-9]{4}$/.test(val['check_code']);
		},
		paramName: 'checkcode'
	};
	core.checkCode = checkCode;
})(alipay.security.core);


/** end ---module/checkCode.js---*/
/** begin ---module/rds.js---*/
light.has('/alipay/security/core/core/rds') || (function(core){
	var rds = light.deriveFrom(core.base, {
			afterValidate: function(isValid, errorMsg, isChecked) { }
		});
	rds.defaults = { 
		paramName: 'rds',
		rule: function(){
			return true;
		} 
	};
	core.rds = rds;
})(alipay.security.core);



/** end ---module/rds.js---*/
/** begin ---module/barcode.js---*/
light.has('/alipay/security/core/core/barcode') || (function(core){
	var barcode = light.deriveFrom(core.base, {
		postInit: function() {
			var self = this;
      this.product.onready(function() {
        self.element = self.product.element;
        self.parent = self.element.parent('.'+self.options.itemClass);
        self.msg = self.parent.find('.'+ self.options.notifyClass);
        self.defaultMsg = self.element.attr('data-explain') || '';
        self.bind();
      });
      light.track('sc_' + this.product.__type.Name);
		},
    getValue: function(requestContext) {
      var self = this;
      this.product.render(function(){
        self.value = this.getValue();
        //requestContext.params[self.options.paramName] = self.value;
      });
    }
  });
	barcode.defaults = { 
		errorMsg: '请扫描二维码后，再提交。',
		rule: function(validated) {
      return validated;
    },
    paramName: 'barcode'
	};
	core.barcode = barcode;
})(alipay.security.core);

/** end ---module/barcode.js---*/

/**alipay.security.core-1.14**/
/** CurrentDeveloper: wangwei**/
/** DeployDate: Thu Jan 02 12:14:19 CST 2014**/
