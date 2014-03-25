/** begin ---checkCode.js---*/
light.has('/alipay/security/checkCode') || (function(security) {
	
var checkCode = {
	Name: 'checkCode'
}, 
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
      "check_code": this.element.value
    };
	}
};

security.checkCode = light.deriveFrom(security.base, members, checkCode);

})(alipay.security);

/** end ---checkCode.js---*/
/**Last Changed Author: shuai.shao--Last Changed Date: Thu Jun 13 10:27:09 CST 2013**/
/**alipay.security.checkCode-1.1**/
/** CurrentDeveloper: shawn**/
/** DeployDate: Thu Jun 13 10:27:44 CST 2013**/
