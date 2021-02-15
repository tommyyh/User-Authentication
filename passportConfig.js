const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Models
const User = require('./models/Users');

const initialize = (passport) => {
  passport.use(
    new localStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });

        // Check if exists
        if (user == null) {
          return done(null, false, { message: 'No user with that email' });
        }

        // Match passwords
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  });
}

module.exports = initialize;