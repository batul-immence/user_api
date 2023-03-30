const { Sequelize } = require('sequelize')
const connection = new Sequelize('test1', 'root', 'bimmence', {
  host: 'localhost',
  dialect: 'mysql',
})

module.exports = connection
