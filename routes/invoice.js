const { Router } = require('express')
const router = Router();
const {invoiceList, invoiceGenerate, invoicePdf, invoiceDelete, cashInvoicePdf, sendEmail} = require('../controllers/invoiceController')
const {verifyToken, authorizeRole, authorizeResource, authorizeModule} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']

router.get('/list', verifyToken, authorizeRole(admin), authorizeModule(['invoice']), invoiceList)

router.post('/', verifyToken, authorizeRole(admin), invoiceGenerate)

router.get('/:invoiceId/pdf', invoicePdf) //verifyToken, authorizeRole(admin), authorizeResource

router.delete('/:invoiceId/delete', verifyToken, authorizeRole(admin), authorizeResource, invoiceDelete)

router.post('/cashinvoice', verifyToken, authorizeRole(admin), cashInvoicePdf)

router.get('/:invoiceId/email', verifyToken, authorizeRole(admin), authorizeResource, sendEmail)

module.exports = router