# morgan@1.10.1 (npm)

## Quick Start

```sh
$ npm install morgan
```

## Examples

```js
var express = require('express')
var morgan = require('morgan')

var app = express()

app.use(morgan('combined'))

app.get('/', function (req, res) {
  res.send('hello, world!')
})
```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/morgan@1.10.1/doc.md`
**Size**: 444 lines

## Source

- URL: https://registry.npmjs.org/morgan/1.10.1
- Fetched: 2025-12-09T17:43:44.027894