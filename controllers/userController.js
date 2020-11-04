const mongoose = require('mongoose');
// imported from start.js
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'login' });
}

exports.registerForm = (req, res) => {
  res.render('register', {title: 'Register' });
}

// middleware
exports.validateRegister = (req, res, next) => {
  // express validator method (imported from app.js)
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! your passwords do not match').equals(req.body.password);

  // this method will run all the checks above
  const errors = req.validationErrors();
  if(errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stops fn from running
  }
  next(); // no errors
}

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  // promisify library doesn't have async methods
  // so we'll write register method into a promise
  // if method lives on an object, you have to pass the entire object (for promisify)
  const register = promisify(User.register, User);
  await register(user, req.body.password); // this will store password hash
  next(); // pass to authController.login rather than use a res, since it's a check and redirect
}