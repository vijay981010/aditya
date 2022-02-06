const { Router } = require('express');
const router = Router();
const dashboardController = require('../controllers/dashboardController')

router.get('/', dashboardController.index)

//router.get('/:id', dashboardController.index)

module.exports = router