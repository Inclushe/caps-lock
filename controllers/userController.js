var {check, validationResult} = require('express-validator/check')
var uuid = require('uuid/v4')
var getUniqueId = require('../helpers').getUniqueID
var knex = require('../helpers').knex

exports.renderSignUpPage = (req, res) => {
  res.render('signUpPage')
}

exports.validateEmail = [
  check('email').isEmail().normalizeEmail().withMessage('NOT A VALID EMAIL'),
  check('email').custom(value => {
    return knex('user')
      .where({email: value})
      .then((rows) => {
        if (rows.length !== 0) {
          return Promise.reject(new Error('EMAIL ALREADY IN USE'))
        }
      })
  })
]
// @TODO: Check for existing email

exports.showErrorsIfAny = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('signUpPage', {errors: errors.mapped()})
  } else {
    next()
  }
}

exports.createUser = (req, res, next) => {
  var userId
  getUniqueId('user', 'id')
    .then((id) => {
      userId = id
      return knex('user')
        .insert({
          id: id,
          name: 'ANONYMOUS',
          email: req.body.email,
          created_at: Date.now(),
          updated_at: Date.now()
        })
    })
    .then(() => getUniqueId('verification_code', 'id'))
    .then((id) => {
      return knex('verification_code')
        .insert({
          id: id,
          user_id: userId,
          code: uuid(),
          action: 'activate',
          created_at: Date.now(),
          updated_at: Date.now()
        })
    })
    .then(() => {
      return knex('user')
        .where({id: userId})
        .then((row) => {
          req.session.user = row[0]
          console.log(req.session.user)
          res.render('verify', {action: 'activate', user: row[0]})
        })
    })
    .catch((e) => {
      console.error(e)
      next(e)
    })
}
