const express = require('express')
const router = express.Router()

router.use('/V1', require('./V1.0.0/routes/routes'))

module.exports = router
