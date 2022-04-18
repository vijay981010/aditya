const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Service = require('../model/serviceModel')
const debug = require('debug')('dev')
const axios = require('axios')
const mongoose = require('mongoose');
const {vendorArray} = require('../fixedData/vendors')
const {processRequest, sortBoxItem, getDates} = require('../helpers/helpers')
const PDFdocument = require('pdfkit')
const {generateAwb} = require('../pdf/awb')
const {boxstickergenerate} = require('../pdf/boxsticker')
const {primarydetails, boxdetails, footerdetails} = require('../pdf/packinglist')
const fs = require('fs')
const { validationResult } = require('express-validator')
let stream = require('stream')
const fsPromises = require('fs').promises
const {createCanvas} = require('canvas')
var JsBarcode = require('jsbarcode')
const logger = require('../helpers/logger')

const db = mongoose.connection;

exports.orderList = async (req, res, next) => {
    try{                                                  
        let orderlist

        let userId = req.user.id
        const user = await User.findById(userId)
        
        if(user.role == 'client'){
            orderlist = await Order.find({client: userId}).sort({bookingDate: 'desc', createdAt: 'desc'}).limit(1000)          
        }else if(user.role == 'admin'){            
            orderlist = await Order.find().populate('client').sort({bookingDate: 'desc', createdAt: 'desc'}).limit(1000).exec()            
            orderlist = orderlist.filter(elem => elem.client.admin == userId)            
        }

        if(!orderlist) return res.render('error', {message:'Some unknown error.Couldnt get orderlist. Please try again', status: '500'})

        res.render('order/list', {orderlist, user}) 
    }catch(err){
        next(err)
    }
}

// ------------------------------------------------------------------------- //

exports.createOrderPage = async (req, res, next) => {
    try{
        
        let userId = req.user.id
        const user = await User.findById(userId).populate('admin').exec()
        
        const clientlist = await User.find({role: 'client', admin: userId})
        const countries = await db.collection('countries').find().toArray()
        const serviceList = await Service.find({admin: userId})

        //convert servicenames to displaynames
        let displayNames = await Service.find({serviceName: user.serviceAccess})        
        displayNames = displayNames.map(item => item.displayName)
        
        //find admin of client and get accessright of that admin
        let adminUser = await User.findById(user.admin)        

        res.render('order/add/primary', { user, clientlist, countries, serviceList, displayNames, adminUser})
    }catch(err){
        next(err)
    }
}

exports.createOrder = async (req, res, next) => {
    try{
        //debug(req.body)
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
            bookingDate, consignor, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, 
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client_id, awbNumber
        } = req.body                  

        //GENERATE UNIQUE RANDOM 7 DIGIT AWBNUMBER        
        if(awbNumber.trim() == '' || !awbNumber){
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

        let obj = {
            bookingDate, awbNumber, consignor, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, 
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, status: 'active', client: client_id,
            trackingDetails: trackArr, apiCount:0, trackingStatus: 'SCH'
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

        const user = await User.findById(userId)
        const clientlist = await User.find({role: 'client', admin: userId})
        const countries = await db.collection('countries').find().toArray()
        let order = await Order.findById(orderId).populate('client').exec()
        
        res.render('order/edit', {order, user, clientlist, countries})
        
    }catch(err){
        next(err)
    }
}

exports.updateOrder = async (req, res, next) => {
    try{
        let {
            bookingDate, awbNumber, consignor, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, 
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client_id
        } = req.body     
        
        let orderId = req.params.orderId        

        let obj = {
            bookingDate, awbNumber, consignor, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, 
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client: client_id
        }

        await Order.findByIdAndUpdate(orderId, obj, {new: true})
        
        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}

// ----------------------------------------------------------------------- //

exports.patchBoxPage = async (req, res, next) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id
        
        const user = await User.findById(userId)
        let order = await Order.findById(orderId).populate('client').exec()        
        
        res.render('order/add/box', {user, order})

    }catch(err){
        next(err)
    }
}

exports.patchBox = async (req, res, next) => {
    try{
        let { 
            boxType, boxLength, boxWidth, boxHeight, 
            volumetricWeight, actualWeight, 
            boxNumber, itemType, itemName, 
            itemQuantity, itemPrice, chargeableWeight, 
            currency, totalValue, invoiceType
        } = req.body    

        //debug(typeof totalValue)

        totalValue = parseFloat(totalValue)

        let numberOfBoxes
        
        let orderId = req.params.orderId
        let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        let user = await User.findById(userId)

    // ----------------- VALIDATE INVOICE TOTAL VALUE -------------------- //
        let invoiceTotal = totalValue
        if(currency != 'INR'){
            invoiceTotal = await getExchange(currency, totalValue)            
        }
        debug(invoiceTotal)
        if(invoiceTotal > 24000){
            let alert = [{msg: 'Invoice Total cannot exceed 24000 INR!!'}]
            return res.render('order/add/box', {user, order, alert})
        }

    // ----------------- PROCESS ORDER -------------------- //
        let itemArr = []; let boxArr = [];

        if(Array.isArray(itemType) && boxNumber && itemType && itemName && itemQuantity && itemPrice){            
            itemArr = processRequest([boxNumber, itemType, itemName, itemQuantity, itemPrice], 
                ['boxNumber', 'itemType', 'itemName', 'itemQuantity', 'itemPrice'], itemType.length)
        }else if(boxNumber && itemType && itemName && itemQuantity && itemPrice){
            itemArr = [{ 'boxNumber': boxNumber, 'itemType': itemType, 'itemName': itemName, 
            'itemQuantity': itemQuantity, 'itemPrice': itemPrice}]
        }
        //debug(itemArr)             

        if(Array.isArray(boxLength) && boxLength && boxWidth && boxHeight && volumetricWeight && actualWeight){
            boxArr = processRequest([boxLength, boxWidth, boxHeight, volumetricWeight, actualWeight],
                ['boxLength', 'boxWidth', 'boxHeight', 'volumetricWeight', 'actualWeight'],
                boxLength.length)
            numberOfBoxes = boxLength.length
        }else if(boxLength && boxWidth && boxHeight && volumetricWeight && actualWeight){
            boxArr = [{ 'boxLength': boxLength, 'boxWidth': boxWidth, 'boxHeight': boxHeight, 
            'volumetricWeight': volumetricWeight, 'actualWeight': actualWeight}]
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

// ---------------------------------------------------------------------- //

exports.patchTrackPage = async (req, res, next) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id        

        const user = await User.findById(userId)
        let order = await Order.findById(orderId).populate('client').exec()              

        res.render('order/add/track', {user, order})
        
    }catch(err){
        next(err)
    }
}

exports.patchTrack = async (req, res, next) => {
    try{
        // get all inputs
        let { awbNumber, trackingNumber, vendorId, coforwarder, 
            coforwarderAwb, clientNote, selfNote } = req.body                    

        let orderId = req.params.orderId 
        let userId = req.user.id       

        let vendorName 
        let apiCount
        let apiCredit

        let user = await User.findById(userId)        
        
        //get respective vendor name from vendor id
        vendorArray.forEach(elem => {
            if(elem.id == vendorId){
                vendorName = elem.name
            }
        })
        
        //if no tracking number or vendor id, show error          
        if(!trackingNumber || !vendorId){
            //return res.status(400).json({Error: 'Please enter tracking number and select a vendor'})
            return res.render('error', {message:'Please enter tracking number and select a vendor', statusCode: '400'})            
        }
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
        if(vendorName != 'OTHERS' ){
            if(order.trackingNumber != trackingNumber || order.vendorName != vendorName){
                let postData = {
                    "username":"adinr4",
                    "password":"be57b1d8cbcf5c9cd7fe3d8011233985",
                    "carrier_id":vendorId,
                    "awb": trackingNumber,
                    "order_id": awbNumber,
                    "first_name":"N/A",
                    "last_name":"N/A",
                    "email":"N/A",
                    "phone":"N/A",
                    "products":"N/A",
                    "company":"N/A",
                    "shipment_type":"1"
                }
    
                let response = await axios.post('https://shipway.in/api/PushOrderData', postData)
                //debug(response.data)
                /* let response = {data: {status: 'Success'}}  */
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

exports.checkDuplicateTracking = async(req, res, next) => {
    try{
        let {trackingNumber, user} = req.query
        
        let order = await Order.find({awbNumber: trackingNumber})
    }catch(err){
        next(err)
    }
}

exports.trackDetails = async(req, res, next) => {
    try{        
        
    // --------- GET ORDER MANUAL TRACKING DATA FROM DATABASE ----------------- //
        let {trackingNumber, user} = req.query

        //GET CLIENT LIST TO AVOID DUPLICATE TRACKING NUMBER ISSUE//
        let userId = await User.findOne({username: user}).select('username')
        userlist = await User.find({role: 'client', admin: userId})
        userlist = userlist.map(user => user._id)  

        let order = await Order.findOne({awbNumber: trackingNumber, client: userlist}).populate('client')        
        
        if(order == null) return res.json({status: 'fail'})

    // -------- GET TRACKING DATA FROM API IF VENDOR ID EXISTS -------------------- //
        
        if(order.vendorId && order.vendorId != 0 || trackingNumber == '920183'){
            let postData = {
                "username":"adinr4",
                "password":"be57b1d8cbcf5c9cd7fe3d8011233985",
                "order_id": trackingNumber
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
                //res.status(400).send(`tracking number doesn't exist`)
                res.json({status: 'fail'})
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
        debug(req.body)
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

        //debug(obj)
        
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

exports.patchBill = async (req, res) => {
    try{
        //res.json(req.body)
        let orderId = req.params.orderId

        let {baseRate, brGst, title, amount, gst, totalBill} = req.body

        let chargeArr = []        

        if(Array.isArray(title)){            
            chargeArr = processRequest([title, amount, gst], 
                ['title', 'amount', 'gst'], title.length)
        }else if(title && amount && gst){
            chargeArr = [{ 'title': title, 'amount': amount, 'gst': gst}]
        }

        let patchObj = {baseRate, brGst, chargeDetails: chargeArr, totalBill}

        //res.json(patchObj)

        await Order.findByIdAndUpdate(orderId, patchObj)

        res.redirect('/orders/orderlist')

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

/* exports.deleteOrder = async (req, res) => {
    try{

    }catch(err){
        next(err)
    }
} */

// ----------------------------------------------------------------------- //

exports.printawb = async(req, res, next) => {
    try{
        /* var startTime = performance.now() */        
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
            for(let i = 0; i < order.numberOfBoxes; i++){
                doc.addPage()
                generateAwb(doc, order, user) 
            }            

            res.setHeader('Content-type', 'application/pdf')
            res.set({ 'Content-Disposition': `inline; filename=awb_${order.awbNumber}.pdf` })
            
            stream = doc.pipe(res) 
            doc.end()

            stream.on('finish', () => {
                fs.unlink(`awb_${order.awbNumber}.png`, (err) => { if(err) next(err) })
            })            
            
        }
                        
        /* var endTime = performance.now()
        debug(`Call for this took ${endTime - startTime} ms`) */
    }catch(err){
        next(err)
    }
}

exports.packingList = async(req, res, next) => {
    try{
        /* var startTime = performance.now() */
        let orderId = req.params.orderId
        let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        let user = await User.findById(userId)
        let boxDetails = order.boxDetails

        //if no boxDetails display error
        if(boxDetails.length == 0){
            //return res.status(400).send('No Box Details added. Please add Box Details first before generating Packing List')
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        }
        
        let itemArray = []
        let qtyArray = []
        let priceArray = []
        let lengthArray = [0]
        let boxNumberArray = ['Box1']
        let dimensionArray = [`(${boxDetails[0].boxLength}x${boxDetails[0].boxWidth}x${boxDetails[0].boxHeight})`]
        //let actualWeightArray = [`${boxDetails[0].actualWeight} KG`]      
        
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

        // --- boxNumberArray computation --- //
        lengthArray.pop()
        
        let count = 2

        lengthArray.forEach(item => {
            for(let i = 1; i <= item; i++){
                if(item != i){
                    boxNumberArray.push('')
                    dimensionArray.push('')
                    //actualWeightArray.push('')
                }else{
                    boxNumberArray.push(`Box${count}`)            
                    dimensionArray.push(`(${boxDetails[count-1].boxLength}x${boxDetails[count-1].boxWidth}x${boxDetails[count-1].boxHeight})`)
                    //actualWeightArray.push(`${boxDetails[count-1].actualWeight} KG`)
                    count++
                }
            }
        }) 

        let breakpoint = 22
        let breakpoint2 = 37
        let runs = Math.floor((totalitems-22) / breakpoint2)    

        // --- total pages and total value computation --- //
        let totalPages = 0    

        if(totalitems <= 22){
            totalPages = 1      
        }else if(totalitems > 22 && totalitems <= 59){
            totalPages = 2
        }else{
            totalPages = runs + 2 
        }
        // --- total pages computation --- //

        // ---------------------------------------------------- //

        const doc = new PDFdocument

        doc.info['Title'] = `packinglist${order.awbNumber}`
        
        primarydetails(doc, order)
        boxdetails(290, doc, order)                
        footerdetails(1, totalPages, doc, order)

        for(let i = 0; i < totalitems; i++){                                  
            if(i <= (breakpoint - 1)){             
                print(345, 15, i, 0) //first page
            }else if(i == breakpoint){
                doc.addPage()
                .moveTo(40, 40).lineTo(40, 750).stroke() //left vertical line
                .moveTo(560, 40).lineTo(560, 750).stroke() //right vertical line
                boxdetails(40, doc, order)
                footerdetails(2, totalPages, doc, order)            
                for(let j = 0; j < totalitems - i; j++){
                    if(j <= breakpoint2){
                        print(100, 15, j, breakpoint) //second page
                    }                
                }
            }else{
                for(let j = 1; j <= runs; j++){                
                    if(i == (breakpoint + (breakpoint2 * j))){                    
                        additionalPage(i, i + j, j) //further pages
                    }
                }
            }
        }

        function print(start, gap, i, value){              
            if((value + i + 1) == totalitems) {            
              doc
              .text('Total', 425, 685)
              .text(order.currency, 475, 685)
              .text(order.totalValue, 520, 685, {width: 50, align:'left'})            
            }
                            
            doc
            .font('Helvetica')              
            .text(boxNumberArray[value + i], 43, start + (gap * i))
            .text(dimensionArray[value + i], 68, start + (gap * i))  
            //.text(actualWeightArray[value + i], 43, start + (gap * i) + 15)
            .text(itemArray[value + i], 180, start + (gap * i)) 
            .text(qtyArray[value + i], 440, start + (gap *i))
            .text(priceArray[value + i], 485, start + (gap *i))
            .text(totalArray[value + i], 520, start + (gap *i), {width: 50, align:'left'}) 
                    
        }

        function additionalPage(i, value, page){        
            doc.addPage()   
            .moveTo(40, 40).lineTo(40, 750).stroke() //left vertical line
            .moveTo(560, 40).lineTo(560, 750).stroke() //right vertical line     
            boxdetails(40)
            footerdetails(page + 2, totalPages)            
                for(let x = 0; x < totalitems - i; x++){
                    if(x <= breakpoint2){
                        print(100, 15, x, value)
                    }                
                }
        }


        res.setHeader('Content-type', 'application/pdf')
        res.set({ 'Content-Disposition': `inline; filename=packinglist_${order.awbNumber}.pdf` })
        
        doc.pipe(res)                                              
        doc.end()

        /* var endTime = performance.now()
        debug(`Call for this took ${endTime - startTime} ms`) */

    }catch(err){
        next(err)
    }
}

exports.boxSticker = async(req, res, next) => {
    try{
        /* var startTime = performance.now() */
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
            for(let i = 0; i < order.numberOfBoxes; i++){                            
                boxstickergenerate(i, doc, order, user)
            }
    
            res.setHeader('Content-type', 'application/pdf')
            res.set({ 'Content-Disposition': `inline; filename=boxsticker_${order.awbNumber}.pdf` })
            
            stream = doc.pipe(res)                                                      
            doc.end()                      
            
            stream.on('finish', () => {            
                fs.unlink(`box_${order.awbNumber}.png`, (err) => { if(err) next(err) })
            })
        }

        /* var endTime = performance.now()
        debug(`Call for this took ${endTime - startTime} ms`) */

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



