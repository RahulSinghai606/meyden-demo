# autoprefixer@10.4.22 (npm)

## Quick Start

```javascript
const autoprefixer = require('autoprefixer')
```

## Examples

```js
gulp.task('autoprefixer', () => {
  const autoprefixer = require('autoprefixer')
  const sourcemaps = require('gulp-sourcemaps')
  const postcss = require('gulp-postcss')

  return gulp.src('./src/*.css')
    .pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dest'))
```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/autoprefixer@10.4.22/doc.md`
**Size**: 1109 lines

## Source

- URL: https://registry.npmjs.org/autoprefixer/10.4.22
- Fetched: 2025-12-09T17:33:28.377518