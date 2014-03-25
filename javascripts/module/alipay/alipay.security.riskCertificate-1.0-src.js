/** begin ---riskCertificate.js---*/
light.has('/alipay/security/riskCertificate') || (function(security) {
	
var riskCertificate = {Name: 'riskCertificate'}; 
members = {
	ready: true,
	render: function(callback) {
		light.isFunction(callback) && this._readyList.push(callback);
		this.element = light.get(this.options.id);	
		var queue = this._readyList;
		while(queue.length) queue.shift().apply(this);
	},
	getValue: function() {
		return {inputCertificateNo : this.element.value};
	}
};

security.riskCertificate = light.deriveFrom(security.base, members, riskCertificate);
})(alipay.security);


/** end ---riskCertificate.js---*/
/**Last Changed Author: xugan--Last Changed Date: Tue Nov 20 10:39:54 CST 2012**/
/**alipay.security.riskCertificate-1.0**/
/** CurrentDeveloper: saiyagg**/
/** DeployDate: Tue Nov 20 12:02:19 CST 2012**/
