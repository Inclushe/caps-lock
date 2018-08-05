var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var path = require('path')
// var session = require('express-session')
var expressValidator = require('express-validator')
var morgan = require('morgan')
var routes = require('./routes/index')
var isProduction = process.env.NODE_ENV === 'production'
var app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(expressValidator())
app.use(cookieParser())
// app.use(session())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(require('stylus').middleware('public'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', routes)
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})
app.use((err, req, res, next) => {
  // console.log(err.stack)
  res.status(err.status || 500)
  if (!isProduction) {
    res.json({'errors': {
      message: err.message,
      error: err
    }})
  } else {
    res.send(err.message)
  }
})

module.exports = app
