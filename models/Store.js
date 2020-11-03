const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');


const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // will remove whitespace in text  
    required: 'Please enter a store name!'
  },
  slug: String, 
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number, 
      required: 'You must supply coordinates'
    }],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  }
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return next(); // stop this fn from running
  }
  this.slug = slug(this.name); 
  // find other stores that have the same slug
  // via regex
  // if store is found with same slug, it'll add a "-1" at the end of the slug
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
  // TODO make more resiliant so slugs are unique 
})

// all static methods are bound to the store model
// this means we can use regular functions to utilize "this"
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    // $ is an operator within mongo
    // $group will give us the amount of restaurants with the same tag
    // $sort (-1) will descendingly sort tags
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1} }},
    { $sort: { count: -1 }}
  ]);
}

module.exports = mongoose.model('Store', storeSchema);