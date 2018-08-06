var express = require('express')
var router = express.Router()
var mainController = require('../controllers/mainController')
var userController = require('../controllers/userController')

router.get('/', mainController.homePage)
router.get('/sign-up', userController.renderSignUpPage)

module.exports = router
