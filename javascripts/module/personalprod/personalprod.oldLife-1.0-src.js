(function(arale){ if(!arale) return;var deps = arale.deps;
deps.addDependency('personalprod.oldLife',['personalprod.oldLife-1.0.js']);
}((typeof arale == 'undefined') ? undefined : arale));

/** begin ---life.js---*/
AP.pk.pa.popup = function(element, target, type, onOpen, onClose,borderContainer) {
	/* 	modified from AP.util.more */
		var hideClass = "fn-hide";
		var el = (typeof(element) === "string") ? D.get(element) : element;
		var tar = (typeof(target) === "string") ? D.get(target) : target;
		var type = (type !== "") ? type : "click";
		var oSelf = this;
		var borderContainer = borderContainer || D.get("container");
		oSelf.container = target;
		
		if(el == "undefined" || el == null || tar == "undefined" || tar == null) return;
					
		if(type === "hover"){
			E.on(el, "click", function(e){
				if(el.tagName.toUpperCase() === "A"){
					E.preventDefault(e);
				}
			});		
			
			E.on(el, "mouseover", function(){
				D.removeClass(tar, hideClass);
				D.setXY(target, [D.getX(el), D.getRegion(el).bottom]);
				
				if(D.getRegion(target).right > D.getRegion(borderContainer).right) {
					D.setXY(target,  [(D.getX(el) - (D.getRegion(target).right - D.getRegion(borderContainer).right) - 30), D.getRegion(el).bottom]);
				}
				
				if (onOpen) onOpen(oSelf);
			});
			
			E.on(el, "mouseout", function(e){
				if (!AP.fn.eInRegion(D.getRegion(tar), e) ) {
					D.addClass(tar, hideClass);
					if (onClose) onClose(oSelf);
				}
				
			});	
			E.on(tar, "mouseout", function(e){
				if (!AP.fn.eInRegion(D.getRegion(tar), e) ) {
					D.addClass(tar, hideClass);
					if (onClose) onClose(oSelf);
				}
			});			
		} 
};

AP.pk.pa.countText = 	function(field, countField, explainField, maxLen) {
		
	if(field.value.length > maxLen) {
		explainField.innerHTML = '备注字数已经超过' + maxLen + '的限制';
		countField.innerHTML = '0';
		D.addClass(field.parentNode, 'fm-error');
		return false;
	}
	else {
		countField.innerHTML = maxLen - field.value.length;
		D.removeClass(field.parentNode, 'fm-error');
		return true;
	}
};

AP.pk.pa.TextCounter = 	function(field, countField, explainField, maxLen) {

	E.on(field, "keyup", function(e) {
		AP.pk.pa.countText(field, countField, explainField, maxLen);
	});
	
	E.onDOMReady(function() {
		AP.pk.pa.countText(field, countField, explainField, maxLen);
	});
};

/* 	手机号放大镜 */
AP.pk.pa.TextMagnifier = function(el, magEl, type) {
	var oText = D.query('.mag-text', magEl)[0];
	function splitText(){
		var text = el.value;
		text = text.trimAll();
		
		var magText = text.substring(0, 3);
		text = text.substring(3);
		while(text && text.length > 0) {
			magText += ' ' + text.substring(0, 4);
			text = text.substring(4); 
		}
		oText.innerHTML = magText;
	}
	
	function show () {
		D.removeClass(magEl, 'fn-hide');
		D.setXY(magEl,  [D.getX(el), D.getRegion(el).bottom]);
	}
	
	function hide () {
		D.addClass(magEl, 'fn-hide');
	}
	
	E.on(el, "keyup", function(e) {
		if(el.value.length == 0) hide();
		else show();
		
		splitText();
	});
	
	E.on(el, "blur", function(e){
		hide();
		el.value = el.value.trimAll();
	});
	E.on(el, 'focus', function(e) {
		if(el.value.length > 0) {
			show();
			splitText();
		}
	});
};

AP.pk.pa.isValidAmount = function(value) {
	var limit = 10000000000; // 7+3+1digits
	if(typeof value == 'string') value = value.trim();
	if(!isNaN(parseFloat(value)) && parseFloat(value) < limit && /^\d+(\.\d{0,2})?$/.test(value)) {
		return true;
	}
	else {
		return false;
	}
};

AP.pk.pa.isInteger = function(value) {
	return AP.pk.pa.isValidAmount(value) && /^[1-9][0-9]*$/.test(value);
}


AP.pk.pa.toggle = function(el, target, openTxt, closeTxt, onOpen, onClose) {
	if (el.nodeName.toLowerCase() == 'input' && el.type == 'checkbox') {
		E.on(el, 'click', function(e) {
			if (el.checked) {
				D.removeClass(target, 'fn-hide');
				if (onOpen) onOpen();
			}
			else {
				D.addClass(target, 'fn-hide');
				if (onClose) onClose();
			}
		});
	}
	else {
		E.on(el, "click", function(e) {
			if(target.offsetWidth == 0) {
				D.removeClass(target, 'fn-hide');
				if (closeTxt) el.innerHTML = closeTxt;
				if (onOpen) onOpen();
			}
			else {
				D.addClass(target, 'fn-hide');
				if (openTxt) el.innerHTML = openTxt;
				if (onClose) onClose();
			}

			E.preventDefault(e);
		})
		
	}
};

AP.pk.pa.formatMonth = function (monthTxt) {
	var aMonth = monthTxt.split(',');
	var yearFormat = 'yyyy';
	var monthFormat = 'mm';
	var seperator = '、';
	
	var oYear = {};
	var indexYear = '';
	
	for (var i=0; i < aMonth.length; i++) {
		var ym = aMonth[i];
		var sYear = ym.substring(0, yearFormat.length);
		var sMonth = ym.substring(yearFormat.length);
		
		if (!oYear[sYear]) {
			oYear[sYear] = [];
		}
		
		oYear[sYear].push(sMonth);
	};
	
	var aOutputs = {};
	
	for (year in oYear) {
		var months = oYear[year];
		var output = '';
		if (months.length == 12) {
			output = '全年';
		}
		else {
			var idx = 0;
			while(idx < months.length) {
				var start = parseInt(months[idx], 10);
				if (idx + 2 < months.length) {
					var next2 = parseInt(months[idx+2], 10);
					// console.info('months[idx+2]: ' + months[idx+2]);
					// console.info('start: ' + start + ' next2: ' + next2);
					if (next2 - start > 2) {
						output += start + seperator;
						idx ++;
					}
					else {
						var contIdx = idx;
						var till = '';
						while(contIdx < months.length-1 && parseInt(months[contIdx], 10)+1 == parseInt(months[contIdx+1], 10)) {
							till = parseInt(months[contIdx+1], 10);
							contIdx++;
						}
						
						if (output.charAt(output.length-1) == seperator && output.charAt(output.length-2) != '月') {
							output = output.substring(0, output.length-1) + '月' + seperator;
						}
						output += start + '-' + till + '月' + seperator;
						idx = contIdx + 1;
					}
				}
				else {
					output += start + seperator;
					idx ++;
				}
			}
			
			if (output.charAt(output.length-1) == seperator && output.charAt(output.length-2) != '月') {
				output = output.substring(0, output.length-1) + '月';
			}
			
			if (output.charAt(output.length-1) == seperator) {
				output = output.substring(0, output.length-1);
			}
		}
		
		// aOutputs.push(output);
		aOutputs[year] = output;
	}
	
	
	// var next = 0;
	// var months = ['01','02','03','04','05','06','07','08','11','12'];
	// var start = parseInt(month[0]);

	
	// console.info(aOutputs);
	// console.info(oYear);
	
	return aOutputs;
}

AP.pk.pa.contactsAutoComplete = function (options) {
	/* 	自动完成 */
	var oDS;
	if (options.apiUrl) {
		oDS = new YAHOO.util.ScriptNodeDataSource(options.apiUrl + "/user/contacts/searchResult.json?");
		oDS.scriptCallbackParam = "_callback";
	}
	else {
		oDS = new YAHOO.util.XHRDataSource("/user/contacts/searchResult.json");
	}
	
	oDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
	oDS.connMethodPost = true;
	oDS.maxCacheEntries = 60;
	oDS.responseSchema = {
	    resultsList : "result",
	    fields : ["contactLogonId","contactNickName","ownerCardNo","contactRealName", 'id']
	};

	var oAC = new YAHOO.widget.AutoComplete(options.inputEl,"autoCompleteContainer", oDS);
	oAC.queryDelay = 0;
	oAC.resultTypeList = false;
	oAC.autoHighlight  = false;

	oAC.generateRequest = function(sQuery) {
		return "keyword=" + sQuery ;
	};
	
	oAC.formatResult = function(oResultData, sQuery, sResultMatch){
		var ul = D.query('#autoCompleteContainer ul')[0];
		D.setStyle(ul,'width','174px');
		D.setStyles(ul,{'display':''});
		if(oResultData.contactNickName){
			var nick_name = oResultData.contactNickName;
		}else{
			var nick_name = "";
		}
		if(oResultData.contactRealName){
			var real_name = oResultData.contactRealName;
			if(real_name.len()>8){
				real_name = real_name.brief(8)+'..'
			}else{
				real_name = real_name
			}
		}else{
			var real_name = "";
		}
		
		var account   = oResultData.contactLogonId;
		
		if(account.len()>16){
			account = account.brief(16)+'..';
		}else{
			account = account;
		}
		return "<span title=\""+ nick_name +"\" rel=\"" + account + "\">" + real_name + "(" + account + ")</span>";
	};
	
	oAC.itemSelectEvent.subscribe(function(sType, aArgs){
		var contact = aArgs[2];
		options.selectHandler(contact);
    });
	
	oAC.dataErrorEvent.subscribe(function(oSelf , sQuery){
		var ul = D.query('#autoCompleteContainer ul')[0];
		D.setStyles(ul,{'display':'none'});
	});

	// oAC.containerPopulateEvent.subscribe(function(oSelf, aArgs) {
	// 	var oSelf = aArgs[0];
	// 	D.setXY(D.query('.yui-ac-content .yui-ac-bd', oSelf.getContainerEl())[0],  [D.getX(oSelf.getInputEl()), D.getRegion(oSelf.getInputEl()).bottom]);
	// 	
	// });
	
	oAC.containerExpandEvent.subscribe(function(oSelf, aArgs) {
		var oSelf = aArgs[0];
		D.setXY(D.query('.yui-ac-content .yui-ac-bd', oSelf.getContainerEl())[0],  [D.getX(oSelf.getInputEl()), D.getRegion(oSelf.getInputEl()).bottom]);
	});
	
	return oAC;
};

AP.pk.pa.life = AP.pk.pa.life ? AP.pk.pa.life : {};
// 计算服务费
// AP.pk.pa.life.calculateExtraFee = function (amount, extraFeeEl, extraFeeWrapper, extraFeeProp, whiteRecipient, recipientAccount) {
AP.pk.pa.life.calculateExtraFee = function (amount, pageProps) {
/* alert('cal') */
	// console.dir(pageProps)
	var extraFeeEl = D.get('extraFee');
	var extraFeeWrapper = D.get('extraFeeWrapper');
	var extraFeeProp = pageProps.extraFeeProp;
	var whiteRecipient = pageProps.isWhiteUser;
	var recipientAccount = pageProps.accountInput.value;

	var amountLeft = extraFeeProp.amountLeft;
	
	var isToAli = pageProps.isToAli || function(){return true};
	var isAliToCard = pageProps.isAliToCard || function(){return true};

	if(isToAli() && extraFeeProp.useRate && !whiteRecipient) {
		if(AP.pk.pa.isValidAmount(amount) && amount > amountLeft) {
			var extraFee = (Math.round((parseFloat(amount)*100-parseFloat(amountLeft)*100)*(extraFeeProp.rate/100))/100).toFixed(2);
			if(extraFee < 1) {
				extraFee = '1.00';
			}
			else if(extraFee > 25) {
				extraFee = '25.00';
			}
			showExtraFee(extraFee);
		}
		else {
			showExtraFee(extraFee);
		}
	}
	else { // 如果是白名单用户，远程请求计算服务费		
		if(!AP.pk.pa.isValidAmount(amount)) {
			D.addClass(extraFeeWrapper, 'fn-hide');
			return;
		}
		var url = 'life/getExtraFee';

		
		var payType = isToAli() ? '0' : '1';
/* 		var transferMode = isAliToCard() ? '0' : '1'; */
		
		
		var apiOptions = {
			onAPISuccess: function(e, rsp){
				var fee = rsp[0].fee;
				showExtraFee(fee);
			},
			onAPIFailure: function(e, rsp){
				D.addClass(extraFeeWrapper, 'fn-hide');
			},
			method : 'POST'
		};
		
		if (pageProps.extraFeeUrl) {
			AP.hashExtend(apiOptions, {'api_url':pageProps.extraFeeUrl, 'format':'jsonp'});
		};
	
		var callParams = {'amount': amount, 'account': recipientAccount, 'payType':payType};
/* 		AP.hashExtend(apiOptions, {'payType', payType}); */
		if (pageProps.isAliToCard) {
			var transferMode = pageProps.isAliToCard() ? '0' : '1';
			AP.hashExtend(callParams, {'transferMode':transferMode});
		}
		
		
		var api = new AP.core.api(url, apiOptions);
		
		api.call(callParams);
	}
	
	function showExtraFee (fee) {
		extraFeeEl.innerHTML = fee;
		if (parseFloat(fee) > 0) {
			D.removeClass(extraFeeWrapper, 'fn-hide');
		}
		else {
			D.addClass(extraFeeWrapper, 'fn-hide');
		}
	}
	
}

AP.pk.pa.life.AmountInput = function(inputEl, pageProps, extraFee, sms) {
	if (!pageProps.isToAli) {
		pageProps.isToAli = function(){return true};
		pageProps.isAliToCard = function(){return false};
	}
	var extraFeeProp = pageProps.extraFeeProp;
/*
	E.on(inputEl, "keyup", function(e){
	log('pageProps.isToAli(): ' + pageProps.isToAli())
		if (extraFeeProp.useRate && pageProps.isToAli()) {
			var amount = inputEl.value;
			AP.pk.pa.life.calculateExtraFee(amount, pageProps);
		}
		resetSmsAlert();
	});
*/
	E.on(inputEl, "blur", function(e) {
		if(!extraFeeProp.useRate || pageProps.isWhiteUser || !pageProps.isToAli()) {
			var amount = inputEl.value;
			AP.pk.pa.life.calculateExtraFee(amount, pageProps);
		}
		resetSmsAlert();
	});
	
	E.onDOMReady(function(){
		resetSmsAlert();
	});
		
	function resetSmsAlert() {
		var oCell = D.get("cellphoneField");
		if (parseFloat(inputEl.value) >= 1) {
			D.get("smsAlert").disabled = false;
			D.removeClass("smsLabel","ft-gray");
			if (D.get("smsAlert").checked) {
				D.removeClass(oCell, 'fn-hide');
			}
		}
		else {
			D.addClass("smsLabel","ft-gray");
			D.get("smsAlert").checked = false;
			D.get("smsAlert").disabled = true; 
			D.addClass(oCell, 'fn-hide');
		}	
	}	
};

AP.pk.pa.life.freeSmsTrigger = function (inputEl) {
	E.on(inputEl, "keyup", function(e){
		resetSmsAlert();
	});

	E.on(inputEl, "blur", function(e) {
		resetSmsAlert();
	});
	
	E.onDOMReady(function(){
		resetSmsAlert();
	});
	
	function resetSmsAlert() {
		var oCell = D.get("cellphoneField");
		if (parseFloat(inputEl.value) >= 1) {
			D.get("smsAlert").disabled = false;
			D.removeClass("smsLabel","ft-gray");
			if (D.get("smsAlert").checked) {
				D.removeClass(oCell, 'fn-hide');
			}
		}
		else {
			D.addClass("smsLabel","ft-gray");
			D.get("smsAlert").checked = false;
			D.get("smsAlert").disabled = true;
			D.addClass(oCell, 'fn-hide');
		}	
	}	

}


AP.pk.pa.AddToContacts = function(options) {

	function show(el) {
		D.removeClass(el, "fn-hide");
	};
	
	function hide(el) {
		D.addClass(el, "fn-hide");
	};

	var chooseGroup = new AP.widget.appendToGroup({completeEvent:function(rsp){
		D.removeClass(D.get('addToContacts'), 'no-group');
		show('clearSelection');
	}, apiUrl : options.apiUrl});
		
	E.on('chooseGroups', 'click', function(e){
		if(D.query("a.selected",D.get("chooseGroups")).length > 0) {
			show('clearSelection');
		}
		else {
			hide('clearSelection');
		}
	});
	
	AP.widget.formInputStyle.init(D.get('groupTxt'));

	E.on(['createGroupBtn', 'cannelChoose'], 'click', function(e){
		E.preventDefault(e);
	});
	
	E.on("doAddContact",'click',function(){
		var users = D.query('#addToContacts input[name=emails]');
		var nonChecked = true;
		for (var i = 0; i < users.length; i++) {
			if (users[i].checked) {
				nonChecked = false;
				break;
			}
		}
		if(nonChecked) {
			D.addClass('addToContacts', 'no-selection');
			return;
		}
		else {
			D.removeClass('addToContacts', 'no-selection');
		}
		
	
		function generateGroupText(aGroups) {
			var sGroup = '';
			var tooLong = false;
			for(var i=0; i < aGroups.length; i++) {
				sGroup += aGroups[i] + ',';
				if (sGroup.length > 10) {
					if(i < aGroups.length-1) {
						tooLong = true;
					}
					break;
				}
			}
			
			sGroup = sGroup.substring(0, sGroup.length-1);
			
			sGroup = tooLong ? sGroup + '...等' + aGroups.length + '个分组中。' : sGroup + ' 分组中。';
			return sGroup;
		}
		
		
		function saveContact (newGroup) {
			var tag_on = [];
			var groupNames = [];
			D.query("a.selected",D.get("chooseGroups")).forEach(function(t){
				tag_on.push(t.getAttribute('rel'));
				groupNames.push(D.query('span', t)[0].innerHTML);
			});
			
			if (newGroup) {
				tag_on.push(newGroup.id);
				groupNames.push(newGroup.name);
			};

			D.get("groupIds").value = tag_on.join(",");
			
			var sGroups = groupNames.join(",");
			var url = 'user/contacts/addToGroups';
			var apiOptions = {
				onAPISuccess: function(e, rsp){
					options.onSuccess(rsp[0]);
				},
				onAPIFailure: function(e, rsp){

				},
				method : 'POST'
			};
			
			if (options.apiUrl) AP.hashExtend(apiOptions, {'api_url':options.apiUrl, 'format':'jsonp'});
			var api = new AP.core.api(url, apiOptions);
			
			var groupIds = D.get("groupIds").value;
			
			// var logonId = D.get("logonId").value;
			var aLogonIds = [];
			var emails = D.query('input[name=emails]');
			emails.forEach(function(el, n) {
				if (el.checked) {
					aLogonIds.push(el.value);
				}
				
			});
			logonIds = aLogonIds.join(',');
			
			api.call({groupIds: groupIds, logonIds: logonIds});
		}
		
		
		if (D.get('groupTxt') && D.get('groupTxt').offsetHeight > 0 && D.get('groupTxt').value) {
			var url = 'user/contacts/createGroup';
			var apiOptions = {
				onAPISuccess: function(e, rsp){
					rsp = rsp[0];
					saveContact({'id':rsp.result.id, 'name':rsp.result.name});
				},
				onAPIFailure: function(e, rsp){
					var item = D.get('groupTxt').parentNode;
					var ex = D.query('.fm-explain',item)[0];
					ex.innerHTML = rsp[0].msg;
					D.addClass(item,'fm-error');
				},
				method : 'POST'
			};
			
			if (options.apiUrl) AP.hashExtend(apiOptions, {'api_url':options.apiUrl, 'format':'jsonp'});
			var api = new AP.core.api(url, apiOptions);
			
			api.call({groupName: D.get('groupTxt').value});
		}
		else {
			saveContact();
		}
		
		
	});
	
	E.on("cancelAddToContacts", "click", function(e) {
		show(D.get("addContactNotice"));
		hide(D.get("addToContacts"));
	});
	
	E.on('clearSelection', 'click', function(e){
		var tags = D.query("a.selected",D.get("chooseGroups"));
		tags.forEach(function(el){
			D.removeClass(el, 'selected');
		});
		
		hide('clearSelection');
		E.preventDefault(e);
	});

	// the end
};

AP.pk.pa.BankBranchSelector = function(options) {
	var cityInput = options.cityInput;
	var provInput = options.provInput;
	var bankInput = options.bankInput;
	var branchInput = options.branchInput;
	var branchUrl = options.branchUrl;
    var tipText = options.tipText || "请选择支行";
	var container = options.container || branchInput.parentNode;

	var toggleBtn = D.get('comboboxBtn');
	var acContainer = D.get('comboAcContainer');

	function show(el) {
		D.removeClass(el, "fn-hide");
	};

	function hide(el) {
		D.addClass(el, "fn-hide");
	};

/*
	E.on([bankInput, cityInput], 'change', function() {
		reloadBranches();
	});
*/
	function reloadBranches () {
    	var bank = bankInput.value;
    	var prov = provInput.value;
    	var city = cityInput.value;
    	if (bank && prov && city) {
			loadData(bank, prov, city);
    	} else {
            branchInput.value = tipText;
        }
	}
	
	function correctSpec(prov) {
		var spec = ["北京", "上海", "重庆", "天津"];
		return spec.indexOf(prov) > -1 ? prov + '市' : prov;
	}

	E.onDOMReady(function(){
		
		reloadBranches();
	});
	
	function resetWidth() {
		branchInput.style.width = '150px'; 
		container.style.width = '175px'; 
	}

	function loadData(bank, prov, city) {
		var apiOptions = {
			onAPISuccess: function(e, rsp){
				rsp = rsp[0];
				var branches = rsp.branches;
				if (branches && branches.length > 0 ) {
					if(branches.indexOf(branchInput.value) == -1) {
                        branchInput.value = tipText;
					}
					renderBranches(branches);
					show(toggleBtn);
					branchInput.disabled = false;
				} else {
					hide(toggleBtn);
					branchInput.value = '没有该地区支行信息';
					branchInput.disabled = true;
					resetWidth();
				}
			},
			onAPIFailure : function(e, rsp){

			},
			method : "POST"
		};

		if (options.apiUrl) {
			AP.hashExtend(apiOptions, {'api_url':options.apiUrl, 'format':'jsonp'});
		}
		var api = new AP.core.api(branchUrl, apiOptions);
		
		prov = correctSpec(prov);
		
		api.call({'bank':bank, 'prov':prov, 'city':city});

	};

	this.reloadBranches = reloadBranches;
	
    function renderBranches(data) {
    	AP.cache._ACDS.liveData = data;
    	D.query('.yui-ac-content .yui-ac-bd ul', oAC.getContainerEl())[0].style.width = getMaxWidth(data) + 'px';
    };

    oAC = initAc();
    var acShowAll = D.get('comboShowAll');
    var acFoot = acShowAll.parentNode;

	E.on(acShowAll, 'click', function() {
		oAC.sendQuery('');
/*
		if(oAC.isContainerOpen()) {
            D.addClass(acFoot, "fn-hide");
        }
*/
	});

	E.on(document.body, "click", function(e) {
		if (!AP.fn.eInRegion(D.getRegion(branchInput), e) && !AP.fn.eInRegion(D.getRegion(container), e)) {
			oAC.collapseContainer();
		}
	});

	function initAc() {
		var oConfigs = {
			prehighlightClassName: 'yui-ac-prehighlight',
			queryDelay: 0,
			minQueryLength: 0,
			queryMatchContains: true,
			maxResultsDisplayed: 500,
/* 			forceSelection: true, */
			animVert: false
		}
		var branchData = [];
		AP.cache._ACDS = new YAHOO.util.LocalDataSource(branchData); 
		var oAC = new YAHOO.widget.AutoComplete(branchInput, acContainer, AP.cache._ACDS, oConfigs);
		oAC.setFooter("<span id='comboShowAll'>查看全部</span>");
		var displayAll = D.get('comboShowAll');
		var acFoot = displayAll.parentNode;

		E.on(toggleBtn, 'click', function(e) {
			if(oAC.isContainerOpen()) {
				oAC.collapseContainer();
			} else {
				setTimeout(function() { // For IE
					oAC.sendQuery('');
				},0);
			}
		});

		function setBranchValue(value) {
			branchInput.value = value;
			if (12.5 * value < 150) {
				resetWidth();
			} else {
				branchInput.style.width = 12.5 * value.length + 'px'; // very rough calculation
    			container.style.width = 12.5 * value.length + 30 + 'px'; // very rough calculation
			}
    		
    	}
		
		
		E.on(branchInput, 'blur', function(e){
			if (AP.cache._ACDS.liveData.indexOf(branchInput.value) == -1) {
				var value = '';
				if (queryResult[0]) {
					value = queryResult[0];
				} else if (AP.cache._ACDS.liveData.length > 0) {
					value = AP.cache._ACDS.liveData[0];
				}
				// var value = queryResult[0] || AP.cache._ACDS.liveData[0];
				setBranchValue(value);
			}
		});

		E.on(branchInput, 'click', function(e){

				setTimeout(function() { // For IE
					oAC.sendQuery('');
					// oAC.expandContainer();
				},10);
		});

		oAC.itemSelectEvent.subscribe(function(sType, aArgs){
			var oSelf = aArgs[0];
			var value = aArgs[2][0];
			setBranchValue(value);
			oSelf.getInputEl().blur();
		});		

		oAC.containerExpandEvent.subscribe(function(oSelf, aArgs) {
			var oSelf = aArgs[0];
			var displayAll = D.get('comboShowAll');
			var acFoot = displayAll.parentNode;
	        var isFiltered = false;

/*
			if (AP.cache._ACDS.liveData.length > queryResult.length) {
				isFiltered = true;
			}
*/

			if (isFiltered) {
				show(acFoot);
			} else {
				hide(acFoot);
			}

			var acList = D.query('.yui-ac-content .yui-ac-bd', oSelf.getContainerEl())[0];
			D.setXY(acList,  [D.getX(container), D.getRegion(container).bottom]);
			var acFoot = D.query('.yui-ac-content .yui-ac-ft', oSelf.getContainerEl())[0];
			D.setXY(acFoot,  [D.getX(acList), D.getRegion(acList).bottom]);


		});

		var queryResult = [];
		oAC.dataReturnEvent.subscribe( function(oSelf , aArgs) {
			queryResult = aArgs[2];
		}) ;

		return oAC;

	};

	function getMaxWidth(data) {
		var longest = data[0];
		for (var i=1; i < data.length; i++) {
			if (data[i].length > longest.length) {
				longest = data[i];
			}
		}
		return longest.length * 12.5 + 20;
	};

};

AP.pk.pa.life.toggleFee = function (el, pageProps) {
	var c = 'fee-toaccount';
	if (!pageProps.isToAli ()) {
		c = pageProps.isAliToCard() ? 'fee-accounttocard' : 'fee-banktocard';
	}
	D.removeClass(el, 'fee-toaccount');
	D.removeClass(el, 'fee-accounttocard');
	D.removeClass(el, 'fee-banktocard');
	D.addClass(el, c);
};

function initToCard(pageProps) {
	function show(el) {
		D.removeClass(el, "fn-hide");
	};
	
	function hide(el) {
		D.addClass(el, "fn-hide"); 
	};
	
	// 是否选中‘支付宝账户’tab
	function alipayTabOn() {
		return D.hasClass('alipayTab', 'current');
	};
	
	// 是否选中‘支付宝余额或者卡通’radio
	function isAliToCard() {
		return D.get('aliRadio').checked;
	}
	

	
	function setError(inputEl, msg) {
		D.addClass(inputEl.parentNode, 'fm-error');
		var ex = D.query('.fm-explain', inputEl.parentNode)[0];
		ex.innerHTML = msg;
	};

	function clearError (inputEl) {
		D.removeClass(inputEl.parentNode, 'fm-error');
		D.query('.fm-explain', inputEl.parentNode)[0].innerHTML = inputEl.getAttribute('data-explain') || '';
	}
	
	pageProps.isToAli = alipayTabOn;
	pageProps.isAliToCard = isAliToCard;
	
	var amountInput = D.get('amount');
	var amountExplain = D.getNextSiblingBy(amountInput, function(el){return D.hasClass(el, 'fm-explain')});
	var aliAmountExplain = amountInput.getAttribute('data-explain'); // copy of the initial value
	var branchInput = D.get('comboboxInput');
	
	var needBranch = (branchInput.value && branchInput.offsetHeight > 0) ? true : false;
	
	//切换支付宝账户和银行卡账户
	new AP.widget.tabSwitch(D.query('#J-tab li'),{
		onAfter:function(){
			if (alipayTabOn()) {
				hide('payMethodItem');
				show(amountExplain);
				amountInput.setAttribute('data-explain', aliAmountExplain);
				clearError(amountInput);
			} else {
				show('payMethodItem');
				hide(amountExplain);
				amountInput.setAttribute('data-explain', '');
			}
			
			AP.pk.pa.life.calculateExtraFee(D.get('amount').value, pageProps);
		}
	});
	
	// 如果初始时在‘银行卡账户’tab, 隐藏金额说明
	if (!alipayTabOn() && !D.hasClass(amountExplain.parentNode, 'fm-error')) {
		hide(amountExplain);
	}
	
	E.on(amountInput, 'focus', function(e){
		hide(amountExplain);
	});
	
	// 生僻字选择
	var bankcardName = D.get('bankCardName');
	function unfamiliarFun(targets){
		if(AP.widget.unfamiliarWords) {
			new AP.widget.unfamiliarWords(targets, {
				selectEvent:function(type,arg) {
					bankcardName.value += arg[0].innerHTML;
					arg[2].hide();
					bankcardName.focus();
				}, showEvent:function(type,arg){
/* 					cf.cancelNameValidation = true; */
				}, 
				offset:[-210,0],
				class_name : 'unfamiliarTag'}
			);
		}
	}
	
	try{
		unfamiliarFun(D.query('.unfamiliarTag'));
	}catch(e){
		log(e);
	}
	
	E.on(bankcardName,'focus',function(){
		setTimeout(function () { // Validator erases the dom, need to attach it again
				try{
					unfamiliarFun(D.query('.unfamiliarTag'));
				}catch(e){
					log(e);
				}
		}, 1000);
		
	});

	
	//显示放大的银行卡号
	var reviewCard = new AP.widget.reviewCardID(D.query('.J-bank-card')); 
	
	//历史记录下拉框 
	var drop = new AP.widget.dropDown(D.query(".J-history"),{
		isposition:false,
		targetClick:function() {
			var r = D.getRegion('showHistory');
			D.setXY('showHistoryExtend', [r.left, r.bottom]);
			if (D.query('#showHistoryExtend dd').length > 5) {
				D.query('#showHistoryExtend .optional')[0].style.height = '100px';
			}
			
		}
	});
	
	
	//点击下拉框
	D.query("#showHistoryExtend dd a.J-history-item").forEach(function(el) {
		E.on(el, 'click', function(e){
			showHistoryInfo(el);
			E.preventDefault(e);
		});
	});
	
	function showHistoryInfo(item) {
		D.get('bankCardName').value = D.get('bankCardNameDisplay').innerHTML = item.getAttribute('cardname');
		
		D.get('bankCardNo').value =  D.get('bankCardNoDisplay').innerHTML = item.getAttribute('cardno');
		D.get('bankNameDisplay').innerHTML = item.getAttribute('bankname');
		D.get('bankName').value = item.getAttribute('bankShortName');
		D.get('locationDisplay').innerHTML = item.getAttribute('prov') + item.getAttribute('city');
		D.get('prov-input').value = item.getAttribute('prov');
		D.get('city-input').value = item.getAttribute('city');
		hint.setData([D.get('prov-input').value, D.get('city-input').value]); 
		
		var branch = item.getAttribute('branch');
		if (branch) {
			D.get('comboboxInput').value = D.get('branchDisplay').innerHTML = branch;
			show('branchItem');
			needBranch = true;
		} else {
			D.get('comboboxInput').value = D.get('branchDisplay').innerHTML = '';
			hide('branchItem');
			needBranch = false;
		}
		
		D.removeClass("bankCardExtend","history-off");
		D.addClass("showHistoryExtend","fn-hide");

		try {
			D.addClass("bankCardExtend","history-on");
		} catch (e) {
			log(e);
		}
		
		
	};
	
	E.on(D.query(".J-modifyHistory"),"click",function(e){
		E.preventDefault(e);
		D.removeClass(D.get("bankCardExtend"),"history-on");
		D.addClass(D.get("bankCardExtend"),"history-off");
	});
	
	
	E.on('bankCardNo', 'blur', function(e){
		var cardNo = D.get('bankCardNo').value;
		var bankName = D.get('bankName').value;
		
		if (bankName && cardNo) {
			validateCard(bankName, cardNo);
		}
	});
	
	E.on('bankName', 'change', function(e){
		validateBank(D.get('bankName').value);
		D.get('city-input').setAttribute('data-explain', ''); // when error is set, clear it
		clearError(D.get('city-input'));
	});
	
	E.on('aliRadio', 'click', function(e){
		AP.pk.pa.life.calculateExtraFee(D.get('amount').value, pageProps); 
		togglePayMethod();
	});
	
	E.on('bankRadio', 'click', function(e){
		AP.pk.pa.life.calculateExtraFee(D.get('amount').value, pageProps);
		togglePayMethod();
	});
	
	function togglePayMethod() {
		if (isAliToCard()) {
			D.addClass('payMethodItem', 'from-account');
			D.removeClass('payMethodItem', 'from-card');
		} else {
			D.removeClass('payMethodItem', 'from-account');
			D.addClass('payMethodItem', 'from-card');
		}
		
		clearError(D.get('amount'));
		hide(amountExplain);
	};
	

	
	function validateCard(bankName, cardNo) {
		var api = new AP.core.api("bank/validateCard",{
			onAPISuccess: function(e, rsp){
				rsp = rsp[0];
				clearError(D.get('bankCardNo'));
			},
			onAPIFailure : function(e, rsp){
				rsp = rsp[0]; 
				setError(D.get('bankCardNo'), rsp.msg);
			},
			method: 'POST'
		});
		
		api.call({'bankName':bankName, 'cardNo':cardNo.trimAll()});
	};
	
    var hint = new AP.widget.cityHint({
        key: 'cityhint',
        triggle: ['cityhint-city-select'],
        units: true,
        onCitySelect: function(){
        	if(needBranch) {
        		branchSelector.reloadBranches();
	        	show('branchItem');
        	}
        }
    });
    hint.render(); 
    

	function validateBank(bankName) {
		var api = new AP.core.api('bank/validateTransferBank',{ 
			onAPISuccess: function(e, rsp){
				rsp = rsp[0];
				if (rsp.needBranch == 'false') {
					hide('branchItem');
					needBranch = false;
					branchInput.value = '';
					D.get('branchDisplay').innerHTML = '';
					
				} else {
					show('branchItem');
					needBranch = true;
					branchSelector.reloadBranches();
				}
				
				var cardNo = D.get('bankCardNo').value;
				if (cardNo) {
					validateCard(bankName, cardNo);
				}
				
			},
			onAPIFailure : function(e, rsp){
				rsp = rsp[0];
/* 				setError(D.get('bankName'), rsp.msg);  */
			},
			method: 'POST'
		});
		
		api.call({'bankName':bankName});
	};

	var branchSelector = new AP.pk.pa.BankBranchSelector({
		cityInput: D.get('city-input'),
		provInput: D.get('prov-input'),
		bankInput: D.get('bankName'),
		branchInput: D.get('comboboxInput'),
		branchUrl: 'bank/getBranches'
	});

};


AP.pk.IframeOverlay = function (el) {
	var layer = D.get('iframe-overlay')
	if (!layer){
/*
		layer = Element.create('div', {
			id: 'iframe-overlay',
			innerHTML: '<iframe src="javascript:false;" style="width: 100%; height: 100%" frameborder="0"></iframe>'
		});
		
*/
		layer = Element.create('iframe');
		layer.setAttribute("frameborder",'0');
		layer.setAttribute("scrolling",'no');
		layer.setAttribute("src",'javascript:""');
		
		D.setStyles(layer, {
			'position': 'absolute',
			'background': '#fff',
	    	"padding": "0",
	    	'display': 'none',
	    	"width": el.offsetWidth + "px",
	    	"height": el.offsetHeight + "px"
        }) ;
        
		D.insertBefore(layer, el);
/* 		var isIE = AP.env.browser.msie; */
		
/* 		document.body.appendChild(layer); */
	} 
	
	this.show = function () {
		layer.style.display = 'block';
        layer.style.width = el.offsetWidth + "px";
        layer.style.height = el.offsetHeight + "px";

		D.setXY(layer, D.getXY(el));
		
		
	};
	
	this.hide = function () {
		layer.style.display = 'none';
	};
	
};

/*
	支持placeholder属性
*/
AP.pk.pa.placeholder = function(el){
	
	if(!AP.pk.pa.placeholder.isSupport()){
		var placeholder = el.getAttribute('placeholder');
		E.on(el,'focus',function(e){
			if(this.value == placeholder){
				this.value = '';
				D.removeClass(this,'hasPlaceholder');
			}
		});
		
		E.on(el,'blur',function(e){
			if(this.value == '' || this.value == placeholder){
				this.value = placeholder;
				D.addClass(this,'hasPlaceholder');
			}
		});
		
		if(el.value == '' || this.value == placeholder){
			el.value = placeholder;
			D.addClass(el,'hasPlaceholder');
		}
	}
};

/*
	检测是否支持placeholder属性
*/
AP.pk.pa.placeholder.isSupport = function(){
	i = document.createElement('input');
	return 'placeholder' in i;
};


/** end ---life.js---*/
/**Last Changed Author: fangla--Last Changed Date: Wed Apr 18 15:06:40 CST 2012**/
/**personalprod.oldLife-1.0**/
/** CurrentDeveloper: alonestatic**/
/** DeployDate: Wed Apr 18 15:06:50 CST 2012**/
