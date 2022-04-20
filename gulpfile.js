const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');

function sassTask() {
    return gulp.src('./src/sass/roolith.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
}

function sassDarkTask() {
    return gulp.src('./src/sass/roolith-dark.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
}

function buildCSS() {
    return gulp.src('./dist/css/roolith.css')
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(rename('roolith.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'));
}

function buildCSSDark() {
    return gulp.src('./dist/css/roolith-dark.css')
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(rename('roolith-dark.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'));
}

function browserSyncTask(done) {
    // https://browsersync.io/docs/options
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: 3000,
        open: false
    });

//     browserSync.init({
//         proxy: 'local.yourdomain.me',
//         port: 3000,
//         open: false
//     });

    done();
}

function browserSyncReload(done) {
    browserSync.reload();

    done();
}

function watchFiles() {
    gulp.watch('./src/sass/**/*.scss', sassTask);
    gulp.watch(['./**/*.html', './**/*.php'], browserSyncReload);
}

gulp.task('watch', gulp.parallel(watchFiles, browserSyncTask));
gulp.task('sass', sassTask);
gulp.task('sassDarkTask', sassDarkTask);
gulp.task('production', gulp.series('sass', 'sassDarkTask', gulp.parallel(buildCSS, buildCSSDark)));
