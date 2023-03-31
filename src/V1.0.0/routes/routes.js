const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
var generator = require('generate-password')
const verify = require('../auth/authVerify')
const { Op } = require('sequelize')
const emailServices = require('../emailServices/emailServices')
const connection = require('../database/connection')
const User = require('../models/user')(connection)
require('dotenv').config()
const bodyParser = require('body-parser')
const passwordSecure = require('../passwordSecure/encrypt')
const joi = require('joi')
const validationObjects = require('../validation/validationObject')
const httpStatus = require('http-status-codes').StatusCodes
express().use(bodyParser.json())

router.get('/home', (req, res) => {
  res.status(200).send({
    isSuccess: true,
    message: 'Hello World!',
    code: 200,
    data: {},
  })
});

router.post('/user', verify, async (req, res) => {
  const filters = req.query
  const word = req.body.word ? req.body?.word : ''
  const currentPage = req.query.currentPage
  const page_size = req.query.pageSize ? req.query.pageSize : 10
  const offset = (currentPage - 1) * page_size
  delete filters['currentPage']
  delete filters['pageSize']
  console.log(currentPage, page_size, offset, filters)

  await User.findAll({
    order: ['id'],
    where: {
      full_name: {
        [Op.like]: `%${word}%`,
      },
      [Op.and]: filters,
    },
    attributes: [
      'id',
      'full_name',
      'mobile_no',
      'email_id',
      'address',
      'blood_grp',
      'username',
    ],
    limit: Number(page_size),
    offset: offset,
  })
    .then((result) => {
      res.send({
        isSuccess: true,
        message: 'User list',
        code: 200,
        data: {
          UserList: result,
        },
      })
    })
    .catch((error) => {
      res.status(404).send({
        isSuccess: false,
        message: error,
        code: 404,
        data: {},
      })
    })
});

// router.post('/search', async (req, res) => {
//     const word = req.body.word;
//     const currentPage = req.body.currentPage ? req.body.currentPage : 1;
//     const page_size = req.body.pageSize;
//     const offset = (currentPage - 1)*page_size;
//     console.log(currentPage, page_size, offset);

//     if(!page_size || page_size == "0" || currentPage == "0"){
//         await User.findAll({
//             order: ['id'],
//             where: {
//                 [Op.or]: [
//                     {
//                         full_name: {
//                             [Op.like]: `%${word}%`
//                         }
//                     }
//                 ]

//             }
//         }).then(result => {
//             res.send(result);
//         }).catch((error) => {
//             res.send(error);
//         });
//     } else {
//         await User.findAll({
//             order: ['id'],
//             where: {
//                 [Op.or]: [
//                     {
//                         full_name: {
//                             [Op.like]: `%${word}%`
//                         }
//                     },
//                     // {
//                     //     mobile_no: {
//                     //         [Op.like]: `%${word}%`
//                     //     }
//                     // },
//                     // {
//                     //     email_id: {
//                     //         [Op.like]: `%${word}%`
//                     //     }
//                     // },
//                     // {
//                     //     address: {
//                     //         [Op.like]: `%${word}%`
//                     //     }
//                     // },
//                     // {
//                     //     blood_grp: {
//                     //         [Op.like]: `%${word}%`
//                     //     }
//                     // },
//                     // {
//                     //     username: {
//                     //         [Op.like]: `%${word}%`
//                     //     }
//                     // }
//                 ]

//             },
//             limit: Number(page_size),
//             offset: offset
//         }).then(result => {
//             res.send(result);
//         }).catch((error) => {
//             res.send(error);
//         });
//     }
// });

// router.post('/filter', async (req, res) => {
//     const filters = req.query;
//     const word = req.body.word;
//     const currentPage = req.query.currentPage;
//     const page_size = req.query.pageSize;
//     const offset = (currentPage - 1)*page_size;
//     delete filters["currentPage"];
//     delete filters["pageSize"];
//     console.log(currentPage, page_size, offset, filters);

//     if(!page_size || page_size == "0" || currentPage == "0"){
//         await User.findAll({
//             order: ['id'],
//             where: {
//                 full_name: {
//                     [Op.like]: `%${word}%`
//                 },
//                 [Op.and]: filters
//             }
//         }).then(result => {
//             res.send(result);
//         }).catch((error) => {
//             res.send(error);
//         });
//     } else {
//         await User.findAll({
//             order: ['id'],
//             where: {
//                 full_name: {
//                     [Op.like]: `%${word}%`
//                 },
//                 [Op.and]: filters
//             },
//             limit: Number(page_size),
//             offset: offset
//         }).then(result => {
//             res.send(result);
//         }).catch((error) => {
//             res.send(error);
//         });
//     }
// });

router.get('/user/:id', verify, async (req, res) => {
  var id = req.params.id

  await User.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      res.status(200).send(
        result
          ? {
              isSuccess: true,
              message: 'User found',
              code: 200,
              data: {
                id: result.id,
                full_name: result.full_name,
                mobile_no: result.mobile_no,
                email_id: result.email_id,
                address: result.address,
                blood_grp: result.blood_grp,
                username: result.username,
              },
            }
          : {
              isSuccess: false,
              message: 'User not found',
              code: 404,
              data: {},
            }
      )
    })
    .catch((error) => {
      res.status(409).send({
        isSuccess: false,
        message: `Failed to create a new user: ${error}`,
        code: 409,
        data: {},
      })
    })
});

router.post('/createUser', verify, async (req, res) => {
  var data = req.body
  var password = generator.generate({
    length: 6,
    numbers: true,
  })
  console.log(data)

  const validate = joi
    .object(validationObjects['createUser'])
    .validate(data)
  if (validate.error) {
    let message = ''
    validate.error.details.forEach((element) => {
      message += `${element.context.label}`
    })
    res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
      isSuccess: false,
      message: message,
      code: httpStatus.UNPROCESSABLE_ENTITY,
      data: {},
    })
  }

  try {
    await User.create({
      full_name: data.full_name,
      mobile_no: data.mobile_no,
      email_id: data.email_id,
      address: data.address,
      blood_grp: data.blood_grp,
      username: data.username,
      password: passwordSecure.encrypt(password),
      forgotpasswordToken: '',
    })
      .then( (result) => {
        res.send({
          isSuccess: false,
          message: 'User created successfully',
          code: 200,
          data: {
            id: result.id,
            full_name: result.full_name,
            mobile_no: result.mobile_no,
            email_id: result.email_id,
            address: result.address,
            blood_grp: result.blood_grp,
            username: result.username,
          },
        })

        emailServices(data.email_id, 'Credentials', `Your Username : ${data.username}</br>Your Password : ${password}`);
      })
      .catch((error) => {
        res.status(403).send({
          isSuccess: false,
          message: `Email already exist ${error}`,
          code: 403,
          data: {},
        })
      })
  } catch {
    res.status(403).send({
      isSuccess: false,
      message: `Email already exist ${error}`,
      code: 403,
      data: {},
    })
  }
});

router.post('/auth/register', async (request, response) => {
  var data = request.body
  console.log(data)

  const validate = joi
    .object(validationObjects['registerUser'])
    .validate(data)
  if (validate.error) {
    let message = []
    validate.error.details.forEach((element) => {
      message += `${element.context.label}`
    })
    response.status(httpStatus.UNPROCESSABLE_ENTITY).send({
      isSuccess: false,
      message: message,
      code: httpStatus.UNPROCESSABLE_ENTITY,
      data: {},
    })
  } else {
    try {
      User.create({
        full_name: data.full_name,
        mobile_no: data.mobile_no,
        email_id: data.email_id,
        address: data.address,
        blood_grp: data.blood_grp,
        username: data.username,
        password: passwordSecure.encrypt(data.password),
        forgotpasswordToken: '',
      })
        .then((result) => {
          response.send({
            isSuccess: true,
            message: 'User Registration Successful',
            code: 200,
            data: {
              id: result.id,
              full_name: result.full_name,
              mobile_no: result.mobile_no,
              email_id: result.email_id,
              address: result.address,
              blood_grp: result.blood_grp,
              username: result.username,
            },
          })
        })
        .catch((error) => {
          response.status(403).send({
            isSuccess: false,
            message: 'Email already exist.',
            code: 403,
            data: {},
          })
          console.error('Email already exist.', error)
        })
    } catch {
      response.status(409).send({
        isSuccess: false,
        message: 'Failed to create a new record',
        code: 409,
        data: {},
      })
    }
  }
});

router.post('/auth/login', async (req, res) => {
  var email = req.body.email
  var loginPassword = req.body.password
  if (!email || !loginPassword) {
    res.status(401).send({
      isSuccess: false,
      message: 'Email and Password required.',
      code: 401,
      data: {},
    })
  }

  const validate = joi
    .object(validationObjects['validateEmail'])
    .validate({ email_id: `${email}` })
  if (validate.error) {
    let message = ''
    validate.error.details.forEach((element) => {
      message += `${element.context.label}`
    })
    res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
      isSuccess: false,
      message: message,
      code: httpStatus.UNPROCESSABLE_ENTITY,
      data: {},
    })
  } else {
    User.findOne({
      where: {
        email_id: email,
      },
    })
      .then(async (result) => {
        const checkResult = result ? true : false
        const checkPassword = passwordSecure.decrypt(
          loginPassword,
          result.password
        )
        if (checkResult && checkPassword) {
          try {
            const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
            await User.update({JWTtoken: token}, {
                where: {
                  email_id: email,
                },
            }).then((result) => {
                console.log(result);
                res.header('auth-token', token).send({
                    isSuccess: true,
                    message: 'Login Successful',
                    code: 200,
                    data: {
                      token: `${token}`,
                    },
                  })
            }).catch((error) => {
                res.status(500).send({
                    isSuccess: false,
                    message: error,
                    code: 500,
                    data: {},
                  })
            })
            
          } catch (error) {
            res.status(500).send({
              isSuccess: false,
              message: error,
              code: 500,
              data: {},
            })
          }
        } else
          res.status(401).send({
            isSuccess: false,
            message: 'Email or Password invalid!',
            code: 401,
            data: {},
          })
      })
      .catch((error) => {
        res.status(401).send({
          isSuccess: false,
          message: 'User not found!',
          code: 401,
          data: {},
        })
        console.error('User not found! : ', error)
      })
  }
});

router.post('/auth/forgotPassword', async (req, res) => {
  var email = req.body.email

  if (!email) {
    res.status(501).
      send({
        isSuccess: false,
        message: 'Email id required!',
        code: 501,
        data: {},
      })
  }

  const validate = joi
    .object(validationObjects['validateEmail'])
    .validate({ email_id: `${email}` })
  if (validate.error) {
    let message = ''
    validate.error.details.forEach((element) => {
      message += `${element.context.label}`
    })
    res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
      isSuccess: false,
      message: message,
      code: httpStatus.UNPROCESSABLE_ENTITY,
      data: {},
    })
  } else {
    await User.findOne({
        where: {
          email_id: email,
        },
      })
        .then((result) => {
          console.log(result)
          if (result) {
            const forgotpasswordToken = jwt.sign(
              { email },
              process.env.TOKEN_SECRET
            )
            console.log(forgotpasswordToken)
    
            User.update(
              { forgotpasswordToken: forgotpasswordToken },
              {
                where: {
                  email_id: email,
                },
              }
            )
              .then((result) => {
                console.log(result)
                if (result) {

                    emailServices(email, 'Reset Password', forgotpasswordToken);
                    res.send(
                    result[0]
                        ? {
                            isSuccess: true,
                            message:
                            'A mail sent to your email id for reseting the password.',
                            code: 200,
                            data: {},
                        }
                        : {
                            isSuccess: false,
                            message: 'Email not found!',
                            code: 404,
                            data: {},
                        }
                    )
                }
              })
              .catch((error) => {
                res.send({
                  isSuccess: false,
                  message: 'Failed to Update',
                  code: 401,
                  data: {},
                })
                console.error('Failed to update : ', error)
              })
              
          } else {
            res.status(404).send({
              isSuccess: false,
              message: 'Email not found!',
              code: 404,
              data: {},
            })
          }
        })
        .catch((error) => {
          res.status(409).send({
            isSuccess: false,
            message: 'Failed to reset!',
            code: 409,
            data: {},
          })
          console.error('Failed to reset : ', error)
        })
  }
});

router.post('/auth/verifyToken/:token', async (req, res) => {
  const forgotpasswordToken = req.params.token
  const password = req.body.password
  if (!forgotpasswordToken) {
    return res.status(401).send({
      isSuccess: false,
      message: 'Access denied!',
      code: 401,
      data: {},
    })
  }

  const validate = joi
    .object(validationObjects['validatePassword'])
    .validate({ password: `${password}` })
  if (validate.error) {
    let message = ''
    validate.error.details.forEach((element) => {
      message += `${element.context.label}`
    })
    res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
      isSuccess: false,
      message: message,
      code: httpStatus.UNPROCESSABLE_ENTITY,
      data: {},
    })
  } else {
    try {
        const verify = jwt.verify(forgotpasswordToken, process.env.TOKEN_SECRET)
        const email = verify.email
        await User.findOne({
          where: { email_id: email },
        })
          .then((result) => {
            const token = result.forgotpasswordToken
            console.log('data', result.forgotpasswordToken)
            if (token) {
              if (token == forgotpasswordToken) {
                User.update(
                  {
                    password: passwordSecure.encrypt(password),
                    forgotpasswordToken: '',
                  },
                  {
                    where: {
                      email_id: email,
                    },
                  }
                )
                  .then((result) => {
                    res.send({
                      isSuccess: true,
                      message: 'Password Changed!',
                      code: 200,
                      data: {
                      },
                    })
                  })
                  .catch((error) => {
                    res.status(401).send({
                      isSuccess: false,
                      message: 'Failed to update!',
                      code: 401,
                      data: {},
                    })
                    console.error('Failed to update : ', error)
                  })
              }
            } else {
                res.status(401).send({
                    isSuccess: false,
                    message: 'Invalid Token',
                    code: 401,
                    data: {},
                })
            }
          })
          .catch((error) => {
            res.status(401).send({
              isSuccess: false,
              message: 'Failed to verify!',
              code: 401,
              data: {},
            })
          })
      } catch (error) {
        res.status(401).send({
            isSuccess: false,
            message: 'Invalid Token',
            code: 401,
            data: {},
          })
      }
  }
});

router.post('/auth/updatePassword', verify, async (req, res) => {
  var email = req.body.email
  var oldPassword = req.body.oldPassword
  var newPassword = req.body.newPassword

  if (!email || !oldPassword || !newPassword) {
    res.status(501).send({
      isSuccess: false,
      message: 'All fields required!',
      code: 501,
      data: {},
    })
  }
  else{
    await User.findOne({
        where: { email_id: email },
      })
        .then(async (result) => {
          if (passwordSecure.decrypt(oldPassword, result.password)) {
            await User.update(
              { password: passwordSecure.encrypt(newPassword) },
              {
                where: {
                  [Op.and]: [{ email_id: email }],
                },
              }
            )
              .then((result) => {
                console.log(result)
                if(result[0]){
                    res.send(
                        {
                        isSuccess: true,
                        message: 'Updated!',
                        code: 200,
                        data: {},
                        }
                    )
                    emailServices(email, 'Reset Password', `Your password has been updated.`);
                } else {
                    res.status(401).send({
                      isSuccess: false,
                      message: 'Failed to update!',
                      code: 401,
                      data: {},
                    })
                }
              })
              .catch((error) => {
                res.status(401).send({
                  isSuccess: false,
                  message: 'Failed to update!',
                  code: 401,
                  data: {},
                })
                console.error('Failed to update : ', error)
              })
          }
          else {
            res.status(401).send({
                isSuccess: false,
                message: 'Old password did not match!',
                code: 401,
                data: {},
              })
          }
        })
        .catch((error) => {
          res.status(404).send({
            isSuccess: false,
            message: "Email doesn't exist!",
            code: 404,
            data: {},
          })
          console.log(error)
        })
  }
});

router.put('/user/:id', verify, async (req, res) => {
  var id = req.params.id
  var data = req.body
  console.log(data)

  const validate = joi
    .object(validationObjects['createUser'])
    .validate(data)
  if (validate.error) {
    let message = ''
    validate.error.details.forEach((element) => {
      message += `${element.context.label}`
    })
    res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
      isSuccess: false,
      message: message,
      code: httpStatus.UNPROCESSABLE_ENTITY,
      data: {},
    })
  } else {
    try{
        await User.update(
            {
              full_name: data.full_name,
              mobile_no: data.mobile_no,
              email_id: data.email_id,
              address: data.address,
              blood_grp: data.blood_grp,
              username: data.username
            },
            {
              where: {
                id: id,
              },
            }
          )
            .then((result) => {
              res.send(
                result[0]
                  ? {
                      isSuccess: true,
                      message: 'Updated Successfully',
                      code: 200,
                      data: {
                        data,
                      },
                    }
                  : {
                      isSuccess: false,
                      message: 'No such user exist',
                      code: 550,
                      data: {},
                    }
              )
            })
            .catch((error) => {
              res.status(550).send({
                isSuccess: false,
                message: "ID doesn't exist!",
                code: 550,
                data: {},
              })
              console.error('ID does not exist : ', error)
            })
      } catch {
        res.status(401).send({
            isSuccess: false,
            message: 'Data not valid!',
            code: 401,
            data: {},
          })
      }
  }
});

router.delete('/user/:id', verify, async (req, res) => {
    var id = req.params.id
    await User.update({JWTtoken: ""},{
        where: {
        id: id,
        }
    })
    .then(async (result) => {
        if (!result) {
            res.status(404).send({
            isSuccess: true,
            message: 'No such user existed',
            code: 404,
            data: {},
            })
        } else{
            await User.destroy({
                where: {
                    id: id
                }
            }).then(async (result) => {
                res.status(200).send({
                    isSuccess: true,
                    message: 'User Deleted',
                    code: 200,
                    data: {},
                })
            }).catch((error) => {
                res.status(401).send({
                    isSuccess: true,
                    message: 'Failed to delete',
                    code: 401,
                    data: {},
                })
            });
        }
    })
    .catch((error) => {
      res.status(404).send({
        isSuccess: false,
        message: 'Invalid ID',
        code: 404,
        data: {},
      })
      console.error('Invalid ID : ', error)
    })
});

router.get('/deletedUsers', verify, async (req, res) => {
    await User.findAll({
      where: {
        [Op.not]: {
            deletedAt: null
        }
      },
      paranoid: false
    }).then((result) => {
        console.log(result);
        if (!result) {
          res.status(404).send({
            isSuccess: true,
            message: 'No deleted users found!',
            code: 404,
            data: {},
          })
        }
        else {
            res.status(200).send({
              isSuccess: true,
              message: 'List of Deleted Users',
              code: 200,
              data: {
                result
              },
            })
        }
      })
      .catch((error) => {
        res.status(404).send({
          isSuccess: false,
          message: 'No data found!',
          code: 404,
          data: {},
        })
        console.error('No data found : ', error)
      })
});

module.exports = router;
