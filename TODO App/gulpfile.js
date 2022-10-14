let gulp = require('gulp');
let uglify = require('gulp-uglify');
let rename = require('gulp-rename');
let eslint = require('gulp-eslint');

gulp.task('scripts', () => {
    return gulp.src('source/*.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dest'));
});

gulp.task('watch', () => {
    return gulp.watch('source', gulp.series('scripts'));
});