const jwt = require('jsonwebtoken')
const connection = require('../database/connection')
const User = require('../models/user')(connection)
require('dotenv').config()

module.exports = async (req, res, next) => {
  const token = req.headers['authentication']
  if (!token) {
    return res.status(401).send({
      isSuccess: false,
      message: 'Access denied!',
      code: 401,
      data: {},
    })
  }
  try {
    const verify = jwt.verify(token, process.env.TOKEN_SECRET)
    console.log(verify.email)
    await User.findOne({where: {
      email_id: verify.email
    }})
      .then((result) =>{ 
        if(result){
          req.user = verify;
          next();
      } else {
        res.status(401).send({
          isSuccess: false,
          message: 'Access denied!',
          code: 401,
          data: {},
        })
      }
    }).catch((error) => {
      res.status(401).send({
        isSuccess: false,
        message: 'Access denied!',
        code: 401,
        data: {},
      })
    })
  } catch (error) {
    res.status(400).send({
      isSuccess: false,
      message: 'Invalid Token',
      code: 400,
      data: {},
    })
  }
}
