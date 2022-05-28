const { Router } = require('express')
const router = Router();
const settingsController = require('../controllers/settingsController')
const {verifyToken, authorizeRole} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']

router.get('/list', verifyToken, authorizeRole(admin), settingsController.list)

router.get('/awb', verifyToken, authorizeRole(admin), settingsController.awbSettings)

router.post('/awb', verifyToken, authorizeRole(admin), settingsController.processAwbSettings)


module.exports = router