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
const del = require('del');
const fs = require('fs');
const path = require('path');

const paths = {
  scss: {
    src: 'src/scss/main.scss',
    watch: 'src/scss/**/*.scss',
    dest: 'dist/css'
  },
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js'
  },
  html: {
    pages: 'src/html/pages/**/*.+(html|njk)',
    watch: 'src/html/**/*.+(html|njk)',
    dest: 'dist'
  },
  images: {
    src: 'src/images/**/*',
    dest: 'dist/images'
  },
  data: 'src/data/**/*.json',
  filters: 'src/filters/**/*.js'
};

// Utility: Load all JSON files from a folder (recursively)
function loadJSONData(dir) {
  let results = {};

  function readDir(baseDir) {
    fs.readdirSync(baseDir).forEach(file => {
      const filePath = path.join(baseDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDir(filePath);
      } else if (path.extname(file) === '.json') {
        try {
          const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
          const key = path.basename(file, '.json');
          results[key] = jsonData;
        } catch (err) {
          console.warn(`⚠️  Could not parse JSON file: ${filePath}`, err.message);
        }
      }
    });
  }

  if (fs.existsSync(dir)) {
    readDir(dir);
  }

  return results;
}

// Load Nunjucks filters automatically
function loadFilters(env) {
  const filtersPath = path.join(__dirname, 'src', 'filters');
  if (fs.existsSync(filtersPath)) {
    fs.readdirSync(filtersPath).forEach(filename => {
      if (path.extname(filename) === '.js') {
        const filterName = path.basename(filename, '.js');
        const filterFunc = require(path.join(filtersPath, filename));
        env.addFilter(filterName, filterFunc);
      }
    });
  }
}

// Clean dist
function clean() {
  return del(['dist']);
}

// Sass + Bootstrap
function styles() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['node_modules']
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// JS
function scripts() {
  return gulp.src(paths.js.src)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream());
}

function loadSiteData() {
  const filePath = path.join('src', 'html', 'data', 'site.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}
// Helper to safely read JSON
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    console.warn(`⚠️  Could not parse JSON file: ${filePath}`);
    return {};
  }
}

function html() {
  return gulp.src("src/html/pages/**/*.njk")
    .pipe(data(function(file) {
      const dataDir = path.join(__dirname, "src/html/data");

      // Load all global JSON files in data/
      let globalData = {};
      fs.readdirSync(dataDir).forEach(fileName => {
        const fullPath = path.join(dataDir, fileName);
        if (fs.statSync(fullPath).isFile() && path.extname(fullPath) === ".json") {
          const key = path.basename(fileName, ".json");
          globalData[key] = readJSON(fullPath);
        }
      });

      // Load page-specific JSON from data/pages/
      const pageName = path.basename(file.path, ".njk");
      const pageDataPath = path.join(dataDir, "pages", `${pageName}.json`);
      let pageData = {};
      if (fs.existsSync(pageDataPath)) {
        pageData[pageName] = readJSON(pageDataPath);
      }

      return { ...globalData, ...pageData, currentPage: pageName };
    }))
    .pipe(nunjucksRender({
      path: ["src/html"],
      envOptions: { trimBlocks: true, lstripBlocks: true }
    }))
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
}

exports.html = html;


// Images
function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
}

// Serve & watch
function serve() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });
  gulp.watch(paths.scss.watch, styles);
  gulp.watch(paths.js.src, scripts);
  gulp.watch([paths.html.watch, paths.data, paths.filters], html);
  gulp.watch(paths.images.src, images);
}

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.images = images;
exports.serve = serve;

exports.default = gulp.series(
  clean,
  gulp.parallel(styles, scripts, html, images),
  serve
);