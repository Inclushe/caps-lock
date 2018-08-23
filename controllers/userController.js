var {check, validationResult} = require('express-validator/check')
var uuid = require('uuid/v4')
var getUniqueId = require('../helpers').getUniqueID
var knex = require('../helpers').knex
var mail = require('../helpers/mail')
// var util = require('util')
// var promisify = util.promisify

exports.renderSignUpPage = (req, res) => {
  // req.session.userId = null
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

// @TODO: Clean up
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
          action: 'activate',
          created_at: Date.now(),
          updated_at: Date.now()
        })
        .returning('id')
    })
    .then((id) =>
      mail.send({
        user: {
          email: req.body.email
        },
        subject: 'Yo. Here\'s the code.',
        html: `<h1>id: ${id}</h1>`,
        text: `<h1>id: ${id}</h1>`
      }))
    .then(() => {
      // req.session.userId = userId
      req.session.email = req.body.email
      // return promisify(req.session.save)
      req.session.save(function (err) {
        if (err) next(err)
        console.log(req.session)
        res.redirect('/verify/activate')
      })
    })
    .catch((e) => {
      console.error(e)
      next(e)
    })
}
