const express = require('express')
const route = express.Router()
const { Comment } = require('../models/comment')

route.post('/post', async(req, res) => {

   let comment = await Comment.create({
      parentComment: (req.body.parentComment !== null) ? req.body.parentComment : null,
      user: req.body.user,
      comment: req.body.comment,
      dateCreated: req.body.dateCreated,
      postID: req.body.postID
   })

   comment.save()

   res.send({
      message: 'Succesful',
      status: 200
   })
})

route.get('/:postID', async(req, res) => {

   let commentByPost = await Comment.find({postID: req.params.postID})
   .populate({
      path: 'user'
   })
   
   res.send(commentByPost).status(200)
}) 

module.exports = route