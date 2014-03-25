/** begin ---rds.js---*/
(function(security) {
	
var rds = {
	Name: 'rds'
}, 
members = {
	ready: true,
	render: function(callback) {
		light.isFunction(callback) && this._readyList.push(callback);
		var queue = this._readyList;
		while(queue.length) queue.shift().apply(this);
	},
	getValue: function() {
		return {
			"rdsUaValue" : window.json_ua ? window.json_ua : '',
			"rdsTokenValue" : window.form_tk ? window.form_tk : ''
		}
	}
};

security.rds = light.deriveFrom(security.base, members, rds);

})(alipay.security);

/** end ---rds.js---*/
/**Last Changed Author: xugan--Last Changed Date: Wed Dec 26 15:34:02 CST 2012**/
/**alipay.security.rds-1.0**/
/** CurrentDeveloper: saiyagg**/
/** DeployDate: Wed Dec 26 16:19:09 CST 2012**/
