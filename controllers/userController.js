var { check, validationResult } = require('express-validator/check')
var knex = require('../helpers').knex
var uuid = require('uuid/v4')

exports.createUser = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('signUpPage', { errors: errors.mapped() })
  } else {
    var id = uuid()
    knex('user')
      .insert({
        id: id,
        email: req.body.email,
        created_at: Date.now(),
        updated_at: Date.now()
      })
      .then(() => {
        req.user_id = id
        next()
      })
      .catch((e) => {
        console.error(e)
        next(e)
      })
  }
}

exports.isNotSetup = (req, res, next) => {
  var user = res.locals.user
  ;(user !== null && user.setup === false) ? next() : res.redirect('/')
}

exports.renderProfileCreatePage = (req, res) => res.render('profileCreate')

exports.validateProfile = [
  check('username').custom((value, { req, location, path }) => {
    req[location][path] = value.toUpperCase().trim()
    value = value.toUpperCase().trim()
    return knex('user')
      .where({ name: value })
      .then((rows) => {
        if (rows.length !== 0) {
          return Promise.reject(new Error('USERNAME ALREADY IN USE'))
        }
        if (value.length === 0) {
          return Promise.reject(new Error('LENGTH CANNOT BE EMPTY'))
        }
        if (value.length > 32) {
          return Promise.reject(new Error('USERNAME OVER 32 CHARACTERS'))
        }
        if (value.match(/^[A-Z0-9_]+$/) === null) {
          return Promise.reject(new Error('USERNAME MUST CONTAIN VALID CHARACTERS (A-Z/0-9/_)'))
        }
      })
  }),
  check('description').trim().isLength({ min: 0, max: 1000 }).withMessage('DESCRIPTION IS OVER 1000 CHARACTERS')
]

exports.createProfile = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('profileCreate', { errors: errors.mapped() })
  } else {
    knex('user')
      .where({ id: req.session.user })
      .update({
        name: req.body.username,
        description: req.body.description,
        setup: true,
        updated_at: Date.now()
      })
      .then(() => {
        res.redirect('/')
      })
      .catch((e) => {
        console.error(e)
        next(e)
      })
  }
}

exports.getUserId = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('logInPage', { errors: errors.mapped() })
  } else {
    knex('user')
      .where({ email: req.body.email })
      .first()
      .then((user) => {
        req.user_id = user.id
        next()
      })
  }
}

exports.showProfile = (req, res) => {
  res.render('profile', { user: req.params.user })
}
