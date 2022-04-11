const { Router } = require('express')
const router = Router();
const invoiceController = require('../controllers/invoiceController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, invoiceController.invoiceList)

router.post('/', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, invoiceController.invoiceGenerate)

router.get('/:invoiceId/pdf', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, invoiceController.invoicePdf)

router.delete('/:invoiceId/delete', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, invoiceController.invoiceDelete)



module.exports = router