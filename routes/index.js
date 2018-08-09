var express = require('express')
var router = express.Router()
var mainController = require('../controllers/mainController')
var userController = require('../controllers/userController')

router.get('/', mainController.homePage)
router.get('/sign-up', userController.renderSignUpPage)
router.post('/users/create', userController.validateEmail,
                             userController.showErrorsIfAny,
                             userController.createUser)

module.exports = router
