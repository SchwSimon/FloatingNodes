const gulp = require('gulp');
const eslint = require('gulp-eslint');
const pump = require('pump');
const webpack = require('webpack-stream');

gulp.task('eslint', (callback) => {
  pump([
    gulp.src('./src/*.js'),
    eslint(),
    eslint.format(),
    eslint.failAfterError()
  ]);
});

gulp.task('build', (callback) => {
  pump([
      gulp.src('./src/FloatingNodes.js'),
      webpack(require('./webpack.config.js')),
      gulp.dest('./')
    ],
    callback
  );
});
