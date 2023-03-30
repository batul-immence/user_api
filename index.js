const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const connection = require('./src/V1.0.0/database/connection')
const cors = require('cors')
require('dotenv').config()
const routers = require('./src/index')
const ngrok = require('ngrok')

const swaggerUI = require('swagger-ui-express')

const options = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: `https://2351-2405-201-2028-d896-1562-6f33-e6b1-d385.in.ngrok.io/doc/swagger.json`,
        name: 'V1',
      },
      {
        url: `https://2351-2405-201-2028-d896-1562-6f33-e6b1-d385.in.ngrok.io/doc/swagger.json`,
        name: 'V2',
      },
    ],
    servers: [
      {
        url: 'http://localhost:4000',
        url: 'https://2351-2405-201-2028-d896-1562-6f33-e6b1-d385.in.ngrok.io',
      },
    ],
  },
}

app.use(bodyParser.json())
app.use(express.json())
app.use('/', routers)

app.use(cors())

app.use('/api', swaggerUI.serve, swaggerUI.setup(null, options))

app.use('/doc', express.static(path.join(__dirname, './src/V1.0.0/docs')))

app.listen(4000, () => {
  console.log('Server On!')
  connection
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
    })
    .catch((error) => {
      console.error('Unable to connect to the database: ', error)
    })
})
