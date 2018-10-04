var dayjs = require('dayjs')
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var path = require('path')
var knex = require('./helpers').knex
var session = require('express-session')
var KnexSessionStore = require('connect-session-knex')(session)
var expressValidator = require('express-validator')
var morgan = require('morgan')
var compression = require('compression')
var favicon = require('serve-favicon')
var routes = require('./routes')
require('dotenv').config({ path: './vars.env' })
var isProduction = process.env.NODE_ENV === 'production'
var app = express()

app.use(morgan('dev'))
app.use(compression())
app.use(favicon('./public/favicon.ico'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(expressValidator())

app.use(cookieParser(process.env.SESSION_SECRET))

app.use(session({
  secret: process.env.SESSION_SECRET,
  sameSite: true,
  saveUninitialized: true,
  resave: true,
  secure: isProduction,
  store: new KnexSessionStore({
    knex: require('./helpers').knex
  })
}))

app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'pug')

app.use(require('stylus').middleware({
  src: 'public',
  compress: true
}))

app.use('/public', express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  res.locals.email = req.session.email
  console.log({ id: req.session.user })
  res.locals.user = null
  res.locals.path = req.path
  res.locals.dayjs = dayjs
  if (req.session.user) {
    knex('user').where({ id: req.session.user }).first().then(user => {
      if (user) {
        res.locals.user = user
        res.locals.user['avatarURL'] = 'https://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update(user.email).digest('hex')
      }
      next()
    })
  } else {
    next()
  }
})

app.use('/', routes)

app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  // console.log(err.stack)
  res.status(err.status || 500)
  res.render('error', {
    errors: {
      message: err && err.message ? err.message : '',
      error: err || '',
      stack: err && err.stack ? err.stack : ''
    },
    code: err.status || 500
  })
})

module.exports = app
