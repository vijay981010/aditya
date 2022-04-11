const { Router } = require('express');
const { verify } = require('jsonwebtoken');
const router = Router();
const manifestController = require('../controllers/manifestController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestList)

router.get('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestForm)

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestGenerate)

router.get('/:manifestId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, manifestController.manifestUpdateForm)

router.put('/:manifestId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, manifestController.manifestUpdate)



router.get('/:manifestId/manifestexcel', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, manifestController.manifestExcel)

router.get('/:manifestId/ediexcel', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, manifestController.ediExcel)


module.exports = router