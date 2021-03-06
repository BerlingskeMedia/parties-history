/*jslint indent:2, node:true, sloppy:true*/
var
  gulp = require('gulp'),
  del = require('del'),
  coffee = require('gulp-coffee'),
  ngannotate = require('gulp-ng-annotate'),
  rename = require("gulp-rename"),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  header = require('gulp-header'),
  cleanhtml = require('gulp-cleanhtml'),
  changed = require('gulp-changed'),
  googlecdn = require('gulp-google-cdn'),
  gulpif = require('gulp-if'),
  jade = require('gulp-jade'),
  connect = require('gulp-connect'),
  plumber = require('gulp-plumber'),
  sourcemaps = require('gulp-sourcemaps'),

  pkg = require('./package.json');

var banner = [
  '/**',
  ' ** <%= pkg.name %> - <%= pkg.description %>',
  ' ** @author <%= pkg.author %>',
  ' ** @version v<%= pkg.version %>',
  ' **/',
  ''
].join('\n');

var build = false;
var dest = 'app/upload/tcarlsen/parties-history';
/* Scripts */
gulp.task('scripts', function () {
  return gulp.src('src/**/*.coffee')
    .pipe(plumber())
    .pipe(gulpif(!build, changed(dest)))
    .pipe(gulpif(!build, sourcemaps.init()))
    .pipe(concat('scripts.min.js'))
    .pipe(coffee())
    .pipe(ngannotate())
    .pipe(uglify())
    .pipe(gulpif(!build, sourcemaps.write()))
    .pipe(gulpif(build, header(banner, {pkg: pkg})))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});
/* Styles */
gulp.task('styles', function () {
  return gulp.src('src/**/*.scss')
    .pipe(plumber())
    .pipe(gulpif(!build, changed(dest)))
    .pipe(gulpif(!build, sourcemaps.init()))
    .pipe(concat('styles.min.css'))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minifycss())
    .pipe(gulpif(!build, sourcemaps.write()))
    .pipe(gulpif(build, header(banner, {pkg: pkg})))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});
/* Dom elements */
gulp.task('dom', function () {
  return gulp.src('src/**/*.jade')
    .pipe(plumber())
    .pipe(gulpif(!build, changed(dest)))
    .pipe(jade({pretty: true}))
    .pipe(gulpif(build, cleanhtml()))
    .pipe(rename({dirname: '/partials'}))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});
/* Images */
gulp.task('images', function () {
  return gulp.src('src/images/**')
    .pipe(plumber())
    .pipe(gulpif(!build, changed('app/img')))
    .pipe(imagemin())
    .pipe(gulp.dest(dest + '/img'))
    .pipe(connect.reload());
});
gulp.task('fonts', function () {
  return gulp.src('src/fonts/**')
    .pipe(gulp.dest(dest + '/fonts'));
 });
 /* Moving upload to app */
gulp.task('upload', function () {
  gulp.src('upload/**/*')
  .pipe(gulp.dest('app/upload/'));
});
 gulp.task('lib', function () {
   return gulp.src('src/lib/**')
    .pipe(gulp.dest(dest + '/lib'));
 });
/* Watch task */
gulp.task('watch', function () {
  gulp.watch('src/**/*.coffee', ['scripts']);
  gulp.watch('src/**/*.scss', ['styles']);
  gulp.watch('src/**/*.jade', ['dom']);
  gulp.watch('src/images/**', ['images']);
});
/* Server */
gulp.task('connect', function () {
  connect.server({
    root: 'app',
    port: 9000,
    livereload: true
  });
});
/* CORS Proxy */
gulp.task('corsproxy', function () {
  require('corsproxy/bin/corsproxy');
});
/* Build task */
gulp.task('build', function () {
  if (process.argv.indexOf('--production') > -1){
    build = true;
    dest = 'build';
    del(dest);
    console.log('Building into ./' + dest);
    gulp.start('scripts', 'styles', 'dom', 'images', 'fonts', 'lib');
  } else {
    /* This is a task to build to the /app folder but without the serve-task.  */
    build = false;
    dest = 'app/upload/tcarlsen/parties-history';
    console.log('Building into ./' + dest);
    gulp.start('scripts', 'styles', 'dom', 'images', 'fonts', 'lib', 'upload');
  }
});

 /* This is a task to just serve the content from the /app folder. No build or other fancy stuff. */
gulp.task('serve', ['corsproxy', 'connect']);

/* Default task */
gulp.task('default', ['corsproxy', 'connect', 'scripts', 'styles', 'dom', 'images', 'fonts', 'lib', 'upload', 'watch']);
