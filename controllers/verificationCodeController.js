var uuid = require('uuid/v4')
var knex = require('../helpers').knex
var { check, validationResult } = require('express-validator/check')
var mail = require('../helpers/mail')

exports.renderVerifyPage = (req, res) => res.render('verify')

exports.createCode = (req, res, next) => {
  var code = uuid()
  // Promise.all([
  knex('verification_code')
    .insert({
      code: code,
      user_id: req.user_id,
      action: 'auth',
      created_at: Date.now(),
      updated_at: Date.now()
    })
    .then(() => {
      mail.send({
        user: {
          email: req.body.email
        },
        subject: 'CAPS LOCK: Verfication Code',
        html: `<h1>Code is ${code}</h1>`,
        text: `Code is ${code}`
      })
    })
    .then(() => {
      req.session.email = req.body.email
      req.session.save(function (err) {
        if (err) next(err)
        console.log(req.session)
        res.redirect('/verify')
      })
    })
    .catch((e) => {
      console.error(e)
      next(e)
    })
}

exports.verifyCode = [
  check('verificationCode').isUUID(4).withMessage('INVALID CODE'),
  check('verificationCode').custom((value, { req }) => {
    return knex('verification_code')
      .where({ code: value })
      .first()
      .then((code) => {
        // Check if user matches user in db
        knex('user')
          .where({ id: code.user_id })
          .first()
          .then((user) => {
            if (req.session.email !== user.email) {
              return Promise.reject(new Error('INVALID CODE'))
            }
          })
        // Check if code expired (24 hours after creation)
        if (code.created_at < (Date.now() - 1000 * 60 * 60 * 24)) {
          return Promise.reject(new Error('CODE EXPIRED'))
        }
      })
  })
]

exports.runAction = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('verify', { errors: errors.mapped() })
  } else {
    knex('verification_code')
      .where({ code: req.body.verificationCode })
      .first()
      .returning('user_id')
      .del()
      .then((userID) => {
        return knex('user')
          .where({ id: userID[0] })
          .update({ activated: true, updated_at: Date.now() })
          .returning('id')
      })
      .then((userID) => {
        console.log(userID[0])
        req.session.user = userID[0]
        req.session.save(function (err) {
          if (err) next(err)
          res.redirect('/profile/create')
        })
      })
      .catch((e) => {
        console.error(e)
        next(e)
      })
  }
}
