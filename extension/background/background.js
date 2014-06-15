var connections = {};
chrome.runtime.onConnect.addListener(function(port) {
	var extensionListener = function(message, sender, sendResponse) {
		if (message.type === "init") {
			connections[message.tabId] = {
				port : port,
				recording : false,
				reloading : false
			};
			console.log('background.js', 'connections', connections);
		}
		if (message.type === 'reload') {
			port.postMessage({
				action : 'reloading',
				started : true,
				finished : false
			});
			chrome.tabs.reload(message.tabId);
		}
		if (message.type === 'record') {
			if (message.action === 'start') {
				connections[message.tabId].recording = true;
			}
			if (message.action === 'stop') {
				connections[message.tabId].recording = false;
			}
			connections[message.tabId].console = message.console;
			connections[message.tabId].childList = message.childList;
			connections[message.tabId].screenshots = message.screenshots;
			port.postMessage({
				action : 'recording',
				data : connections[message.tabId].recording
			});
			chrome.tabs.sendMessage(message.tabId, {
				action : 'record-' + message.action,
				console : connections[message.tabId].console,
				childList : connections[message.tabId].childList,
				screenshots : connections[message.tabId].screenshots
			});

		}
		return;
	};

	port.onMessage.addListener(extensionListener);
	port.onDisconnect.addListener(function(port) {
		port.onMessage.removeListener(extensionListener);
		var tabs = Object.keys(connections);
		for (var i = 0, len = tabs.length; i < len; i++) {
			if (connections[tabs[i]] && connections[tabs[i]].port == port) {
				chrome.tabs.sendMessage(parseInt(tabs[i], 10), {
					action : 'record-stop'
				});
				delete connections[tabs[i]];
				break;
			}
		}
	});
});

chrome.tabs.onUpdated.addListener(function(tabId, info) {
	if (connections[tabId]) {
		if (info.status == "complete") {
			connections[tabId].port.postMessage({
				action : 'reloading',
				started : false,
				finished : true
			});
		}
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('background.js', request, sender);
	if (request.destination === 'devtools') {
		if (sender.tab) {
			var tabId = sender.tab.id;
			if ( tabId in connections) {
				connections[tabId].port.postMessage(request);
			} else {
				console.error("Tab not found in connection list.");
			}
		} else {
			console.error("sender.tab not defined.");
		}
	}
	if (request.destination === 'background') {
		if (request.action === 'init') {
			var tabId = sender.tab.id;
			if ( tabId in connections) {
				if (connections[tabId].recording === true) {
					chrome.tabs.sendMessage(tabId, {
						action : 'record-start',
						console : connections[tabId].console,
						childList : connections[tabId].childList,
						screenshots : connections[tabId].screenshots,
					});
				}
			}
		}
	}

	return true;
});

//initial settings
if (KONST) {
	for (var k in KONST.settings) {
		if (!localStorage['ngStorage-' + k]) {
			localStorage['ngStorage-' + k] = JSON.stringify(KONST.settings[k]);
		}
	}
}