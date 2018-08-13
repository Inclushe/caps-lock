var express = require('express')
var router = express.Router()
var mainController = require('../controllers/mainController')
var userController = require('../controllers/userController')
var verificationCodeController = require('../controllers/verificationCodeController')

router.get('/', mainController.homePage)
router.get('/sign-up', userController.renderSignUpPage)
router.post('/users/create', userController.validateEmail,
                             userController.showErrorsIfAny,
                             userController.createUser)
router.get('/verify/:action', verificationCodeController.renderVerifyPage)
router.post('/verify/:action', verificationCodeController.validateCode,
                               verificationCodeController.showErrorsIfAny,
                               verificationCodeController.runAction)

module.exports = router
