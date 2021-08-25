import express from 'express'
import dotenv from 'dotenv'
import houndify from 'houndify'

dotenv.config()

const houndifyExpress = houndify.HoundifyExpress

const app = express()
app.listen(5000, console.log('Server running on port 5000'))

app.get('/', (req, res) => {
  res.send('API is running.')
})
//authenticates requests
app.get(
  '/houndifyAuth',
  houndifyExpress.createAuthenticationHandler({
    clientId: `${process.env.REACT_APP_CLIENT_ID}`,
    clientKey: `${process.env.REACT_APP_CLIENT_KEY}`,
  })
)
