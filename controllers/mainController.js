var knex = require('../helpers').knex
var { check } = require('express-validator/check')
var isProduction = process.env.NODE_ENV === 'production'

exports.renderHomePage = (req, res) => {
  if (res.locals.user === null) {
    res.render('index')
  } else if (res.locals.user.setup === false) {
    res.redirect('/')
  } else {
    res.render('indexLoggedIn')
  }
}
exports.renderSignUpPage = (req, res) => res.render('signUpPage')
exports.viewPage = (req, res, next) =>
  !isProduction ? res.render(req.params.page) : next(404)

exports.validateEmail = [
  check('email').isEmail().normalizeEmail().withMessage('NOT A VALID EMAIL'),
  check('email').custom(value => {
    return knex('user')
      .where({ email: value })
      .then((rows) => {
        if (rows.length !== 0) {
          return Promise.reject(new Error('EMAIL ALREADY IN USE'))
        }
      })
  })
]
