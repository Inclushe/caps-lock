require('dotenv').config({path: './vars.env'})

module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'capslock',
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    }
  },
  production: {
    client: 'pg',
    connection: {
      database: 'capslock',
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    }
  }
}