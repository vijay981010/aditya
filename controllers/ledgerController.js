const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Ledger = require('../model/ledgerModel')
const bcrypt = require('bcrypt')

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