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
});

storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return next(); // stop this fn from running
  }
  this.slug = slug(this.name); // will take name, and set the slug property to that name
  next();
  // TODO make more resiliant so slugs are unique 
})

module.exports = mongoose.model('Store', storeSchema);