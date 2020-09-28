
exports.myMiddleware = (req, res, next) => {
  req.name = 'Wes';
  // res.cookie('name', 'wes is cool', {maxAge: 90000});
  next();
}

exports.homePage = (req, res) => {
  // console.log(req.name);
  res.render('index');
};