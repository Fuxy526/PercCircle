var gulp = require('gulp');
var uglify = require('gulp-uglify'); // compress js
var plumber = require('gulp-plumber'); // ignore error
var rename = require('gulp-rename'); //rename files
var browserSync = require('browser-sync').create(); //create server and refresh browser automatically

/**
 * compress js and distribute
 */
gulp.task('build', function() {
	return gulp.src('src/PercCircle.js')
		.pipe(plumber())
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename('PercCircle.min.js'))
		.pipe(gulp.dest('dist'));
});

/**
 * watch files changes and rebuild
 */
gulp.task('watch', function() {
	return gulp.watch('src/PercCircle.js', ['build']);
});

/**
 * start server and refresh browser automatically
 */
gulp.task('server', function() {
	var files = [
		'**/*.html',
		'dist/PercCircle.min.js'
	]
	return browserSync.init(files, {
		server: {
			baseDir: './'
		}
	});
});

/**
 * default task
 */
gulp.task('default', ['build', 'watch', 'server']);