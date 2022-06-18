const { Router } = require('express')
const router = Router();
const {list, addPage, add, editPage, edit, filter, deleteTxn, exportLedger} = require('../controllers/ledgerController')
const {verifyToken, authorizeRole, authorizeResource, authorizeModule} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']


router.get('/list', verifyToken, authorizeRole(admin), authorizeModule('ledger'), list)

router.get('/add', verifyToken, authorizeRole(admin), authorizeModule('ledger'), addPage)

router.post('/add', verifyToken, authorizeRole(admin), add)


router.get('/:ledgerId/edit', verifyToken, authorizeRole(admin), authorizeModule('ledger'), editPage)

router.post('/:ledgerId/edit', verifyToken, authorizeRole(admin), edit)


router.get('/filter', verifyToken, authorizeRole(admin), authorizeModule('ledger'), filter)

router.delete('/:ledgerId/delete', verifyToken, authorizeRole(admin), deleteTxn)


router.post('/export', verifyToken, authorizeRole(admin), exportLedger)

module.exports = router