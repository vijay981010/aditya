const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Invoice = require('../model/invoiceModel')
const {getDates, checkOrderBillWeight, sendOrderNotification} = require('../helpers/helpers')
const PDFdocument = require('pdfkit')
const {detailedInvoice} = require('../pdf/detailedInvoice')
const bcrypt = require('bcrypt')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'


exports.invoiceList = async(req, res, next) => {
    try{
        let userId = req.user.id                
        let user = await User.findById(userId)

        let clientUserList = await User.find({admin: userId})

        let invoicelist = await Invoice.find({admin: userId}).populate({path: 'client', select: 'username'})
        .sort({invoiceDate: 'desc', createdAt: 'desc'}).limit(1000)

        res.render('invoice/list', {user, invoicelist, clientUserList})
    }catch(err){
        next(err)
    }
}

exports.invoiceGenerate = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: invoiceGenerate')

        let {admin, client, invoiceNumber, invoiceDate,
        invoiceStartDate, invoiceEndDate, note, gstType} = req.body                     
        
        //GET ARRAY OF DATE RANGE//
        let dateArray = getDates(new Date(invoiceStartDate), new Date(invoiceEndDate))
        
        //VALIDATE DATE RANGE//
        if(dateArray.length == 0) 
            return res.render('error', {message: `Start Date cannot be after End Date`, statusCode: '400'})

        //GET ORDERS FOR THE SPECIFIED DATE RANGE AND CLIENT//
        let orderFields = 'bookingDate awbNumber destination consignee chargeableWeight baseRate brGst chargeDetails totalBill'        
        let orders = await Order.find({bookingDate: dateArray, client, invoiceFlag: true}).select(orderFields)   
        debug(orders)
        //VALIDATE IF ORDERS//
        if(orders.length == 0) return res.render('error', {message: `No Orders found for the selected Date Range`, statusCode: '400'})

        //CHECK IF ALL ORDERS HAVE BILL AND WEIGHT ADDED//
        let count = checkOrderBillWeight(orders)
        if(count > 0) return res.render('error', {message: `Some Orders don't have bill/weight added. Please check`, statusCode: '400'})
        

    //---- CALCULATE TOTAL BILL, WEIGHT---- //            

        //SERIALIZE TOTALBILL AND WEIGHTS OF FILTERED ORDERS//
        let totalBillArr = orders.map(order => order.totalBill)
        let weightArr = orders.map(order => order.chargeableWeight)        

        //GET SUM OF TOTAL BILL OF ALL ORDERS//
        let totalAmount = totalBillArr.reduce((a,b) => a + b, 0)         
        totalAmount = totalAmount.toFixed(2) 

        //GET TOTAL WEIGHT// 
        let totalWeight = weightArr.reduce((a, b) => a + b, 0) 
        totalWeight = totalWeight.toFixed(2)       
        
        //CREATE INVOICE OBJECT TO WRITE TO DB//
        let invoiceObj = {
            admin, client, invoiceNumber, invoiceDate, invoiceStartDate, invoiceEndDate, note,
            totalAmount, totalWeight, totalAwbs: orders.length, gstType
        }

        let invoice = new Invoice(invoiceObj)

        await invoice.save()

        res.redirect('/invoices/list')
    }catch(err){
        next(err)
    }
}

exports.invoicePdf = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: invoicePdf')
        let invoiceId = req.params.invoiceId
        //let userId = req.user.id //
        
        //GET INVOICE DETAILS//
        let invoiceFields = 'invoiceNumber invoiceStartDate invoiceEndDate totalAmount invoiceDate note gstType'
        let invoice = await Invoice.findById(invoiceId).populate('client').populate('admin').select(invoiceFields)

        //debug(invoice.admin)

        //GET USER DETAILS//
        //let user = await User.findById(userId)

        //debug(user)
        let user = invoice.admin

        //GET DATE RANGE BETWEEN START AND END//
        let dateArray = getDates(new Date(invoice.invoiceStartDate), new Date(invoice.invoiceEndDate))

        //GET ORDERS BETWEEN THAT DATE RANGE FOR THAT ADMIN//
        let orderFields = 'bookingDate awbNumber destination consignee boxType chargeableWeight baseRate brGst fuelSurcharge fsGst chargeDetails totalBill'
        let orders = await Order.find({bookingDate: dateArray, client: invoice.client, invoiceFlag: true}).select(orderFields)      

        //VALIDATE IF ORDERS//
        if(orders.length == 0) return res.render('error', {message: `No Orders found for the selected Date Range`, statusCode: '400'})

        //CHECK IF ALL ORDERS HAVE BILL AND WEIGHT ADDED//
        let count = checkOrderBillWeight(orders)
        if(count > 0) return res.render('error', {message: `Some Orders don't have bill/weight added. Please check`, statusCode: '400'})
        
        //CALCULATE DATA//  
        let compData = getCompData(orders)              

    // ------------------- GENERATE PDF -------------------------- //
        const doc = new PDFdocument({          
            size: 'A4',                     
            layout: user.invoiceSettings.layout,
            autoFirstPage: false  
        })        

        detailedInvoice(doc, orders, invoice, user, compData) 

        res.setHeader('Content-type', 'application/pdf')
        res.set({ 'Content-Disposition': `inline; filename=invoice_${invoice.invoiceNumber}.pdf` })
        
        stream = doc.pipe(res)                                              
        doc.end() 
        
    }catch(err){
        next(err)
    }
}

exports.invoiceDelete = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: invoiceDelete')

        let id = req.params.invoiceId
        let userId = req.user.id        

        const user = await User.findById(userId)        

        if(await bcrypt.compare(req.body.pw, user.password)){            
            await Invoice.findByIdAndDelete(id)
            res.status(200).json({msg: 'success'})
        }else{            
            res.json({msg: 'error'})
        }
    }catch(err){
        next(err)
    }
}

exports.cashInvoicePdf = async(req, res, next) => {
    try{
        //res.json(req.body)
        let {admin, orderId, invoiceDate, invoiceNumber, note} = req.body

        let userId = req.user.id

        //GET USER DETAILS//
        let user = await User.findById(userId)

        //GET ORDER//
        let orderFields = 'bookingDate miscClients awbNumber destination consignee boxType chargeableWeight baseRate brGst fuelSurcharge fsGst chargeDetails totalBill'
        let orders = await Order.find({_id: orderId}).select(orderFields)        

        //CHECK IF ALL ORDERS HAVE BILL AND WEIGHT ADDED//
        let count = checkOrderBillWeight(orders)
        if(count > 0) return res.render('error', {message: `Some Orders don't have bill/weight added. Please check`, statusCode: '400'})

        let invoice = {
            client:{
                username: orders[0].miscClients,
                gstNumber: 'N/A'
            },
            admin:user,
            invoiceNumber,
            invoiceStartDate: orders.bookingDate,
            invoiceEndDate: orders.bookingDate,
            totalAmount: orders.totalBill,
            invoiceDate,
            note
        }

        let compData = getCompData(orders)           

    // ------------------- GENERATE PDF -------------------------- //
        const doc = new PDFdocument({          
            size: 'A4',         
            layout: user.invoiceSettings.layout,
            autoFirstPage: false  
        })        

        detailedInvoice(doc, orders, invoice, user, compData) 

        res.setHeader('Content-type', 'application/pdf')
        res.set({ 'Content-Disposition': `inline; filename=invoice_${invoice.invoiceNumber}.pdf` })
        
        stream = doc.pipe(res)                                              
        doc.end() 

    }catch(err){
        next(err)
    }
}

// ------------------------------------------ //

function getCompData(orders){
    let chargesArr = orders.map(order => {
        let total = 0
        order.chargeDetails.forEach(charge => {
            total += charge.amount
        })
        return total
    })

    let taxArr = orders.map(order => {
        let total = order.brGst + order.fsGst
        order.chargeDetails.forEach(charge => {
            total += charge.gst
        })
        return total
    })

    let subTotalArr = orders.map((order, i) => order.baseRate + order.fuelSurcharge + chargesArr[i])

    let totalFscArr = orders.map(order => order.fuelSurcharge)
    let totalBillArr = orders.map(order => order.totalBill)
    let totalBaseRateArr = orders.map(order => order.baseRate)

    let totalCharges = chargesArr.reduce((a, b) => a + b, 0) //GET SUM OF ALL CHARGES//
    let totalTax = taxArr.reduce((a, b) => a + b, 0) //GET SUM OF ALL TAX//  
    
    let totalBill = totalBillArr.reduce((a, b) => a + b, 0) //GET SUM OF ALL ORDERS FINAL BILL// 
    totalBill = totalBill.toFixed(2) //CLIP IT TO TWO DECIMAL PLACES//

    let totalBaseRate = totalBaseRateArr.reduce((a, b) => a + b, 0)
    let totalFsc = totalFscArr.reduce((a, b) => a + b, 0)
    
    return compData = {chargesArr, taxArr, totalBillArr, totalCharges, totalFsc, totalTax, totalBill, totalBaseRate, subTotalArr}
}

exports.sendEmail = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: sendEmail')

        // let userId = req.user.id

        // //GET USER DETAILS//
        // let user = await User.findById(userId)

        const { invoiceId } = req.params

        let invoiceFields = 'invoiceNumber invoiceStartDate invoiceEndDate totalAmount'
        let clientPop = {path: 'client', select: 'email'}
        let adminPop = {path:'admin', select:'senderEmail senderPassword'}
        let invoice = await Invoice.findById(invoiceId).populate(clientPop).populate(adminPop).select(invoiceFields)

        const {client: {email}, admin: {senderEmail, senderPassword}, invoiceNumber, invoiceStartDate, invoiceEndDate, totalAmount} = invoice

        //CHECK IF EMAIL
        if(email == '') return res.render('error', {message: `Email not present. Kindly enter Email`, statusCode: '400'})

        //debug(invoice)
        const receiver = [email]
        const subject = 'Invoice Notification'    
        let user = senderEmail
        let pass = senderPassword
        debug(receiver)

        let html = `<p>Dear Shipper,<p>
                    <p>Here is your invoice : <b>${invoiceNumber}</b></p> 
                    <p>billed for the time period: <b>${moment(invoiceStartDate).format(shortDateFormat)}</b> to <b>${moment(invoiceEndDate).format(shortDateFormat)}</b></p>
                    <p>amounting to a total of: <b>Rs ${totalAmount}/-</b></p>
        
                    <p><a href='${process.env.BASE_URL}/invoices/${invoiceId}/pdf'>Click Here</a> to download the detailed invoice</p><br>
                
                    <p>Thank you for your business</p>`

        //debug(html)
        await sendOrderNotification(user, pass, receiver, subject, html)
        
        res.status(200).render('success', {message: `Email Sent Successfully`, statusCode: '200'})

    }catch(err){
        next(err)
    }    
}