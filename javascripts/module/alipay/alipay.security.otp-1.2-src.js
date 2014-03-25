/** begin ---otp.js---*/
light.has('/alipay/security/otp') || (function(security) {
	
var otp = {Name: 'otp'}; 
members = {
	ready: true,
	render: function(callback) {
		light.isFunction(callback) && this._readyList.push(callback);
		this.element = light.get(this.options.id);	
		var queue = this._readyList;
		while(queue.length) queue.shift().apply(this);
	},
	getValue: function() {
		return {
      otpPassword: this.element.value
    };
	}
};

security.otp = light.deriveFrom(security.base, members, otp);
})(alipay.security);

/** end ---otp.js---*/
/**Last Changed Author: shuai.shao--Last Changed Date: Thu Jun 13 10:17:32 CST 2013**/
/**alipay.security.otp-1.2**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Thu Jun 13 10:18:29 CST 2013**/
