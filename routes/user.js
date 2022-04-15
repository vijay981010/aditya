const { Router } = require('express');
const router = Router();
const userController = require('../controllers/userController')
const {verifyToken, authorizeRole, authorizeUser} = require('../helpers/helpers')
const {createUserValidator, profileValidator,
userSettingValidator} = require('../validations/userValidation')

/**
* @Acess : Superadmin
* @Function : Fetch all admin users and render adminlist page
**/
router.get('/adminlist', verifyToken, authorizeRole(['superadmin']), userController.userList)

/**
* @Acess : Superadmin, Respective admin
* @Function : Fetch all client users and render client list page
**/
router.get('/clientlist', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, userController.userList)




/**
* @Acess : Superadmin, Respective admin
* @Function : Render add User form
**/
router.get('/add', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, userController.createUserPage)

/**
* @Acess : Superadmin, Respective admin
* @Function : Post user form data to dB
**/
router.post('/add', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, createUserValidator, userController.createUser)




router.patch('/userstatus', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, userController.userstatus)

router.get('/:userId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, userController.settingsPage)

router.patch('/:userId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, userSettingValidator, userController.patchSettings)




/**
* @Acess : Global, Respective
* @Function : Fetch individual profile and render profile update form
**/
router.get('/profile', verifyToken, authorizeUser, userController.singleProfile)

router.get('/:clientId/profile/edit', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, userController.adminEditClientProfile)
/**
* @Acess : Global, Respective
* @Function : Update individual profile in dB
**/
router.post('/profile', verifyToken, authorizeUser, profileValidator, userController.updateProfile)







module.exports = router

