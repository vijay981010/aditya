const { Router } = require('express');
const router = Router();
const dashboardController = require('../controllers/dashboardController')
const {verifyToken, authorizeRole, authorizeUser} = require('../helpers/helpers')

router.get('/', verifyToken, authorizeUser, dashboardController.index)



module.exports = router