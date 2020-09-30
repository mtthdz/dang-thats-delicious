const mongoose = require('mongoose'); 
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  console.log(req.name);
  req.flash('error', 'something happened');
  req.flash('info', 'something happened');
  req.flash('warning', 'something happened');
  req.flash('success', 'something happened');
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `successfully created ${store.name}. care to leave a review?`);
  res.redirect(`/store/${store.slug}`);

}