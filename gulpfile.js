var gulp = require('gulp'),
	gnf = require('gulp-npm-files'),
	connect = require('gulp-connect'),
	clean = require('gulp-clean');

var paths = {
	src: ['app/**'],
	build: 'build/'
};

gulp.task('copy-src', function() {
	gulp.src(paths.src)
		.pipe(gulp.dest(paths.build));
});

gulp.task('dev-server', function() {
	connect.server({
		root: 'build',
		port: 8000
	});
});

gulp.task('copy-deps', function() {
	gulp.src(gnf(), {
		base: './'
	}).pipe(gulp.dest('./build'));
});

gulp.task('clean', function() {
	return gulp.src(paths.build, {
			read: false
		})
		.pipe(clean());
});

gulp.task('watch', function () {
    gulp.watch(paths.src, ['build']);
});


gulp.task('build', ['copy-deps', 'copy-src']);
gulp.task('default', ['build', 'watch', 'dev-server']);