const { default: axios } = require('axios')
const express = require('express')
const { GoogleAccount } = require('../models/googleAccount')
const route = express.Router()

route.post('/google/auth', async(req, res) => {

   let code

   if(req.body.code) {

      code = req.body.code

      const URL = req.headers.referer.slice(0, -1)

      let userData = await axios
      .post(`https://www.googleapis.com/oauth2/v4/token?code=${code}?&client_id=295398958200-1sucqtao9gfjro43188q59lc9e43lgm1.apps.googleusercontent.com&client_secret=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&grant_type=authorization_code&redirect_uri=${URL}`)
      .catch(err => err)
      
      userData = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',
      {headers: {Authorization: `Bearer ${userData.data.access_token}`}}
      )
      .then(info => info.data)
      .catch(err => err)
      
      let checkGoogleAccount = await GoogleAccount.find({_id: userData.sub})

      if(checkGoogleAccount[0]) {
         
         return res.send(checkGoogleAccount[0])
      } else {
         
         let googleAccount = await GoogleAccount.create({
            _id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
         })
         
         googleAccount.save()
         
         return res.send(googleAccount)
      }

   } else if(req.body.jwt) {
      code = req.body.jwt

      let userData = parseJWT(code)

      let checkGoogleAccount = await GoogleAccount.find({_id: userData.sub})

      if(checkGoogleAccount[0]) {

         return res.send(checkGoogleAccount[0])
      } else {
         
         let googleAccount = await GoogleAccount.create({
            _id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
         })
         
         googleAccount.save()
         
         return res.send(googleAccount)
      }
   }
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