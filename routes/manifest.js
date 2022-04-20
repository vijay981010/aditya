const { Router } = require('express');
const { verify } = require('jsonwebtoken');
const router = Router();
const manifestController = require('../controllers/manifestController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), manifestController.manifestList) //authorizeUser

router.get('/', verifyToken, authorizeRole(['admin', 'superadmin']), manifestController.manifestForm) //authorizeUser

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), manifestController.manifestGenerate) //authorizeUser

router.get('/:manifestId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, manifestController.manifestUpdateForm) //authorizeUser

router.put('/:manifestId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, manifestController.manifestUpdate) //authorizeUser



router.get('/:manifestId/manifestexcel', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, manifestController.manifestExcel) //authorizeUser

router.get('/:manifestId/ediexcel', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, manifestController.ediExcel) //authorizeUser


module.exports = router