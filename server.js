require('dotenv').config();

const express = require('express');
const app = express();
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

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

// Routes
app.use('/', require('./routes/index')); // Home route
app.use('/', require('./routes/user')); // User route

// Listen on a port
app.listen(3000, () => console.log('Server running on port 3000'));