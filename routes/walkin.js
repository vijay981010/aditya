const { Router } = require('express')
const router = Router();
const walkinController = require('../controllers/walkinController')
const {verifyToken, authorizeRole, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'client']), walkinController.list) //authorizeUser

router.get('/:walkinId/edit', verifyToken, authorizeRole(['admin', 'client']), authorizeResource, walkinController.view) //authorizeUser

router.post('/:walkinId/edit', verifyToken, authorizeRole(['admin', 'client']), authorizeResource, walkinController.edit) //authorizeUser



router.get('/search', verifyToken, authorizeRole(['admin', 'client']), walkinController.search) //authorizeUser



module.exports = router
