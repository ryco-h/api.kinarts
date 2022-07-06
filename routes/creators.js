const express = require('express')
const route = express.Router()
const { Creator } = require('../models/creator')
const multer = require('multer');
const fs = require('fs')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads/creator');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        cb(null, `${fileName}`);
    }
});

const uploadOptions = multer({ storage: storage });

route.get(`/`, async (req, res) => {
   let creatorList = await Creator.find()
   res.send(creatorList)
})

route.post(`/`, uploadOptions.single('creatorPfp'), async (req, res) => {
   
   const file = req.file;
   if (!file) return res.status(400).send('No image in the request');

   const fileName = file.filename;
   const basePath = `${req.protocol}://${req.get('host')}/public/uploads/creator/`;

   let creator = new Creator({
      creatorName: req.body.creatorName,
      creatorNickname: req.body.creatorNickname,
      creatorPfp: `${basePath}${fileName}`,
      bio: req.body.bio,
      instagramUrl: req.body.instagramUrl,
      youtubeUrl: req.body.youtubeUrl,
      facebookUrl: req.body.facebookUrl
   })

   creator = await creator.save()
   res.send(creator)
})

route.put(`/:id`, uploadOptions.single('creatorPfp'), async (req, res) => {

   const creator = await Creator.findById(req.params.id);
   if (!creator) return res.status(400).send('Invalid Creator!');
   
   const file = req.file;
   let imagepath;

   if (file) {
      fs.unlink("public/uploads/creator/"+creator.creatorPfp.replace(`${req.protocol}://${req.get('host')}/public/uploads/creator`, ''), (err) => {
         console.log(err)
      })
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/creator/`;
      imagepath = `${basePath}${fileName}`;
   } else {
      imagepath = creator.creatorPfp;
   }

   const updatedCreator = await Creator.findByIdAndUpdate(
      req.params.id,
      {
         creatorName: req.body.creatorName,
         creatorNickname: req.body.creatorNickname,
         creatorPfp: imagepath, 
         bio: req.body.bio,
         instagramUrl: req.body.instagramUrl,
         youtubeUrl: req.body.youtubeUrl,
         facebookUrl: req.body.facebookUrl
      },
      { new: true }
   )

   if (!updatedCreator) return res.status(500).send('Profile cannot be updated!');

   res.send(updatedCreator)
})

route.delete(`/:id`, async (req, res) => {

   const creator = await Creator.findById(req.params.id);
   if (!creator) return res.status(400).send('Invalid Creator!');
   
   const file = req.file;
   
   let fileName, imagepath;
   
   if (file) {
      fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/creator/`;
      imagepath = `${basePath}${fileName}`;
   } else {
      imagepath = creator.creatorPfp;
   }

   Creator.findByIdAndDelete(req.params.id)
   .then((creator) => {
      console.log(imagepath)
      if (creator) {
         
         fs.unlink("public/uploads/creator/"+imagepath.replace(`${req.protocol}://${req.get('host')}/public/uploads/creator`, ''), (err) => {
            console.log(err)
         })
         return res.status(200).json({
            success: true,
            message: 'Your profile is deleted!'
         });
      } else {
         return res.status(404).json({ success: false, message: 'Creator not found!' });
      }
   });
})

module.exports = route