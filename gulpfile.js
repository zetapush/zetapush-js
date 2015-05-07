var gulp = require('gulp'),
  rename = require('gulp-rename')
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

// CometD build process
// This task build the CometD Library
// Launch this task with "gulp cometd"
// One can include Zepto (light JQuery) 

var cometdPath= 'bower_components/cometd-jquery/cometd-javascript/common/src/main/js/org/cometd/';
var qwestPath= 'bower_components/qwest/src/';

gulp.task('zetapush', function() {
  return gulp.src([
      cometdPath + 'cometd-namespace.js',
      cometdPath + 'CometD.js', 
      cometdPath + 'Utils.js' ,
      cometdPath + 'cometd-json.js',
      cometdPath + 'Transport.js',
      cometdPath + 'RequestTransport.js',
      cometdPath + 'TransportRegistry.js', 
      cometdPath + 'WebSocketTransport.js', 
      cometdPath + 'LongPollingTransport.js',
      'bower_components/loglevel/dist/loglevel.min.js',
      'src/qwest.js',
      'src/zetapush.js'
    ])
    .pipe(concat('zetapush.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});


gulp.task('default', [], function() {
    gulp.start('zetapush');
});