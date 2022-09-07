const express = require('express')
const route = express.Router()
const { ArtCollection } = require('../models/artCollection')
const multer = require('multer');
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');

require('dotenv/config')
const DB_URL = process.env.DB_URL

let gfs, gridfsBucket, dbCollection;

// Create mongo connection
const conn = mongoose.createConnection(DB_URL);

conn.once('open', () => {
   // Init stream
   gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'kinarts'
   });

   gfs = Grid(conn.db, mongoose.mongo);
   gfs.collection('kinarts')
});

// const FILE_TYPE_MAP = {
//    'image/png': 'png',
//    'image/jpeg': 'jpeg',
//    'image/jpg': 'jpg',
//    'image/gif': 'gif'
// };

// const storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        const isValid = FILE_TYPE_MAP[file.mimetype];
//        let uploadError = new Error('invalid image type');

//        if (isValid) {
//            uploadError = null;
//        }
//        cb(uploadError, 'public/uploads');
//    },
//    filename: function (req, file, cb) {
//        const fileName = file.originalname.split(' ').join('-');
//        cb(null, `${fileName}`);
//    }
// });

var storage = new GridFsStorage({
   url: DB_URL,
   file: (req, file) => {
     return new Promise((resolve, reject) => {
         const filename = file.originalname;
         const fileInfo = {
           filename: filename,
           bucketName: 'kinarts'
         }
         resolve(fileInfo);
     });
   }
 });

const upload = multer({ storage });

route.get(`/`, async (req, res) => {
   
   const listArt = await ArtCollection.find().populate('creator')

   if(!listArt) {
      res.status(500).json({
         success: false
      })
   }

   res.send(listArt)
})

route.get(`/gallery/:artName`, async (req, res) => {
   
   const listArt = await ArtCollection.find({artName: req.params.artName}).populate('creator')

   if(!listArt) {
      res.status(500).json({
         success: false
      })
   }

   res.send(listArt)
})

route.get('/images', (req, res) => {
   
   gfs.collection('kinarts').files.find().toArray((err, files) => { 
     // Check if files
     if (!files || files.length === 0) {
       return res.status(404).json({
         err: 'No files exist'
       });
     }
 
     // Files exist
     return res.json(files);
   });
 });

var parentCount = []
route.get('/img', (req, res) => {
   // gfs.collection('kinarts').files.find().toArray((err, files) => { 
   //     // Check if files
   //    if (!files || files.length === 0) {
   //      return res.status(404).json({
   //        err: 'No files exist'
   //      });
   //    }
      
   //    files.map(file => {
   //       parentCount.push(file)
   //    })
   //    // Files exist
   // });

   gridfsBucket.find({filename: filePath}).toArray(files=>{
      console.log(files)
   })

   res.send(parentCount)
})

route.post(`/`, upload.single('imageArtUrl'), async (req, res) => {
   
   const file = req.file;
   if (!file) return res.status(400).send('No image in the request');

   const fileName = file.filename;
   const basePath = `${req.protocol}s://${req.get('host')}/media/image/`;

   let artCollection = new ArtCollection({
      artName: req.body.artName,
      imageArtUrl: `${basePath}${fileName}`,
      collectionImg: req.body.collectionImg,
      artDescription: req.body.artDescription,
      postedDate: req.body.postedDate,
      creator: req.body.creator,
      isFeatured: req.body.isFeatured,
      likes: req.body.likes,
      tags: req.body.tags
   })

   artCollection = await artCollection.save()

   req.io.sockets.emit(
      'POSTED_DATA',
      {
         message: `An image is posted! ~${req.body.artName}~`,
         content: artCollection
      }
   );
   
   res.send(artCollection)
})

route.put(`/:id`, upload.single('imageArtUrl'), async (req, res) => {

   console.log('passed', '144')

   const artCollection = await ArtCollection.findById(req.params.id);
   if (!artCollection) return res.status(400).send('Invalid Collection!');
   
   const file = req.file;
   let imagepath;

   if (file) {

      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/media/image/`;
      imagepath = `${basePath}${fileName}`;
   } else {
      imagepath = artCollection.imageArtUrl;
   }

   const updatedArtCollection = await ArtCollection.findByIdAndUpdate(
      req.params.id,
      {
         artName: req.body.artName,
         imageArtUrl: imagepath,
         collectionImg: req.body.collectionImg,
         artDescription: req.body.artDescription,
         postedDate: req.body.postedDate,
         creator: req.body.creator,
         isFeatured: req.body.isFeatured,
         likes: req.body.likes,
         tags: req.body.tags
      },
      { new: true }
   )

   if (!updatedArtCollection) return res.status(500).send('Collection cannot be updated!');

   req.io.sockets.emit(
      'ADDED_DATA', 
      {
         message: 'A post updated!',
         content: updatedArtCollection
      }
   );

   res.setHeader("Access-Control-Allow-Origin", "*")
   res.send(updatedArtCollection)
})

route.delete(`/:id`, async (req, res) => {

   const post = await ArtCollection.findOneAndDelete({ _id: req.params.id });
   
   console.log(post) 
   if(post !== null) {
      const filePath = post.imageArtUrl.replace(`https://kinarts.herokuapp.com/media/image/`, '')
      if (filePath) {
         gridfsBucket.find({filename: filePath}).toArray((err, files) => {
            const obj_id = new mongoose.Types.ObjectId(files[0]._id);
            gridfsBucket.delete( obj_id )
            res.status(200).json({status: '200', result: 'Success'})
         })
      }
   } else {
      return res.status(404).json({err: 'File not Found'})
   }
   
   // gfs.files.find().toArray((err, files) => { 
   //    // Check if files
   //    if (!files || files.length === 0) {
   //       return res.status(404).json({
   //          err: 'No files exist'
   //       });
   //    }
   
   //    // Files exist
   //    return res.json(files);
   // });
   
   // conn.collection('kinarts.files', (err, files) => {
   //    console.log('kena')
   //    files.remove({filename: filePath}, (err, result) => {
   //       if (err) {
   //          console.log(err);
   //          res.status(500);
   //       }
   //       console.log(result);
   //    });
   //    console.log('178', files)
   // });


   // conn.db.collection('kinarts').findOneAndDelete({_id: req.params.id}, function(err) {
   //    if (err) return handleError(err);
      
   //    gfs.db.collection('kinarts.files').remove({__filename: }, function (err) {
   //       if (err) return handleError(err);
         
   //       res.send('File successfully deleted!')
   //    });
   // })

   // const artCollection = await ArtCollection.findById(req.params.id);
   // if (!artCollection) return res.status(400).send('Invalid Collection!');
   
   // const file = req.file;
   // let imagepath;

   // if (file) {
   //    const fileName = file.filename;
   //    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/artcollection/`;
   //    imagepath = `${basePath}${fileName}`;
   // } else {
   //    imagepath = artCollection.imageArtUrl;
   // }

   // ArtCollection.findByIdAndDelete(req.params.id)
   // .then((artCollection) => {
   //    console.log(imagepath)
   //    if (artCollection) { 
         
   //       fs.unlink("public/uploads/artcollection/"+imagepath.replace(`${req.protocol}://${req.get('host')}/public/uploads/artcollection`, ''), (err) => {
   //          console.log(err)
   //       })
   //       return res.status(200).json({
   //          success: true,
   //          message: 'Your Collection is deleted!'
   //       });
   //    } else {
   //       return res.status(404).json({ success: false, message: 'Collection not found!' });
   //    }
   // });
})

module.exports = route