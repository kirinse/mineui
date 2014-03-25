/** begin ---riskSecurityQa.js---*/
light.has('/alipay/security/riskSecurityQa') || (function(security) {
	
var riskSecurityQa = {Name: 'riskSecurityQa'}; 
members = {
	ready: true,
	render: function(callback) {
		light.isFunction(callback) && this._readyList.push(callback);
		this.element = light.get(this.options.id);	
		var queue = this._readyList;
		while(queue.length) queue.shift().apply(this);
	},
	getValue: function() {
		return {securityAnswer : this.element.value};
	}
};

security.riskSecurityQa = light.deriveFrom(security.base, members, riskSecurityQa);
})(alipay.security);


/** end ---riskSecurityQa.js---*/
/**Last Changed Author: xugan--Last Changed Date: Tue Nov 20 10:38:25 CST 2012**/
/**alipay.security.riskSecurityQa-1.0**/
/** CurrentDeveloper: saiyagg**/
/** DeployDate: Tue Nov 20 12:04:15 CST 2012**/
