import gulp from 'gulp'
import util from 'gulp-util'
import browserify from 'browserify'
import del from 'del'
import concat from 'gulp-concat'
import babelify from 'babelify'
import fs from 'fs'
import stream from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import merge from 'merge-stream'
import files from 'main-bower-files'
import minimist from 'minimist'
import sequence from 'run-sequence'
import uglify from 'gulp-uglify'
import github from 'gulp-gh-pages'
import request from 'request'

const pkg = require('./package')
const { optimize = false } = minimist(process.argv)

const REMOTE_DEFINITIONS_URL = 'http://pinte-silver-2/sdks/generated/2.3.15/js/zp_services.js'

const paths = {
  input: './src/index.js',
  output: './dist'
}

const getBabelifyConfig = () => {
  const text = fs.readFileSync('./.babelrc', 'utf8')
  const config = JSON.parse(text)
  if (optimize) {
    config.plugins.push('transform-remove-console')
  }
  return config
}

const getBrowserifyConfig = () => {
  return {
    standalone: 'ZetaPush',
    entries: paths.input,
    debug: !optimize,
    verbose: true
  }
}

const onError = (error) => {
  const message = JSON.stringify({
    filename: error.filename,
    message: error.message
  })

  util.beep()
  util.log(util.colors.red(message))
}

const getVendorStream = () => {
  return gulp.src(files({
    filter: /^(.)*(\.js)$/,
    includeDev: true
  }))
}

const getSourceStream = () => {
  const bundler = browserify(getBrowserifyConfig())
    .transform(babelify, getBabelifyConfig())

  if (optimize) {
    bundler.plugin('minifyify', {
      map: false
    })
  }

  return bundler
    .bundle()
    .on('error', onError)
    .pipe(stream('zetapush.js'))
    .pipe(buffer())
}

gulp.task('remote', (done) => {
  return request(REMOTE_DEFINITIONS_URL)
    .pipe(fs.createWriteStream('./src/definitions.js'))
})

gulp.task('bundle', () => {
  return merge(getVendorStream(), getSourceStream())
    .pipe(concat('zetapush.js'))
    .pipe(optimize ? uglify() : util.noop())
    .pipe(gulp.dest(paths.output))
})

gulp.task('clean', (callback) => {
  return del([
    paths.output
  ], callback)
})

gulp.task('deploy', () => {
  return gulp.src([__dirname + '/docs/**/**.*'])
    .pipe(github({
      remoteUrl : pkg.repository.url,
      branch : 'gh-pages',
      cacheDir : __dirname + '/.deploy/'
    }))
})

gulp.task('build', () => {
  return sequence('clean', 'bundle')
})
