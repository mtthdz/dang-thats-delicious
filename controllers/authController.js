const passport = require('passport')

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