describe("Test basic xhrify", function() {
	var xhrify;

	beforeEach(function(){
		xhrify = new Xhrify();
	});

	afterEach(function() {
		window.localStorage.clear();
	});

	/**
	 * Validate getStorageKey function (validates initial values)
	 */
	it('Validates storage key function', function() {
		var key = xhrify.getStorageKey();
		expect(key).to.equal('_cache-1');
	});

	/**
	 * Validate key builder and setter inself
	 */
	it('Validates set storage key function', function(){
		var target = 'test-value';
		var key = xhrify.service.setStorageKey(target);
		var result = xhrify.getStorageKey();
		expect(result).to.equal(target);
	});

	/**
	 * Testing serialization method
	 */
	it('Tests serialization method', function(){
		var testData = {
			'hello': 'world',
			'welcome': 'planet'
		}
		var result = 'hello=world&welcome=planet';
		var serialized = xhrify.service.serializeURLencoded(testData);
		expect(serialized).to.equal(result);
	});

	/**
	 * Checks cache expiration
	 */
	it('Checks cache expiration', function(){
		var result = xhrify.service.isCacheExpired();
		expect(result).to.be.true;
	});
});

describe("Test extended initialization", function(){
	var xhrify;
	var cachePrefix = '_customCache';
	var timePrefix = '_customExpiration';
	var defaultCachePeriod = 3000;

	beforeEach(function(){
		xhrify = new Xhrify({
			serverStorageUrl: 'http://localhost/xhrify',
			defaultCachePeriod: defaultCachePeriod,
			cachePrefix: cachePrefix,
			timePrefix: timePrefix
		});
	});

	afterEach(function() {
		window.localStorage.clear();
	});

	/**
	 * Validate getStorageKey function (validates custom initial values)
	 */
	it('Validates custom storage key function', function() {
		var key = xhrify.getStorageKey();
		expect(key).to.equal('_customCache-1');
	});

	/**
	 * Check cache expiration
	 */
	it('Checks cache expiration', function(){
		var storageKey = xhrify.getStorageKey();
		var expirationKey = storageKey + timePrefix;
		var result;

		this.timeout(defaultCachePeriod + 100);
		window.localStorage.setItem(expirationKey, new Date().getTime() + defaultCachePeriod);

		setTimeout(function(){
			result = xhrify.service.isCacheExpired();
			expect(result).to.be.true;
		});
	});

	/**
	 * Cache should exist for a moment when we are calling it
	 */
	it('Checks cache correction', function(){
		var storageKey = xhrify.getStorageKey();
		var expirationKey = storageKey + timePrefix;
		var result;

		window.localStorage.setItem(expirationKey, new Date().getTime() + defaultCachePeriod);
		result = xhrify.service.isCacheExpired();
		expect(result).to.be.false;
	});
});