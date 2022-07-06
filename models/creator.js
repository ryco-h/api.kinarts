const mongoose = require('mongoose')

const CreatorSchema = new mongoose.Schema({

   creatorName: String,
   creatorNickname: String,
   creatorPfp: String,
   bio: String,
   instagramUrl: String,
   youtubeUrl: String,
   facebookUrl: String
})

exports.Creator = mongoose.model('creator', CreatorSchema)