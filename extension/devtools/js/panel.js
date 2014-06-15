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

