const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Service = require('../model/serviceModel')
const debug = require('debug')('dev')
const axios = require('axios')
const mongoose = require('mongoose');
const {vendorArray} = require('../fixedData/vendors')
const {processRequest, sortBoxItem} = require('../helpers/helpers')
const PDFdocument = require('pdfkit');
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
        //let userId = req.params.userId                        
        let orderlist
        let userId = req.user.id
        const user = await User.findById(userId)
        //let role = await checkRole(userId)         
        if(user.role == 'client'){
            orderlist = await Order.find({client: userId})            
        }else if(user.role == 'admin'){            
            orderlist = await Order.find().populate('client').exec()            
            orderlist = orderlist.filter(elem => elem.client.admin == userId)            
        }/* else{
            res.send(`No Orders found for id: ${userId}`)
        } */             
        /* res.json({
            message: `Orderlist for id : ${userId}`,
            orderCount: orderlist.length,
            data: orderlist
        }) */               
        res.render('orderlist', {orderlist, user}) 
    }catch(err){
        next(err)
    }
}

// ------------------------------------------------------------------------- //

exports.createOrderPage = async (req, res, next) => {
    try{
        //res.send(`Create order page for id: ${req.params.userId}`)
        let userId = req.user.id
        const user = await User.findById(userId)
        
        const clientlist = await User.find({role: 'client', admin: userId})
        const countries = await db.collection('countries').find().toArray()
        const serviceList = await Service.find({admin: userId})

        //convert servicenames to displaynames
        let displayNames = await Service.find({serviceName: user.serviceAccess})        
        displayNames = displayNames.map(item => item.displayName)
        //debug(displayNames)
        //debug(user.admin)

        //find admin of client and get accessright of that admin
        let adminUser = await User.findById(user.admin)
        //debug(adminUser)
        /* debug(user)
        debug(user.defaultService) */

        res.render('addorder', { user, clientlist, countries, serviceList, displayNames, adminUser})
    }catch(err){
        next(err)
    }
}

exports.createOrder = async (req, res, next) => {
    try{
        //debug(req.body)
        let {
            bookingDate, consignor, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, 
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, client_id
        } = req.body  
        
        //debug(bookingDate)
        
        //check for mandatory fields
        if(!bookingDate || !consignor || !consignorContactNumber || !service
            || !consignorAddress1 || !consignorAddress2 || !consignorPincode
            || !docType || !docNumber || !consignee || !consigneeContactNumber
            || !consigneeAddress1 || !consigneeAddress2 || !consigneePincode
            || !origin || !destination){
            return res.status(400).json({Error: 'Please enter all fields marked with *'})
        }

        let awbNumber

        //generate unique random 7 digit awbNumber
        do{
            awbNumber = Math.floor(Math.random() * 10000000)
        }while(await Order.findOne({awbNumber: awbNumber}))              

        let obj = {
            bookingDate, awbNumber, consignor, service,
            consignorContactNumber, consignorEmail,
            consignorAddress1, consignorAddress2,
            consignorPincode, consignorCity, consignorState,
            docType, docNumber, consignee, 
            consigneeContactNumber, consigneeEmail, 
            consigneeAddress1, consigneeAddress2, 
            consigneePincode, consigneeCity, consigneeState,
            origin, destination, status: 'active', client: client_id
        }
        
        const order = new Order(obj)
        //debug(obj)
        await order.save()
        /* res.json({
            message: 'Order created successfuly', 
            data: order
        }) */
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
        
        res.render('updateorder', {order, user, clientlist, countries})
        
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

        //check for mandatory fields
        if(!bookingDate || !consignor || !consignorContactNumber || !service
            || !consignorAddress1 || !consignorAddress2 || !consigneeCity 
            || !consigneeState || !consignorPincode || !docType || !docNumber 
            || !consignee || !consigneeContactNumber || !consigneeAddress1 
            || !consigneeAddress2 || !consigneeCity || !consigneeState 
            || !consigneePincode || !origin || !destination){
            return res.status(400).json({Error: 'Please enter all fields marked with *'})
        }

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
        /* res.status(200).json({
            message: 'Order-primary details updated successfully',
            data: obj
        }) */
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
        
        res.render('addbox', {user, order})

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
            currency, totalValue
        } = req.body    


        let numberOfBoxes
        
        //debug(itemType, boxNumber, itemName, itemQuantity, itemPrice)
        //debug(req.body)
        let orderId = req.params.orderId

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
            chargeableWeight, currency, totalValue }
        
        await Order.findByIdAndUpdate(orderId, obj, {new: true})
        /* res.status(200).json({
            message: 'Order patched successfully',
            data: obj
        }) */
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

        res.render('addtrack', {user, order})
        
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
            return res.status(400).json({Error: 'Please enter tracking number and select a vendor'})
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
                    if(!order.apiCount){
                        apiCount = 1                                                
                    }else{
                        apiCount = order.apiCount + 1
                    }
                    apiCredit = user.apiCredit - 1 //decrement user API credit
                }else{
                    return res.status(400).json({Error: 'some API error'})
                }
            }            
        }                     

        let obj = { trackingNumber, apiCount, vendorId, vendorName, coforwarder, 
            coforwarderAwb, clientNote, selfNote }  
            
        let userObj = { apiCredit }

        await Order.findByIdAndUpdate(orderId, obj, {new: true})
        await User.findByIdAndUpdate(userId, userObj, {new: true})
        
        /* res.status(200).json({
            message: 'Order patched successfully',
            data: obj,      
            user: userObj      
        }) */

        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
}

exports.trackDetails = async(req, res, next) => {
    try{
        //debug(req.query)
        //res.send('yes')
        let order = await Order.find({awbNumber: req.query.trackingNumber})
        let postData = {
            "username":"adinr4",
            "password":"be57b1d8cbcf5c9cd7fe3d8011233985",
            "order_id": req.query.trackingNumber || '914325'
        }
        let response = await axios.post('https://shipway.in/api/getOrderShipmentDetails', postData)

        if(response.data.status == "Success"){            
            response.data.response.date = order.bookingDate || '12/07/2021'
            response.data.response.consignor = order.consignor || 'naruto'
            response.data.response.consignee = order.consignee || 'orochimaru'
            response.data.response.destination = order.destination || 'konoha'
            response.data.response.note = order.clientNote || 'test'

            debug(order)
            res.json(response.data)
        }else{
            //res.status(400).send(`tracking number doesn't exist`)
            res.json({status: 'fail'})
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

        if(order.client.admin == userId || order.client._id == userId){
            res.render('addTrackingStatus', {user, order})            
        }else{            
            res.status(403).send("Resource Not Authorized")            
        }
    }catch(err){
        next(err)
    }
}

exports.patchManualTracking = async (req, res, next) => {
    try{
        //debug(req.body)
        let { statusDate, statusTime, statusLocation, statusActivity } = req.body

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

        let obj = { trackingDetails : trackingDetailsArr }

        //debug(obj)
        
        await Order.findByIdAndUpdate(orderId, obj, {new: true})        

        res.redirect('/orders/orderlist')

    }catch(err){
        next(err)
    }
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
        //let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        //let user = await User.findById(userId)

        const doc = new PDFdocument({             
            autoFirstPage: false
          })            

        if(order.boxDetails.length == 0){
            //return res.status(400).send('No Box Details added. Please add Box Details first before generating AWB')
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        }

        for(let i = 0; i < order.numberOfBoxes; i++){
            doc.addPage()
            generateAwb(doc, order) //user
        }               

        res.setHeader('Content-type', 'application/pdf')
        res.set({ 'Content-Disposition': `inline; filename=awb_${order.awbNumber}.pdf` })
        
        stream = doc.pipe(res) 
        stream.on('finish', () => {
            fs.unlink(`awb_${order.awbNumber}.png`, (err) => {
                if(err){
                    next(err)
                }
            })
        })
        //doc.pipe(res)                                               
        doc.end()                
        
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
            if((value + i) == totalitems) {
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

        const doc = new PDFdocument({             
            autoFirstPage: false
        })

        if(order.boxDetails.length == 0){
            //return res.status(400).send('No Box Details added. Please add Box Details first before generating AWB')
            return res.render('error', {message: `No Box Details added. Please add Box Details first before generating AWB`, statusCode: '400'})
        }

        const canvas = createCanvas()
        const context = canvas.getContext('2d')

        JsBarcode(canvas, order.awbNumber)
        //const buffer = canvas.toBuffer('image/png')
        canvas.toBuffer((err, buffer) => {
            logger.info(`Inside canvas buffer`)
            if(err) next(err)
            fsPromises.writeFile(`box_${order.awbNumber}.png`, buffer)            
            .then(() => {
                for(let i = 0; i < order.numberOfBoxes; i++){
                    logger.info(`Inside for loop`)
                    doc.addPage()
                    boxstickergenerate(i, doc, order, user)
                }        

                res.setHeader('Content-type', 'application/pdf')
                res.set({ 'Content-Disposition': `inline; filename=boxsticker_${order.awbNumber}.pdf` })
                
                stream = doc.pipe(res)                                                      
                doc.end()              
                
                stream.on('finish', () => {            
                    fs.unlink(`box_${order.awbNumber}.png`, (err) => {
                        if(err){
                            next(err)
                        }
                    })
                })
            })
            .catch((err) => next(err))
        })
        //await fsPromises.writeFile(`box_${order.awbNumber}.png`, buffer)

        

        /* var endTime = performance.now()
        debug(`Call for this took ${endTime - startTime} ms`) */

    }catch(err){
        next(err)
    }
}



