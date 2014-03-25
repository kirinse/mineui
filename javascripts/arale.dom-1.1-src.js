/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(arale){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
		soFar = selector, ret, cur, pop, i;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec("");
		m = chunker.exec(soFar);

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string",
				elem, i = 0, l = checkSet.length;

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return (/h\d/i).test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return (/input|select|textarea|button/i).test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [], i = 0;

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.compareDocumentPosition ? -1 : 1;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.sourceIndex ? -1 : 1;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.ownerDocument ? -1 : 1;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !Sizzle.isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

Sizzle.contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

Sizzle.isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
window.$$ = function(selector, context, results, seed){
	if(context) {
		context = context.node ? context.node : context;
	}
	var results = Sizzle(selector, context, results, seed);
	var nodes = [];
	$A(results).each(function(elem){
		nodes.push($Node(elem));
	});
	return nodes;
};
window.$  = function(id){
	if(!id)return null;
	if(id.node)return id;
	if(!arale.isString(id) && id.nodeType){
		return $Node(id);
	}
	var node = document.getElementById(id);
	if(node){
	    return $Node(node);
	}
	return null;
};

arale.dom = arale.dom || {};

arale.dom.filter_ = function(selector, eles) {
    return Sizzle.matches(selector, eles);
};

arale.dom.sizzle = Sizzle;

})(arale);

/**
 * @name arale.dom
 * @namespace
 * Dom操作模块，可以对dom进行创建，遍历，插入等
 * @description
 * arale.dom 封装了主要针对document, window的一些操作方法，另外少许对HTMLElement操作的方法，更多对dom操作的方法以及链式操作 具体请参见 { @link arale.Node }
 */
arale.module("arale.dom", (function(){
	
	var isIE     = arale.browser.Engine.trident;
	var isOpera  = arale.browser.Engine.presto;
	var isSafari = arale.browser.Engine.webkit;
	var isBody   = function(element){
		return (/^(?:body|html)$/i).test(element.tagName);
	}
	
	// 支持 _toDom 这个方法
	var tagWrap = {
			option: ["select"],
			tbody: ["table"],
			thead: ["table"],
			tfoot: ["table"],
			tr: ["table", "tbody"],
			td: ["table", "tbody", "tr"],
			th: ["table", "thead", "tr"],
			legend: ["fieldset"],
			caption: ["table"],
			colgroup: ["table"],
			col: ["table", "colgroup"],
			li: ["ul"]
		},
		reTag = /<\s*([\w\:]+)/,
		masterNode = {}, masterNum = 0,
		masterName = "__araleToDomId";

	// generate start/end tag strings to use
	// for the injection for each special tag wrap case.
	for(var param in tagWrap){
		var tw = tagWrap[param];
		tw.pre  = param == "option" ? '<select multiple="multiple">' : "<" + tw.join("><") + ">";
		tw.post = "</" + tw.reverse().join("></") + ">";
		// the last line is destructive: it reverses the array,
		// but we don't care at this point
	}
	var specialAttr = $H({
		appendTo: function(node,value){
			value.appendChild(node.node);
		},
		innerHTML: function(node,value){
			node.setHtml(value);
		},
		style: function(node,value){
			node.setStyle(value);
		},
		"class": function(node,value){
			node.addClass(value);
		}
	});
	/** @lends arale.dom */
	return {
		/**
         * 获取元素可见区域的高度
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的可见区域高度
         * @example
         * $D.getViewportHeight($('node1'));
         * @returns {Number} 元素可见区域高度
         */
		getViewportHeight : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){
		    	var height = self.innerHeight, // Safari, Opera
	                mode = document['compatMode'];
	            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
	                height = (mode == 'CSS1Compat') ?
	                        document.documentElement.clientHeight : // Standards
	                        document.body.clientHeight; // Quirks
	            }
				return height;
			}
			
			return element.offsetHeight;
        },
		
		/**
         * 获取元素可见区域的宽度
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的可见区域宽度
         * @example
         * $D.getViewportWidth($('node1'));
         * @returns {Number} 元素可见区域宽度
         */
		getViewportWidth : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){
		    	var width = self.innerWidth,  // Safari
	                mode = document['compatMode'];

	            if (mode || isIE) { // IE, Gecko, Opera
	                width = (mode == 'CSS1Compat') ?
	                        document.documentElement.clientWidth : // Standards
	                        document.body.clientWidth; // Quirks
	            }
				return width;
			}
			return element.offsetWidth;
        },
		
		/**
         * 获取元素实际高度(scroll在内)
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的实际高度
         * @example
         * $D.getDocumentHeight($('node1'));
         * @returns {Number} 元素实际高度(scroll在内)
         */
		getDocumentHeight : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){
            	var scrollHeight = (document['compatMode'] != 'CSS1Compat' || isSafari) ? document.body.scrollHeight : document.documentElement.scrollHeight,
	                h = Math.max(scrollHeight, $D.getViewportHeight());

	            return h;
			}
			
			return element.scrollHeight;
        },
		
		/**
         * 获取元素实际宽度(scroll在内)
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的实际宽度
         * @example
         * $D.getDocumentWidth($('node1'));
         * @returns {Number} 元素实际宽度(scroll在内)
         */
        getDocumentWidth : function(element) {
			element = element || window;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){	
            	var scrollWidth = (document['compatMode'] != 'CSS1Compat' || isSafari) ? document.body.scrollWidth : document.documentElement.scrollWidth,
	                w = Math.max(scrollWidth, $D.getViewportWidth());
				return w;
			}
            return element.scrollWidth;
        },
		
		/**
         * 获取元素scroll当前位置
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的scroll当前位置
         * @example
         * $D.getScroll($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示scroll位置
         */
		getScroll : function(element) {
		    element = element || document;
			element = element.node ? element.node : element;
			if(element == window || element == document || isBody(element)){	
            	return {
					left : Math.max(document['documentElement'].scrollLeft, document.body.scrollLeft),
					top  : Math.max(document['documentElement'].scrollTop, document.body.scrollTop)
				}
			}
			return {left : element.scrollLeft, top : element.scrollTop};
        },
		
		/**
         * 获取元素scroll当前位置(其所有父元素的scroll累加)
         * @param {HTMLElement} [element] 元素对象，为空则默认返回document的scroll当前位置(其所有父元素的scroll累积)
         * @example
         * $D.getScrolls($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示scroll当前位置(其所有父元素的scroll累加)
         */
		getScrolls: function(element){
		    element = element || document;
			element = element.node ? element.node : element;
            var position = {left : 0, top : 0};
            while (element && ! isBody(element)){
                position.left += element.scrollLeft;
                position.top += element.scrollTop;
                element = element.parentNode;
            }
            return position;
        },

		/**
         * 获取元素相对当前窗口的坐标
         * @param {HTMLElement} [element] 元素对象
         * @example
         * $D.getOffsets($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示元素相对当前窗口的坐标
         */
		getOffsets : function(element) {
			element = element.node ? element.node : element;
		    var getNextAncestor = function(node){
		    	var actualStyle;
			    if( window.getComputedStyle ) {
			      actualStyle = getComputedStyle(node,null).position;
			    } else if( node.currentStyle ) {
			      actualStyle = node.currentStyle.position;
			    } else {
			      actualStyle = node.style.position;
			    }
			    if( actualStyle == 'absolute' || actualStyle == 'fixed' ) {
			      return node.offsetParent;
			    }
			    return node.parentNode;
		   }
		   if( typeof( element.offsetParent ) != 'undefined' ) {
		    	var originalElement = element;
			    for( var posX = 0, posY = 0 ; element; element = element.offsetParent ) {
			      posX += element.offsetLeft;
			      posY += element.offsetTop;
			    }
			    if( !originalElement.parentNode || !originalElement.style || typeof( originalElement.scrollTop ) == 'undefined' ) {
			      return {left : posX, top : posY };
			    }
			    element = getNextAncestor(originalElement);
			    while( element && element != document.body && element != document.documentElement ) {
			      posX -= element.scrollLeft;
			      posY -= element.scrollTop;
			      element = getNextAncestor(element);
			    }
			    return { left : posX, top : posY };
		   } else {
		    	return { left : element.x, top : element.y };
		   }
		},
		
		/**
         * 获取元素相对坐标
         * @param {HTMLElement} element 元素对象
         * @param {HTMLElement} [relative] 相对元素，默认为offsetParent
         * @example
         * $D.getPosition($('node1'));
         * @returns {Object} 类似{left : 10, top : 10}，指示元素相对坐标
         */
		getPosition : function(element, relative){
			if(!element) return null;
			element = element.node ? element.node : element;
            relative = relative || $D.getOffsetParent(element);
			if (isBody(element)) return {left : 0, top : 0};
            var offset = $D.getOffsets(element),
                scroll = $D.getScrolls(element);
		
            var position = {
                left : parseInt(offset.left) - parseInt(scroll.left),
                top  : parseInt(offset.top) - parseInt(scroll.top)
            };
            var relativePosition = (relative) ? $D.getPosition(relative) : {left : 0, top : 0};
            return {left : parseInt(position.left) - parseInt(relativePosition.left), top : parseInt(position.top) - parseInt(relativePosition.top)};    
        },

		getComputedStyle: function(node, property){
            node = node.node || node;
			if (node.currentStyle) return node.currentStyle[$S(property).camelCase()];
			var computed = node.ownerDocument.defaultView.getComputedStyle(node, null);
			return (computed) ? computed[$S(property).camelCase()] : null;
		},
		
		/**
         * 获取元素的offsetParent
         * @param {HTMLElement} [element] 元素对象
         * @example
         * $D.getOffsetParent($('node1'));
         * @returns {HTMLElement|null} 元素的offsetParent
         */
		getOffsetParent: function(element){
			element = element.node ? element.node : element;
			if (isBody(element)) return null;
			if (!arale.isIE()) return element.offsetParent;
			while ((element = element.parentNode) && !isBody(element)){
				if (arale.dom.getComputedStyle(element, 'position') != 'static') return element;
			}
			return null;
		},
		/**
         * 转换一个html 字符串为 dom节点
         * @param {String} frag html字符串片段
         * @example
         * $D.toDom($('&lt;div id="div1"&gt;&lt;div&gt;'));
         * @returns {HTMLElement} 生成的DOM元素
         */
		toDom: function(frag){
			var master = this._getMaster(frag);
			if(master.childNodes.length == 1){	
				return master.removeChild(master.firstChild); // DOMNode
			}else{		
				var elem = master.removeChild(master.firstChild);
				while(elem.nodeType == 3){
					elem = master.removeChild(master.firstChild);
				}
				return elem;
			}
			//因为现在不可能有这这种情况,先不考虑,所以直接返回
			// 把多个节点作为一个documentFragment返回
			/*
			df = doc.createDocumentFragment();
			while(fc = master.firstChild){ 
				df.appendChild(fc);
			}
			return df; // DOMNode
			*/
		},
		toDomForTextNode: function(frag){
			var master = this._getMaster(frag);
			df = doc.createDocumentFragment();
			while(fc = master.firstChild){ 
				df.appendChild(fc);
			}
			return df;
		},
		_getMaster: function(frag){
			//转换一个html 字符串为 dom节点
			doc = document;
			var masterId = doc[masterName];
			if(!masterId){
				doc[masterName] = masterId = ++masterNum + "";
				masterNode[masterId] = doc.createElement("div");
			}
			// 确保我们的flag是一个字符串
			frag += "";

			//获取开始的tag,然后获取这个最外层的tag
			var match = frag.match(reTag),
				tag = match ? match[1].toLowerCase() : "",
				master = masterNode[masterId],
				wrap, i, fc, df;
			if(match && tagWrap[tag]){
				wrap = tagWrap[tag];
				master.innerHTML = wrap.pre + frag + wrap.post;
				for(i = wrap.length; i; --i){
					master = master.firstChild;
				}
			}else{
				master.innerHTML = frag;
			}
			return master;	
		},
		/**
         * 替换dom节点
         * @param { HTMLElement } element 需要被替换的元素对象
		 * @param { HTMLElement } element 需要去替换的元素对象
         */
		replace: function(refNode,node){
			refNode = refNode.node ? refNode.node : refNode;
			node = node.node ? node.node: node;
			refNode.parentNode.replaceChild(node, refNode);
		},
		create: function(type,param){		
			var node = $(document.createElement(type));
			if(type == "script" || type == "iframe"){
				if(param['callback']){
					if(node.node.attachEvent){
						node.node.attachEvent("onload",param['callback']);
					}else{
						node.node.onload = param['callback']
					}
					delete param['callback'];
				}			
			}
			var temp = {};
			specialAttr.each(function(attr){
				param[attr] && (temp[attr] = param[attr]);
				delete param[attr];
			});
			node.setAttributes(param);
			$H(temp).each(function(attr,value){
				specialAttr.obj[attr](node,value);
			});
			return node;
		},
		/**
         * 给node list 设置样式
         * @param { Array } nodes 需要设置样式的数组
         */
		setStyles: function(nodes,style){
			$A(nodes).each(function(node){
				$(node).setStyle(style);
			});
		},
		append: function(parent, elem) {
			if(!arale.domManip) return;
			arale.domManip(elem, function(fragment) {
				parent.appendChild(fragment);
			});	
		}
	}
}), '$D');

D = $D;
//TODO create,getText,getValue,ancestor

/**
 * @name arale.node
 * @class
 * 对HTMLElement的最次封装，可以对元素进行方便的创建，遍历，插入等操作
 * @param {HTMLElement} node 要包装的DOM对象
 * @returns {Node} 包装后的对象
 * @description
 * arale.node 操作返回Node对象，只是对你传入的元素进行了增加，你用链式的方式对你得到的节点进行操作
 * @example
 * $Node(document.getElementById("id"));
 */
arale.module("arale.node", (function(){

	var attributes = {
		'html': 'innerHTML',
		'class': 'className',
		'for': 'htmlFor',
		'defaultValue': 'defaultValue',
		'text': (arale.browser.Engine.trident || (arale.browser.Engine.webkit && arale.browser.Engine.version < 420)) ? 'innerText' : 'textContent'
	};
	
	var inserters = {

        before: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            if(context.parentNode) context.parentNode.insertBefore(element, context);
        },

        after: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            if (!context.parentNode) return;
            var next = context.nextSibling;
            (next) ? next.parentNode.insertBefore(element,next) : context.parentNode.appendChild(element);
        },

        bottom: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            context.appendChild(element);
        },

        top: function(context, element){
			if(context.nodeType=='NODE') context = context.element;
			if(element.nodeType=='NODE') element = element.element;
            var first = context.firstChild;
            (first) ? context.insertBefore(element, first) : context.appendChild(element);
        }
    };
	
	var match = function(element, selector){
        //return (!tag || (tag == element) || element.tagName.toLowerCase() == tag.toLowerCase());
		//return (!selector || (selector == element) || $A($A($$(selector, element.parentNode)).map(function(item){return item.node;})).contains(element));
        return !selector || (selector == element) || arale.dom.filter_(selector, [element]).length;
    };
	var Node = arale.dblPrototype(document.createElement("div"),function(node){
		this.node  = node;
		this.noded = true;
	});
	
	var isTable = function(nodeName){
		
	}
		
	arale.augment(Node,
	/** @lends arale.node.prototype */
	{
		/**
		 * @ignore 
		 * 遍历查找相关元素
		 */
		walk: function(walk, start, tag, all){
			var el = this.node[start || walk];
	        var elements = [];
	        while (el){
	            if (el.nodeType == 1 && (!tag || match(el, tag))){
	                if (!all) return $(el);
	                elements.push($(el));
	            }
				el = el[walk];
	        }
	        return (all) ? elements : null;
		},
		
		/**
		 * 插入多个元素到当前元素
		 * @param {HTMLElement[,others]} arguments 需要插入的元素
		 * @example
		 * var node1 = $Node('div');
		 * var node2 = $Node('div');
		 * $('parentNode').adopt(node1, node2) //在parentNode中插入node1 和 node2
		 * @returns {Node} 原对象
		 */
		adopt: function(){
			var that = this;
            arguments = Array.prototype.slice.call(arguments);
            $A(arguments).each(function(el){
                if(el){
					el = el.node || el;
                    that.node.appendChild(el);
                }
            });
            return this;
        },
		
		/**
		 * 将元素插入到某个元素中的指定位置
		 * @param {HTMLElement} el 目标元素
		 * @param {String} where  插入的位置, before, after, bottom, top 默认bottom
		 * @example
		 * $Node('div').inject(document.body) //将新创建的div元素插入到document.body中
		 * $Node('div').inject($('node1'),'before') //将新创建的div元素插入到node1的前面
		 * @returns {Node} 原对象
		 */
		inject: function(el, where){
			//有可能el也是我们的Node类型
			el = el.node || el;
            inserters[where || 'bottom'](el, this.node);
            return this;
        },
	
		/**
		 * 获取前一个兄弟节点或满足条件的兄弟节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').prev() //获取node1前一个兄弟节点
		 * $('node1').prev('div') //获取node1前一个tagName为div的兄弟节点
		 * @returns {Node | Array} 前一个兄弟节点对象或满足条件的兄弟节点数组
		 */
		prev: function(match){
			return this.walk('previousSibling', null, match, false);
		},	
		
		/**
		 * 获取所有前面的兄弟节点或满足条件的兄弟节点
		 * @param {String} match 选择器
		 * @example
		 * $('node1').prevAll() //获取所有在node1前面的兄弟节点
		 * $('node1').prevAll('div') //获取所有在node1前面的tagName为div的兄弟节点
		 * @returns {Node} 所有前面的兄弟节点或满足条件的兄弟节点数组
		 */
		prevAll: function(match){
			return this.walk('previousSibling', null, match, true);
		},
		
		/**
		 * 获取所有后面的兄弟节点或满足条件的兄弟节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').next() //获取node1前一个兄弟节点
		 * $('node1').next('div') //获取node1前一个tagName为div的兄弟节点
		 * @returns {Node} 所有后面的兄弟节点或满足条件的兄弟节点
		 */		
		next: function(match){
			return this.walk('nextSibling', null, match, false);
		},	
		
		/**
		 * 获取所有后面的兄弟节点或满足条件的兄弟节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').nextAll() //获取所有在node1后面的兄弟节点
		 * $('node1').nextAll('div') //获取所有在node1后面的tagName为div的兄弟节点
		 * @returns {Node} 所有后面的兄弟节点或满足条件的兄弟节点
		 */	
		nextAll: function(match){
			return this.walk('nextSibling', null, match, true);
		},
		
		/**
		 * 获取第一个子节点或者满足条件的子节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').first() //获取node1的第一个子节点
		 * $('node1').first('div') //获取node1的tagName为div的第一个子节点
		 * @returns {Node} 第一个子节点或者满足条件的子节点
		 */		
		first: function(match){
			return $(this.walk('nextSibling', 'firstChild', match, false));
		},	
		
		/**
		 * 获取最后一个子节点或者满足条件的子节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').last() //获取node1的最后一个子节点
		 * $('node1').last('div') //获取node1的tagName为div的最后一个子节点
		 * @returns {Node} 最后一个子节点或者满足条件的子节点
		 */	
		last: function(match){
			return $(this.walk('previousSibling', 'lastChild', match, false));
		},
		
		/**
		 * 获取第一个父节点或者满足条件的父节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').parent() //获取node1的第一个父节点
		 * $('node1').parent('div') //获取node1的tagName为div的父节点
		 * @returns {Node} 第一个父节点或者满足条件的父节点
		 */		
		parent: function(match){
			return $(this.walk('parentNode', null, match, false));
		},
		
		/**
		 * 获取满足条件的父节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').parents() //获取node1的所有父节点
		 * $('node1').parents('div') //获取node1的tagName为div的所有父节点
		 * @returns {Array} 满足条件的父节点
		 */		
		parents: function(match){
			return this.walk('parentNode', null, match, true);
		},
		
		/**
		 * 获取所有子节点
		 * @param {String} match 匹配tagname
		 * @example
		 * $('node1').nodes() //获取node1的所有子结点
		 * $('node1').nodes('div') //获取node1的tagName为div的所有子节点
		 * @returns {Array} 所有子节点
		 */		
		nodes: function(match){
			return this.walk('nextSibling', 'firstChild', match, true);
		},
		
		/**
		 * 获取或者设置元素单个属性
		 * @param {String} key 属性名
		 * @param {String} [value] 属性值 
		 * @example
		 * $('node1').attr('id') //获取node1的id属性
		 * $('node1').attr('id','node2') //设置node1的id属性为node2
		 * @returns {Node | String}  若设置属性值，则返回原对象；若获取属性值，则返回属性值。
		 */		
		attr: function(key, value){
			if(key){
				if(attributes[key]) key = attributes[key];
                if (!arale.isUndefined(value)) {
					if(key == 'class' || key == 'className'){
						this.node.className = value;
					}else{
						this.node[key] = value;
						this.node.setAttribute(key , value);
					}
					return $Node(this.node);
				}else{
					if(key == 'class' || key == 'className'){
						return this.node.className;
					}
					return (!arale.isUndefined(this.node[key])) ? this.node[key] : this.node.getAttribute(key);
				}
			}
			return this;
		},	
		/**
		 * 设置元素多个属性
		 * @param {Object} attributes 属性键值对
		 * @example
		 * $('node1').attrs({id : 'node2', 'data' : '123'})
		 * @returns {Node} 原对象
		 */
		attrs: function(attries){
			for (var attr in attries) {
				if(attributes[attr]) attr = attributes[attr];
				if(attr == 'class' || attr == 'className'){
					this.node.className = attries[attr];
				}else{
					this.node[attr] = attries[attr];
					this.node.setAttribute(attr, attries[attr]);
				}
            }
            return this;	
		},
		/**
		 * 设置元素多个属性,
         * @deprecated 从1.1以后此方法废弃，您可以使用attrs方法代替
		 * @param {Object} attributes 属性键值对
		 * @example
		 * $('node1').setAttributes({id : 'node2', 'data' : '123'})
		 * @returns {Node} 原对象
		 */	
		setAttributes: function(attries){		
            return this.attrs(attries);
		},	
		
		/**
		 * 获取元素多个属性
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').getAttrs("id" , "data"}); //return {id : 'node1' , data : '123'}
		 * @returns {Object} 获取的多属性对象
		 */	
		getAttrs: function(){
			var that = this;
            var args = $A(arguments).map(function(arg){
				if(attributes[arg]) arg = attributes[arg];
				if(arg == 'class' || arg == 'className'){
					return that.node.className;
				}else{
					return (!arale.isUndefined(that.node[arg])) ? that.node[arg] : that.node.getAttribute(arg);
				}
            });
            return $A(args).associate(arguments);
		},
		/**
		 * 获取元素多个属性
         * @deprecated 从1.1以后此方法废弃，您可以使用attrs方法代替
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').getAttributes("id" , "data"}); //return {id : 'node1' , data : '123'}
		 * @returns {Object} 获取的多属性对象
		 */	
		getAttributes: function(){
			return this.getAttrs.apply(this,arguments);
		},
		
		/**
		 * 删除元素多个属性
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').removeAttrs("id" , "data"});
		 * @returns {Node} 原对象
		 */		
		removeAttrs: function(){
			var that = this;
            $A(arguments).each(function(arg){
                return that.node.removeAttribute(arg);
            });
            return this;
		},
		
		/**
		 * 删除元素多个属性
         * @deprecated 从1.1以后此方法废弃，您可以使用attrs方法代替
		 * @param {String[,others]} arguments 属性名 
		 * @example
		 * $('node1').removeAttributes("id" , "data"});
		 * @returns {Node} 原对象
		 */		
		removeAttributes: function(){
			return this.removeAttrs.apply(this,arguments);
		},
		
		/**
		 * 是否包含指定的类名
		 * @param {String} className 类名
		 * @example
		 * $('node1').hasClass('heighlight');
		 * @return {Boolean} 是否包含指定的类名
		 */		
		hasClass: function(className){
            return Boolean(this.node.className.match(new RegExp('(\\s|^)' + className +'(\\s|$)')));
        },
		
		/**
		 * 添加类名
		 * @param {String} className 类名
		 * @example
		 * $('node1').addClass('heighlight');
		 * @returns {Node} 原对象
		 */
		addClass: function(className){
			if (!this.hasClass(className)) this.node.className = $S(this.node.className + ' ' + className).clean();
            return this;
		},
		
		/**
		 * 删除类名
		 * @param {String} className 类名
		 * @example
		 * $('node1').removeClass('heighlight');
		 * @returns {Node} 原对象
		 */		
		removeClass: function(className){
            this.node.className = this.node.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
            return this;
        },
		
		/**
		 * 交替类
		 * @param {String} className 类名
		 * @example
		 * $('node1').toggleClass('heighlight');
		 * @return {Node} 原对象
		 */
        toggleClass: function(className){
            return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
        },

		/**
		 * 拷贝一个元素
		 * @param {Boolean} [contents] 是否拷贝元素里面的内容
		 * @param {Boolean} [keepid] 是否保留Id
		 * @example
		 * $('node1').clone();
		 * @returns {Node} 新拷贝出的对象
		 */
		clone: function(contents, keepid){
            contents = contents !== false;
			var props = {
				input: 'checked', 
			 	option: 'selected', 
			 	textarea: (arale.browser.Engine.webkit && arale.browser.Engine.version < 420) ? 'innerHTML' : 'value'
			};
			var clone = this.node.cloneNode(contents);
            var clean = function(cn, el){
                if (!keepid) cn.removeAttribute('id');
                if (arale.browser.Engine.trident){
                    cn.mergeAttributes(el);
                    if(cn.options){
                        var no = cn.options, eo = el.options;
                        for(var j = no.length; j--;){
                            no[j].selected = eo[j].selected;
                        }
                    }
                    var prop = props[el.tagName.toLowerCase()];
                    if(prop && el[prop]) cn[prop] = el[prop];
                }
            };
			if (contents){
                var ce = clone.getElementsByTagName('*'),
                    te = this.node.getElementsByTagName('*');
                for (var i = ce.length; i--;) clean(ce[i], te[i]);
            }

            clean(clone, this.node);
            return $Node(clone);
        },
		
		/**
		 * 设置滚动条到某个位置
		 * @param {Number} x x坐标
		 * @param {Number} y y坐标
		 * @example
		 * $('node1').scrollTo(10, 20);
		 * @return {Node} 原对象
		 */
		scrollTo: function(x, y){
            if ((/^(?:body|html)$/i).test(this.node.tagName)){
                this.node.ownerDocument.window.scrollTo(x, y);
            } else {
                this.node.scrollLeft = x;
                this.node.scrollTop = y;
            }
            return this;
        },
		
		/**
		 * 获取元素样式
		 * @param {String} arguments 要获取的样式名称
		 * @example
		 * $('node1').getStyle('background', 'border'); //return {Object}
		 * $('node1').getStyle('background'); //return {String} 
		 * @returns {Object|String} 要获取的样式
		 */
		getStyle: function() {
			var that = this;
			var get_style = function(style){
				if(style == 'float') {
					style = arale.isIE() ? 'styleFloat' : 'cssFloat';
				}
				style = $S(style).camelCase();
			    var value = that.node.style[style];

			    if (!value || value == 'auto') {
				  value = that.getComputedStyle(style);
			    }	
				var color = /rgba?\([\d\s,]+\)/.exec(value);
                if (color) value = value.replace(color[0], $S(color[0]).rgbToHex());

			    if (style == 'opacity') {
                    return this.getOpacity();
                    /*
					try{
						return parseFloat(value)
					}catch(e){
						return 1.0;
					}
                    */
				}
				
				//Opera IE需用offsetTop&offsetLeft来获取宽高
				if ( arale.isOpera() || ( arale.isIE() && isNaN(parseFloat(value))) ) {
					if (/^(height|width)$/.test(style)){
						var values = (style == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
						$A(values).each(function(value){
							size += parseInt(get_style('border-' + value + '-width')) + parseInt(get_style('padding-' + value));
						});
						value = that.node['offset' + $S(style).capitalize()] - size + 'px';
					}
					if ( arale.isOpera() && String(value).indexOf('px') != -1 ) return value;
					if ( /(border(.+)Width|margin|padding)/.test(style)) return '0px';
				}
				
			    return value == 'auto' ? null : value;
			
			}

			if(!arguments.length){
				return null;
			}

			if(arguments.length > 1){
				var result = {};
				for(var i=0;i<arguments.length;i++){
					result[arguments[i]] = get_style(arguments[i]);
				}
				return result;
			}
			return get_style(arguments[0]);
		},
		
		/**
		 * 获取元素opacity值
		 * @example
		 * $('node1').getOpacity('opacity');
		 * @returns {String} opacity值，0-1之间
		 */
		getOpacity: function() {
		  	//return this.getStyle('opacity');
            var opacity = null;
            //Get the opacity based on the current browser used
            if(arale.isIE() && Number(arale.browser.ver()) < 9) {
                filter = this.node.style.filter;
                if(filter) {
                    alpha = filter.split("alpha(opacity=");
                    opacity = alpha[1].substr(0,(alpha[1].length-1))/100;
                }
            }
            else {
                opacity = this.node.style.opacity;
            }
            opacity = parseFloat(opacity);
            return (!opacity && opacity!=0) ? 1.0 : opacity;
		},
		
		/**
		 * 设置元素属性
		 * @example
		 * $('node1').setStyle({
		 *		'height' : '200px',
		 *		'width'  : '300px'
		 * });
		 * $('node1').setStyle('height','200px');
		 * @returns {Node} 原对象
		 */
		setStyle: function(styles) {
			var  match;
			if (arale.isString(styles) && arguments.length==2) {
			  var tmp = {};
			  tmp[arguments[0]] = arguments[1];
			  styles = tmp;
			}
			for (var property in styles){
			  if (property == 'opacity'){
				this.setOpacity(styles[property]);
			  }else if(property == 'class' || property == 'className'){
				this.className = new String(property);
			  }else{
			    this.node.style[(property == 'float' || property == 'cssFloat') ? 
					(arale.isUndefined(this.node.style.styleFloat) ? 'cssFloat' : 'styleFloat') : property] = styles[property];
			  }
			}
			return this;
		},
		
		/**
		 * 设置元素opacity值
         * @param {Number} value 要设置的opacity值，0-1之间
		 * @example
		 * $('node1').setOpacity(0.2);
		 * @returns {Node} 原对象
		 */
		setOpacity: function(value) {
            if(value >1 || value<0) {return this;}
			if(arale.isIE() && Number(arale.browser.ver()) < 9) {
				this.node.style.filter = 'alpha(opacity=' + value*100 + ')';
			}
            this.node.style.opacity = (value < 0.00001) ? 0 : value;
			//this.node.style.opacity = (value == 1 || value === '') ? this.getOpacity(value) : (value < 0.00001) ? 0 : value;
			return this;
		},	
			
		/**
		 * 获取元素可见区域宽，高
		 * @example
		 * $('node1').getViewportSize();
		 * @returns {Object} 类似{width:200 , height:300}的对象
		 */	
		getViewportSize: function(){
            return {
				width  : $D.getViewportWidth(this.node),
				height : $D.getViewportHeight(this.node)
			}
        },	
	
		/**
		 * 获取元素实际宽，高
		 * @example
		 * $('node1').getDocumentSize();
		 * @returns {Object} 类似{width:200 , height:300}的对象
		 */
		getDocumentSize: function(){
            return {
				width  : $D.getDocumentWidth(this.node),
				height : $D.getDocumentHeight(this.node)
			}
		},		
		
		/**
		 * 获取元素scroll位置
		 * @example
		 * $('node1').getScroll();
		 * @returns {Object} 类似{left : 200 , top : 300}的对象
		 */
		getScroll: function(){
			return $D.getScroll(this.node);
		},		
		
		/**
		 * 获取元素scroll当前位置(其所有父元素的scroll累加)
		 * @example
		 * $('node1').getDocumentSize();
		 * @returns {Object} 类似{left : 200 , top : 300}的对象
		 */
		getScrolls: function(){
			return $D.getScrolls(this.node);
		},
		
		/**
		 * 获取元素区块参数
		 * @example
		 * $('node1').region();
		 * @returns {Object} 类似{left : 200 , top : 300 , right : 400 , bottom : 600, width : 200, height : 300 }的对象
		 */
		region: function(){
			var position = this.getOffsets();
			var obj = {
                left   : position.left,
                top    : position.top,
                width  : $D.getViewportWidth(this.node),
                height : $D.getViewportHeight(this.node)
            };
            obj.right  = obj.left + obj.width;
            obj.bottom = obj.top  + obj.height;
			return obj;
		},
		/**
		 * 获取元素边框
		 * @example
		 * $('node1').border();
		 * @returns {Object} 类似{l : 200 , t : 300 , r : 400 , b : 600}的对象
		 */
		border: function(){
			var fix = this._toFixPx;
			return{
				l: fix(this.getStyle('border-left-width')),
				t: fix(this.getStyle('border-top-width')),
				r: fix(this.getStyle('border-right-width')),
				b: fix(this.getStyle('border-bottom-width'))	
			}
		},
		_toFixPx: function(value){
			//TODO可能需要对不同的浏览器进行扩展,来处理比如middle这类的情况
			return parseFloat(value) || 0;
		},
		/**
		 * @ignore
		 */
		getComputedStyle: function(property){
            return $D.getComputedStyle(this.node, property);
		},
		
		/**
         * 获取元素相对坐标
         * @param {HTMLElement} [element] 元素对象
         * @param {HTMLElement} [relative] 相对元素，默认为offsetParent
         * @example
         * $('node1').getPosition();
         * @returns {Object} 类似{left : 10, top : 10}的对象
         */
		getPosition : function(relative){
			return $D.getPosition(this.node, relative);
		},
		
		/**
         * 获取元素的offsetParent
         * @example
         * $('node1').getOffsetParent();
         * @returns {HTMLElement|null} 元素的offsetParent
         */
		getOffsetParent : function(){
			return $D.getOffsetParent(this.node);
		},
		
		/**
         * 获取元素相对当前窗口的坐标
         * @example
         * $('node1').getOffsets();
         * @returns {Object} 类似{left : 10, top : 10}的对象
         */
		getOffsets : function(){
			return $D.getOffsets(this.node);
		},
		
		/**
         * 设置元素坐标
         * @example
         * $('node1').setPosition({ left : 10, top : 10 });
         * @returns {Node} 原对象
         */
		setPosition: function(pos){
			var obj = { 
				left: new String(parseInt(pos.left) - (parseInt(this.getComputedStyle('margin-left')) || 0)) + 'px',
				top: new String(parseInt(pos.top) - (parseInt(this.getComputedStyle('margin-top')) || 0)) + 'px'
			}
			return this.setStyle(obj);
		},
		
		/**
         * DOM选择器, 详细文档请查看<a href="http://wiki.github.com/jeresig/sizzle/">Sizzle</a>
         * @example
         * $('node1').query('input[name=number]'); //返回node1下name值为number的input元素
         * @returns {Array} 利用sizzle选择出的对象
         */
		query : function(match){
			return $$(match, this.node);
		},
	
		/**
         * 销毁元素
         * @example
         * $('node1').dispose(); //返回node1下name值为number的input元素
         * @returns {Array} 删除掉的对象
         */	
		dispose : function(){
			return this.node.parentNode ? $Node(this.node.parentNode.removeChild(this.node)) : $Node(this.node);
		},

        /**
         * 清空所有子元素
         * @example
         * $('node1').empty(); 
         * @returns {Node} 原对象
         */
		empty: function(){
			while(this.node.firstChild){
				this.node.removeChild(this.node.firstChild);
			}
            return this;
		},

        /**
         * 设置innerHTML，此方法目前还比较粗糙,需要进一步完善
         * @returns {Node} 原对象
         */
		setHtml: function(html){
			//此方法目前还比较粗糙,需要进一步完善
			if(this._isTableInIe(this.node.nodeName)){
				var tempnode = $D.toDom(html);
				this.empty();
				this.node.appendChild(tempnode);
			}else{
				this.node.innerHTML = html;	
			}
			return this;
		},
		_isTableInIe: function(nodeName){
			return arale.isIE() && $A(["tbody","thead","tr","td"]).indexOf(nodeName.toLowerCase())>-1;
		},

        /**
         * 获取html
         */
		getHtml: function(){
			return $S(this.node.innerHTML).unescapeHTML();
		},
		/**
         * 替换dom节点
		 * @param { HTMLElement } element 需要去替换的元素对象
         * @example
         * $('div').replace('<div id="div1"><div>');
         * @returns {Node} 原对象
         */
		replace: function(node){
			node = node.node || node;
			this.node.parentNode.replaceChild(node,this.node);
            return this;
		}
	});
	
	Node.prototype['toString'] = function(){
		return this.node.toString();
	};
	Node.prototype['valueOf'] = function(){
		return this.node.valueOf();
	};
	
	//return new Temp(node);
	var NodeFactory = function(node){
		if(node.noded) return node;
		if(arale.isString(node)){
			node = document.createElement(node);
		}	
		return new Node(node);
	}
	
	NodeFactory.fn =Node.prototype;
	return NodeFactory;
}), '$Node');


$A(("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" ")).each(function(key){
		$Node.fn[key] = function(context,method){
			$E.connect(this,'on'+key,arale.hitch(context,method));
			return this;
			//return $E.connect(this,'on'+key,arale.hitch(context,method));
		};
});
$Node.fn['trigger'] = function(type,data){
	$E.trigger(this,type,data);
};

Node=$Node;

/**Last Changed Author: hui.kang--Last Changed Date: Wed Jun 01 16:38:20 CST 2011**/