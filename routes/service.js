const { Router } = require('express')
const router = Router()

const {list, form, checkFile, processService, rateChecker, serviceExport, clientList, zoneList} = require('../controllers/serviceController')

const {verifyToken, authorizeRole, authorizeModule} = require('../helpers/helpers')
const multer = require('multer')
const upload = multer({ dest: 'controllers/uploads/' })


let admin = ['admin', 'superadmin']

// --------------------------------------------------- //

router.get('/list', verifyToken, authorizeModule('services'), list)

router.get('/', verifyToken, authorizeRole(admin), authorizeModule('services'), form)

router.post('/', verifyToken, authorizeRole(admin), upload.single('uploaded_file'), checkFile, processService)

router.get('/:serviceId', verifyToken, authorizeRole(admin), authorizeModule('services'), form)

router.post('/:serviceId', verifyToken, authorizeRole(admin), upload.single('uploaded_file'), checkFile, processService)


router.post('/rate/checker', rateChecker)


router.get('/:serviceId/export', verifyToken, authorizeRole(admin), authorizeModule('services'), serviceExport)

router.get('/:serviceId/export/:fsc', verifyToken, authorizeRole(admin), authorizeModule('services'), serviceExport)


router.get('/:serviceId/clients', verifyToken, authorizeRole(admin), authorizeModule('services'), clientList)

router.get('/:serviceId/zones', verifyToken, authorizeRole(admin), authorizeModule('services'), zoneList)


module.exports = router