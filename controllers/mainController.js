var knex = require('../helpers').knex
var { check } = require('express-validator/check')
var isProduction = process.env.NODE_ENV === 'production'

exports.renderHomePage = (req, res) => {
  if (res.locals.user === null) {
    res.render('index')
  } else if (res.locals.user.setup === false) {
    res.redirect('/profile/create')
  } else {
    knex('post')
      .orderBy('created_at', 'desc')
      .limit(20)
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
        res.render('indexLoggedIn', { posts: rows })
      })
  }
}
exports.renderSignUpPage = (req, res) => res.render('signUpPage')
exports.renderLogInPage = (req, res) => res.render('logInPage')
exports.viewPage = (req, res, next) =>
  !isProduction ? res.render(req.params.page) : next(404)

exports.validateEmailSignUp = [
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

exports.validateEmailLogIn = [
  check('email').isEmail().normalizeEmail().withMessage('NOT A VALID EMAIL'),
  check('email').custom(value => {
    return knex('user')
      .where({ email: value })
      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error('NO USER HAS THIS EMAIL. <a href="/sign-up">SIGN UP HERE.</a>'))
        }
      })
  })
]
