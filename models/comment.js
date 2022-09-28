const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({

   parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment'
   },
   user: {
      type: String,
      ref: 'googleAccount',
   },
   comment: String,
   dateCreated: Date,
   postID: {
      type: String,
      ref: 'artsCollection',
   },
})

exports.Comment = mongoose.model('comment', CommentSchema)