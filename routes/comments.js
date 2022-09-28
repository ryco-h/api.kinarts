const express = require('express')
const route = express.Router()
const { Comment } = require('../models/comment')
const nodemailer = require("nodemailer");
const { GoogleAccount } = require('../models/googleAccount');
const { ArtCollection } = require('../models/artCollection');

route.post('/post', async(req, res) => {

   let testAccount = await nodemailer.createTestAccount();

   // create reusable transporter object using the default SMTP transport
   let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'ican@kinarts.art',
         pass: process.env.PASS
      }
   });

   let comment = await Comment.create({
      parentComment: (req.body.parentComment !== null) ? req.body.parentComment : null,
      user: req.body.user,
      comment: req.body.comment,
      dateCreated: req.body.dateCreated,
      postID: req.body.postID
   })

   comment.save()

   let googleAccount = await GoogleAccount.find({_id: req.body.user})
   let artCollection = await ArtCollection.find({_id: req.body.postID})

   let info = await transporter.sendMail({
      from: 'ican@kinarts.art',
      to: 'roaddevil53@gmail.com, kinnaruchann@gmail.com',
      subject: 'Comment Notification',
      text: 'Comment Notification',
      html: `
      <p>Someone Commented!</p>
      <ul>
         <li>User: ${googleAccount[0].name}</li>
         <li>Comment: ${req.body.comment}</li>
         <li>Link post: <a href='https://kinarts.art/kinnaruchann/${artCollection[0].artName}'>${artCollection[0].artName}</a></li>
      </ul>
      `,
   })

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