console.log('chrome.devtools.inspectedWindow.tabId', chrome.devtools.inspectedWindow.tabId);

chrome.devtools.panels.create('DOM Observer', null, 'devtools/panel.html', function(panel) {
	panel.onShown.addListener(function(win) {
		win.init();

	});
	panel.onHidden.addListener(function(win) {
		//		win.init();

	});
});

