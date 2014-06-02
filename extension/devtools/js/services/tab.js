/**
 * Tab service ("API")
 */
app.service('tab', function($q) {
	var data = {};
	var isRecording=false;
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
			name : 'init',
			tabId : chrome.devtools.inspectedWindow.tabId
		});
		connection.onMessage.addListener(function(message) {
			data.debug = message;
			if (message.action) {
				data['' + message.action] = message.data;
			}
			//:'(
			onMessageCb();
		});
	}
	return {
		/**
		 * Record DOM observation
		 */
		onMessage : function(cb) {
			//input cheking
			onMessageCb = cb;
		},
		/**
		 *
		 * @param {Object} action
		 */
		record : function(action) {
			if (chrome.devtools) {
				var deferred = $q.defer();

				//		data.registered = registered;
				//		deferred.resolve(registered);
				//	} catch(e) {
				//		deferred.reject(e);
				//	}
				return deferred.promise;
			} else {
				data.registered = 0;
			}
		},
		data : data
	};
});
