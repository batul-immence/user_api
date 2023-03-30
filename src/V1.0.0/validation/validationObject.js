const joi = require('joi')

module.exports = {
  registerUser: {
    full_name: joi.string().required().label('Full Name is required'),
    mobile_no: joi
      .string()
      .regex(/^\+[1-9]{1}[0-9]{3,14}$/)
      .required()
      .label('Enter a valid Mobile number'),
    email_id: joi.string().email().required().label('Enter a valid Email'),
    address: joi.string().required().label('Address is required'),
    blood_grp: joi
      .string()
      .regex(/^(A|B|AB|O)[+-]$/)
      .required()
      .label('Enter a valid BloodGroup'),
    username: joi.string().required().label('Username is required'),
    password: joi.string().required().label('Password is required'),
  },
  validateEmail: {
    email_id: joi.string().email().required().label('Enter a valid Email')
  },
  validatePassword: {
    password: joi.string().required().label('Password is required')
  },
  createUser: {
    full_name: joi.string().required().label('Full Name is required'),
    mobile_no: joi
      .string()
      .regex(/^\+[1-9]{1}[0-9]{3,14}$/)
      .required()
      .label('Enter a valid Mobile number'),
    email_id: joi.string().email().required().label('Enter a valid Email'),
    address: joi.string().required().label('Address is required'),
    blood_grp: joi
      .string()
      .regex(/^(A|B|AB|O)[+-]$/)
      .required()
      .label('Enter a valid BloodGroup'),
    username: joi.string().required().label('Username is required')
  }
}
