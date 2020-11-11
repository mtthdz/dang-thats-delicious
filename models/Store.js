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
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  // virtual fields do NOT go into either objects nor json unless explicitly stated
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// define our indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere' });

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

storeSchema.statics.getTopStores = function() {
  // aggregate is a query fn like .find() but more dynamic
  return this.aggregate([
    // lookup stores and populate their reviews
      // note: mongoDB will take the name of your model (Review),
      // lowercase it, add an -s (from: reviews)
    { $lookup: { 
      from: 'reviews', 
      localField: '_id', 
      foreignField: 'store', 
      as: 'reviews' 
    }},
    
    // filter for only items that have 2 or more reviews
    {$match: { 'reviews.1': { $exists: true } }},
    
    // add the average reviews field
    { $project: {
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      averageRating: { $avg: '$reviews.rating' }
    }},

    // sort it by our new field, higest reviews, first
    { $sort: { averageRating: -1 }},

    // limit to at most 10
    { $limit: 10 }
  ])
}

// find reviews where the stores _id property === reviews store property
// virtual fields do NOT go into either objects nor json unless explicitly stated
// refer to line 44
storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});

module.exports = mongoose.model('Store', storeSchema);