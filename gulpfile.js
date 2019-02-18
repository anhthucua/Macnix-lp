'use strict';

var gulp        = require('gulp');
var pug         = require('gulp-pug');
var sass        = require('gulp-sass');
var concat      = require('gulp-concat');
var sourcemaps  = require('gulp-sourcemaps');
var imagemin    = require('gulp-imagemin');
var clean       = require('gulp-clean');
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');
var pump        = require('pump');
var browserSync = require('browser-sync').create();

var vendorCssSrc = [
  {
    src: 'node_modules/bootstrap/scss/**/*',
    name: 'bootstrap'
  },
  {
    src: 'node_modules/slick-carousel/slick/slick.scss',
    name: 'slick'
  },
  // {
  //   src: 'node_modules/aos/dist/aos.css',
  //   name: 'aos'
  // }
];

var vendorJsSrc = [
  'node_modules/jquery/dist/jquery.min.js',
  'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  'node_modules/slick-carousel/slick/slick.js',
  // 'node_modules/aos/dist/aos.js'
];

gulp.task('html', function(){
  return gulp.src(['app/templates/*.pug', '!app/templates/_*.pug'])
    .pipe(pug())
    .pipe(gulp.dest('dist/'));
});
//
gulp.task('css', function(){
  return gulp.src('app/scss/*.scss', { base: process.cwd() })
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({
      dirname: '/',
      suffix: '.min',
      extname: '.css'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function(){
  return gulp.src([
      'app/js/vendors/jquery.min.js',
      'app/js/**/*.js',
      'app/js/main.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

gulp.task('compress-js', function(cb) {
  pump([
    gulp.src('dist/js/*.js'),
    uglify(),
    gulp.dest('dist/js')
  ], cb );
});

gulp.task('image-min', function() {
  gulp.src('app/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('vendors-css', function() {
  vendorCssSrc.forEach(function(vendor) {
    var src = vendor.src;
    var pluginName = vendor.name;
    gulp.src(src)
      .pipe(gulp.dest('app/scss/vendors/' + pluginName));
  });
});

gulp.task('vendors-js', function() {
  vendorJsSrc.forEach(function(src) {
    gulp.src(src)
      .pipe(gulp.dest('app/js/vendors'));
  });
});

gulp.task('copy', function() {
  gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });

  gulp.watch('./app/templates/**/*.pug', ['html']);
  gulp.watch('./app/scss/**/*.scss', ['css']);
  gulp.watch('./app/js/**/*.js', ['js']);
  gulp.watch('./dist/*.html').on('change', browserSync.reload);
});

gulp.task('clean', function() {
  gulp.src(['app/vendors/', 'dist/'], {read: false})
    .pipe(clean({force: true}));
});

gulp.task('watch', function () {
  gulp.watch('./app/templates/**/*.pug', ['html']).on('change', browserSync.reload);
  gulp.watch('./app/scss/**/*.scss', ['css']).on('change', browserSync.reload);
  gulp.watch('./app/js/**/*.js', ['js']).on('change', browserSync.reload);
  
});   // saved to reload page

gulp.task('default', ['html', 'css', 'js', 'image-min', 'vendors-css', 'vendors-js', 'copy', 'browser-sync']);
gulp.task('build', ['compress-js']);
