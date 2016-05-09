const gulp = require('gulp')
const util = require('gulp-util')
const browserify = require('browserify')
const del = require('del')
const concat = require('gulp-concat')
const babelify = require('babelify')
const fs = require('fs')
const stream = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const merge = require('merge-stream')
const files = require('main-bower-files')
const minimist = require('minimist')
const sequence = require('run-sequence')
const uglify = require('gulp-uglify')
const github = require('gulp-gh-pages')
const request = require('request')

const pkg = require('./package')
const { optimize = false } = minimist(process.argv)

const REMOTE_DEFINITIONS_URL = 'http://pinte-silver-2/sdks/generated/2.4.0/js/zp_services.js'

const paths = {
  input: './src/index.js',
  output: './dist'
}

// Inject Package Version
process.env.ZETAPUSH_VERSION = pkg.version

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
    .pipe(fs.createWriteStream('./src/definitions/index.js'))
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
