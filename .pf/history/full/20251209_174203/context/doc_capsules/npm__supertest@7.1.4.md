# supertest@7.1.4 (npm)

## Quick Start

```bash
npm install supertest --save-dev
```

## Examples

```js
const request = require('supertest');
const express = require('express');

const app = express();

app.get('/user', function(req, res) {
  res.status(200).json({ name: 'john' });
});

request(app)
```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/supertest@7.1.4/doc.md`
**Size**: 347 lines

## Source

- URL: https://registry.npmjs.org/supertest/7.1.4
- Fetched: 2025-12-09T17:33:08.610026