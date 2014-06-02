var connections = {};
chrome.runtime.onConnect.addListener(function(port) {
	var extensionListener = function(message, sender, sendResponse) {
		if (message.name == "init") {
			connections[message.tabId] = port;
			console.log('background.js', 'connections', connections);
			return;
		}
	};
	port.onMessage.addListener(extensionListener);

	port.onDisconnect.addListener(function(port) {
		port.onMessage.removeListener(extensionListener);
		var tabs = Object.keys(connections);
		for (var i = 0, len = tabs.length; i < len; i++) {
			if (connections[tabs[i]] == port) {
				delete connections[tabs[i]];
				break;
			}
		}
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('background.js', request, sender);
	if (sender.tab) {
		var tabId = sender.tab.id;
		if ( tabId in connections) {
			connections[tabId].postMessage(request);
		} else {
			console.error("Tab not found in connection list.");
		}
	} else {
		console.error("sender.tab not defined.");
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