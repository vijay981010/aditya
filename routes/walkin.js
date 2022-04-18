const { Router } = require('express');
const router = Router();
const walkinController = require('../controllers/walkinController')
const {verifyToken, authorizeRole, authorizeUser} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin']), authorizeUser, walkinController.list)

router.get('/:walkinId/edit', verifyToken, authorizeRole(['admin']), authorizeUser, walkinController.view)

router.post('/:walkinId/edit', verifyToken, authorizeRole(['admin']), authorizeUser, walkinController.edit)



router.get('/search', verifyToken, authorizeRole(['admin']), authorizeUser, walkinController.search)



module.exports = router
