const { Router } = require('express');
const router = Router();
const walkinController = require('../controllers/walkinController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin']), walkinController.list) //authorizeUser

router.get('/:walkinId/edit', verifyToken, authorizeRole(['admin']), authorizeResource, walkinController.view) //authorizeUser

router.post('/:walkinId/edit', verifyToken, authorizeRole(['admin']), authorizeResource, walkinController.edit) //authorizeUser



router.get('/search', verifyToken, authorizeRole(['admin']), walkinController.search) //authorizeUser



module.exports = router
