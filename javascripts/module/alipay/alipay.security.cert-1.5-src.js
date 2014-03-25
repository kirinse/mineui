/** begin ---cert.cdo.js---*/
light.has('/alipay/security/cdo') || (function(security) {

var CMD_VERSION = 1;

var downloadServer = alipay.security.downloadServer;

var cdo = function() {
	var ua = light.client.info, info = {
		activex: 'AliCertDO.AliCertDOCtrl',
		plugin: 'npalicdo plugin',
		classId: '08d512d2-7d97-4e22-b7db-82791106c086',
		type: 'application/npalicdo',
		version: '1.0.0.1',
		codebase: downloadServer + '/ukey/cf/alicert.cab',
        downloadUrl: ua.os.windows ? downloadServer + '/ukey/cf/alicert.exe' : downloadServer + '/sec/cert/alicert.dmg'
	},
	message = {
		0: '您需要重新安装数字证书控件',
		1: '操作系统或浏览器不支持',
		2: '插件没有安装',
		'5001-10000': '您的运行环境配置不正确',
		'10001-11000': '控件运行错误',
		'11001-12000': '调用参数错误'
	},
	template = ua.engine.trident ?
		'<object id="{id}" type="{type}" classid="clsid:{classId}" codebase="{codebase}" width="0" height="0"></object>' :
		'<object id="{id}" type="{type}" width="0" height="0"></object>';

	return {
		Name: 'cert.cdo',
		defaultMethod: 'Do',
		info: info,
		template: template,
		message: message,
        available: !!(ua.os.windows || ua.os.macos && ua.os.macos[1] > 6),
		actions: {restore: 'custom'},
		defaults: {msgMode: 'dialog'},
		// do nothing if cert not found
		handlers: {12004: light.noop},
		updateQueryInterval: 1000,
		updateHandler: null,
		properties: {handlers: {}}
	};
}(),
members = {
	execute: function(command, callback) {
		var api = null;
		if(!command) {
			if(light.debug) throw 'Empty command passed';
			return;
		}
		if(typeof command === 'object') {
			api = command.service;
			command = light.param(command);
		} else {
			api = light.unparam(command).service;
		}
		if(!api) {
			if(light.debug) throw 'Invalid command passed';
			return;
		}
		light.log('Calling %s: %s.', api, command);

		var params = '';
		try {
			// IE ignore case...
			params = this.element.Do(command);
		} catch(e) {
			light.log('Exception thrown from %s: %s.', api, result.rawData);
			this.catchError(api, e);
			return;
		}

		var result = params ? light.unparam(params) : {};

		// save original returned data
		result.rawData = params || '';
		result.api = api;

		// parse status code
		//var code = result.status = parseInt(result.status, 10) || -1;
		var code = result.status = parseInt(result.status, 10);
        if(isNaN(code)) code = -1;

		light.log('Result from %s: (%d) %s.', api, code, params);

		// succeeded
		if(!code) {
			if(this.backupCmd) {
				cdo.updateHandler && cdo.updateHandler.call(this, false);

				var info = this.backupCmd;
				delete this.backupCmd;
				light.log('Call previous command, see next log.');
				this.execute(info.command, info.callback);
			} else {
				callback && callback.call(this, result);
			}
			return;
		}

		// call handler if the control is being updating or updating just finished
		var me = this, updating = code >= 101 && code < 1000;
		if(updating) {
			if(!this.backupCmd && api != 'update') this.backupCmd = {command: command, callback: callback};
			var checker = function() {
				cdo.updateHandler && cdo.updateHandler.call(me, true, result.message);

				// re-check again
				setTimeout(function() {
					me.execute(result.rawData);
				}, cdo.updateQueryInterval);
			};
			checker();
		} else {
			// log the error and message mode
			this.catchError(api, result, true);

			result.msg = this.getMessage(code);
			// stop if user cancelled
			var fn = matchHandler.call(this, code);
			if(fn) {
				fn.call(this, result);
				return;
			} else {
				this.showMessage(result);
			}
		}
	},
	send: function(name, data, callback) {
		var d = data || {};
		d.service = name;
		d.version = CMD_VERSION;
		this.execute(d, callback);
	}
};

var matchHandler = function(code) {
	if(!code) return null;
	return this.handlers[code] || this.handlers['*'] || this.__type.handlers[code] || this.__type.handlers['*'];
};

cdo = security.cdo = light.deriveFrom(security.base, members, cdo);
security.refreshStatus(cdo);

})(alipay.security);



/** end ---cert.cdo.js---*/
/** begin ---cert.enroll.js---*/
light.has('/alipay/security/enroll') || (function(security) {

var downloadServer = alipay.security.downloadServer;
var ua = light.client.info;
var	enroll = function(){
	var	info = {
			activex: 'Itrusenroll.CertEnroll',
			plugin: 'iTrusChina iTrusPTA,XEnroll,iEnroll,hwPTA,UKeyInstalls Firefox Plugin',
			classId: '7978461C-CC22-48F2-BC69-02220D3E101D',
			type: 'application/Itrusenroll.CertEnroll.Version.1',
			version: '1.0.0.1',
			codebase: downloadServer + '/ukey/cert/1007/ie/PTA.cab',
			downloadUrl: downloadServer + '/ukey/cert/1007/ie/iTrusPTA.exe'
		},
		template = ua.engine.trident ? 
			'<object id="{id}" type="{type}" classid="clsid:{classId}" codebase="{codebase}" width="0" height="0"></object>' :
			'<object id="{id}" type="{type}" width="0" height="0"></object>';
		availableObj = {os: !!ua.os.windows, browser: (!!ua.engine.trident || !!ua.browser.firefox || !!ua.browser.chrome)};
	return {
		Name: 'cert.enroll',
		defaultMethod: 'Version',
		info: info,
		template: template,
		message: null,
		availableObj: availableObj,
		available: availableObj.os && availableObj.browser
	};
}();


security.enroll = light.deriveFrom(security.base, {}, enroll);
security.refreshStatus(security.enroll);

})(alipay.security);



/** end ---cert.enroll.js---*/
/** begin ---cert.pta.js---*/
/**
 * 一代数字证书，支付盾，U盾签名所使用的控件PTA
 * TODO: getCerts, getCert, getCertByBlurSearch, sign函数参数较多，后续可以改成传入对象的形式
 **/

light.has('/alipay/security/pta') || (function(security) {

var downloadServer = alipay.security.downloadServer;
var ua = light.client.info;
var	pta = function(){
	var	info = {
			activex: 'PTA.iTrusPTA',
			plugin: 'iTrusChina iTrusPTA,XEnroll,iEnroll,hwPTA,UKeyInstalls Firefox Plugin',
			classId: '1e0dffcf-27ff-4574-849b-55007349feda',
			type: 'application/PTA.iTrusPTA.Version.1',
			version: '1.0.0.1',
			codebase: downloadServer + '/ukey/cert/1007/ie/PTA.cab',
			downloadUrl: ua.engine.trident ? 
						(downloadServer + '/ukey/cert/1007/ie/iTrusPTA.exe?t=20110907.exe') :
						(downloadServer + '/ukey/cert/1007/ff/iTrusPTA_f_c.exe?t=20110714.exe')
		},
		template = ua.engine.trident ? 
			'<object id="{id}" type="{type}" classid="clsid:{classId}" codebase="{codebase}" width="0" height="0"></object>' :
			'<object id="{id}" type="{type}" width="0" height="0"></object>',
		availableObj = {os: !!ua.os.windows, browser: !!(ua.engine.trident || ua.browser.firefox || ua.browser.chrome)},
		message = {
			'-2147483135': '用户取消操作',
			'-2146434962': '用户取消操作'
		};
	return {
		Name: 'cert.pta',
		defaultMethod: 'Version',
		info: info,
		template: template,
		message: message,
		handlers: {},
		availableObj: availableObj,
		available: availableObj.os && availableObj.browser,
		properties: {handlers: {}}
	};
}(),
members = {
	getCerts: function(sn, issuer, subject) {
		// 当所有过滤条件都为空，不进行过滤
		if( !(sn || issuer || subject) ) return null;

		try {
			var filter = this.api('Filter');
			if(!filter) return null;

			filter.Clear();
			if(sn) {
				if(parseInt(sn.substr(0, 1), 16) > 8) { sn = '00' + sn; }
				filter.SerialNumber = sn;
			}
			issuer && (filter.Issuer = issuer);
			subject && (filter.Subject = subject);

			return this.api('MyCertificates');
		} catch(e) {
			this.catchError('filter', e);
		}
		return null;
	},
	getCert: function(sn, issuer, subject) {
		var certs = this.getCerts(sn, issuer, subject), cert = null;	
		if(certs && certs.Count) {
			cert = certs(0);
		}
		return cert;
	},
	getCertByBlurSearch: function(sn, issuer, subject, blurSubjectCn) {
		var cert = this.getCert(sn, issuer) || this.getCert(sn);
		if(cert) return cert;

		if(!blurSubjectCn) return null;

		certs = this.getCerts('', issuer);
		for(var k = 0 ; k < certs.Count ; k++){
			//模糊匹配subjecCN
			if(certs(k).Subject.indexOf(blurSubjectCn) != -1){
				return certs(k);
			}
		}
		return null;
	},
	sign: function(randomStr, sn, issuer, subject, blurSubjectCn) {
		if(!randomStr) throw 'invalid param';

		var cert = this.getCertByBlurSearch(sn, issuer, subject, blurSubjectCn);

		if(!cert) return '';
		try {
			return cert.SignLogonData(randomStr, 4);
		} catch(e) {
			var fn = matchHandler.call(this, e.number);
			fn && fn.call(this, e);
			this.catchError('sign', e);
		}
		return '';
	}
};

var matchHandler = function(code) {
	if(!code) return null;
	return this.handlers[code] || this.handlers['*'] || this.__type.handlers[code] || this.__type.handlers['*'];
};

security.pta = light.deriveFrom(security.base, members, pta);
security.refreshStatus(security.pta);

})(alipay.security);

/** end ---cert.pta.js---*/
/** begin ---ukey.pta.js---*/
light.has('/alipay/security/hwpta') || (function(security) {

var downloadServer = alipay.security.downloadServer;
var ua = light.client.info,
	hwpta = function(){
	var	info = {
			activex: 'HwPTA.iTrusHwPTA',
			classId: 'EF7BC8AC-5BDC-4AED-AD63-A9B3AE7A768C',
			version: '1,1,0,14',
			codebase: downloadServer + '/ukey/hwPTA.cab',
			downloadUrl: downloadServer + '/ukey/cert/1007/ie/iTrusPTA.exe?t=20110907.exe',
			driverUrls:{}
		},
		template = '<object id="{id}" type="{type}" classid="clsid:{classId}" codebase="{codebase}" width="0" height="0"></object>' ,
		availableObj = {os: !!ua.os.windows, browser: !!ua.engine.trident};

	info.driverUrls['Watchdata AliPay CSP v3.3'] = downloadServer + '/ukey/0818/hwWDkey.exe';
	info.driverUrls['EnterSafe ePass2001 for TWCX CSP v1.0'] = downloadServer + '/ukey/0818/hwEpass2001.exe';
	info.driverUrls['HaiTai Cryptographic Service Provider'] = downloadServer + '/ukey/0818/hwHaikey.exe';

	return {
		Name: 'ukey.pta',
		defaultMethod: 'DetectKeys',
		info: info,
		template: template,
		message: null,
		availableObj: availableObj,
		available: availableObj.os && availableObj.browser
	};
}(),

members = {
	/**
	 * 监测驱动是否安装成功
	 * return {Boolean}
	 * */
	checkDriver: function() {
		try {
			return this.element.checkCSP(0);
		} catch(e) {
			this.catchError('checkDriver', e);
		}
		return false;
	},
	/**
	 * 获取插入支付盾的个数
	 * return {Number}
	 * */
	getKeyNum: function() {	
		try {
			return this.element.DetectKeys();
		} catch(e) {
			this.catchError('getKeyNum', e);
		}
		return 0;
	},
	/**
	 * 获取驱动的CSP名称
	 * return {String}
	 *
	 * */
	getDriverName: function(ukeyIndex) {
		var ukeyIndex = ukeyIndex || 0;
		try {
			return this.element.GetKeyCSPName(ukeyIndex);
		} catch(e) {
			this.catchError('getDriverName', e);
		}
		return '';
	},

	getDriverUrl: function() {
		var driverUrls = hwpta.info.driverUrls,
			driverName = this.getDriverName();
		for(var key in driverUrls) {
			if(driverName == key) {
				return driverUrls[key];
			}
		}
		return '';
	},
	/**
	 * 根据userId删除用户证书
	 * return {Boolean}
	 *
	 * */
	deleteCert: function(ukeyIndex, userId) {
		try {
			return this.element.deleteCertificateByUserID(ukeyIndex, userId);
		} catch(e) {
			this.catchError('deleteCert', e);
		}
		return false;
	},
	/**
	 * 导入支付盾管理员口令
	 * return {Number} 返回值1时，导入正常；否则为异常；
	 *
	 * */
	importAdminPIN: function(ukeyIndex, adminPIN) {
		try {
			return this.element.importAdminPIN(ukeyIndex, adminPIN);
		} catch(e) {
			this.catchError('importAdminPIN', e);
		}
		return 0;
	},
	/**
	 * 生成临时密钥对
	 * return {String}
	 *
	 * */
	exportTempPubkey: function() {
		try {
			return this.element.exportTempPubkey();
		} catch(e) {
			this.catchError('exportTempPubkey', e);
		}
		return '';
	}
};


security.hwpta = light.deriveFrom(security.base, members, hwpta);
security.refreshStatus(security.hwpta);

})(alipay.security);


/** end ---ukey.pta.js---*/
/**Last Changed Author: wei.wangwww--Last Changed Date: Tue Apr 02 17:44:29 CST 2013**/
/**alipay.security.cert-1.5**/
/** CurrentDeveloper: wangwei**/
/** DeployDate: Tue Apr 02 17:47:27 CST 2013**/
