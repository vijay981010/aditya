const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/indexController')
const {autheticateUserValidator} = require('../validations/indexValidation')

/**
* @Acess : Global
* @Function : Render login page
**/
router.get('/', indexController.loginPage)

/**
* @Acess : Global
* @Function : Post login details in order to authenticate
**/
router.post('/', autheticateUserValidator, indexController.authenticateUser)

/**
* @Acess : Global
* @Function : Logout 
**/
router.get('/logout', indexController.logoutPage)


module.exports = router