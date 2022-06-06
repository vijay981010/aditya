const { Router } = require('express')
const router = Router();
const {list, addPage, add, editPage, edit, filter, deleteTxn, exportLedger} = require('../controllers/ledgerController')
const {verifyToken, authorizeRole, authorizeResource} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']


router.get('/list', verifyToken, authorizeRole(admin), list)

router.get('/add', verifyToken, authorizeRole(admin), addPage)

router.post('/add', verifyToken, authorizeRole(admin), add)


router.get('/:ledgerId/edit', verifyToken, authorizeRole(admin), editPage)

router.post('/:ledgerId/edit', verifyToken, authorizeRole(admin), edit)


router.get('/filter', verifyToken, authorizeRole(admin), filter)

router.delete('/:ledgerId/delete', verifyToken, authorizeRole(admin), deleteTxn)


router.post('/export', verifyToken, authorizeRole(admin), exportLedger)

module.exports = router