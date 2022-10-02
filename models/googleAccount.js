const mongoose = require('mongoose')

const GoogleAccountSchema = new mongoose.Schema({

   _id: String,
   email: String,
   name: String,
   picture: String,
   likedPost: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'artcollection'
   }],
   token: String
})

exports.GoogleAccount = mongoose.model('googleAccount', GoogleAccountSchema)