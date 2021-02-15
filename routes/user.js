const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// Models
const Users = require('../models/Users');

// Call authentice function
const initializePassport = require('../passportConfig');
initializePassport(passport)

// Login route
router.get('/login', isNotLoggedIn, (req, res) => {
  res.render('login');
});

router.post('/login', isNotLoggedIn, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Register route
router.get('/register', isNotLoggedIn, (req, res) => {
  res.render('register');
});

router.post('/register', isNotLoggedIn, async (req, res) => {
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
router.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

function isNotLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
}

module.exports = router;