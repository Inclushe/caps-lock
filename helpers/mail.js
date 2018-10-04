var nodemailer = require('nodemailer')
var sgMail = require('@sendgrid/mail')
var isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}
var transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})

exports.send = (options) => {
  var message = {
    from: 'CAPS LOCK <verify@capslock.inclushe.com>',
    to: options.user.email,
    subject: options.subject,
    html: options.html,
    text: options.text
  }
  if (isProduction) {
    return sgMail.send(message)
  } else {
    return transport.sendMail(message)
  }
}
