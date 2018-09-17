var express = require('express')
var router = express.Router()
var mainController = require('../controllers/mainController')
var userController = require('../controllers/userController')
var verificationCodeController = require('../controllers/verificationCodeController')

router.get('/', mainController.renderHomePage)
router.get('/sign-up', mainController.renderSignUpPage)
router.post('/sign-up',
  mainController.validateEmail,
  mainController.showErrorsIfAny,
  userController.createUser,
  verificationCodeController.createCode
)
router.get('/verify', verificationCodeController.renderVerifyPage)
router.post('/verify',
  verificationCodeController.verifyCode,
  verificationCodeController.showErrorsIfAny,
  verificationCodeController.runAction
)
router.get('/profile/create', userController.renderProfileCreatePage)
router.get('/test/:page', mainController.viewPage)

module.exports = router
