const { Router } = require('express');
const router = Router();
const orderController = require('../controllers/orderController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')
const {primaryDetailsValidator} = require('../validations/orderValidation')

/**
* @Acess : Global, Respective
* @Function : Fetch all orders and render orders list page
**/
router.get('/orderlist', verifyToken, orderController.orderList) //authorizeUser




/**
* @Acess : Global, Respective
* @Function : Render create order - primary details blank form page
**/
router.get('/add', verifyToken, orderController.createOrderPage) //authorizeUser

router.post('/add', verifyToken, orderController.createOrder) //authorizeUser

/**
* @Acess : Global, Respective
* @Function : Fetch single order - primary details data and render order update form
**/
router.get('/:orderId', verifyToken, authorizeResource, orderController.singleOrder) //authorizeUser

router.patch('/:orderId/update', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.updateOrder) //authorizeUser




/**
* @Acess : Global, Respective
* @Function : Render patch order - box details blank form page
**/
router.get('/:orderId/box', verifyToken, authorizeResource, orderController.patchBoxPage) //authorizeUser

router.patch('/:orderId/box', verifyToken, authorizeResource, orderController.patchBox) //authorizeUser




/**
* @Acess : Global, Respective
* @Function : Render patch order - tracking details blank form page
**/
router.get('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchTrackPage) //authorizeUser

router.patch('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchTrack) //authorizeUser



/**
* @Acess : Global, Respective
* @Function : Render patch order - billing details blank form page
**/
router.get('/:orderId/bill', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchBillPage) //authorizeUser

router.patch('/:orderId/bill', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchBill) //authorizeUser




router.get('/track/details', orderController.trackDetails)




router.get('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.manualTrackingPage) //authorizeUser

router.patch('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchManualTracking) //authorizeUser


/**
* @Acess : Superadmin, Respective admin
* @Function : Delete single order data from dB
**/
//router.delete('/:orderId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, orderController.deleteOrder)

router.get('/:orderId/print/awb', verifyToken, authorizeResource, orderController.printawb) //authorizeUser

router.get('/:orderId/print/packinglist', verifyToken, authorizeResource, orderController.packingList) //authorizeUser

router.get('/:orderId/print/boxsticker', verifyToken, authorizeResource, orderController.boxSticker) //authorizeUser


router.get('/search/history', verifyToken, orderController.searchHistory) //authorizeUser



module.exports = router