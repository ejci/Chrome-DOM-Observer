(function() {
	console.log('DOM Observer (page.js)');
	var events = {
		DOMContentLoaded : false,
		load : false
	};
	try {
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			console.log('request.action', request.action);
			/**
			 * Reload page
			 */
			if (request.action === 'reload') {
			}
			/**
			 * Start recording
			 */
			if (request.action === 'record-start') {

			}
			/**
			 * Stop recording
			 */
			if (request.action === 'record-stop') {
			}
		});
		window.addEventListener('DOMContentLoaded', function() {
			chrome.runtime.sendMessage({
				destination : 'devtools',
				action : 'timing',
				data : null
			});
			events.DOMContentLoaded = true;
		});
		window.addEventListener('load', function() {
			chrome.runtime.sendMessage({
				destination : 'devtools',
				action : 'performance',
				data : window.performance
			});
			events.load = true;
		});

	} catch(e) {
		//do nothing
		console.error('DOM watcher (page.js)', e);
	}
	chrome.runtime.sendMessage({
		destination : 'devtools',
		action : 'nothing',
		data : 'nothing'
	});
})();

(function() {
	return;
	var timeline = [];
	var watch = function() {
		var target = document.querySelector('body');
		var i = {};
		var observer = new MutationObserver(function(mutations) {
			timeline.push({
				time : (new Date().getTime()),
				mutations : mutations,
				event : 'mutation'
			});
		});
		observer.observe(document, {
			childList : true,
			attributes : true,
			characterData : true,
			subtree : true,
			attributeOldValue : true,
			characterDataOldValue : true,
			attributeFilter : true
		});
	};

	window.addEventListener('DOMContentLoaded', function() {
		timeline.push({
			time : (new Date().getTime()),
			event : 'DOMContentLoaded'
		});
		//console.log('DOMContentLoaded: ' + new Date().getTime());
		watch();
	});
	window.addEventListener('load', function() {
		//console.log('load: ' + new Date().getTime());
		timeline.push({
			time : (new Date().getTime()),
			event : 'load'
		});
		//TODO: pass timeline to dev tools
		chrome.runtime.sendMessage({
			action : 'timeline',
			data : timeline
		}, function(response) {

		});
		//TODO: pass window.performance to dev tools
		chrome.runtime.sendMessage({
			action : 'performance',
			data : window.performance
		}, function(response) {

		});
	});
	//TODO: pass timeline to dev tools
	chrome.runtime.sendMessage({
		action : 'indentify'
	}, function(response) {

	});

})();
