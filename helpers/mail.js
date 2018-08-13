var nodemailer = require('nodemailer')
var pug = require('pug')
var util = require('util')
var promisify = util.promisify

var transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})

exports.send = (options) => {
  return transport.sendMail({
    from: 'Caps Lock <noreply@capslo.ck>',
    to: options.user.email,
    subject: options.subject,
    html: options.html,
    text: options.text
  })
}
