const { Router } = require('express')
const router = Router();
const settingsController = require('../controllers/settingsController')
const {verifyToken, authorizeRole} = require('../helpers/helpers')

router.get('/list', verifyToken, authorizeRole(['admin', 'client']), settingsController.list) //authorizeUser


module.exports = router