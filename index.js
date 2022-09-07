const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors');
require('dotenv/config')
const api = process.env.API_URL
const media = process.env.MEDIA_URL
var path = require ('path');

const { createServer } = require("http")
const { Server } = require("socket.io")

const httpServer = createServer(app);
const io = new Server(httpServer, {
   cors: {
      origin: ["https://kinarts.web.app", "http://localhost:3000", "http://192.168.100.10:3000", '*'],
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
});

// var http = require('http').Server(express);
// const { Server } = require('socket.io')

// const io = new Server(http, {
//    cors: {
//      origin: '*',
//    }
// });

io.on("connection", (socket) => {
   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

const corsOption = {
   origin: '*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200
}

app.use(function(req, res, next){
   req.io = io;
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});

app.use(cors(corsOption));
app.use(express.json())
app.use(morgan('tiny'))
app.use("/public/uploads", express.static(path.join(__dirname + "/public/uploads")));

const artCollectionRouter = require('./routes/artCollections')
const artMedia = require('./routes/artMedia')
const creatorRouter = require('./routes/creators')

app.use(`${api}/artcollection`, artCollectionRouter)
app.use(`${media}/`, artMedia)
app.use(`${api}/creator`, creatorRouter)

mongoose.connect(process.env.DB_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   dbName: process.env.DB_NAME
})
.then(() => {
   console.log('Database is ready...')
})
.catch(error => {
   console.log(error)
})

httpServer.listen(process.env.PORT || 5000, () => {
   console.log('Api link ', api)
   console.log('Server is listening at port ' + (process.env.PORT || 5000))
})