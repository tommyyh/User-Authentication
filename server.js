require('dotenv').config();

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

// Models
const Users = require('./models/Users');

// Call authentice function
const initializePassport = require('./passportConfig');
initializePassport(passport)

const users = [];

// Ejs
app.set('view engine', 'ejs');

// Forms
app.use(express.urlencoded({ extended: false }));

// Connect flash
app.use(flash());

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Set passport
app.use(passport.initialize())
app.use(passport.session())

// Method override
app.use(methodOverride('_method'));

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection
  .on('error', error => console.log(error))
  .once('open', () => console.log('Connected'));

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

    const user = new Users({
      name: name,
      email: email,
      password: hashedPassword
    });

    await user.save();

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