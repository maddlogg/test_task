const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const plumber = require("gulp-plumber");
const { watch } = require("gulp");
const postcss = require("gulp-postcss");
const posthtml = require("gulp-posthtml");
const autoprefixer = require("autoprefixer");
const cssmin = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const sourcemaps = require("gulp-sourcemaps");
const server = require("browser-sync").create();
const { run } = require("node:test");
const del = require("del");
const browserSync = require("browser-sync");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const babel = require("gulp-babel");
const include = require("posthtml-include");
const ttf2woff2 = require("gulp-ttf2woff2");

gulp.task("styles", function () {
  return gulp
    .src("source/sass/styles.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          cascade: true,
        }),
      ])
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(cssmin())
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("serve", function () {
  server.init({
    server: "build/",
    reloadDelay: 200,
  });

  gulp.watch("source/sass/*.scss", gulp.series("styles"));
  gulp.watch("source/sass/blocks/*.scss", gulp.series("styles"));
  gulp.watch("source/sass/variables/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", gulp.series("html", server.reload));
  gulp.watch(["source/**/*.js", "!source/**/*.min.js"], gulp.series("scripts"));
});

gulp.task("images", function () {
  return gulp
    .src(["build/img/**/*.{png,jpg,svg}"], {
      encoding: false,
    })
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.svgo({
          plugins: [
            { optimizationLevel: 3 },
            { progessive: true },
            { interlaced: true },
            { removeViewBox: false },
            { removeUselessStrokeAndFill: false },
            { cleanupIDs: false },
          ],
        }),
      ])
    )
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp
    .src(["build/img/**/*.{png,jpg,jpeg}"], {
      encoding: false,
    })
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp
    .src("source/*html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("build"));
});

gulp.task("scripts", function () {
  return gulp
    .src(["source/js/**/*.js"])
    .pipe(concat("scripts.min.js"))
    .pipe(gulp.dest("build/js/"))
    .pipe(server.stream());
});

// gulp.task("fonts", function () {
//   return gulp
//     .src(["source/fonts/**/*.ttf"], {
//       encoding: false,
//       removeBOM: false,
//     })
//     .pipe(ttf2woff2())
//     .pipe(gulp.dest("source/fonts/"));
// });

gulp.task("copy", function () {
  return gulp
    .src(["source/img/**", "source/js/**/*.min.js", "source/sprite.svg"], {
      base: "source",
      buffer: true,
      removeBOM: false,
      encoding: false,
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del(["build"]);
});

gulp.task(
  "build",
  gulp.series(
    "clean",
    "copy",
    gulp.parallel("styles", "html", "images", "webp", "scripts")
  )
);
