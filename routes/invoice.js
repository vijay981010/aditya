const { Router } = require('express')
const router = Router();
const invoiceController = require('../controllers/invoiceController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), invoiceController.invoiceList) //authorizeUser

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), invoiceController.invoiceGenerate) //authorizeUser

router.get('/:invoiceId/pdf', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, invoiceController.invoicePdf) //authorizeUser

router.delete('/:invoiceId/delete', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, invoiceController.invoiceDelete) //authorizeUser



module.exports = router