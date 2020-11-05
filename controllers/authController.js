const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

// passport doesn't need req res arguments
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  // first check if user is authenticated
  if(req.isAuthenticated()) {
    next(); // carry on, they're logged in!
    return;
  }
  res.flash('error', 'Oops, you must be logged in.');
}

exports.forgot = async (req, res) => {
  // 1. see if the user exists
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    // don't do this irl
    req.flash('error', 'No account with that email exists');
    return res.redirect('/login');
  }

  // 2. set reset tokens + expiry on their account
  // built-in NodeJS model
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
  await user.save();

  // 3. send email with reset token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `test response ${resetURL}`);
  
  // 4. redirect to login page
  res.redirect('/login');
}

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if(!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // if there is a user, show the reset password form
  res.render('reset', { title: 'Reset your password' });
}

exports.confirmedPasswords = (req, res, next) => {
  if(req.body.password === req.body['password-confirm']) {
    next(); // keep going!
    return;
  }
  req.flash('error', 'Passwords do not match');
  res.redirect('back');
}
exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });  

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }  

  // update user's password
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined; // will remove from db
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser); // automatically logs user in via passport method
  req.flash('success', 'Nice! your password has been reset. You are now logged in.')
  res.redirect('/');
}
