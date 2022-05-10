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
router.get('/clientlist', verifyToken, authorizeRole(['admin', 'superadmin']), userController.userList) //authorizeUser




/**
* @Acess : Superadmin, Respective admin
* @Function : Render add User form
**/
router.get('/add', verifyToken, authorizeRole(['admin', 'superadmin']), userController.createUserPage) //authorizeUser

/**
* @Acess : Superadmin, Respective admin
* @Function : Post user form data to dB
**/
router.post('/add', verifyToken, authorizeRole(['admin', 'superadmin']), createUserValidator, userController.createUser) //authorizeUser




router.patch('/userstatus', verifyToken, authorizeRole(['admin', 'superadmin']), userController.userstatus) //authorizeUser

router.get('/:userId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), userController.settingsPage) //authorizeUser

router.patch('/:userId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), userSettingValidator, userController.patchSettings) //authorizeUser




/**
* @Acess : Global, Respective
* @Function : Fetch individual profile and render profile update form
**/
router.get('/profile', verifyToken, userController.singleProfile) //authorizeUser

router.get('/:clientId/profile/edit', verifyToken, authorizeRole(['admin', 'superadmin']), userController.adminEditClientProfile) //authorizeUser
/**
* @Acess : Global, Respective
* @Function : Update individual profile in dB
**/
router.post('/profile', verifyToken, profileValidator, userController.updateProfile) //authorizeUser



router.get('/:clientId/addons', verifyToken, authorizeRole(['superadmin']), userController.addOns)

router.post('/:clientId/addons', verifyToken, authorizeRole(['superadmin']), userController.toggleAddOns)



module.exports = router

