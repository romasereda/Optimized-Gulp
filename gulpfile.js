// подключение пакетов
const { src, dest, parallel, series, watch } = require("gulp"); // функция require, подключает пакеты с node_modules
const browserSync  = require("browser-sync").create();  // live-server
const concat       = require("gulp-concat");            // конкатинация (объединение файлов в один)
const uglify       = require("gulp-uglify-es").default; // минификация js
const sass         = require("gulp-sass");              // sass => css
const autoprefixer = require("gulp-autoprefixer");      // добавить в css префиксы
const cleancss     = require("gulp-clean-css");         // минификация css
const imagemin     = require("gulp-imagemin");          // оптимизация изображений
const newer        = require("gulp-newer");             // выборка файлов
const del          = require("del");                    // удаление файлов

// live-server
function browsersync() {
  browserSync.init({             // инициализация browserSync
    server: { baseDir: "app/" }, // отслеживаемая директория
    notify: false,               // отключеник уведомлений 
    online: true                 // true - работа в онлайне , false - работа оффлайн (wi-fi работать не будет)
  });
}

// работа с JavaScript
function scripts() {
  return src([
    // "node_modules/jquery/dist/jquery.min.js", // подключение jquery
    "app/js/script.js"           // рабочий js-файл
  ])
  .pipe(concat("script.min.js")) // конкатинация
  .pipe(uglify())                // минификация js
  .pipe(dest("app/js"))          // сохранение файла
  .pipe(browserSync.stream());   // перезагрузка страницы 
}

// работа с CSS
function styles() {
  return src("app/sass/main.sass")  // рабочий sass-файл
  .pipe(sass())                     // превращиние в css-файд
  .pipe(concat("style.min.css"))    // создание файла 
  .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })) // добавление префиксов
  .pipe(cleancss(( { level: { 1: { specialComments: 0 } }/*, format: "beautify" */ } )))  // минфикация             
  .pipe(dest("app/css"))            // сохранения файла
  .pipe(browserSync.stream());      // перезагрузка страницы 
}

// минификация изображений
function images() {
  return src("app/images/src/**/*") // все изображения
  .pipe(newer("app/images/dest"))   // проверка на новые изображения
  .pipe(imagemin())                 // минификация
  .pipe(dest("app/images/dest"))    // сохранение
  .pipe(browserSync.stream());      // перезагрузка страницы
}

// очистка папки app/images/dest (удаление всех оптимизированных изображений)
function cleanimg() {
  return del("app/images/dest/**/*", { force: true }); // удаление файлов
}

// удаление всего содержимого папки dist
function cleandist() {
  return del("dist/**/*", { force: true }); // удаление файлов
}

// собрать проэкт
function buildCopy() {
  return src([
    "app/css/**/*.min.css",
    "app/js/**/*.min.js",
    "app/images/dest/**/*",
    "app/**/*.html"
  ], { base: "app" })
  .pipe(dest("dist"));
}

// вотчинг файлов (отслеживание изменений файлов)
function startWatch() {
  watch("app/sass/**/*", styles);                           // изменение sass-файлов
  watch(["app/**/*.js", "!app/**/*.min.js"], scripts);      // изменение js-файлов
  watch("app/**/*.html").on("change", browserSync.reload);  // изменение html-файлов
  watch("app/images/src/**/*", images);                     // изменение изображений
}

exports.browsersync = browsersync; // экспортирование (таски)
exports.scripts     = scripts;
exports.styles      = styles;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.build       = series(cleandist, styles, scripts, images, buildCopy);

exports.default = parallel(styles, scripts, images, browsersync, startWatch);
