if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

const users = [];

const initializePassport = require('./passportConfig');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

// Middlewares
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'));

// Home route
app.get('/', isLoggedIn, (req, res) => {
  res.render('index', {
    name: req.user.name
  });
});

// Login route
app.get('/login', isNotLoggedIn, (req, res) => {
  res.render('login');
});

app.post('/login', isNotLoggedIn, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Register route
app.get('/register', isNotLoggedIn, (req, res) => {
  res.render('register');
});

app.post('/register', isNotLoggedIn, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      id: Date.now().toString(),
      name: name,
      email: email,
      password: hashedPassword
    });

    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
});

// Logout
app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function isNotLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
}

// Listen on a port
app.listen(3000, () => console.log('Server running on port 3000'));