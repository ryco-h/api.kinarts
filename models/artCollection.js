const mongoose = require('mongoose')

const ArtCollectionSchema = new mongoose.Schema({
   artName: String,
   imageArtUrl: String,
   artDescription: {
      type: String,
      maxlength: 300
   }, 
   collectionImg: String,
   postedDate: String,
   creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'creator'
   },
   isFeatured: Boolean,
   likes: {
      type: Number,
      default: 0
   },
   tags: [String]
})

exports.ArtCollection = mongoose.model('artsCollection', ArtCollectionSchema)