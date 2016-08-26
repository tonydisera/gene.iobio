var gulp = require('gulp');
var nightwatch = require('gulp-nightwatch');
var util = require('gulp-util');

var fork = require('child_process').fork;
var args = require('yargs').argv;
var child;

gulp.task('start-server', function(done) {
	log('Starting the test server');
	process.env.PORT = 3008;
	child = fork('./server.js');
	done();
});

gulp.task('nightwatch', ['start-server'], function() {
	var cliArgs = JSON.parse(JSON.stringify(args));
	if (args.e) { cliArgs['env'] = args.e; }
	return gulp.src('')
		.pipe(nightwatch({
			configFile: 'nightwatch.json',
			cliArgs: cliArgs
		}));
});

gulp.task('e2e', ['nightwatch'], function(done) {
	// Use --env or -e to specify which test environment to use (e.g. gulp e2e -e chrome)
	if (child) {
		log('Shutting down the test server.');
		child.kill();
	}
	done();
});

function log(message) {
	util.log(util.colors.blue(message));
}


