var bcrypt = require('bcryptjs')

module.exports.encrypt = (password) => {
  var salt = bcrypt.genSaltSync(10)
  var hash = bcrypt.hashSync(password, salt)
  return hash
}

module.exports.decrypt = (password, hash) => {
  return bcrypt.compareSync(password, hash)
}
