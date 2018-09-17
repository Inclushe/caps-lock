var knex = require('../helpers').knex
var { check, validationResult } = require('express-validator/check')
var isProduction = process.env.NODE_ENV === 'production'

exports.renderHomePage = (req, res) => res.render('index')
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

exports.showErrorsIfAny = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('signUpPage', { errors: errors.mapped() })
  } else {
    next()
  }
}
