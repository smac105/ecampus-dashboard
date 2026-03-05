// gulpfile.js
const gulp = require('gulp');
const { src, dest } = gulp;
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const optipng = require('imagemin-optipng');
const gifsicle = require('imagemin-gifsicle');
const svgo = require('imagemin-svgo');
const gulpif = require('gulp-if');
const del = require('del');
const fs = require('fs');
const path = require('path');

// Environment
const isProduction = process.env.NODE_ENV === 'production';

// Paths
const paths = {
  scss: { src: 'src/scss/**/*.scss', watch: 'src/scss/**/*.scss', dest: 'dist/css' },
  js: { src: 'src/js/**/*.js', dest: 'dist/js' },
  html: { pages: 'src/html/pages/**/*.njk', watch: 'src/html/**/*.+(html|njk)', dest: 'dist' },
  images: { src: 'src/images/**/*.{jpg,jpeg,png,svg,gif,webp}', dest: 'dist/images' },
  video: { src: 'src/video/**/*.{mp4,webm,mov,avi}', dest: 'dist/video' },
  assets: { src: 'src/assets/**/*', dest: 'dist/assets' },
  data: 'src/html/data/**/*.json',
  filters: 'src/filters/**/*.js'
};

// Helper to safely read JSON
function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } 
  catch (err) { console.warn(`⚠️ Could not parse JSON: ${filePath}`, err.message); return {}; }
}

// Clean dist folder
function clean() { return del(['dist']); }

// Sass
function styles() {
  return src(paths.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sass({ includePaths: ['node_modules'] }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulpif(isProduction, cleanCSS()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// JS
function scripts() {
  return src(paths.js.src)
    .pipe(plumber())
    .pipe(gulpif(isProduction, uglify()))
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// HTML/Nunjucks
function html() {
  return src(paths.html.pages)
    .pipe(data(file => {
      const dataDir = path.join(__dirname, 'src/html/data');

      // Global JSON
      let globalData = {};
      if (fs.existsSync(dataDir)) {
        fs.readdirSync(dataDir).forEach(fileName => {
          const fullPath = path.join(dataDir, fileName);
          if (fs.statSync(fullPath).isFile() && path.extname(fullPath) === '.json') {
            const key = path.basename(fileName, '.json');
            globalData[key] = readJSON(fullPath);
          }
        });
      }

      // Page-specific JSON
      const pageName = path.basename(file.path, '.njk');
      const pageDataPath = path.join(dataDir, 'pages', `${pageName}.json`);
      let pageData = {};
      if (fs.existsSync(pageDataPath)) {
        pageData[pageName] = readJSON(pageDataPath);
      }

      return { ...globalData, ...pageData, currentPage: pageName };
    }))
    .pipe(nunjucksRender({
      path: ['src/html'],
      envOptions: { trimBlocks: true, lstripBlocks: true }
    }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Images
function images() {
  return gulp.src(paths.images.src, { encoding: false })
    .pipe(gulpif(isProduction, imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo()
    ])))
    .pipe(gulp.dest(paths.images.dest));
}

// Video
function video() {
  return src(paths.video.src, { encoding: false })
    .pipe(dest(paths.video.dest));
}

// Assets
function assets() {
  if (!fs.existsSync('src/assets')) return Promise.resolve();
  return src(paths.assets.src, { since: gulp.lastRun(assets) })
    .pipe(dest(paths.assets.dest));
}

// Copy HTML Data (JSON files for JavaScript to fetch)
function htmlData() {
  return src(paths.data)
    .pipe(dest('dist/html/data'));
}

// Serve & watch
function serve() {
  browserSync.init({ server: { baseDir: 'dist' } });
  gulp.watch(paths.scss.watch, styles);
  gulp.watch(paths.js.src, scripts);
  gulp.watch([paths.html.watch, paths.data, paths.filters], html);
  gulp.watch(paths.data, htmlData);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.video.src, video);
  gulp.watch(paths.assets.src, assets);
}

// Tasks
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.images = images;
exports.video = video;
exports.assets = assets;
exports.serve = serve;
exports.htmlData = htmlData;

exports.default = gulp.series(
  clean,
  gulp.parallel(styles, scripts, html, htmlData, images, video, assets),
  serve
);
