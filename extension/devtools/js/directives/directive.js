app.directive('mutation', function() {
	return {
		restrict : 'AE',
		scope : {
			mutation : '=data'
		},
		templateUrl : 'templates/mutation.html'
	};
});
app.directive('event', function() {
	return {
		restrict : 'AE',
		scope : {
			event : '=data'
		},
		templateUrl : 'templates/event.html'
	};
});
app.directive('element', function() {
	return {
		restrict : 'AE',
		scope : {
			element : '=data'
		},
		templateUrl : 'templates/element.html'
	};
});
app.directive('elements', function() {
	return {
		restrict : 'AE',
		scope : {
			elements : '=data'
		},
		templateUrl : 'templates/elements.html'
	};
}); 