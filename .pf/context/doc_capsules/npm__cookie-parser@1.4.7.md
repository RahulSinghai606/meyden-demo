# cookie-parser@1.4.7 (npm)

## Quick Start

```sh
$ npm install cookie-parser
```

## Top APIs

- `secret`
- `options`

## Examples

```js
var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())

app.get('/', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/cookie-parser@1.4.7/doc.md`
**Size**: 127 lines

## Source

- URL: https://registry.npmjs.org/cookie-parser/1.4.7
- Fetched: 2025-12-09T17:32:24.443979