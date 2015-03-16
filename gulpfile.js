var gulp = require('gulp')
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

// CometD build process
// This task build the never-modified CometD Library
// Launch this task with "gulp cometd"

var concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename');

gulp.task('zetapush', function() {
  return gulp.src([
  		'bower_components/loglevel/dist/loglevel.min.js',
		'bower_components/cometd-zepto/dist/cometdzepto.js',
	    'zetapush.js'
    ])
    .pipe(concat('zetapush.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// ZetaPush without Zepto Included
// The user must provide jQuery
gulp.task('zetapush-jquery', function() {
  return gulp.src([
  		'bower_components/loglevel/dist/loglevel.min.js',
		'bower_components/cometd-zepto/dist/cometd.js',
	    'zetapush.js'
    ])
    .pipe(concat('zetapush-jquery.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', [], function() {
    gulp.start('zetapush', 'zetapush-jquery');
});