/** begin ---riskExpressPrivacy.js---*/
light.has('/alipay/security/riskExpressPrivacy') || (function(security) {
	
var riskExpressPrivacy = {Name: 'riskExpressPrivacy'}; 
members = {
	render: function(callback) {
		light.isFunction(callback) && this._readyList.push(callback);
		this.element = light.get(this.options.id);	
		var queue = this._readyList;
		while(queue.length) queue.shift().apply(this);
	},
	queryValue: function(callback) {
		this.element = light.get(this.options.id);	
		var element = this.element,
			bankCardNo = element.value.replace(/\D/g,''),
			el = light.node(element),
			cardtype = el.attr('data-cardtype'),
			server = el.attr('data-server'),
			url = server + '/validateAndCacheCardInfo.json'; 

		if(cardtype == 'debit') {
			callback({bankCardDebitNo:bankCardNo})
		}else if(cardtype == 'credit'){
			light.request(url, {cardNo:bankCardNo, cardBinCheck:true, doUpdate:false}, {
				format: 'jsonp',
				success: function(rsp){
					if(rsp && rsp.validated) {
						callback({bankCardCreditUUID: rsp.key});
					}else{
						var message = '卡号校验不通过';
						callback({message: message});
					}
				}
			});

		}
	}
};

security.riskExpressPrivacy = light.deriveFrom(security.base, members, riskExpressPrivacy);
})(alipay.security);

/** end ---riskExpressPrivacy.js---*/
/**Last Changed Author: xugan--Last Changed Date: Tue Nov 20 10:37:04 CST 2012**/
/**alipay.security.riskExpressPrivacy-1.0**/
/** CurrentDeveloper: saiyagg**/
/** DeployDate: Tue Nov 20 12:05:50 CST 2012**/
