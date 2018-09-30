var knex = require('../helpers').knex
var { check, validationResult } = require('express-validator/check')
var uuid = require('uuid/v4')

exports.validatePost = [
  check('content').custom((value, { req, location, path }) => {
    req.body.content = req.body.content.toUpperCase().trim()
    return knex('user')
      .where({ id: req.session.user })
      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error('USER DOES NOT EXIST'))
        }
        if (rows[0].disabled) {
          return Promise.reject(new Error('USER CANNOT POST'))
        }
        if (!rows[0].activated || !rows[0].setup) {
          return Promise.reject(new Error('USER CANNOT POST'))
        }
      })
  }),
  check('content').not().isEmpty().withMessage('CONTENT CANNOT BE EMPTY'),
  check('content').isLength({ max: 1000 }).withMessage('POST IS TOO LONG')
]

exports.createPost = (req, res) => {
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.mapped())
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
        res.render('indexLoggedIn', { errors: errors.mapped(), posts: rows })
      })
  } else {
    knex('post')
      .insert({
        id: uuid(),
        user_id: req.session.user,
        content: req.body.content,
        created_at: Date.now(),
        updated_at: Date.now()
      })
      .then(() => {
        res.redirect('/')
      })
  }
}

exports.showPosts = (req, res) => {
  if (req.params.page && !isNaN(Number(req.params.page)) && req.params.page >= 1) {
    knex('post')
      .orderBy('created_at', 'desc')
      .limit(20)
      .offset((req.params.page - 1) * 20)
      .then((rows) => {
        var results = rows.reduce((arr, value) => {
          var prom = new Promise((resolve, reject) => {
            knex('user')
              .where({ id: value.user_id })
              .first()
              .then((user) => {
                var post = {
                  content: value.content,
                  created_at: res.locals.dayjs(Number(value.created_at)).fromNow(),
                  user: {
                    name: user.name,
                    avatarURL: 'https://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update(user.email).digest('hex')
                  }
                }
                resolve(post)
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
        res.json({ posts: rows, error: false })
      })
  } else {
    res.json({ error: true })
  }
}
