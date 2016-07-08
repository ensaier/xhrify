(function(Xhrify){
	'use strict';
	var xhrify = new Xhrify({
		serverStorageUrl: 'http://php.local/xhrify',
		defaultCachePeriod: 500000,
	});

	var examplesMap = {
		GET: getExample,
		PUT: bulk,
		POST: postExample,
		DELETE: bulk,
		PATH: bulk
	}

	function bulk() {
		console.log('ok');
	}

	function successCallback(input) {
		console.log('All is ok', input);
	}

	function failCallback(error) {
		console.log('Error while requesting', error);
	}

	function getExample() {
		xhrify.get('/package.json', successCallback, failCallback);
	}

	function postExample() {
		xhrify.ajax({
			type: 'POST',
			url: '/package.json',
			success: successCallback,
			fail: failCallback,
			data: {'hello': 'world'}
		});
	}

	function onButtonClicked(event){
		var element = event.target;
		var type = element.getAttribute('data-request-type');
		var payload = {
			'hello': 'world'
		};
		if (type == 'GET' || type == 'DELETE') {
			payload = undefined;
		}
		xhrify.ajax({
			type: type,
			url: '/package.json',
			success: successCallback,
			fail: failCallback,
			data: payload
		});
		// examplesMap[type]();
		console.log(type);
	}

	function startListeners() {
		var buttons = document.querySelectorAll('.request-trigger');
		[].forEach.call(buttons, function(element){
			element.addEventListener('click', onButtonClicked);
		});
	}

	startListeners();
})(Xhrify);