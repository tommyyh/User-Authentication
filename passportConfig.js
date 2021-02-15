const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const initialize = (passport, getByEmail, getById) => {
  const authenticateUser = async (email, password, done) => {
    const user = getByEmail(email);

    if (user == null) {
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new localStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, getById(id)));
}

module.exports = initialize;