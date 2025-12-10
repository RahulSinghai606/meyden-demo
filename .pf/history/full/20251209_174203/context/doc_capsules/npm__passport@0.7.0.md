# passport@0.7.0 (npm)

## Quick Start

```
$ npm install passport
```

## Examples

```javascript
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
```

## 📄 Full Documentation Available

**Full content**: `./.pf/context/docs/npm/passport@0.7.0/doc.md`
**Size**: 250 lines

## Source

- URL: https://registry.npmjs.org/passport/0.7.0
- Fetched: 2025-12-09T17:32:49.601768