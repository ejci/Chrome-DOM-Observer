app.directive('mutation', function() {
	return {
		restrict : 'E',
		scope : {
			mutation : '=data'
		},
		templateUrl : 'templates/mutation.html'
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