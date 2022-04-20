const { Router } = require('express');
const { verify } = require('jsonwebtoken');
const router = Router();
const serviceController = require('../controllers/serviceController')
const {verifyToken, authorizeRole, authorizeUser} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), serviceController.serviceList) //authorizeUser

router.get('/', verifyToken, authorizeRole(['admin', 'superadmin']), serviceController.serviceForm) //authorizeUser

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), serviceController.createService) //authorizeUser

router.get('/:serviceId', verifyToken, authorizeRole(['admin', 'superadmin']), serviceController.serviceUpdateForm) //authorizeUser

router.put('/:serviceId', verifyToken, authorizeRole(['admin', 'superadmin']), serviceController.updateService) //authorizeUser


module.exports = router