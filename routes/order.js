const { Router } = require('express');
const router = Router();
const orderController = require('../controllers/orderController')
const {verifyToken, authorizeRole, authorizeUser, authorizeResource} = require('../helpers/helpers')
const {primaryDetailsValidator} = require('../validations/orderValidation')

/**
* @Acess : Global, Respective
* @Function : Fetch all orders and render orders list page
**/
router.get('/orderlist', verifyToken, authorizeUser, orderController.orderList)




/**
* @Acess : Global, Respective
* @Function : Render create order - primary details blank form page
**/
router.get('/add', verifyToken, authorizeUser, orderController.createOrderPage)

router.post('/add', verifyToken, authorizeUser, orderController.createOrder)

/**
* @Acess : Global, Respective
* @Function : Fetch single order - primary details data and render order update form
**/
router.get('/:orderId', verifyToken, authorizeUser, authorizeResource, orderController.singleOrder)

router.patch('/:orderId/update', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.updateOrder)




/**
* @Acess : Global, Respective
* @Function : Render patch order - box details blank form page
**/
router.get('/:orderId/box', verifyToken, authorizeUser, authorizeResource, orderController.patchBoxPage)

router.patch('/:orderId/box', verifyToken, authorizeUser, authorizeResource, orderController.patchBox)




/**
* @Acess : Global, Respective
* @Function : Render patch order - tracking details blank form page
**/
router.get('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.patchTrackPage)

router.patch('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.patchTrack)



/**
* @Acess : Global, Respective
* @Function : Render patch order - billing details blank form page
**/
router.get('/:orderId/bill', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.patchBillPage)

router.patch('/:orderId/bill', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.patchBill)




router.get('/track/details', orderController.trackDetails)




router.get('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.manualTrackingPage)

router.patch('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeResource, orderController.patchManualTracking)


/**
* @Acess : Superadmin, Respective admin
* @Function : Delete single order data from dB
**/
//router.delete('/:orderId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, orderController.deleteOrder)

router.get('/:orderId/print/awb', verifyToken, authorizeUser, authorizeResource, orderController.printawb) 

router.get('/:orderId/print/packinglist', verifyToken, authorizeUser, authorizeResource, orderController.packingList)

router.get('/:orderId/print/boxsticker', verifyToken, authorizeUser, authorizeResource, orderController.boxSticker)


router.get('/search/history', verifyToken, authorizeUser, orderController.searchHistory)



module.exports = router