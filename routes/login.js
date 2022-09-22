const express = require('express')
const route = express.Router()

route.post('/google/auth', async(req, res) => {

   const login = await req.body.jwt
   const dataUser = parseJWT(login)

   res.send(dataUser)
})

function parseJWT(token) {

   var base64Url = token.split('.')[1];
   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
   var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
   }).join(''));

   return JSON.parse(jsonPayload);
}

module.exports = route