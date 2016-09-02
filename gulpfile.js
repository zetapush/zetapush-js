const gulp = require('gulp')
const fs = require('fs')
const github = require('gulp-gh-pages')
const request = require('request')

const pkg = require('./package')

const REMOTE_DEFINITIONS_URL = 'http://pinte-silver-2/sdks/generated/2.4.8/js/zp_services.js'

gulp.task('remote', (done) => {
  return request(REMOTE_DEFINITIONS_URL)
    .pipe(fs.createWriteStream('./lib/services/index.js'))
})

gulp.task('deploy:github', () => {
  return gulp.src([__dirname + '/.esdoc/**/**.*'])
    .pipe(github({
      remoteUrl : pkg.repository.url,
      branch : 'gh-pages',
      cacheDir : __dirname + '/.deploy/'
    }))
})
