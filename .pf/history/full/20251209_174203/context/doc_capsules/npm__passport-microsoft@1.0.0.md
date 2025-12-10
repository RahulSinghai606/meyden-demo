# passport-microsoft@1.0.0 (npm)

## Quick Start

```js
var MicrosoftStrategy = require('passport-microsoft').Strategy;
    passport.use(new MicrosoftStrategy({
        // Standard OAuth2 options
        clientID: 'applicationidfrommicrosoft',
        clientSecret: 'applicationsecretfrommicrosoft',
```

## Examples

```js
var MicrosoftStrategy = require('passport-microsoft').Strategy;
    passport.use(new MicrosoftStrategy({
        // Standard OAuth2 options
        clientID: 'applicationidfrommicrosoft',
        clientSecret: 'applicationsecretfrommicrosoft',
        callbackURL: "http://localhost:3000/auth/microsoft/callback",
        scope: ['user.read'],

        // Microsoft specific options

```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/passport-microsoft@1.0.0/doc.md`
**Size**: 116 lines

## Source

- URL: https://registry.npmjs.org/passport-microsoft/1.0.0
- Fetched: 2025-12-09T17:32:52.303247