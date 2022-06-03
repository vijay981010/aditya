const { Router } = require('express')
const router = Router();
const {list, addPage, add, editPage, edit, filter, deleteTxn} = require('../controllers/ledgerController')
const {verifyToken, authorizeRole, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), list)

router.get('/add', verifyToken, authorizeRole(['admin', 'superadmin']), addPage)

router.post('/add', verifyToken, authorizeRole(['admin', 'superadmin']), add)

router.get('/:ledgerId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), editPage)

router.post('/:ledgerId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), edit)

router.get('/filter', verifyToken, authorizeRole(['admin', 'superadmin']), filter)

router.delete('/:ledgerId/delete', verifyToken, authorizeRole(['admin', 'superadmin']), deleteTxn)

module.exports = router