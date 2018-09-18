var express = require('express')
var router = express.Router()
var mainController = require('../controllers/mainController')
var userController = require('../controllers/userController')
var verificationCodeController = require('../controllers/verificationCodeController')

router.get('/', mainController.renderHomePage)
router.get('/sign-up', mainController.renderSignUpPage)
router.post('/sign-up',
  mainController.validateEmail,
  userController.createUser,
  verificationCodeController.createCode
)
router.get('/verify', verificationCodeController.renderVerifyPage)
router.post('/verify',
  verificationCodeController.verifyCode,
  verificationCodeController.runAction
)
router.get('/profile/create',
  userController.isNotSetup,
  userController.renderProfileCreatePage
)
router.post('/profile/create',
  userController.validateProfile,
  userController.createProfile
)
router.get('/test/:page', mainController.viewPage)

module.exports = router
