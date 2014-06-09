/**
 * Tab service ("API")
 */
app.service('tab', ['$rootScope', '$q', '$localStorage',
function($rootScope, $q, $localStorage) {
	var settings = $localStorage;
	var data = {};
	var isRecording = false;
	data.mutations = [];
	var onMessageCb = function() {

	};
	// Create a connection to the background page
	var connection;
	if (chrome.runtime) {
		//var deferred = $q.defer();
		connection = chrome.runtime.connect({
			name : "panel"
		});
		connection.postMessage({
			type : 'init',
			tabId : chrome.devtools.inspectedWindow.tabId
		});
		connection.onMessage.addListener(function(message) {
			//console.log(message.action, !settings.preserve, message.data);
			if (message.action === 'reloading' && !settings.preserve && message.data === true) {
				clear();
			}
			if (message.action === 'reloading' && message.data === false) {
				if (settings.autostop) {
					connection.postMessage({
						type : 'record',
						action : 'stop',
						tabId : chrome.devtools.inspectedWindow.tabId
					});
				}
			}
			//TODO: rewrite!
			if (message.action === 'mutation') {
				data.mutations.push(message.data);
			} else {
				data['' + message.action] = message.data;
			}
			//:'(
			$rootScope.$apply();
		});
	}
	/**
	 * Start/stop recording
	 * @param {Object} action
	 */
	var record = function(action) {
		if (connection) {
			connection.postMessage({
				type : 'record',
				action : action,
				console : settings.console,
				childList : settings.childChanges,
				tabId : chrome.devtools.inspectedWindow.tabId
			});
		}
	};
	/**
	 * Clear data
	 * @param {Object} action
	 */
	var clear = function() {
		data.mutations = [];

	};
	/**
	 * Reload inspected tab
	 * @param {Object} action
	 */
	var reload = function() {
		if (connection) {
			data.performance = false;
			connection.postMessage({
				type : 'reload',
				tabId : chrome.devtools.inspectedWindow.tabId
			});
		}
	};
	return {
		record : record,
		clear : clear,
		reload : reload,
		data : data
	};
}]);
