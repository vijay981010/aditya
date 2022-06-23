const { Router } = require('express');
const router = Router();
const orderController = require('../controllers/orderController')
const {verifyToken, authorizeRole, authorizeResource, authorizeAddOn} = require('../helpers/helpers')
const {primaryDetailsValidator} = require('../validations/orderValidation')
const cors = require('cors')
/* const User = require('../model/userModel')
let debug = require('debug')('c_app: orderRoute') */


/* let corsOption = {
    origin: async function(origin, callback){
        let userList = await User.find({role: 'admin'}).select('website')
        whiteList = userList.map(user => user.website)
        whiteList.push('http://pranambharatcourier.in')
        debug(whiteList)
        if(whiteList.indexOf(origin) != -1){
            callback(null, true)
        }else{
            let err = new Error(`Not allowed by cors`)
            callback(err)
        }
    }
} */

/**
* @Acess : Global, Respective
* @Function : Fetch all orders and render orders list page
**/
router.get('/orderlist', verifyToken, orderController.orderList) 




/**
* @Acess : Global, Respective
* @Function : Render create order - primary details blank form page
**/
router.get('/add', verifyToken, orderController.createOrderPage) 

router.post('/add', verifyToken, orderController.createOrder) 

/**
* @Acess : Global, Respective
* @Function : Fetch single order - primary details data and render order update form
**/
router.get('/:orderId', verifyToken, authorizeResource, orderController.singleOrder) 

router.patch('/:orderId/update', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.updateOrder)




/**
* @Acess : Global, Respective
* @Function : Render patch order - box details blank form page
**/
router.get('/:orderId/box', verifyToken, authorizeResource, orderController.patchBoxPage) 

router.patch('/:orderId/box', verifyToken, authorizeResource, orderController.patchBox) 



/**
* @Acess : Global, Respective
* @Function : Render patch order - tracking details blank form page
**/
router.get('/hsn/list', verifyToken, authorizeAddOn('autoHsn'), orderController.hsnListPage)

router.post('/hsn/add', verifyToken, orderController.addHsn)

router.get('/api/hsn', verifyToken, authorizeAddOn('autoHsn'), orderController.getHsnList)

router.get('/api/:itemId/hsn', verifyToken, authorizeAddOn('autoHsn'), orderController.getHsnCode)

router.get('/hsn/:hsnId/edit', verifyToken, authorizeRole(['admin']), authorizeAddOn('autoHsn'), orderController.hsnEditPage)

router.post('/hsn/:hsnId/edit', verifyToken, authorizeRole(['admin']), authorizeAddOn('autoHsn'), orderController.editHsn)


/**************************************************
* @Acess : Global, Respective
* @Function : Render Order Archive Page and get respective data
**/
router.get('/search/archive', verifyToken, authorizeRole(['admin']), orderController.orderSearchPage)

router.get('/search/awb', verifyToken, authorizeRole(['admin']), orderController.searchByAwb)



/**
* @Acess : Global, Respective
* @Function : Render patch order - tracking details blank form page
**/
router.get('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchTrackPage) 

router.patch('/:orderId/track', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchTrack) 



/**
* @Acess : Global, Respective
* @Function : Render patch order - billing details blank form page
**/
router.get('/:orderId/bill', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchBillPage) 

router.patch('/:orderId/bill', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchBill) 




router.get('/track/details', cors(), orderController.trackDetails)




router.get('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.manualTrackingPage)

router.patch('/:orderId/trackingdetails',verifyToken, authorizeRole(['admin', 'superadmin']), authorizeResource, orderController.patchManualTracking)


/**
* @Acess : Superadmin, Respective admin
* @Function : Delete single order data from dB
**/
//router.delete('/:orderId', verifyToken, authorizeRole(['admin', 'superadmin']), authorizeUser, orderController.deleteOrder)

router.get('/:orderId/print/awb', verifyToken, authorizeResource, orderController.printawb) //orderController.getLogo

router.get('/:orderId/print/awb/:consigneeId/consignee', verifyToken, authorizeResource, orderController.printawb) //orderController.getLogo

router.get('/:orderId/print/awb/:consignorId/consignor', verifyToken, authorizeResource, orderController.printawb) //orderController.getLogo

router.get('/:orderId/print/packinglist/:type', verifyToken, authorizeResource, orderController.packingList) 

router.get('/:orderId/print/boxsticker', verifyToken, authorizeResource, orderController.boxSticker)

router.post('/client/flatmanifest', verifyToken, orderController.flatManifestPdf)

//router.get('/:date/:clientId/print/flatmanifest', verifyToken, orderController.downloadFlatManifest)

//router.get('/:orderId/print/packinglist/:type', verifyToken, authorizeResource, orderController.packingList)

router.post('/export', verifyToken, authorizeRole(['admin']), orderController.orderExport)


router.get('/search/history', verifyToken, orderController.searchHistory) 



module.exports = router