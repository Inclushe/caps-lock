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
        subject: 'CAPS LOCK: Verification Code',
        html: `<img src="${req.protocol + '://' + req.get('host')}/public/images/logo.png" height="160" width="192" />
        <h1 style="font-family:sans-serif;">VERIFICATION CODE</h1>
        <p style="font-family:sans-serif;">To verify your email, enter this code or click the button below: <span style="font-family:monospace;">${code}</span></p>
        <div><!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${req.protocol + '://' + req.get('host')}/verify/${code}" style="height:40px;v-text-anchor:middle;width:150px;" arcsize="10%" strokecolor="#1e3650" fillcolor="#00d16c">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:monospace;font-size:13px;font-weight:bold;">VERIFY ACCOUNT</center>
          </v:roundrect>
        <![endif]--><a href="${req.protocol + '://' + req.get('host')}/verify/${code}"
        style="background-color:#00d16c;border:1px solid #1e3650;border-radius:4px;color:#ffffff;display:inline-block;font-family:monospace;font-size:13px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:150px;-webkit-text-size-adjust:none;mso-hide:all;">VERIFY ACCOUNT</a></div>
        `,
        text: `CAPS LOCK
        VERIFICATION CODE
        To verify your email, enter this code or enter the URL below: ${code}
        ${req.protocol + '://' + req.get('host')}/verify/${code}
        `
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
      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error('INVALID CODE'))
        }
        // Check if code expired (24 hours after creation)
        if (rows[0].created_at < (Date.now() - 1000 * 60 * 60 * 24)) {
          knex('verification_code')
            .where({ code: value })
            .first()
            .del()
            .then(() => {
              return Promise.reject(new Error('CODE EXPIRED'))
            })
        }
      })
  })
]

exports.paramToBody = (req, res, next) => {
  req.body.verificationCode = req.params.code
  next()
}

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
          res.redirect('/')
        })
      })
      .catch((e) => {
        console.error(e)
        next(e)
      })
  }
}
