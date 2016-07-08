module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha', 'chai'],
	 plugins : [
	    'karma-mocha',
	    'karma-chai',
	    'karma-phantomjs-launcher',
	    'karma-browserify'
	],
	files: [
		'xhrify.js',
		'test/spec/*.js',
	],
	browsers: ['PhantomJS'],
	preprocessors: {
		'test/mock/*.js': ['browserify']
	},
	reporters: ['progress'],
    broswerDisconnectTimeout: 1000,
    browserNoActivityTimeout: 5000,
  });
};