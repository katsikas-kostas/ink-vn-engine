var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");

let bundler;

function bundles(profile) {
    if (bundler == undefined) {
        var _browserify = browserify({
            standalone: 'VisualNovInk',
            basedir: ".",
            debug: true,
            entries: ["src/main.ts"],
            cache: {},
            packageCache: {}
        }).plugin(tsify);
    
        bundler = (profile == "watch") ? watchify(_browserify) : _browserify;
    }

    bundle();
}

function bundle() {
    return bundler
        .bundle()
        .pipe(source("visualnov-ink.js"))
        .pipe(gulp.dest("dist"));
}

gulp.task("default", ["build"], function() { });
gulp.task("build", [], bundles)
gulp.task("watch", [] , function() {
    bundles("watch");

    bundler.on("update", bundle);
    bundler.on("log", gutil.log);
});

