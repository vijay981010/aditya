const { Router } = require('express')
const router = Router();
const ledgerController = require('../controllers/ledgerController')
const {verifyToken, authorizeRole, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'superadmin']), ledgerController.list)

router.get('/add', verifyToken, authorizeRole(['admin', 'superadmin']), ledgerController.addPage)

router.post('/add', verifyToken, authorizeRole(['admin', 'superadmin']), ledgerController.add)

router.get('/:ledgerId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), ledgerController.editPage)

router.post('/:ledgerId/edit', verifyToken, authorizeRole(['admin', 'superadmin']), ledgerController.edit)

router.get('/filter', verifyToken, authorizeRole(['admin', 'superadmin']), ledgerController.filter)

module.exports = router