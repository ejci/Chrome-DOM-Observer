(function() {
	var useConsole = false, childList = false, screenshots = false, observer;
	var nodeExp = new RegExp('target|previousSibling|nextSibling', 'i');
	var nodeListExp = new RegExp('addedNodes|removedNodes', 'i');
	var timeStart = (new Date()).getTime();
	(function() {
		var time = new Date().getTime();
		chrome.runtime.sendMessage({
			destination : 'devtools',
			event : {
				type : 'event',
				__meta__ : {
					timestamp : timeStart,
					time : 0
				},
				name : 'reload'
			}
		});
	})();
	/**
	 * Transform node object to "transferable" object
	 */
	var transformNode = function(node) {
		var copy = null;
		if (node) {
			copy = {};
			copy.tagName = node.tagName;
			copy.attributes = (function(attributes) {
				var attrs = {};
				if (attributes) {
					for (var i = 0, l = attributes.length; i < l; i++) {
						var attr = attributes[i];
						attrs[attr.nodeName] = {
							nodeName : attr.nodeName,
							nodeValue : attr.nodeValue
						};
					}
				}
				return attrs;
			})(node.attributes);
			copy.path = (function(el) {
				var names = [];
				while (el.parentNode) {
					if (el.id) {
						names.unshift('#' + el.id);
						break;
					} else {
						if (el == el.ownerDocument.documentElement)
							names.unshift(el.tagName);
						else {
							for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
							names.unshift(el.tagName + ":nth-child(" + c + ")");
						}
						el = el.parentNode;
					}
				}
				return names.join(" > ");

			})(node);
			copy.children = (node.children) ? node.children.length : 0;
			copy.hidden = node.hidden;
			copy.localName = node.localName;
			copy.clientHeight = node.clientHeight;
			copy.clientWidth = node.clientWidth;
			copy.clientTop = node.clientTop;
			copy.clientLeft = node.clientLeft;
			copy.nodeName = node.nodeName;
		}
		return copy;
	};
	/**
	 * Transform mutation object to "transferable" object
	 */
	var transformMutation = function(obj) {
		var copy = {};
		for (key in obj) {
			if (nodeExp.test(key)) {
				copy[key] = transformNode(obj[key]);
			} else if (nodeListExp.test(key)) {
				copy[key] = [];
				for (var i = 0, l = obj[key].length; i < l; i++) {
					copy[key].push(transformNode(obj[key][i]));
				}
			} else {
				copy[key] = '' + obj[key];
			}

		}
		return copy;
	};
	try {
		chrome.runtime.sendMessage({
			destination : 'background',
			action : 'init'
		});
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			/**
			 * Start recording
			 */
			if (request.action === 'record-start') {
				useConsole = request.console;
				childList = request.childList;
				screenshots = request.screenshots;
				console.log('record-start', observer);
				if (!observer) {

					observer = new MutationObserver(function(mutations) {
						var time = (new Date()).getTime();
						for (key in mutations) {
							//if (useConsole) {
							console.log(mutations[key]);
							//}
							var mutation = transformMutation(mutations[key]);
							chrome.runtime.sendMessage({
								destination : 'devtools',
								event : {
									type : 'mutation',
									__meta__ : {
										timestamp : time,
										time : (time - timeStart)
									},
									mutation : mutation
								}
							});
						}
					});
					observer.observe(document, {
						childList : childList,
						attributes : true,
						characterData : true,
						subtree : true,
						attributeOldValue : true,
						characterDataOldValue : true,
						attributeFilter : true
					});
					console.log(observer, document);
				}

			}
			/**
			 * Stop recording
			 */
			if (request.action === 'record-stop') {
				console.log('record-stop');
				if (observer) {
					observer.disconnect();
					observer = null;
				}
			}
		});
		window.addEventListener('DOMContentLoaded', function() {
			var time = (new Date()).getTime();
			chrome.runtime.sendMessage({
				destination : 'devtools',
				event : {
					type : 'event',
					__meta__ : {
						timestamp : time,
						time : (time - timeStart)
					},
					name : 'DOMContentLoaded'
				}
			});
		});

		window.addEventListener('load', function() {
			var time = (new Date()).getTime();
			chrome.runtime.sendMessage({
				destination : 'devtools',
				event : {
					type : 'event',
					__meta__ : {
						timestamp : time,
						time : (time - timeStart)
					},
					name : 'load'
				}
			});
		});

	} catch(e) {
		//do nothing
		console.error('DOM watcher (page.js)', e);
	}
})();
