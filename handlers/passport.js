const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

// every request, it'll ask what to do with the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
