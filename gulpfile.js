var gulp = require('gulp');
var karma = require('karma');

gulp.task('test', function(done){
	new karma.Server({
		configFile: __dirname + '/test/karma.conf.js',
		singleRun: true
	}, done).start();
})