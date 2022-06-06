const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Ledger = require('../model/ledgerModel')
const bcrypt = require('bcrypt')
const {generateLedgerExport} = require('../excel/ledgerExport')
const {getDates, checkOrderBillWeight} = require('../helpers/helpers')
const ExcelJs = require('exceljs')

exports.list = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)

        const ledgerlist = await Ledger.find({admin: userId}).populate({path: 'client', select: 'username'}).sort({bookingDate: 'desc', updatedAt: 'desc'}).limit(1000)                        
        let clientUserList = await User.find({admin: userId}) //GET LIST OF CLIENTS OF AN ADMIN//   

        res.render('ledger/list', {
            user, ledgerlist, clientUserList
        })
    }catch(err){
        next(err)
    }
}

exports.addPage = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)

        let clientUserList = await User.find({admin: userId})

        res.render('ledger/add', {user, clientUserList})
    }catch(err){
        next(err)
    }
}

exports.add = async(req, res, next) => {
    try{
        //GET FORM DATA//
        let {admin, client, date, amount, type, 
        description, reference, note} = req.body

        //CREATE INVOICE OBJECT TO WRITE TO DB//
        let ledgerObj = {
            admin, client, date, amount, type, 
            description, reference, note
        }

        let ledger = new Ledger(ledgerObj)

        await ledger.save()

        res.redirect('/ledger/list')
    }catch(err){
        next(err)
    }
}

exports.editPage = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)

        let ledgerId = req.params.ledgerId
        const txn = await Ledger.findById(ledgerId).populate({path:'client', select:'username'})

        let clientUserList = await User.find({admin: userId})

        res.render('ledger/edit', {user, clientUserList, txn})
    }catch(err){
        next(err)
    }
}

exports.edit = async(req, res, next) => {
    try{
        //GET FORM DATA//
        let {admin, client, date, amount, type, 
        description, reference, note} = req.body

        let ledgerId = req.params.ledgerId //GET LEDGER ID TO BE UPDATED//

        //CREATE INVOICE OBJECT TO WRITE TO DB//
        let ledgerObj = {
            admin, client, date, amount, type, 
            description, reference, note
        }        
        
        await Ledger.findByIdAndUpdate(ledgerId, ledgerObj)

        res.redirect('/ledger/list')
    }catch(err){
        next(err)
    }
}

exports.filter = async(req, res, next) => {
    try{
        let {clientId} = req.query //GET CLIENT ID
        let userId = req.user.id //GET ADMIN ID

        let orderFilter, ledgerFilter //INITIALISE ORDER AND LEDGER FILTERS

        //IF NO CLIENT ID, GET TOTAL DATA, ELSE GET RESPECTIVE CLIENT DATA
        if(clientId == ''){
            //GET LIST OF ALL CLIENT USERS//
            let clientlist = await User.find({admin:userId}).select('username')            
            clientlist = clientlist.map(client => client._id)

            orderFilter = {client:clientlist}
            ledgerFilter = {admin: userId}
        }else{
            orderFilter = {client:clientId}
            ledgerFilter = {admin: userId, client:clientId}
        }

        let clientOrderList = await Order.find(orderFilter).select('totalBill') //GET LIST OF ORDERS//
        const ledgerlist = await Ledger.find(ledgerFilter) //GET LIST OF TXNS OF SELECTED CLIENT//

        let totalOrders = clientOrderList.length //GET TOTAL ORDERS COUNT//

        let totalBillArr = clientOrderList.map(order => order.totalBill) //GET LIST OF BILLS FOR EACH ORDER//

        //INITIALISE BILLEDORDERS AND TOTAL RECEIVABLES//
        let billedOrders = 0
        let totalReceivables = 0

        //GET TOTAL RECEIVABLES, BILLED ORDERS COUNT//
        totalBillArr.forEach(bill => {
            if(bill){
                billedOrders++
                totalReceivables += bill
            }
        })

        totalReceivables = totalReceivables.toFixed(2)

        //CALCULATE AMOUNT RECEIVED//
        let amountReceived = 0
        ledgerlist.forEach(txn =>{
            txn.type=='credit' ? amountReceived += txn.amount : amountReceived -= txn.amount            
        })

        //CALCULATE AMOUNT PENDING
        let amountPending = totalReceivables - amountReceived
        amountPending = amountPending.toFixed(2)

        //MAKE DATA OBJECT//
        let data = {totalOrders, billedOrders, totalReceivables, amountReceived, amountPending}

        //SEND DATA OBJ TO AJAX//
        res.json(data)

    }catch(err){
        next(err)
    }
}

exports.deleteTxn = async(req, res, next) => {
    try{        
        let debug = require('debug')('c_app: deleteTxn')
        let id = req.params.ledgerId
        let userId = req.user.id        
        
        const user = await User.findById(userId)        

        if(await bcrypt.compare(req.body.pw, user.password)){                        
            await Ledger.findByIdAndDelete(id)
            res.status(200).json({msg: 'success'})
        }else{            
            res.json({msg: 'error'})
        }
    }catch(err){
        next(err)
    }
}

exports.exportLedger = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: exportLedger')
        //GET FORM DATA//
        let {exportClient, ledgerStart, ledgerEnd, orderStart, orderEnd} = req.body        
        let {id} = req.user

        //GET CLIENT INFO//
        let clientData = await User.findById(exportClient).select('username')

        //GET DATE RANGE//
        let dateArray = getDates(new Date(ledgerStart), new Date(ledgerEnd)) 
        let orderDateArray = getDates(new Date(orderStart), new Date(orderEnd)) 
            
        //VALIDATE DATE RANGE//
        if(dateArray.length == 0 || orderDateArray == 0) 
            return res.render('error', {message: `Start Date cannot be after End Date`, statusCode: '400'})                        

        //GET TXN AND ORDER LIST//
        let txnList = await Ledger.find({date: dateArray, client: exportClient})   
        let orderFields = 'bookingDate totalBill chargeableWeight awbNumber'
        let orderList = await Order.find({date: orderDateArray, client: exportClient}).select(orderFields)   
        
        //VALIDATE TXNS//
        if(txnList.length == 0) return res.render('error', {message: `No Transactions found for the selected parameters`, statusCode: '400'})

        //VALIDATE ORDERS//
        let count = checkOrderBillWeight(orderList)
        if(count > 0) return res.render('error', {message: `Some Orders don't have bill/weight added. Please check`, statusCode: '400'})

        //COMPUTE FINAL ARR//
        let finalArr = [...txnList, ...orderList]
        
        finalArr.forEach(item => {
            if(item.date) item.commonDate = item.date
            if(item.bookingDate) item.commonDate = item.bookingDate            
        })        

        finalArr.sort((a, b) => {
            a = new Date(a.commonDate).getTime()
            b = new Date(b.commonDate).getTime()
            return a - b
        })          
        
        //CALCULATE TOTAL DEBIT, CREDIT, BALANCE//
        let totalDebit = 0, totalCredit = 0
        finalArr.forEach(obj =>{
            if(obj.totalBill) totalDebit += obj.totalBill
            if(obj.type=='debit') totalDebit += obj.amount
            if(obj.type=='credit') totalCredit += obj.amount
        })

        let balance = totalDebit - totalCredit
        
        let compData = [
            {Date: '', Description: 'Total', Debit: totalDebit, Credit: totalCredit},
            {Date:'', Description: 'Balance', Debit: balance, Credit: ''}
        ]       
        
    // ------------------------ EXCEL SECTION ------------------------- //
        const workbook = new ExcelJs.Workbook()        

        generateLedgerExport(workbook, finalArr, compData)

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition",`attachment; filename=ledger_${clientData.username}.xlsx`)

        return workbook.xlsx.write(res).then(function (){
            res.status(200).end();
        })        

    }catch(err){
        next(err)
    }
}