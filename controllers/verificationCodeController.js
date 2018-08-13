var {check, validationResult} = require('express-validator/check')
var uuid = require('uuid/v4')
var getUniqueId = require('../helpers').getUniqueID
var knex = require('../helpers').knex
var mail = require('../helpers/mail')
var util = require('util')
var promisify = util.promisify

exports.renderVerifyPage = (req, res) => {
  res.render('verify')
}

exports.validateCode = [
  check('verificationCode').isUUID(4).withMessage('INVALID CODE'),
  check('verificationCode').custom((value, {req}) => {
    return knex('verification_code')
      .where({code: value})
      .first()
      .then((code) => {
        // console.log(code)
        // Check if user matches user in db
        if (req.session.userId !== code.user_id) {
          return Promise.reject(new Error('INVALID CODE'))
        }
        // Check if code action matches action in url
        if (req.params.action !== code.action) {
          return Promise.reject(new Error('INVALID CODE'))
        }
        // Check if code expired (1 hour after creation)
        if (code.created_at < (Date.now() - 1000 * 60 * 60 * 1)) {
          return Promise.reject(new Error('CODE EXPIRED'))
        }
      })
  })
]

exports.showErrorsIfAny = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('verify', {errors: errors.mapped()})
  } else {
    next()
  }
}

exports.runAction = (req, res, next) => {
  knex('verification_code')
    .where({code: req.body.verificationCode})
    .del()
    .then(() => {
      switch (req.params.action) {
        case 'activate':
          knex('user')
            .where({id: req.session.userId})
            .update({activated: true, updated_at: Date.now()})
            .then(() => {
              res.redirect('/')
            })
            .catch((e) => {
              console.error(e)
              next(e)
            })
          break
        default:
          next(new Error('Invalid path'))
      }
    })
    .catch((e) => {
      console.error(e)
      next(e)
    })
}
