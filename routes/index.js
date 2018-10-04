var express = require('express')
var router = express.Router()
var mainController = require('../controllers/mainController')
var userController = require('../controllers/userController')
var verificationCodeController = require('../controllers/verificationCodeController')
var postController = require('../controllers/postController')

router.get('/', mainController.renderHomePage)
router.post('/',
  postController.validatePost,
  postController.createPost
)

router.get('/sign-up', mainController.renderSignUpPage)
router.post('/sign-up',
  mainController.validateEmailSignUp,
  userController.createUser,
  verificationCodeController.createCode
)

router.get('/log-in', mainController.renderLogInPage)
router.post('/log-in',
  mainController.validateEmailLogIn,
  userController.getUserId,
  verificationCodeController.createCode
)

router.get('/verify', verificationCodeController.renderVerifyPage)
router.post('/verify',
  verificationCodeController.verifyCode,
  verificationCodeController.runAction
)
router.get('/profile/create',
  mainController.loggedIn,
  userController.isNotSetup,
  userController.renderProfileCreatePage
)
router.post('/profile/create',
  mainController.loggedIn,
  userController.validateProfile,
  userController.createProfile
)
router.get('/profile/edit',
  mainController.loggedIn,
  userController.showSettings
)
router.post('/profile/edit',
  mainController.loggedIn,
  userController.validateDescription,
  userController.updateProfile
)
router.get('/user/:user', mainController.loggedIn, userController.showProfile)
router.get('/log-out', mainController.loggedIn, userController.logOut)

router.get('/post/:page', postController.showPosts)
router.get('/test/:page', mainController.viewPage)

module.exports = router
