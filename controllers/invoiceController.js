const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Invoice = require('../model/invoiceModel')
const debug = require('debug')('dev')
const {getDates} = require('../helpers/helpers')
const PDFdocument = require('pdfkit')
const {detailedInvoice} = require('../pdf/detailedInvoice')

exports.invoiceList = async(req, res, next) => {
    try{
        let userId = req.user.id                
        let user = await User.findById(userId)

        let clientUserList = await User.find({admin: userId})

        let invoicelist = await Invoice.find({admin: userId}).populate({path: 'client', select: 'username'}).sort({bookingDate: 'desc', createdAt: 'desc'}).limit(1000)
        res.render('invoice/list', {user, invoicelist, clientUserList})
    }catch(err){
        next(err)
    }
}

exports.invoiceGenerate = async(req, res, next) => {
    try{
        let {admin, client, invoiceNumber, invoiceDate,
        invoiceStartDate, invoiceEndDate, note} = req.body

        let userId = req.user.Id
        
        //GET ARRAY OF DATE RANGE//
        let dateArray = getDates(new Date(invoiceStartDate), new Date(invoiceEndDate))         

        let orderFields = 'bookingDate awbNumber destination consignee chargeableWeight baseRate brGst chargeDetails totalBill'        

        let orders = await Order.find({bookingDate: dateArray, client: userId}).select(orderFields)

        //CHECK IF ALL ORDERS HAVE BILL AND WEIGHT ADDED//
        let count = 0
        orders.forEach(order => {
            if(!order.baseRate) count++
            if(!order.chargeableWeight) count++
        })

        if(count > 0) return res.render('error', {message: `Some Orders don't have bill/weight added. Please check`, statusCode: '400'})
        

    //---- CALCULATE TOTAL BILL, WEIGHT---- //            

        let totalBillArr = orders.map(order => order.totalBill)
        let weightArr = orders.map(order => order.chargeableWeight)

        let totalAmount = totalBillArr.reduce((a,b) => a + b, 0) //GET SUM OF ALL BASE RATES//        
        let totalWeight = weightArr.reduce((a, b) => a + b, 0) //GET TOTAL WEIGHT//        
        
        //CREATE INVOICE OBJECT TO WRITE TO DB//
        let invoiceObj = {
            admin, client, invoiceNumber, invoiceDate, invoiceStartDate, invoiceEndDate, note,
            totalAmount, totalWeight, totalAwbs: orders.length
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
        //res.send('hello')
        let invoiceId = req.params.invoiceId
        let userId = req.user.id //'623ed3385158ccd06b59f3f8' 
        
        let invoiceFields = 'invoiceNumber invoiceStartDate invoiceEndDate totalAmount invoiceDate note'
        let invoice = await Invoice.findById(invoiceId).populate('client').populate('admin').select(invoiceFields)

        let user = await User.findById(userId)

        let dateArray = getDates(new Date(invoice.invoiceStartDate), new Date(invoice.invoiceEndDate))

        let orderFields = 'bookingDate awbNumber destination consignee boxType chargeableWeight baseRate brGst chargeDetails totalBill'
        let orders = await Order.find({bookingDate: dateArray}).select(orderFields)      
        
    // ------------------- CALCULATE DATA -------------------- //        
        let chargesArr = orders.map(order => {
            let total = 0
            order.chargeDetails.forEach(charge => {
                total += charge.amount
            })
            return total
        })

        let taxArr = orders.map(order => {
            let total = order.brGst
            order.chargeDetails.forEach(charge => {
                total += charge.gst
            })
            return total
        })

        let totalBillArr = orders.map(order => order.totalBill)
        let totalBaseRateArr = orders.map(order => order.baseRate)

        let totalCharges = chargesArr.reduce((a, b) => a + b, 0) //GET SUM OF ALL CHARGES//
        let totalTax = taxArr.reduce((a, b) => a + b, 0) //GET SUM OF ALL TAX//  
        let totalBill = totalBillArr.reduce((a, b) => a + b, 0) //GET SUM OF ALL TAX// 
        let totalBaseRate = totalBaseRateArr.reduce((a, b) => a + b, 0)
        
        let compData = {chargesArr, taxArr, totalBillArr, totalCharges, totalTax, totalBill, totalBaseRate}


    
    // ------------------- GENERATE PDF -------------------------- //
        const doc = new PDFdocument({          
            size: 'A4',         
            layout: 'landscape',
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

    }catch(err){
        next(err)
    }
}