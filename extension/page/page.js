(function() {
	var useConsole = false, childList = false, eventLoad = false, observer;
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
		var nodeExp = new RegExp('target|previousSibling|nextSibling', 'i');
		var nodeListExp = new RegExp('addedNodes|removedNodes', 'i');
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
		//send init message to background.js. If needed background.js will fire record-start event
		chrome.runtime.sendMessage({
			destination : 'background',
			action : 'init'
		});
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			//console.log('request.action', request);
			/**
			 * Start recording
			 */
			if (request.action === 'record-start') {
				useConsole = request.console;
				childList = request.childList;
				if (!observer) {
					observer = new MutationObserver(function(mutations) {
						var time = new Date().getTime();
						for (key in mutations) {
							if (useConsole) {
								console.log(mutations[key]);
							}

							var mutation = transformMutation(mutations[key]);
							mutation.time = time;
							mutation.eventLoad = eventLoad;
							chrome.runtime.sendMessage({
								destination : 'devtools',
								action : 'mutation',
								data : mutation
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
				}

			}
			/**
			 * Stop recording
			 */
			if (request.action === 'record-stop') {
				if (observer) {
					observer.disconnect();
					observer = null;
				}
			}
		});
		window.addEventListener('DOMContentLoaded', function() {
			//maybe I will need this... or not :)
			eventLoad=false;
		});
		window.addEventListener('load', function() {
			chrome.runtime.sendMessage({
				destination : 'devtools',
				action : 'performance',
				data : window.performance
			});
			eventLoad = true;
		});

	} catch(e) {
		//do nothing
		console.error('DOM watcher (page.js)', e);
	}
})();
