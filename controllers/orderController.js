const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Hsn = require('../model/hsnCodeModel')
const Service = require('../model/serviceModel')
const Walkin = require('../model/walkinModel')
let debug = require('debug')('dev')
const axios = require('axios')
const mongoose = require('mongoose');
const {vendorArray, stateList, cityList, linkedVendorArray} = require('../fixedData/vendors')
const {processRequest, sortBoxItem, getDates, 
    regexUpperCase, getPrefix, getXthDay, sendOrderNotification} = require('../helpers/helpers')
const PDFdocument = require('pdfkit')
const {generateAwb} = require('../pdf/awb')
const {boxstickergenerate} = require('../pdf/boxsticker')
const {generatePackingListPdf} = require('../pdf/packinglist')
const {generateFlatManifest} = require('../pdf/flatManifest')
const {removeNextLine} = require('../pdf/pdfLibrary')
const fs = require('fs')
const { validationResult } = require('express-validator')
let stream = require('stream')
const fsPromises = require('fs').promises
const {createCanvas} = require('canvas')
var JsBarcode = require('jsbarcode')
const logger = require('../helpers/logger')
const ExcelJs = require('exceljs')
const {generatePackingList} = require('../excel/packingList')
const {generateOrderExport} = require('../excel/orderExport')


const db = mongoose.connection;

exports.orderList = async (req, res, next) => {
    try{            
        //DEFINE DEBUG FOR THIS FUNCTION//
        let debug = require('debug')('c_app:orderlist')                                      
        let orderlist

        let userId = req.user.id                
        let user = await User.findById(userId).populate('admin').populate('invoice')  
        if(user.role == 'superadmin') userId = req.params.userId //IF SUPERADMIN
        debug(user.username)   
        
        
        if(user.role == 'client'){
            orderlist = await Order.find({client: userId}).sort({bookingDate: 'desc', createdAt: 'desc'}).limit(1000)          
        }else if(user.role == 'admin' || user.role == 'superadmin'){            
            let userlist = await User.find({admin: userId}).select('username')               
            orderlist = await Order.find({client: userlist}).populate('client').sort({bookingDate: 'desc', createdAt: 'desc'}).limit(1000)            
        }

        debug(orderlist.length)

        if(!orderlist) return res.render('error', {message:'Some unknown error.Couldnt get orderlist. Please try again', statusCode: '500'})

        res.render('order/list', {orderlist, user}) 
    }catch(err){
        next(err)
    }
}

// ------------------------------------------------------------------------- //

exports.createOrderPage = async (req, res, next) => {
    try{
        
        let userId = req.user.id
        let role = req.user.role

        const user = await User.findById(userId).populate('admin').exec()
        
        const clientlist = await User.find({role: 'client', admin: userId})
        const countries = await db.collection('countries').find().toArray()
        const serviceList = await Service.find({admin: userId})

        //FIND ADMIN OF CLIENT AND GET ACCESSRIGHT OF THAT ADMIN//
        let adminUser = await User.findById(user.admin)       

        //GET LIST OF CONSIGNOR/EE FOR RESPECTIVE ADMIN/CLIENT//
        let consignorList
        let consigneeList
        let preferredVendors

        if(role=='admin'){
            consignorList = await Walkin.find({role: 'consignor', admin: userId}).select('name')
            consigneeList = await Walkin.find({role: 'consignee', admin: userId}).select('name')
            preferredVendors = user.preferredVendorList
        }else if(role=='client'){
            consignorList = await Walkin.find({role: 'consignor', client: userId}).select('name')
            consigneeList = await Walkin.find({role: 'consignee', client: userId}).select('name')
            preferredVendors = user.admin.preferredVendorList
        }
        
        
        //CONVERT SERVICENAMES TO DISPLAYNAMES//
        let displayNames = await Service.find({serviceName: user.serviceAccess})        
        displayNames = displayNames.map(item => item.displayName)
        
        res.render('order/add/primary', { 
            user, clientlist, countries, 
            serviceList, displayNames, adminUser, 
            consignorList, consigneeList,
            stateList, cityList, preferredVendors
        })
    }catch(err){
        next(err)
    }
}

exports.createOrder = async (req, res, next) => {
    try{
        //debug(req.body)
        let userId = req.user.id
        let role = req.user.role

        //GET USER DETAILS//
        let user = await User.findById(userId).populate('admin')
        
        //GET ALL CLIENTS OF AN ADMIN USER//
        let userlist

        if(role == 'admin'){
            userlist = await User.find({role: 'client', admin: userId})
            userlist = userlist.map(user => user._id)            
        }         

        //GET FORM DATA//
        let {
            bookingDate, consignor, consignorCompanyName, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, consigneeCompanyName,
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client_id, awbNumber, 
            miscClients, admin, preferredVendor
        } = req.body          
        
        //PROCESS ADDRESS//
        consigneeAddress1 = removeNextLine(consigneeAddress1)
        consigneeAddress2 = removeNextLine(consigneeAddress2)
        consignorAddress1 = removeNextLine(consignorAddress1)
        consignorAddress2 = removeNextLine(consignorAddress2)

        let isAwbAutoGenerated = false//INITIALISE AWBNUMBER AS MANUAL//

        //GENERATE UNIQUE RANDOM 7 DIGIT AWBNUMBER                
        if(!awbNumber || awbNumber.trim() == ''){
            isAwbAutoGenerated = true //SET AWBNUMBER AS AUTO//
            
            do{
                awbNumber = Math.floor(Math.random() * 10000000)
            }while(await Order.findOne({awbNumber: awbNumber}))                                    
        }else{
            //CHECK DUPLICATE FOR RESPECTIVE ADMIN, IF AWBNUMBER INPUTTED
            let checkAwb = await Order.findOne({awbNumber: awbNumber, client: userlist}) 
            if(checkAwb != null)
                return res.render('error', {message: 'AWB Number already exists!!', statusCode: '404'})                
        }
                    
     // ------------- CREATE TRACKING ACTIVITY ------------ //
        
        //get time string from bookingDate
        let time = new Date(bookingDate)
        time = time.toLocaleTimeString()

        //create tracking details array
        let trackArr = [{
            statusDate: bookingDate,
            statusTime: time,
            statusActivity: 'shipment received at hub',
            statusLocation: 'India'
        }]

        if(role=='admin' && user.settings.additionalTrackingStatus || role=='client' && user.admin.clientSettings.additionalTrackingStatus){
            let nextDate = getXthDay(bookingDate, 1)            

            let addStatus = {
                statusDate: nextDate, statusTime: '14:00', 
                statusActivity: 'shipment forwarded to destination', statusLocation: 'In Transit'              
            }

            trackArr.unshift(addStatus)
        }

        //debug(trackArr)

    // -------------- CREATE FINAL ORDER OBJECT ------------------ //        
        let obj = {
            bookingDate, awbNumber, consignor, consignorCompanyName, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, consigneeCompanyName,
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, status: 'active', client: client_id,
            trackingDetails: trackArr, apiCount:0, trackingStatus: 'SCH',
            miscClients, isAwbAutoGenerated, preferredVendor
        }

    // -------------- CREATE AND SAVE CONSIGNOR/CONSIGNEE WALKIN OBJECT IF IT DOESNT'T EXIST ------------------ // 
        let consignorwalkinlist
        let consigneewalkinlist

        //INITIALIZE GENERAL CONSIGNOR OBJ//
        let consignorObj = {
            role: 'consignor', name: consignor, companyName: consignorCompanyName, 
            contactNumber: consignorContactNumber, email: consignorEmail, address1: consignorAddress1, 
            address2: consignorAddress2, pincode: consignorPincode, city: consignorCity, 
            state: consignorState, country: origin, docType, docNumber
        }

        //INITIALIZE GENERAL CONSIGNEE OBJ//
        let consigneeObj = {
            role: 'consignee', name: consignee, companyName: consigneeCompanyName, 
            contactNumber: consigneeContactNumber, email: consigneeEmail, address1: consigneeAddress1, 
            address2: consigneeAddress2, city: consigneeCity, pincode: consigneePincode, 
            state: consigneeState, country: destination
        }

        //GET CONSIGNORWALKIN LIST OF ADMIN OR CLIENT USER//
        if(role == 'admin'){
            consignorwalkinlist = await Walkin.find({role: 'consignor', admin: userId})
            consigneewalkinlist = await Walkin.find({role: 'consignee', admin: userId})
        }else if(role == 'client'){
            consignorwalkinlist = await Walkin.find({role: 'consignor', client: client_id})
            consigneewalkinlist = await Walkin.find({role: 'consignee', client: client_id})
        }
            
        //GET CONSIGNOR/CONSIGNEE NAMES ARRAY//
        consignorwalkinlist = consignorwalkinlist.map(item => item.name)  
        consigneewalkinlist = consigneewalkinlist.map(item => item.name)          
        
        //SAVE CONSIGNOR IF NEW//
        if(consignorwalkinlist.indexOf(consignor) == -1){                        
            if(role == 'admin'){
                consignorObj.admin = admin
            }else if(role == 'client'){
                consignorObj.client = client_id
            }
            debug(consignorObj)
            const walkinConsignor = new Walkin(consignorObj)
            await walkinConsignor.save()
        }
            
        //SAVE CONSIGNOR IF NEW//                                                
        if(consigneewalkinlist.indexOf(consignee) == -1){
            if(role == 'admin'){
                consigneeObj.admin = admin
            }else if(role == 'client'){
                consigneeObj.client = client_id
            }
            debug(consigneeObj)
            const walkinConsignee = new Walkin(consigneeObj)
            await walkinConsignee.save()
        }
        
        
        const order = new Order(obj)        
        
        await order.save()
        
        res.redirect('/orders/orderlist')
    }catch(err){
        next(err)
    }
}

exports.singleOrder = async (req, res, next) => {
    try{         
        let orderId = req.params.orderId
        let userId = req.user.id

        const user = await User.findById(userId).populate('admin').exec()
        const clientlist = await User.find({role: 'client', admin: userId})
        const countries = await db.collection('countries').find().toArray()
        let order = await Order.findById(orderId).populate('client').exec()

        let preferredVendors
        if(user.role=='admin') preferredVendors = user.preferredVendorList
        if(user.role=='client') preferredVendors = user.admin.preferredVendorList
        debug(preferredVendors)
        
        res.render('order/edit', {order, user, clientlist, countries, preferredVendors})
        
    }catch(err){
        next(err)
    }
}

exports.updateOrder = async (req, res, next) => {
    try{
        let userId = req.user.id
        let role = req.user.role
        
        //GET ALL CLIENTS OF AN ADMIN USER//
        let userlist

        if(role == 'admin'){
            userlist = await User.find({role: 'client', admin: userId})
            userlist = userlist.map(user => user._id)            
        }

        //GET FORM DATA//
        let {
            bookingDate, awbNumber, hiddenAwbNumber, consignor, consignorCompanyName,
            service, consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, consigneeCompanyName,
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client_id, miscClients, preferredVendor
        } = req.body     

        //PROCESS ADDRESS//
        consigneeAddress1 = removeNextLine(consigneeAddress1)
        consigneeAddress2 = removeNextLine(consigneeAddress2)
        consignorAddress1 = removeNextLine(consignorAddress1)
        consignorAddress2 = removeNextLine(consignorAddress2)
        
        //GET ORDER ID//
        let orderId = req.params.orderId      
        
        //CHECK IF MANUAL AWB NUMBER IS EDITED AND ISN'T DUPLICATE//
        if(awbNumber && awbNumber.trim() != hiddenAwbNumber){
            let checkAwb = await Order.findOne({awbNumber: awbNumber, client: userlist}) 
            if(checkAwb != null)
                return res.render('error', {message: 'AWB Number already exists!!', statusCode: '404'}) 
        }

        let obj = {
            bookingDate, awbNumber, consignor, consignorCompanyName,
            service, consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, consigneeCompanyName,
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client: client_id, miscClients, preferredVendor
        }

        await Order.findByIdAndUpdate(orderId, obj, {new: true})
        
        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}

// ----------------------------------------------------------------------- //
exports.orderSearchPage = async (req, res, next) => {
    try{
        let userId = req.user.id                
        const user = await User.findById(userId)

        let userlist = await User.find({admin: userId}).select('username')        
        let filter = {client: userlist}
        if(user.role=='client') filter = {client: userId}        

        let awblist = await Order.find(filter).select('awbNumber destination')              
        
        res.render('order/archive', {user, awblist})
    }catch(err){
        next(err)
    }
}

exports.searchByAwb = async(req, res, next) => {
    try{        
        let userId = req.user.id        
        let userlist = await User.find({admin: userId}).select('username')

        let {param} = req.query 
                             
        let clientPop = {path: 'client', select: 'username'}        
        let orderFields = 'bookingDate awbNumber client miscClients consignor consignee origin destination numberOfBoxes chargeableWeight trackingNumber trackingStatus vendorName'
        let data = await Order.find({awbNumber: param, client: userlist}).populate(clientPop).select(orderFields)
        
        data.length == 0 ? res.json({data: 'undefined'}): res.status(200).json(data)
    }catch(err){
        next(err)
    }
}

// ----------------------------------------------------------------------- //

exports.orderExport = async(req, res, next) => {
    try{
        //GET FORM DATA//
        let {exportStart, exportEnd} = req.body        
        let {id} = req.user

        //GET DATE RANGE//
        let dateArray = getDates(new Date(exportStart), new Date(exportEnd)) 
            
        //VALIDATE DATE RANGE//
        if(dateArray.length == 0) 
            return res.render('error', {message: `Start Date cannot be after End Date`, statusCode: '400'})

        //APPLY FILTER ACCORDING TO ADMIN/CLIENT//
        //let filter = {bookingDate: dateArray, client: id}
        /* if(role == 'admin'){
            
        } */
        let userlist = await User.find({admin: id}).select('username')
        let filter = {bookingDate: dateArray, client: userlist}
        
        //GET ORDERS//
        let orders = await Order.find(filter).populate({path: 'client', select: 'username'})
        
        //VALIDATE ORDERS//
        if(orders.length == 0) return res.render('error', {message: `No Orders found for the selected Date Range`, statusCode: '400'})
        
    // ------------------------ EXCEL SECTION ------------------------- //
        const workbook = new ExcelJs.Workbook()        

        generateOrderExport(workbook, orders)

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition",`attachment; filename=orderexport_${exportStart}_${exportEnd}.xlsx`)

        return workbook.xlsx.write(res).then(function (){
            res.status(200).end();
        })

    }catch(err){
        next(err)
    }
}

// ----------------------------------------------------------------------- //

exports.patchBoxPage = async (req, res, next) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id
        
        const user = await User.findById(userId).populate('admin').exec()
        let order = await Order.findById(orderId).populate('client').exec() 

        //CREATE PKGLIST ARRAY//
        let pkgTypeArr = ['pcs', 'pkt', 'bot', 'kgs', 'pai', 'nos', 'set', 'box', 'grv']

        //GET HSN LIST IF ADDON MODULE//
        let hsnList
        if(user.role=='admin' && user.settings.autoHsn==true || user.role=='client' && user.admin.clientSettings.autoHsn==true){
            let filter = {admin: userId}
            if(user.role == 'client') filter = {admin: user.admin._id} 
            hsnList = await Hsn.find(filter)
        }else{
            hsnList = []
        }
        
        let renderObj = {user, order, pkgTypeArr, hsnList}

        res.render('order/add/box', renderObj)

    }catch(err){
        next(err)
    }
}

exports.patchBox = async (req, res, next) => {
    try{
        let { 
            boxType, boxLength, boxWidth, boxHeight, 
            volumetricWeight, actualWeight, 
            boxNumber, itemType, itemName, hsnCode,
            itemQuantity, packagingType, itemPrice, 
            chargeableWeight, currency, totalValue, invoiceType
        } = req.body      
        //res.json(req.body)                    

        //CHECK IF TOTAL VALUE IS COMING FROM FORM//
        totalValue ? totalValue = parseFloat(totalValue) : totalValue = 0
        

        let numberOfBoxes
        
        let orderId = req.params.orderId
        let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        let user = await User.findById(userId)

    // ----------------- VALIDATE INVOICE TOTAL VALUE FOR EPS-------------------- //
        if(user.username=='eps'){
            let invoiceTotal = totalValue
            if(currency != 'INR'){
                invoiceTotal = await getExchange(currency, totalValue)            
            }
            
            if(invoiceTotal > 24000){
                let alert = [{msg: 'Invoice Total cannot exceed 24000 INR!!'}]
                return res.render('order/add/box', {user, order, alert})
            }
        }        

    // ------------------------------ PROCESS ORDER ------------------------------ //
        
        let itemArr = []; let boxArr = [];

        let itemValArr = [boxNumber, itemType, itemName, hsnCode, itemQuantity, packagingType, itemPrice]
        let itemKeyArr = ['boxNumber', 'itemType', 'itemName', 'hsnCode', 'itemQuantity', 'packagingType', 'itemPrice']
        
        let boxValArr = [boxLength, boxWidth, boxHeight, volumetricWeight, actualWeight]
        let boxKeyArr = ['boxLength', 'boxWidth', 'boxHeight', 'volumetricWeight', 'actualWeight']
        
        //PROCESS ITEMS//
        if(Array.isArray(itemType)){            
            itemArr = processRequest(itemValArr, itemKeyArr, itemType.length)
        }else{
            itemArr = processSingleRow(itemValArr, itemKeyArr)            
        }        
               
        //PROCESS BOX//        
        if(Array.isArray(boxLength)){
            boxArr = processRequest(boxValArr, boxKeyArr, boxLength.length)
            numberOfBoxes = boxLength.length
        }else{
            boxArr = processSingleRow(boxValArr, boxKeyArr)
            numberOfBoxes = 1
        }
        //debug(boxArr)

        boxArr = sortBoxItem(boxArr, itemArr, numberOfBoxes)                  

        let obj = { numberOfBoxes, boxType, boxDetails: boxArr,
            chargeableWeight, currency, totalValue, invoiceType }
        
        await Order.findByIdAndUpdate(orderId, obj, {new: true})
    
        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}

exports.hsnListPage = async(req, res, next) => {
    try{
        //THE HSN LIST IS COMMON FOR ADMIN AND ITS CLIENTS//
        let userId = req.user.id //GET USER ID//
        let user = await User.findById(userId).populate('admin').exec()
        
        //IF USER IS CLIENT GET ADMIN ID OF THAT CLIENT//
        let filter = {admin: userId}
        if(user.role == 'client') filter = {admin: user.admin._id} 
        let hsnList = await Hsn.find(filter)

        res.render('order/hsn/list', {user, hsnList})
    }catch(err){
        next(err)
    }
}

exports.addHsn = async(req, res, next) => {
    try{
        let {item, hsnCode} = req.body                
        
        let userId = req.user.id
        let user = await User.findById(userId).populate('admin').exec()

        //CHECK IF DUPLICATE ITEM//
        let filter = {admin: userId}
        if(user.role == 'client') filter = {admin: user.admin._id} 
        let hsnList = await Hsn.find(filter)
        let hsnListArr = hsnList.map(elem => elem.item)

        let checkArr = regexUpperCase(hsnListArr, item)
        if (checkArr.indexOf(true) != -1)
            return res.render('error', {message:'Item Already Exists', statusCode: '404'})
        

        //GET ADMIN ID//
        let admin = userId
        if(user.role == 'client') admin = user.admin._id

        //SAVE TO DB//
        let hsn = new Hsn({item, hsnCode, admin})        
        await hsn.save()

        res.redirect('/orders/hsn/list')
    }catch(err){
        next(err)
    }
}

exports.hsnEditPage = async(req, res, next) => {
    try{
        let userId = req.user.id
        let user = await User.findById(userId).populate('admin').exec()

        let {hsnId} = req.params

        let hsn = await Hsn.findById(hsnId)

        res.render('order/hsn/edit', {user, hsn})
    }catch(err){
        next(err)
    }
}

exports.editHsn = async(req, res, next) => {
    try{
        let {item, hiddenItem, hsnCode} = req.body
        let {hsnId} = req.params

        let userId = req.user.id
        let user = await User.findById(userId).populate('admin').exec()

        //IF NEW VALUE ENTERED//
        if(hiddenItem != item){
            //CHECK IF DUPLICATE ITEM//
            let filter = {admin: userId}
            
            let hsnList = await Hsn.find(filter)
            let hsnListArr = hsnList.map(elem => elem.item)

            let checkArr = regexUpperCase(hsnListArr, item)
            if (checkArr.indexOf(true) != -1)
                return res.render('error', {message:'Item Already Exists', statusCode: '404'})
        }

        //SAVE TO DB//         
        let updateObj = {item, hsnCode}
        await Hsn.findByIdAndUpdate(hsnId, updateObj)

        res.redirect('/orders/hsn/list')        
    }catch(err){
        next(err)
    }
}

exports.getHsnList = async(req, res, next) => {
    try{
        let userId = req.user.id //GET USER ID//
        let user = await User.findById(userId).populate('admin').exec()
        
        //IF USER IS CLIENT GET ADMIN ID OF THAT CLIENT//
        let filter = {admin: userId}
        if(user.role == 'client') filter = {admin: user.admin._id} 
        let hsnList = await Hsn.find(filter)

        res.json(hsnList)
    }catch(err){
        next(err)
    }
}

exports.getHsnCode = async(req, res, next) => {
    try{
        let{itemId} = req.params //GET ITEM FROM AJAX//

        let userId = req.user.id //GET USER ID//
        let user = await User.findById(userId).populate('admin').exec()
        
        //IF USER IS CLIENT GET ADMIN ID OF THAT CLIENT//
        let filter = {admin: userId, item: itemId}
        if(user.role == 'client') filter = {admin: user.admin._id, item: itemId} 
        let hsn = await Hsn.findOne(filter).select('hsnCode')        
        debug(hsn)
        
        //RESPONSE TO AJAX//
        !hsn ? res.json({hsnCode:null}): res.json({hsnCode: hsn.hsnCode})
    }catch(err){
        next(err)
    }
}

// ---------------------------------------------------------------------- //

exports.patchTrackPage = async (req, res, next) => {
    try{
        let debug = require('debug')('c_app: patchTrackPage')
        let orderId = req.params.orderId
        let userId = req.user.id        

        const user = await User.findById(userId)
        let order = await Order.findById(orderId).populate('client').exec()
        
        let apiVendors = vendorArray.slice(1)
        let linkedVendors = linkedVendorArray.slice(1)

        let coforwarders = user.coforwarderList
        //debug(coforwarders)
        res.render('order/add/track', {user, order, apiVendors, linkedVendors, coforwarders})
        
    }catch(err){
        next(err)
    }
}

exports.patchTrack = async (req, res, next) => {
    try{
        //INITIALISE DEBUG FOR THIS FUNCTION//
        let debug = require('debug')('c_app: shipwayTracking')

        // get all inputs
        let { awbNumber, trackingType, trackingNumber, vendorId, coforwarder, 
            coforwarderAwb, clientNote, selfNote } = req.body                    

        let orderId = req.params.orderId 
        let userId = req.user.id       
        
        let apiCount
        let apiCredit

        let user = await User.findById(userId).select('apiCredit trackingId')   
        
        //GET VENDOR NAME//
        let vendorName     
        trackingType=='shipway'? vendorName = getVendorName(vendorArray, vendorId) : vendorName = getVendorName(linkedVendorArray, vendorId)                
        debug(vendorName, vendorId, trackingType)

        let order = await Order.findById(orderId)
        /* if(vendorName != 'OTHERS' ){
            if(order.trackingNumber != trackingNumber || order.vendorName != vendorName){
                debug('increment')
            }            
        }else{
            debug('no increment')
        } */

        //if vendorName is others then don't increment else
        //check if new tracking number or new vendorName, then increment
        if(vendorName != 'OTHERS' && trackingType=='shipway'){
            if(order.trackingNumber != trackingNumber || order.vendorName != vendorName){
                //CREATE PREFIXED TRACKING NUMBER TO AVOID DUPLICATES//
                let order_id = `${user.trackingId}${awbNumber}`                

                //CREATE POSTDATA FOR SHIPWAY//
                let postData = {
                    "username":"adinr4",
                    "password":"be57b1d8cbcf5c9cd7fe3d8011233985",
                    "carrier_id":vendorId,
                    "awb": trackingNumber,
                    "order_id": order_id,
                    "first_name":"N/A",
                    "last_name":"N/A",
                    "email":"N/A",
                    "phone":"N/A",
                    "products":"N/A",
                    "company":"N/A",
                    "shipment_type":"1"
                }                
    
                let response = await axios.post('https://shipway.in/api/PushOrderData', postData)
                
                if(response.data.status == 'Success'){                    
                    apiCount = order.apiCount + 1 //increment API count                    
                    apiCredit = user.apiCredit - 1 //decrement user API credit
                }else{
                    return res.render('error', {message:'Unknown API Error!! Contact Developer', statusCode: '400'})
                }
            }            
        }                     

        let obj = { trackingNumber, apiCount, vendorId, vendorName, coforwarder, 
            coforwarderAwb, clientNote, selfNote }  
            
        let userObj = { apiCredit }

        await Order.findByIdAndUpdate(orderId, obj, {new: true})
        await User.findByIdAndUpdate(userId, userObj, {new: true})                

        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}


exports.trackDetails = async(req, res, next) => {
    try{        
        let debug = require('debug')('c_app: trackDetails')
        
    // --------- GET ORDER MANUAL TRACKING DATA FROM DATABASE ----------------- //
        let {trackingNumber, user} = req.query        
        
        //GET CLIENT LIST TO AVOID DUPLICATE TRACKING NUMBER ISSUE//
        let adminUser = await User.findOne({username: user}).select('trackingId trackingType')   
        
        userlist = await User.find({role: 'client', admin: adminUser})                        
        userlist = userlist.map(user => user._id)          

        //FILTER OUT THE UNIQUE TRACKING NUMBER FOR RESPECTIVE ADMIN//
        let order = await Order.findOne({awbNumber: trackingNumber, client: userlist}).populate('client')        
        
        if(order == null) return res.json({status: 'fail'})

    // -------- GET TRACKING DATA FROM API IF VENDOR ID EXISTS -------------------- //
    
        if(order.vendorId && order.vendorId != 0){   
            //CHECK FOR SHIPWAY AND SHIPWAY VENDOR ID, ELSE GO TO LINKED | adminUser.trackingType=='linked' || adminUser.trackingType=='shipway' &&  //                  
            if(linkedVendorArray.map(item => item.id).indexOf(order.vendorId) == -1){
                //debug('shipway tracking')
                let excludeArr = ['914653', '9146530', '920193', '557740445', '1614352', '3779137', '3734458', '4570177', '3106960',
                '527471', '3981373', '3431059', '3250406', '6172115', '8265503']
            
                let order_id = trackingNumber
                
                if(excludeArr.indexOf(trackingNumber) == -1)
                    order_id = `${adminUser.trackingId}${trackingNumber}`                        
                
                let postData = {
                    "username":"adinr4",
                    "password":"be57b1d8cbcf5c9cd7fe3d8011233985",
                    "order_id": order_id
                }
                let response = await axios.post('https://shipway.in/api/getOrderShipmentDetails', postData)

                //debug(response.data)

                if(response.data.status == "Success"){            
                    let apiData = response.data.response
                    let currentStatus = apiData.current_status
                    //process api scan items and push to order tracking details object
                    if(apiData.scan){
                        apiData.scan.slice().reverse().forEach(item => {
                            let obj = {} // initiate blank obj
                            
                            let d = item.time.split(' ')[0] //get date from item.time
                            let t = item.time.split(' ')[1] // get time from item.time
                            obj.statusDate = d 
                            obj.statusTime = t
                            obj.statusLocation = item.location
                            obj.statusActivity = item.status_detail
        
                            order.trackingDetails.unshift(obj)
                        })
                    }
                    
                    order.trackingStatus = apiData.current_status_code //GET LATEST STATUS CODE//

                    //UPDATE ORDER TRACKING STATUS CODE TO DB//
                    let updateObj = {trackingStatus: order.trackingStatus}
                    await Order.findByIdAndUpdate(order._id, updateObj)
                                    
                    //SEND RESPONSE OBJECT TO AJAX REQUEST//
                    res.status(200).json({order, currentStatus, status:'Success'})            
                }else{                
                    res.json({status: 'fail'})
                }
            }else if(linkedVendorArray.map(item => item.id).includes(order.vendorId)){
                //debug('linked tracking')
                let link = getLink(order)
                res.status(200).json({order, link, status:'Success'})
            }
        }else{
            res.status(200).json({order, status:'Success'})
        }
        
    }catch(err){
        next(err)
    }
}

// ---------------------------------------------------------------------- //

exports.manualTrackingPage = async(req, res, next) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id        

        const user = await User.findById(userId)
        let order = await Order.findById(orderId).populate('client').exec()              
        
        res.render('order/track', {user, order})            
        
    }catch(err){
        next(err)
    }
}

exports.patchManualTracking = async (req, res, next) => {
    try{
        //debug(req.body)
        let { statusDate, statusTime, statusLocation, statusActivity, trackingStatus } = req.body

        //debug(typeof statusDate, typeof statusTime, typeof  statusLocation)
        let orderId = req.params.orderId            

        let trackingDetailsArr = []

        if(statusDate && statusTime && statusLocation && statusActivity){
            let newStatusDate = []

            let arr = [6, 7, 8, 9, 2, 3, 4, 5, 0, 1]

            for(let i = 0; i < statusDate.length; i ++){
                let b = ''
                for(let j = 0; j < statusDate[i].length; j++){
                    b += statusDate[i][arr[j]]
                }
                newStatusDate.push(b)
            }

            trackingDetailsArr = processRequest([newStatusDate, statusTime, statusLocation, statusActivity], 
                ['statusDate', 'statusTime', 'statusLocation', 'statusActivity'], statusDate.length)
        }

        let obj = { 
            trackingDetails : trackingDetailsArr.slice().reverse(),
            trackingStatus 
        }

        //res.json(obj)
        
        await Order.findByIdAndUpdate(orderId, obj, {new: true})        

        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}

// ----------------------------------------------------------------------- //

exports.patchBillPage = async (req, res) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id        

        const user = await User.findById(userId)
        let order = await Order.findById(orderId).populate('client').exec()              

        res.render('order/add/bill', {user, order})            
        
    }catch(err){
        next(err)
    }
}

exports.patchBill = async (req, res, next) => {
    try{
        //res.json(req.body)
        let debug = require('debug')('c_app: patchBill')
        let orderId = req.params.orderId

        let {baseRate, brGst, fuelSurcharge, fsGst, title, amount, gst, totalBill} = req.body

        //GET CLIENT EMAIL AND AWB NUMBER
        const clientInfo = await Order.findById(orderId).select('client awbNumber').populate({path: 'client', select: 'email contactName'}) 
        
        let { client : { email, contactName }, awbNumber } = clientInfo       
        if(email == '') email = 'hello@pebbletech.in'
        if(contactName == '') contactName = 'Shipper'

        const receiver = [email]                        

        //CREATE EMAIL NOTIF SUBJECT AND TEXT
        const subject = `Bill Updation Notification`
        const html = `<p>Dear ${contactName}</p><br>
            <p>Bill for AWB No: ${awbNumber} has been computed. The amount is ${totalBill}</p>`

        debug(html)

        let chargeArr = []        

        if(Array.isArray(title)){            
            chargeArr = processRequest([title, amount, gst], 
                ['title', 'amount', 'gst'], title.length)
        }else if(title && amount && gst){
            chargeArr = [{ 'title': title, 'amount': amount, 'gst': gst}]
        }

        let patchObj = {baseRate, brGst, fuelSurcharge, fsGst, chargeDetails: chargeArr, totalBill}

        //res.json(patchObj)

        await Order.findByIdAndUpdate(orderId, patchObj)

        //await sendOrderNotification(receiver, subject, html)

        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}

exports.deleteOrder = async (req, res, next) => {
    try{

        let debug = require('debug')('c_app: deleteOrder')    
        
        let id = req.params.orderId              
        
        await Order.findByIdAndDelete(id)
        res.status(200).json({msg: 'success'})

    }catch(err){
        next(err)
    }
}

exports.sendWhatsappNotification = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: sendWhatsappNotificaton')

        const userId = req.user.id        
        const orderId = req.params.orderId

        //GET ORDER INFO
        const fields = 'awbNumber preferredVendor trackingNumber consignor consignee destination totalBill client'
        const orderInfo = await Order.findById(orderId).select(fields).populate({path: 'client', select: 'contactNumber username'})                
        
        //CHECK TRACKING NUMBER AND TOTAL BILL
        if(!orderInfo.trackingNumber || !orderInfo.totalBill)
            return res.render('error', {message: `Tracking number or Total Bill not added. Please add before sending whatsapp notification`, statusCode: '400'})

        //DESTRUCTURE
        const {awbNumber, preferredVendor, trackingNumber, consignor, consignee, destination, totalBill, client} = orderInfo

        //CHECK CLIENT EMAIL AND MISCELLANEOUS USER
        let { contactNumber, username } = client     

        if(username == 'Miscellaneous') contactNumber = consignorContactNumber
        if(contactNumber == '') return res.render('error', {message: `Contact Number not present. Kindly enter Contact Number`, statusCode: '400'})
        
        //email = 'hello@pebbletech.in' 
        
        debug(contactNumber)

        //GET ADMIN INFO
        let adminInfo = await User.findById(userId).select('waSignature emailCompanyText')
        let {waSignature, emailCompanyText} = adminInfo
        //waSignature = waSignature.split('').join("")          

        //CREATE EMAIL CONTENT
        let content = `Hi,
        Your order ${awbNumber} is ready for dispatch through ${preferredVendor} with forwarding No ${trackingNumber} from ${emailCompanyText} - ${consignor} TO  ${consignee}
        
        FOR ${destination}
        
        Here is your receipt.
        
        Total Courier Amount: Rs. ${totalBill}/- 
        
        ${waSignature}`

        let urlEncoded = encodeURI(content)
        
        res.redirect(`https://api.whatsapp.com/send?phone=${contactNumber}&text=${urlEncoded}`)
    }catch(err){
        next(err)
    }    
}

exports.sendEmailNotification = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: sendEmailNotificaton')

        const userId = req.user.id
        const orderId = req.params.orderId

        //GET ORDER INFO
        const fields = 'awbNumber preferredVendor trackingNumber consignor consignee destination totalBill client consignorEmail'
        const orderInfo = await Order.findById(orderId).select(fields).populate({path: 'client', select: 'email username'})        
        debug(orderInfo)
        
        //CHECK TRACKING NUMBER AND TOTAL BILL
        if(!orderInfo.trackingNumber || !orderInfo.totalBill)
            return res.render('error', {message: `Tracking number or Total Bill not added. Please add before sending email notification`, statusCode: '400'})

        //DESTRUCTURE
        const {awbNumber, preferredVendor, trackingNumber, consignor, consignee, destination, totalBill, client, consignorEmail} = orderInfo

        //CHECK CLIENT EMAIL AND MISCELLANEOUS USER
        let { email, username } = client       
        
        if(username == 'Miscellaneous') email = consignorEmail
        if(email == '') return res.render('error', {message: `Email not present. Kindly enter Email`, statusCode: '400'})
        
        //email = 'hello@pebbletech.in' 
        
        debug(email)
        
        //GET ADMIN INFO
        let adminInfo = await User.findById(userId).select('signature emailCompanyText senderEmail senderPassword')
        let {signature, emailCompanyText, senderEmail, senderPassword} = adminInfo
        signature = signature.split('//').join("")        
                
        //CREATE EMAIL CONTENT
        const content = `<p>Hi,</p>
        <p>Your order <b>${awbNumber}</b> is ready for dispatch through ${preferredVendor} with forwarding No ${trackingNumber} 
        from <b>${emailCompanyText}</b> - <b>${consignor} TO  ${consignee}</b></p>
        <p>FOR <b>${destination}</b></p>
        <p>Here is your receipt.</p>
        <p><b>Total Courier Amount: Rs. ${totalBill}/- </b></p>`

        //APPEND SIGNATURE
        const html = `${content}${signature}`
        //debug(html)        

        const receiver = [email] 
        const subject = 'Order Booking Notification'    
        // const user = "infoexpic@gmail.com"
        // const pass = "ghxugykcmuqjntcl"   

        await sendOrderNotification(senderEmail, senderPassword, receiver, subject, html)

        res.status(200).render('success', {message: `Email Sent Successfully`, statusCode: '200'})

    }catch(err){
        next(err)
    }
}

exports.invoiceStatus = async (req, res, next) => {
    try{
        let debug = require('debug')('c_app: invoiceStatus')
        
        let { invoiceFlag, orderId } = req.body
        
        let response = await Order.findByIdAndUpdate(orderId, {invoiceFlag}, {new: true})
        
        res.status(200).json({status: 200})
        
    }catch(err){
        next(err)
    }
}

exports.searchHistory = async(req, res, next) => {
    //debug(req.query)    
    let userId = req.user.id //GET USER ID//
    let role = req.user.role //GET USER ROLE//
    let{start, end} = req.query //GET FILTER DATES//
    
    let dateArray = getDates(new Date(start), new Date(end)) //GET ARRAY OF DATE RANGE//    

    //INITIALISE FILTERED ORDER VARIABLE//
    let filteredOrders

    //GET FILTERED ORDERS FOR CLIENT USER//
    filteredOrders = await Order.find({bookingDate: dateArray, client: userId}).select('bookingDate trackingStatus')

    //GET FILTERED ORDERS FOR ADMIN USER//
    if(role == 'admin'){
        filteredOrders = await Order.find({bookingDate: dateArray}).populate('client').select('bookingDate trackingStatus')
        filteredOrders = filteredOrders.filter(elem => elem.client.admin == userId)
    }  
    
    let totFilteredOrders = filteredOrders.length //GET COUNT OF FILTERED ORDERS//
    
    //GET DATEWISE COUNT FOR FILTERED ORDERS//    
    let histArr = dateArray.map(date => {
        let count = 0        
        for(let i = 0; i < filteredOrders.length; i++){ 
            //debug(orders[i].bookingDate, date)                       
            if(JSON.stringify(filteredOrders[i].bookingDate) == JSON.stringify(date)){
                count++
            }
            //console.log(count)
        }
        return count
    })

//--------------- GET STATUSWISE COUNT FOR FILTERED ORDERS---------------------//
    let statusArr = filteredOrders.map(order => order.trackingStatus) //GET STATUS CODE OF FILTERED ORDERS//

    //ARRAY OF STATUS CODE//
    let intArr = ['INT', 'PKP', 'OOD', 'DNB']
    let isuArr = ['UND', 'CAN', 'ONH', 'NWI', 'NFI', 'ODA', 'OTH', 'SMD', 'CRTA', 'CNA', 'DEX', 'DRE', 'PNR', 'LOST', 'PKF', 'PCAN']
    let rtnArr = ['RTO', 'RTD', 'RCAN', 'RCLO', 'RDEL', 'RINT', 'ROOP', 'RPKP', 'RPSH', 'RSMD', 'RSCH']
    
    //INITIALISE COUNT VARIBALES FOR RESPECTIVE STATUS//
    let schStat = 0; let intStat = 0; let delStat = 0; let rtnStat = 0; let infoStat = 0; let isuStat = 0

    //GET COUNT FOR EACH STATUS//
    statusArr.forEach(status => {
        if(status == 'SCH'){
            schStat++
        }else if(status == 'DEL'){
            delStat++
        }else if(intArr.indexOf(status) != -1){
            intStat++
        }else if(isuArr.indexOf(status) != -1){
            isuStat++
        }else if(rtnArr.indexOf(status) != -1){
            rtnStat++
        }else{
            infoStat++
        }         
    })
        
    let statusObj = {schStat, delStat, intStat, isuStat, rtnStat, infoStat}
    
    let data = {dateArray, histArr, totFilteredOrders, statusObj} //POPULATE RESPONSE DATA OBJECT    
    
    res.status(200).json(data) //SEND RESPONSE TO AJAX REQUEST
}


// ----------------------------------------------------------------------- //

exports.printawb = async(req, res, next) => {
    try{              
        let debug = require('debug')('c_app: printawb')

        let orderId = req.params.orderId
        let userId = req.user.id
        let consignee = req.params.consigneeId //FLAG FOR CONSIGNEE COPY//
        let consignor = req.params.consignorId //FLAG FOR CONSIGNEE COPY//
        debug(consignee, consignor)
        let order = await Order.findById(orderId).populate('client').exec()
        let user = await User.findById(userId).populate('admin').exec()

    // ---------------------- CHECK IF BOX DETAILS ADDED --------------------------- //
        if(order.boxDetails.length == 0){            
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        }

    // ---------------------- INITIALIZE PDF --------------------------- //
        const doc = new PDFdocument({ 
            size:'A4',
            autoFirstPage: false
          })             

    // ---------------------- GENERATE BARCODE --------------------------- //      
        const canvas = createCanvas()
        const context = canvas.getContext('2d')

        JsBarcode(canvas, order.awbNumber)
        
        canvas.toBuffer((err, buffer) => {
            if(err) next(err)            
            fs.writeFile(`awb_${order.awbNumber}.png`, buffer, callback)
        })

    // ---------------------- CALLBACK TO GENERATE PDF --------------------------- //
        function callback(){
            let fileName
            if(consignee || consignor){
                fileName = `awb_consignee_${order.awbNumber}.pdf` 
                if(consignor) fileName = `awb_consignor_${order.awbNumber}.pdf`              
                doc.addPage()                
                consignee ? generateAwb(doc, order, user, true, false) : generateAwb(doc, order, user, false, true)
                
            }else{
                fileName = `awb_acc_consignor_${order.awbNumber}.pdf`
                doc.addPage()
                generateAwb(doc, order, user, false, false)
            }                        

            res.setHeader('Content-type', 'application/pdf')
            res.set({ 'Content-Disposition': `inline; filename=${fileName}` })
            
            stream = doc.pipe(res) 
            doc.end()

            stream.on('finish', () => {
                fs.unlink(`awb_${order.awbNumber}.png`, (err) => { if(err) return next(err) })
            })                           

            /* if(user.role=='admin' && user.settings.awbPrintBranding || user.role=='client'&& user.admin.clientSettings.awbPrintBranding){
                    debug('starting to unlink logo')
                    //GET FILE PREFIX//
                    let filePrefix = user.trackingId
                    if(user.role=='client') filePrefix = user.admin.trackingId

                    fs.unlink(`${filePrefix}-logo.png`, (err) => {
                        if(err) return next(err)
                    })
                } */
                        
        }                
    }catch(err){
        next(err)
    }
}

/* exports.getLogo = async(req, res, next) => {
    try{
        debug('entered get Logo')
        let userId = req.user.id
        let user = await User.findById(userId).populate({path:'admin'}).exec()
        // --------------------- GET LOGO IF ADDON ENABLED ----------------- //
        if(user.role=='admin' && user.settings.awbPrintBranding || user.role=='client'&& user.admin.clientSettings.awbPrintBranding){
            debug('starting to get logo')
            //GET LOGO PATH AND FILE PREFIX ACCORDING TO USER ROLE//
            let logoPath = user.logo
            let filePrefix = user.trackingId
            if(user.role=='client'){
                logoPath = user.admin.logo
                filePrefix = user.admin.trackingId
            } 

            let response = await axios({
                url: logoPath,
                method: 'get',
                responseType: 'stream'
            })  

            let fileName = `${filePrefix}-logo.png`
    
            response.data.pipe(fs.createWriteStream(fileName))
            .on('error', (err) => next(err))
            .once('finish', next)
        }else{
            next()
        }    
        
    }catch(err){
        next(err)
    }
} */

exports.packingList = async(req, res, next) => {
    try{        
        let debug = require('debug')('c_app: packingList')
        let {orderId, type} = req.params

        let order = await Order.findById(orderId).populate('client').exec() 
        
        const commons = await db.collection('commons').find().toArray()  
        console.log(commons)      
        
        //GET USER
        let userId = req.user.id
        let user = await User.findById(userId).populate('admin').select('role settings clientSettings')
        debug(user)
        //CHECK IF BOXDETAILS ADDED//
        if(order.boxDetails.length == 0)            
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        
        
    // ---------------------------- GET ARRAYS OF EACH TABLE COLUMN --------------- //      
      
        let boxArr = []
        let itemArr = []
        let totArr = []
        order.boxDetails.forEach((box,i) => {
            let boxInfo = `Box ${i+1}(${box.boxLength}x${box.boxWidth}x${box.boxHeight}) Act. Wt. ${box.actualWeight}`
            if(user.role=='admin' && user.settings.packingListBoxNo || user.role=='client' && user.admin.clientSettings.packingListBoxNo)
                boxInfo = `Box ${i+1}`
            boxArr.push(boxInfo)
            if(order.boxDetails.length > 1) boxArr.push(' ') //PUSH BLANK ENTRY IN BETWEEN NEW BOXES//
            box.itemDetails.forEach((item,j) => {
                if(j > 0) boxArr.push('')
                itemArr.push(item)
                totArr.push((item.itemQuantity * item.itemPrice).toFixed(2))
            })  
            //PUSH BLANK ENTRY IN BETWEEN NEW BOXES//
            if(order.boxDetails.length > 1){
                let blankObj = {boxNumber: ' ', itemType: ' ', itemName: ' ', hsnCode: ' ', itemQuantity: ' ', packagingType: ' ', itemPrice: ' '}
                itemArr.push(blankObj)      
                totArr.push(' ')
            }            
        })

        if(type == 'excel'){
            let workbook = new ExcelJs.Workbook() 
            
            //generatePackingList(workbook, order, compData)
            generatePackingList(workbook, order, itemArr, boxArr, totArr, commons)

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            res.setHeader("Content-Disposition",`attachment; filename=packinglist_${order.awbNumber}.xlsx`)

            return workbook.xlsx.write(res).then(function (){
                res.status(200).end();
            })
        }else if(type == 'pdf'){
            //PDF INITIALIZATION//
            const doc = new PDFdocument({  
                size: 'A4',
                autoFirstPage: false    
            })

            generatePackingListPdf(doc, order, itemArr, boxArr, totArr, commons)

            res.setHeader('Content-type', 'application/pdf')
            res.set({ 'Content-Disposition': `inline; filename=packinglist_${order.awbNumber}.pdf` })
            
            doc.pipe(res)                                              
            doc.end()

        }                

    }catch(err){
        next(err)
    }
}

/* exports.excelPackingList = async(req, res, next) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        let boxDetails = order.boxDetails

        //CHECK IF BOX DETAILS ADDED//
        if(boxDetails.length == 0)            
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        
    // ---------------------- CALCULATE VALUES --------------------- //
        let itemArray = []
        let qtyArray = []
        let priceArray = []
        let lengthArray = [0]
        let boxNumberArray = ['Box1']
        let dimensionArray = [`(${boxDetails[0].boxLength}x${boxDetails[0].boxWidth}x${boxDetails[0].boxHeight})`]             
        
        boxDetails.forEach(box => {
            lengthArray.push(box.itemDetails.length)
            box.itemDetails.forEach(item => {
                itemArray.push(item.itemName)
                qtyArray.push(item.itemQuantity)
                priceArray.push(item.itemPrice)                   
            })        
        })

        let totalitems = itemArray.length
        let totalArray = qtyArray.map((elem,i) => (elem * priceArray[i]).toFixed(1))      

        //BOX NUMBER ARRAY COMPUTATION//
        lengthArray.pop()
        
        let count = 2

        lengthArray.forEach(item => {
            for(let i = 1; i <= item; i++){
                if(item != i){
                    boxNumberArray.push('')
                    dimensionArray.push('')                    
                }else{
                    boxNumberArray.push(`Box${count}`)            
                    dimensionArray.push(`(${boxDetails[count-1].boxLength}x${boxDetails[count-1].boxWidth}x${boxDetails[count-1].boxHeight})`)                    
                    count++
                }
            }
        })
        
        let compData = {itemArray, qtyArray, priceArray, boxNumberArray, dimensionArray, totalArray}

    // ------------------------ EXCEL SECTION ------------------------- //
        const workbook = new ExcelJs.Workbook()        

        generatePackingList(workbook, order, compData)

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition",`attachment; filename=packinglist_${order.awbNumber}.xlsx`)

        return workbook.xlsx.write(res).then(function (){
            res.status(200).end();
        })

    }catch(err){
        next(err)
    }
} */

exports.boxSticker = async(req, res, next) => {
    try{        
        let orderId = req.params.orderId
        let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        let user = await User.findById(userId)        

    // ---------------------- CHECK IF BOX DETAILS ADDED --------------------------- //
        if(order.boxDetails.length == 0){            
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        }

    // ---------------------- INITIALIZE PDF --------------------------- //
        const doc = new PDFdocument({
            size:'A4',
            autoFirstPage: false
          })

    // ---------------------- GENERATE BARCODE --------------------------- //  
        const canvas = createCanvas()
        const context = canvas.getContext('2d')

        JsBarcode(canvas, order.awbNumber)
        
        canvas.toBuffer((err, buffer) => {            
            if(err) next(err)            
            fs.writeFile(`box_${order.awbNumber}.png`, buffer, callback)
        })        
        
        function callback(){                                    
            boxstickergenerate(doc, order, user)
            
            res.setHeader('Content-type', 'application/pdf')
            res.set({ 'Content-Disposition': `inline; filename=boxsticker_${order.awbNumber}.pdf` })
            
            stream = doc.pipe(res)                                                      
            doc.end()                      
            
            stream.on('finish', () => {            
                fs.unlink(`box_${order.awbNumber}.png`, (err) => { if(err) next(err) })
            })
        }        

    }catch(err){
        next(err)
    }
}

exports.flatManifestPdf = async(req, res, next) => {
    try{
        //res.json(req.query)
        debug(req.body)
        let {manifestDate, client} = req.body //gET FORM DATA//     

        //GET FILTERED ORDERLIST//
        let orderFields = 'awbNumber consignee chargeableWeight destination numberOfBoxes'
        let orderlist = await Order.find({bookingDate:manifestDate, client}).select(orderFields)
        
        //CHECK IF ORDER EXISTS FOR GIVEN DATE//
        if(orderlist.length == 0)
            return res.render('error', {message:'No Order exists for the inputted date!!', statusCode: '400'})
        
        //CHECK IF BOX DETAILS ADDED//
        let boxesArr = orderlist.map(order => order.numberOfBoxes)           
        if(boxesArr.includes(undefined)) 
            return res.render('error', {message:'Some Orders are missing Box Details. Kindly add Box details!!', statusCode: '400'})

    // -------------- PDF SECTION --------------------- //
        let user = await User.findById(client).populate({path:'admin', select:'displayName'}).select('username')

        //INITIALIZE PDF//
        const doc = new PDFdocument({    
            size: 'A4',         
            autoFirstPage: false
        })

        //PDF CONTENTS//
        generateFlatManifest(doc, orderlist, user, manifestDate)        
        
        //SAVE TO FILE AND SEND RESPONSE TO AJAX//
        stream = doc.pipe(fs.createWriteStream(`flatmanifest_${user.username}_${manifestDate}.pdf`))                                  
        stream.on('finish', () => {
            res.download(`flatmanifest_${user.username}_${manifestDate}.pdf`, (err) => {
                if(err) next(err)
                fs.unlink(`flatmanifest_${user.username}_${manifestDate}.pdf`, (err) => {
                    if(err) next(err)
                    debug('pdf file removed')
                })
            })
        })         

        //END PDF//
        doc.end()
        
    }catch(err){
        next(err)
    }
}


async function getExchange(currency, amount){
    try{
        let response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`)
        let exchangeRate = response.data.rates.INR
        debug(currency, exchangeRate)
        return amount * exchangeRate        
    }catch(err){
        debug(err)
    }
}

function processSingleRow(valArr, keyArr){    
    let arr = []
    let obj = {}
    keyArr.forEach((item,i) => obj[item] = valArr[i])
    
    arr.push(obj)
    return arr
}

function getLink(obj){
    if(obj.vendorId == '4') return `https://www.fedex.com/fedextrack/?trknbr=${obj.trackingNumber}`
    if(obj.vendorId == '3') return `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${obj.trackingNumber}`
    //if(obj.vendorId == '8') return `https://www.dpd.co.uk/apps/tracking/?parcel=${obj.trackingNumber}*19857&geoSession=83e5e9d7-31b8-4c88-99ce-fc9af393d895&search`
    if(obj.vendorId=='8' || obj.vendorId=='9') return `https://www.dpdgroup.com/nl/mydpd/my-parcels/track?lang=en&parcelNumber=${obj.trackingNumber}`
    if(obj.vendorId=='10') return `https://www.dpd.com/de/en/empfangen/sendungsverfolgung-und-live-tracking/`
    if(obj.vendorId=='13') return `https://www.ups.com/track?loc=en_US&requester=ST/`
    if(obj.vendorId=='14') return `https://markexpress.co.in/`
    if(obj.vendorId=='15') return `https://www.shreemaruticourier.com/`
    if(obj.vendorId=='16') return `https://www.aramex.com/in/en/track/shipments`
}

function getVendorName(arr, val){
    //INITIALISE DEBUG FOR THIS FUNCTION//
    let debug = require('debug')('c_app: getVendorName')    

    let match = arr.filter(elem => elem.id == val)    
    return match[0].name
}
