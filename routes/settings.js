const { Router } = require('express')
const router = Router();
const settingsController = require('../controllers/settingsController')
const {verifyToken, authorizeRole} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']

router.get('/list', verifyToken, authorizeRole(admin), settingsController.list)

router.get('/awb', verifyToken, authorizeRole(admin), settingsController.awbSettings)

router.post('/awb', verifyToken, authorizeRole(admin), settingsController.processAwbSettings)


router.get('/invoice', verifyToken, authorizeRole(admin), settingsController.invoiceSettings)

router.post('/invoice', verifyToken, authorizeRole(admin), settingsController.processInvoiceSettings)


router.get('/manifest', verifyToken, authorizeRole(admin), settingsController.manifestSettings)

router.post('/manifest', verifyToken, authorizeRole(admin), settingsController.processManifestSettings)


module.exports = router