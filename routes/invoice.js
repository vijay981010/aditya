const { Router } = require('express')
const router = Router();
const {invoiceList, invoiceGenerate, invoicePdf, invoiceDelete, cashInvoicePdf} = require('../controllers/invoiceController')
const {verifyToken, authorizeRole, authorizeResource, authorizeModule} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']

router.get('/list', verifyToken, authorizeRole(admin), authorizeModule(['invoice']), invoiceList)

router.post('/', verifyToken, authorizeRole(admin), invoiceGenerate)

router.get('/:invoiceId/pdf', verifyToken, authorizeRole(admin), authorizeResource, invoicePdf)

router.delete('/:invoiceId/delete', verifyToken, authorizeRole(admin), authorizeResource, invoiceDelete)

router.post('/cashinvoice', verifyToken, authorizeRole(admin), cashInvoicePdf)

module.exports = router