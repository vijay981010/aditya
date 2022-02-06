const { Router } = require('express');
const router = Router();
const orderController = require('../controllers/orderController')
const {verifyToken, authorizeRole, authorizeUser, authorizeOrderResource} = require('../helpers/helpers')
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

/**
* @Acess : Global, Respective
* @Function : Post order - primary details form data to dB and create new order
**/
router.post('/add', verifyToken, authorizeUser, orderController.createOrder)

/**
* @Acess : Global, Respective
* @Function : Fetch single order - primary details data and render order update form
**/
router.get('/:orderId', verifyToken, authorizeUser, authorizeOrderResource, orderController.singleOrder)

/**
* @Acess : Superadmin, Respective admin
* @Function : Update order - primary details data form data to dB
**/
router.patch('/:orderId/update', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeOrderResource, orderController.updateOrder)




/**
* @Acess : Global, Respective
* @Function : Render patch order - box details blank form page
**/
router.get('/:orderId/box', verifyToken, authorizeUser, authorizeOrderResource, orderController.patchBoxPage)

/**
* @Acess : Global, Respective
* @Function : Patch order - box details form data to dB
**/
router.patch('/:orderId/box', verifyToken, authorizeUser, authorizeOrderResource, orderController.patchBox)




/**
* @Acess : Global, Respective
* @Function : Render patch order - tracking details blank form page
**/
router.get('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeOrderResource, orderController.patchTrackPage)

/**
* @Acess : Global, Respective
* @Function : Patch order - tracking details form data to dB
**/
router.patch('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeOrderResource, orderController.patchTrack)




router.get('/track/details', orderController.trackDetails)




router.get('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeOrderResource, orderController.manualTrackingPage)

router.patch('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, authorizeOrderResource, orderController.patchManualTracking)


/**
* @Acess : Superadmin, Respective admin
* @Function : Delete single order data from dB
**/
//router.delete('/:orderId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, orderController.deleteOrder)

router.get('/:orderId/print/awb', verifyToken, authorizeUser, authorizeOrderResource, orderController.printawb)

router.get('/:orderId/print/packinglist', verifyToken, authorizeUser, authorizeOrderResource, orderController.packingList)

router.get('/:orderId/print/boxsticker', verifyToken, authorizeUser, authorizeOrderResource, orderController.boxSticker)



module.exports = router