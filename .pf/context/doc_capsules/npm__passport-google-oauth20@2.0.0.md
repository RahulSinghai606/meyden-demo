# passport-google-oauth20@2.0.0 (npm)

## Quick Start

```sh
$ npm install passport-google-oauth20
```

## Examples

```js
var GoogleStrategy = require('passport-google-oauth20');

passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: 'https://www.example.com/oauth2/redirect/google',
    scope: [ 'profile' ],
    state: true
  },
  function verify(accessToken, refreshToken, profile, cb) {
```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/passport-google-oauth20@2.0.0/doc.md`
**Size**: 188 lines

## Source

- URL: https://registry.npmjs.org/passport-google-oauth20/2.0.0
- Fetched: 2025-12-09T17:32:50.925097