const mongoose = require('mongoose'); 
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  console.log(req.name);
  // req.flash('error', 'something happened');
  // req.flash('info', 'something happened');
  // req.flash('warning', 'something happened');
  // req.flash('success', 'something happened');
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

exports.getStores = async(req, res) => {
  // query the database for a list of all stores
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async(req, res) => {
  // 1. find store given the ID
  const store = await Store.findOne({_id: req.params.id});
  // 2. confirm they are the owner of the store
  // todo
  // 3. render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store})
}

exports.updateStore = async(req, res) => {

  // set location data to be a point
  req.body.location.type = 'Point';

  // 1. find and update the store
  // findOneAndUpdate has 3 params: query, data, options
  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { 
      new: true,
      runValidators: true
    }
  ).exec();
  
  // 2. redirect them to the store and tell them it worked
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store.id}/edit`);
  
}