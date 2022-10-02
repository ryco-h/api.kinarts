const express = require('express')
const route = express.Router()
const path = require('path')
const crypto = require('crypto');
const { ArtCollection } = require('../models/artCollection')
const multer = require('multer');
const fs = require('fs')
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');

require('dotenv/config')
const DB_URL = process.env.DB_URL

let gfs, gridfsBucket;

// Create mongo connection
const conn = mongoose.createConnection(DB_URL);

conn.once('open', () => {
   // Init stream
   gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'kinarts'
    });

   gfs = Grid(conn.db, mongoose.mongo);
   gfs.collection('kinarts');
 });

route.get('/images', (req, res) => {
   gfs.files.find().toArray((err, files) => {
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

route.get('/images/gifs', (req, res) => {
   gfs.files.find().toArray((err, files) => {
     // Check if files
     if (!files || files.length === 0) {
       return res.status(404).json({
         err: 'No files exist'
       });
     }
     
     // Files exist
     return res.json(files.filter(file => file.contentType === 'image/gif'));
   });
});

route.get('/images/pngs', (req, res) => {
   gfs.files.find().toArray((err, files) => {
     // Check if files
     if (!files || files.length === 0) {
       return res.status(404).json({
         err: 'No files exist'
       });
     }
     
     // Files exist
     return res.json(files.filter(file => file.contentType === 'image/png'));
   });
});

route.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
            status: 404,
            message: 'No image found.'
        });
      }
      
      // Check if image
      if(file.contentType ==='image/png' || file.contentType ==='image/gif') 
      {
        const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename); 
        readStream.pipe(res);
      } else {
        res.status(404).json({
            status: 404,
            message: 'File is neither image or valid.'
        });
      }
    });
 });

module.exports = route