const { Router } = require('express');
const { verify } = require('jsonwebtoken');
const router = Router();
const manifestController = require('../controllers/manifestController')
const {verifyToken, authorizeRole, authorizeUser} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestList)

router.get('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestForm)

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestGenerate)

router.get('/:manifestId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestUpdateForm)

router.put('/:manifestId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestUpdate)



router.get('/:manifestId/manifestexcel', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.manifestExcel)

router.get('/:manifestId/ediexcel', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, manifestController.ediExcel)


module.exports = router