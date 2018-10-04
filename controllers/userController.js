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

exports.showProfile = (req, res, next) => {
  knex('user')
    .where({ name: req.params.user.toUpperCase() })
    .then((user) => {
      if (user.length === 0) {
        next()
      } else {
        knex('post')
          .where({ user_id: user[0].id })
          .orderBy('created_at', 'desc')
          .then((rows) => {
            var results = rows.reduce((arr, value) => {
              var prom = new Promise((resolve, reject) => {
                knex('user')
                  .where({ id: value.user_id })
                  .first()
                  .then((user) => {
                    value.user = user
                    value.user['avatarURL'] = 'https://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update(user.email).digest('hex')
                    resolve(value)
                  })
                  .catch((e) => {
                    reject(e)
                  })
              })
              arr.push(prom)
              return arr
            }, [])
            return Promise.all(results)
          })
          .then((rows) => {
            console.log(rows)
            user[0]['avatarURL'] = 'https://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update(user[0].email).digest('hex')
            res.render('profile', { profileUser: user[0], posts: rows })
          })
      }
    })
    .catch((e) => {
      console.error(e)
      next(e)
    })
}

exports.showSettings = (req, res) => res.render('settings')

exports.validateDescription = [
  check('description').trim().isLength({ min: 0, max: 1000 }).withMessage('DESCRIPTION IS OVER 1000 CHARACTERS')
]

exports.updateProfile = (req, res, next) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
    res.render('settings', { errors: errors.mapped() })
  } else {
    knex('user')
      .where({ id: req.session.user })
      .update({
        description: req.body.description,
        updated_at: Date.now()
      })
      .then(() => {
        res.redirect(`/user/${res.locals.user.name}`)
      })
      .catch((e) => {
        console.error(e)
        next(e)
      })
  }
}

exports.logOut = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
}
