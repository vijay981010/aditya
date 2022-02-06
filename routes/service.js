const { Router } = require('express');
const { verify } = require('jsonwebtoken');
const router = Router();
const serviceController = require('../controllers/serviceController')
const {verifyToken, authorizeRole, authorizeUser} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, serviceController.serviceList)

router.get('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, serviceController.serviceForm)

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, serviceController.createService)

router.get('/:serviceId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, serviceController.serviceUpdateForm)

router.put('/:serviceId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, serviceController.updateService)


module.exports = router