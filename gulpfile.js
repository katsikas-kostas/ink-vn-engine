var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var log = require("fancy-log");
var del = require("del");

let bundler;

function error(err) {
    log.error(`${err.name}: ${err.filename}(${err.line},${err.column}): ${err.message}`);
}

function bundles(profile) {
    if (bundler == undefined) {
        var _browserify = browserify({
            standalone: 'InkVN',
            basedir: ".",
            debug: true,
            entries: ["src/main.ts"],
            cache: {},
            packageCache: {},
            transform: ["browserify-shim"]
        }).plugin(tsify).external(["inkjs", "pizzicato"]);

        bundler = (profile === "watch") ? watchify(_browserify) : _browserify;
    }

    bundle();
}

function bundle() {
    return bundler
        .bundle()
        .on("error", error)
        .pipe(source("ink-vn-engine.js"))
        .pipe(gulp.dest("lib"));
}

gulp.task("default", ["build"], function() { });
gulp.task("build", [], bundles);
gulp.task("watch", [] , function() {
    bundles("watch");

    bundler.on("update", bundle);
    bundler.on("log", log.info);
});
gulp.task("clean", [], function() {
    del(["lib/ink-vn-engine.js"]);
});

