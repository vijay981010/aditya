const { Router } = require('express')
const router = Router()
const {list, form, process, deleteBill} = require('../controllers/billingController')
const {verifyToken, authorizeRole} = require('../helpers/helpers')

let role = ['admin', 'superadmin']
let role1 = ['superadmin']

router.get('/list', verifyToken, authorizeRole(role), list)



router.get('/add', verifyToken, authorizeRole(role1), form)

router.post('/add', verifyToken, authorizeRole(role1), process) 



//router.get('/:billId/edit', verifyToken, authorizeRole(role1), form)

router.post('/:billId/edit', verifyToken, authorizeRole(role1), process)


router.get('/:billId/:pageType', verifyToken, authorizeRole(role), form)


router.delete('/:billId/delete', verifyToken, authorizeRole(role1), deleteBill)


module.exports = router