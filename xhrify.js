Xhrify = (function(){
	'use strict';

	/**
	 * An default settings template
	 * Just overwrite this settings when build an object
	 * @type {Object}
	 */
	var _settings = {
		version: '1',
		serverStorageUrl: document.location.origin,
		storageUrl: '',
		timePrefix: '_expire',
		cachePrefix: '_cache',
		defaultCachePeriod: 0,
	}

	/**
	 * String which is a prefix for cache in LS
	 */
	var _storageKey;

	/**
	 * Actual settings object.
	 * @type {Object}
	 */
	var settings = {};

	/**
	 * Constructor
	 * @param  {object} input Data to override _settings params
	 * @return {object}       Object library itself
	 */
	function constructor(input) {
		if (input) {
			input.__proto__ = _settings;
			settings = input;
		} else {
			settings = _settings;
		}

		setStorageKey();

		return {
			ajax: ajax,
			getStorageKey: getStorageKey,
			service: {
				getCachePath: getCachePath,
				setStorageKey: setStorageKey,
				serializeURLencoded: serializeURLencoded,
				isCacheExpired: isCacheExpired
			}
		}
	}

	/**
	 * Exported concatenation for the storage key
	 */
	function setStorageKey(customKey) {
		_storageKey = customKey || settings.cachePrefix + '-' + settings.version;
	}

	/**
	 * Getter for a storage key
	 * @return {string} Storage key
	 */
	function getStorageKey() {
		return _storageKey;
	}

	/**
	 * Exporten concatenation for cache path
	 * @param  {string} file
	 * @param  {string} type
	 * @return {string}
	 */
	function getCachePath(file, type) {
		return _storageKey + '-' + type + '-' + file;
	}

	/**
	 * Decorator for success calback. Saves value to cache after success.
	 * @param  {string} key             filename (also a key in cache)
	 * @param  {function} successCallback Original success callback
	 * @return {function}                 Decorated success callback
	 */
	var successDecorator = function(key, type, successCallback) {
		var expirationKey = _storageKey + settings.timePrefix;
		var expirationTime = new Date().getTime() + settings.defaultCachePeriod;
		var cacheKey = getCachePath(key, type);

		return function(response) {
			var encodedResponse = JSON.stringify(response);

			if (window.localStorage[expirationKey] == undefined) {
				window.localStorage.setItem(expirationKey, expirationTime);
			}
			window.localStorage.setItem(cacheKey, encodedResponse);
			successCallback(response);
		}
	}

	/**
	 * Send XHR request
	 * @param  {string} url
	 * @param  {function} success
	 * @param  {function} failCal
	 * @param  {string} type
	 * @param  {object} payload
	 * @return {boolean}          Process state
	 */
	function sendRequest(url, successCallback, failCallback, type, payload) {
	    var request = createXMLHTTPObject();
	    var method = type || 'GET';
	    if (!request) {
	    	return false;
	    }

	    request.open(method,url,true);
	    if (method !== "GET") {
	        request.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	    }
		request.onreadystatechange = function () {
	        if (request.readyState != 4)  {
	        	return false;
	        }
	        if (request.status != 200 && request.status != 304) {
	        	if (failCallback !== undefined) {
	        		failCallback(request);
	        	}
	            return false;
	        }
	        successCallback(JSON.parse(request.response));
	    }
	    if (request.readyState == 4) {
	    	return false
	    }
	    request.send(payload);
	}

	/**
	 * Array of different XHR implementations
	 * @type {Array}
	 */
	var XMLHttpFactories = [
	    function () {
	    	return new XMLHttpRequest()
	    },
	    function () {
	    	return new ActiveXObject("Msxml2.XMLHTTP")
	    },
	    function () {
	    	return new ActiveXObject("Msxml3.XMLHTTP")
	    },
	    function () {
	    	return new ActiveXObject("Microsoft.XMLHTTP")
	    }
	];

	/**
	 * XHR factory
	 * @return {object} XHR implementation
	 */
	function createXMLHTTPObject() {
	    var xmlhttp = false;
	    for (var i=0; i<XMLHttpFactories.length; i++) {
	        try {
	            xmlhttp = XMLHttpFactories[i]();
	        }
	        catch (e) {
	            continue;
	        }
	        break;
	    }
	    return xmlhttp;
	}

	/**
	 * Serialize an object in URL encoded data
	 * @param  {object} input Data to be serialized
	 * @return {string}       URLencoded data
	 */
	function serializeURLencoded(input) {
		var preparedData = [];
		for(var el in input){
		   if (input.hasOwnProperty(el)) {
		       preparedData.push(encodeURIComponent(el) + "=" + encodeURIComponent(input[el]));
		   }
		}
		return preparedData.join("&");
	}

	/**
	 * Check is cache already expired or not
	 * @return {Boolean} Cache is expired
	 */
	var isCacheExpired = function() {
		var time = window.localStorage[_storageKey + settings.timePrefix];
		var now = new Date().getTime().toString();
		if (time == undefined || now > time) {
			console.info('Cache cleared');
			localStorage.clear()
			return true;
		}
		return false;
	}

	/**
	 * Functional wrapper for request
	 * @param  {object} input [description]
	 */
	var ajax = function(input){
		if (typeof input !== 'object' || input.url.length < 1) {
			console.error('Incorrect request data');
			return false;
		}

		var file = input.url;
		var type = input.type || 'GET';
		var data = serializeURLencoded(input.data);
		var successCallback = input.success;
		var errorCallback = input.error;
		var cacheKey = getCachePath(file, type);

		if (settings.defaultCachePeriod > 0
				&& window.localStorage[cacheKey] !== undefined
				&& !isCacheExpired()) {
			return successCallback(JSON.parse(window.localStorage[cacheKey]));
		}

		successCallback = successDecorator(file, type, successCallback);
		sendRequest(settings.serverStorageUrl + file, successCallback, errorCallback, type, data);
	}

	/**
	 * Commonjs module support
	 */
	if (typeof module == 'object' && module.exports) {
		module.exports = colorEntity;
	}

	return constructor;

})();