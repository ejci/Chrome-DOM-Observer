/**
 * Main app module with dependencise
 */
var app = angular.module('app', ['ngStorage', 'angular-rickshaw']);

/**
 * App controller
 */
app.controller('AppCtrl', function($scope, $window, $localStorage, $timeout, tab) {
	//localstorage
	$scope.settings = $localStorage.$default(KONST.settings);
	/**
	 * Services
	 */
	$scope.tab = tab.data;

	/**
	 * onMessage callback will be fired when message will be passed to tab service
	 * I need to find better sollution for that
	 */
	tab.onMessage(function() {
		$scope.$apply();
	});

	$window.init = function() {
		console.log('$window.init');
	};

});

