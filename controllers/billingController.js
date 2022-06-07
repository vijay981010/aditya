const User = require('../model/userModel')
const Billing = require('../model/billingModel')
const {processRequest} = require('../helpers/helpers')
const bcrypt = require('bcrypt')

exports.list = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: billList')
        let {id, role} = req.user
        let user = await User.findById(id)

        let filter = {}
        if(role=='admin') filter = {client: id}
        let billList = await Billing.find(filter).populate({path: 'client', select: 'username'}).sort({date: 'desc'})
        
        let itemList = billList.map(bill => bill.itemDetails)        

        res.render('billing/list', {user, billList, itemList})
    }catch(err){
        next(err)
    }
}

exports.form = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: billForm')
        let {id, role} = req.user
        let user = await User.findById(id)

        let {billId, pageType} = req.params
        
        let clientList = await User.find({role: 'admin'}).select('username')
        let statusList = ['paid', 'pending', 'partial']        

        let renderView = 'billing/add'
        let renderData = {user, clientList, statusList, type:'add'}
        renderData.bill = new Billing()

        if(billId){
            let bill = await Billing.findById(billId).populate('client')            
            renderView = 'billing/edit'             
            renderData.bill = bill    
            renderData.type = 'edit' 
            if(pageType=='view'){
                renderView = 'billing/view'
                renderData.type = 'view'
            }            
        }

        res.render(renderView, renderData)
    }catch(err){
        next(err)
    }
}

exports.process = async(req, res, next) => {
    try{
        let {client, name, description, amount} = req.body
        let {billId} = req.params

        //1. CREATE INVOICE NUMBER IF ADD OPERATION
        if(!billId){
            const billList = await Billing.find().select('billNumber')
            req.body.billNumber = getInvoiceNumber(billList)
        }

        //2. CREATE ITEM DETAILS ARRAY
        let keyArr = ['name', 'description', 'amount']
        let valArr = [name, description, amount]

        req.body.itemDetails = processRequest(valArr, keyArr, name.length)

        //3. CALCULATE TOTAL AMOUNT
        req.body.totalAmount = amount.reduce((a, b) => parseFloat(a) + parseFloat(b))

        //3. CREATE FINAL OBJECT
        let obj = {}
        let fieldArr = Object.keys(req.body)  
        
        keyArr.forEach(key => delete req.body[key])
        fieldArr.forEach(field => obj[field] = req.body[field])
               
        //4. WRITE TO DATABASE AND END
        if(billId){
            await Billing.findByIdAndUpdate(billId, obj)
        }else{
            let response = await new Billing(obj).save()
            if(response._id) await User.findByIdAndUpdate(client, {invoice: response._id})
        }            

        res.redirect('/bills/list') 
        //res.json(obj)
    }catch(err){
        next(err)
    }
}

exports.deleteBill = async(req, res, next) => {
    try{        
        let debug = require('debug')('c_app: deleteBill')
        let id = req.params.billId
        let userId = req.user.id                  
        
        let bill = await Billing.findById(id).select('client').populate({path:'client', select:'invoice'}) 
        let clientId = bill.client._id

        const user = await User.findById(userId)        

        if(await bcrypt.compare(req.body.pw, user.password)){                        
            await Billing.findByIdAndDelete(id)
                                           
            let billList = await Billing.find({client: clientId}).sort({date: 'desc'})

            await User.findByIdAndUpdate(bill.client._id, {invoice: billList[0]._id})

            res.status(200).json({msg: 'success'})
        }else{            
            res.json({msg: 'error'})
        }
    }catch(err){
        next(err)
    }
}

function getInvoiceNumber(arr){
    let num = 100000
    if(arr.length > 0) num += arr.length        

    //Convert to string and prepend E 
    let str = num.toString()
    return`PT${str}`
}
