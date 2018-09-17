var knex = require('../helpers').knex
var uuid = require('uuid/v4')

exports.createUser = (req, res, next) => {
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

exports.renderProfileCreatePage = (req, res) => res.render('profileCreate')
