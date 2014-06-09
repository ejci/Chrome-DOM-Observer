/**
 * Main app module with dependencise
 */
var app = angular.module('app', ['ngStorage', 'ngSanitize']);

/**
 * App controller
 */
app.controller('AppCtrl', function($scope, $window, $localStorage, $timeout, tab) {

	$scope.settings = $localStorage.$default(KONST.settings);
	$scope.ui = {};

	/**
	 * Services
	 */
	$scope.tab = tab.data;

	$scope.ui.reload = function() {
		tab.reload();
	};
	$scope.ui.record = function(action) {
		tab.record(action, $scope.settings.console, $scope.settings.autostop);
	};
	$scope.ui.clear = function() {
		tab.clear();
	};
	//*://127.0.0.1:*/*

	/**
	 * Utils
	 * TODO: Move it outside of controller!
	 */
	$scope.utils = {};
	/**
	 * Format timestamp to something readable
	 * 1m 2s 3ms
	 * 1s 2ms
	 * 1ms
	 */
	$scope.utils.formatTime = function(mutation) {
		if ($scope.tab.performance && $scope.tab.performance.timing.navigationStart < mutation.time) {
			//var tStart = ($scope.tab.mutations[0].time);
			var tStart = ($scope.tab.performance.timing.navigationStart);
			var t = Math.abs(mutation.time - tStart);
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
			mutation.formatTime = ((m) ? m + 'm ' : '') + ((s) ? s + 's ' : '') + (ms + 'ms');
			//mutation.isBeforeLoad=(mutation.time < $scope.performance.timing.loadEventEnd);
		} else {
			mutation.formatTime = '-';
		}
		return mutation.formatTime;
	};

	/**
	 * Format type description
	 */
	$scope.utils.typeDesc = function(mutation) {

		if (mutation.type === 'attributes') {
			mutation.typeDesc = 'attr';
		}
		if (mutation.type === 'characterData') {
			mutation.typeDesc = 'text';
		}
		if (mutation.type === 'childList') {
			//var plus = (mutation.addedNodes.length) ? ' +' + mutation.addedNodes.length : '';
			//var minus = (mutation.removedNodes.length) ? ' -' + mutation.removedNodes.length : '';
			var plus = (mutation.addedNodes.length) ? '+' : '';
			var minus = (mutation.removedNodes.length) ? '-' : '';
			mutation.typeDesc = 'child' + plus + minus;
		}
		return mutation.typeDesc;
	};
	/**
	 * Human radable summary of mutation
	 */
	$scope.utils.description = function(mutation) {
		function safeTags(str) {
			return str.replace(/(\r\n|\n|\r)/gm, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/>/g, '&gt;');
		}


		mutation.summary = 'See details...';
		if (mutation.type === 'attributes') {
			if (mutation.oldValue === 'null') {
				mutation.summary = 'Attribute <b>' + mutation.attributeName + '</b> was added to the element with value <b>' + safeTags((mutation.target.attributes[mutation.attributeName]) ? mutation.target.attributes[mutation.attributeName].nodeValue : '~unknown~') + '</b>.';
				if (mutation.attributeName === 'style' && !mutation.eventLoad && (new RegExp('display|opacity', 'i')).test('' + mutation.target.attributes[mutation.attributeName].nodeValue)) {
					mutation.alert = true;
				}
			} else {
				if (mutation.target.attributes['' + mutation.attributeName] && mutation.target.attributes['' + mutation.attributeName].nodeValue !== '') {
					mutation.summary = 'Attribute <b>' + mutation.attributeName + '</b> was changed. Old value was <b>' + safeTags(mutation.oldValue) + '</b>. New value is <b>' + safeTags(mutation.target.attributes['' + mutation.attributeName].nodeValue) + '</b>.';
					if (mutation.attributeName === 'style' && !mutation.eventLoad && (new RegExp('display|opacity', 'i')).test('' + mutation.target.attributes[mutation.attributeName].nodeValue)) {
						mutation.alert = true;
					}
				} else {
					mutation.summary = 'Attribute <b>' + mutation.attributeName + '</b> was removed from the element. Old value was <b>' + safeTags(mutation.oldValue) + '</b>.';
				}
			}
		}
		if (mutation.type === 'characterData') {
			mutation.summary = '';
		}
		if (mutation.type === 'childList') {
			if (mutation.addedNodes.length) {
				mutation.summary = 'Child element was added to the element (+' + mutation.addedNodes.length + ').';
			}
			if (mutation.removedNodes.length) {
				mutation.summary = 'Child element as removed from the element (' + mutation.removedNodes.length + ').';
			}
		}
		return mutation.summary;
	};
	$scope.ui.toggleMutationDump = function(mutation) {
		mutation.visible = !mutation.visible;
	};
	/**
	 * Settings
	 */
	$scope.ui.settingsVisible = false;
	$scope.ui.settingsClose = function() {
		$scope.ui.settingsVisible = false;
	};
	$scope.ui.settingsOpen = function() {
		$scope.ui.settingsVisible = true;
	};

	$window.init = function() {
		//console.log('$window.init');
	};

});

