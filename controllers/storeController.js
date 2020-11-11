const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `successfully created ${store.name}. care to leave a review?`);
  res.redirect(`/store/${store.slug}`);

}

exports.getStores = async(req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = (page * limit) - limit;
  
  // query the database for a list of all stores
  const storesPromise = Store
  .find()
  .skip(skip)
  .limit(limit)
  .sort({ created: 'desc' });

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit);

  if(!stores.length && skip) {
    req.flash('info', `Hey! You asked for a page ${page}, which doesn't exist. So i put you on page ${pages}.`);
    res.redirect(`/stores/page/${pages}`)
    return;
  }

  res.render('stores', {title: 'Stores', stores, page, pages, count});
}

const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
}

exports.editStore = async(req, res) => {
  // 1. find store given the ID
  const store = await Store.findOne({_id: req.params.id});
  // 2. confirm they are the owner of the store
  confirmOwner(store, req.user);
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

exports.getStoreBySlug = async(req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
  // if the slug isn't a store, return the 404 page
  // next is a middleware fn that'll go to the next fn, which will be the 404 fn
  if(!store) return next();
  res.render('store', { store, title: store.name })
}

exports.getStoresByTag = async(req, res) => {
  // custom static method
  // created in Store.js 
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });

  // created two promises and awaited both via promise.all
  // stores response in its own variables
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  
  res.render('tag', { tags, title: 'Tags', tag, stores });
}

exports.searchStores = async(req, res) => {
  const stores = await Store
  // find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  // sorted by score in descending order
  .sort({
    score: { $meta: 'textScore' } 
  })
  // limit to 5 results
  .limit(5);
  res.json(stores);
}

exports.mapStores = async(req, res) => {
  // parsefloat will change both values to numbers
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };

  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);
}

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
}

exports.heartStore = async(req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  // we don't use $push because it's a unique value (dont want to add two hearts)
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id }},
    { new: true }
  );
  res.json(user);
}

exports.getHearts = async(req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  })

  res.render('stores', { title: 'Hearted Stores', stores });
};

exports.getTopStores = async(req, res) => {
  // always create a complex query on the model itself
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: 'Top Stores!' });
}