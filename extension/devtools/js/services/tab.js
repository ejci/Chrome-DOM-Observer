/**
 * Tab service ("API")
 */
app.service('tab', ['$rootScope', '$q', '$localStorage',
function($rootScope, $q, $localStorage) {
	var settings = $localStorage;
	var isRecording = false;
	var data = {};
	data.mutations = [];
	data.events = [];

	/**
	 * Format time to {X}m {Y}s {Z}ms string
	 */
	var formatTime = function(t) {
		var m, s, ms;
		if (t > (60 * 1000)) {
			m = Math.floor(t / (60 * 1000));
			t = t % (60 * 1000);
		}
		if (t > (1000)) {
			s = Math.floor(t / 1000);
			t = t % (1000);
		}
		ms = t;
		return ((m) ? m + 'm ' : '') + ((s) ? s + 's ' : '') + (ms + 'ms');
	};
	/**
	 * Format type description
	 */
	var typeDesc = function(mutation) {
		var typeDesc = '';
		if (mutation.type === 'attributes') {
			typeDesc = 'attr';
		}
		if (mutation.type === 'characterData') {
			typeDesc = 'text';
		}
		if (mutation.type === 'childList') {
			//var plus = (mutation.addedNodes.length) ? ' +' + mutation.addedNodes.length : '';
			var plus = (mutation.addedNodes.length) ? '+' : '';
			var minus = (mutation.removedNodes.length) ? '-' : '';
			typeDesc = 'child' + plus + minus;
		}
		return typeDesc;
	};
	var summary = function(mutation) {
		function safeTags(str) {
			return str.replace(/(\r\n|\n|\r)/gm, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/>/g, '&gt;');
		}

		var summary = {
			alert : false,
			description : 'See details...'
		};
		if (mutation.type === 'attributes') {
			if (mutation.oldValue === 'null') {
				summary.description = 'Attribute <b>' + mutation.attributeName + '</b> was added to the element with value <b>' + safeTags((mutation.target.attributes[mutation.attributeName]) ? mutation.target.attributes[mutation.attributeName].nodeValue : '~unknown~') + '</b>.';
				if (mutation.attributeName === 'style' && !mutation.eventLoad && (new RegExp('display|opacity', 'i')).test('' + mutation.target.attributes[mutation.attributeName].nodeValue)) {
					summary.alert = true;
				}
			} else {
				if (mutation.target.attributes['' + mutation.attributeName] && mutation.target.attributes['' + mutation.attributeName].nodeValue !== '') {
					summary.description = 'Attribute <b>' + mutation.attributeName + '</b> was changed. Old value was <b>' + safeTags(mutation.oldValue) + '</b>. New value is <b>' + safeTags(mutation.target.attributes['' + mutation.attributeName].nodeValue) + '</b>.';
					if (mutation.attributeName === 'style' && !mutation.eventLoad && (new RegExp('display|opacity', 'i')).test('' + mutation.target.attributes[mutation.attributeName].nodeValue)) {
						summary.alert = true;
					}
				} else {
					summary.description = 'Attribute <b>' + mutation.attributeName + '</b> was removed from the element. Old value was <b>' + safeTags(mutation.oldValue) + '</b>.';
				}
			}
		}
		if (mutation.type === 'characterData') {
			summary.description = '';
		}
		if (mutation.type === 'childList') {
			if (mutation.addedNodes.length) {
				summary.description = 'Child element was added to the element (+' + mutation.addedNodes.length + ').';
			}
			if (mutation.removedNodes.length) {
				summary.description = 'Child element as removed from the element (' + mutation.removedNodes.length + ').';
			}
		}
		return summary;
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
			if (message.action) {
				if (message.action === 'reloading' && message.started === true && !settings.preserve) {
					clear();
				}
				if (message.action === 'reloading' && message.finished === true && settings.autostop) {
					connection.postMessage({
						type : 'record',
						action : 'stop',
						tabId : chrome.devtools.inspectedWindow.tabId
					});
				}
				data['' + message.action] = message.data;
			}
			if (message.event) {
				message.event.__meta__.formattedTime = formatTime(message.event.__meta__.time);
				if (message.event.mutation) {
					var s = summary(message.event.mutation);
					var d = typeDesc(message.event.mutation);
					message.event.mutation.__meta__ = {};
					message.event.mutation.__meta__.typeDesc = d;
					message.event.mutation.__meta__.description = s.description;
					message.event.mutation.__meta__.alert = s.alert;
				}
				data.events.push(message.event);
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
				screenshots : settings.screenshots,
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
		data.events = [];

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
