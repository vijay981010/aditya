const User = require('../model/userModel')
const Order = require('../model/orderModel')
const jwt = require('jsonwebtoken')
const Invoice = require('../model/invoiceModel')
const Manifest = require('../model/manifestModel')
const Walkin = require('../model/walkinModel')

exports.verifyToken = (req, res, next) => {    
    const token = req.cookies.coapp     
          
    if (!token)              
        return res.status(401).render('error', {message: `A token is required for authentication`, statusCode: '403'})            
    
    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY) 
        req.user = decoded
    }catch(err){                
        return res.render('error', {message: `Invalid Token`, statusCode: '401'})        
    }
    next()
}

// ----------------------------------------------------------------------------------------------- //

exports.authorizeRole = (role) =>{  
    let debug = require('debug')('c_app: authorizeRole')
    return async (req, res, next) => {                      
        if(role.indexOf(req.user.role) == -1){            
            return res.status(403).render('error', {message: `This page is not availaible for you`, statusCode: '403'})
        }
                    
        next()
    }
}

exports.authorizeModule = (mod) => {
    return async(req, res, next) => {
        let user = await User.findById(req.user.id).select('accessRight')
        
        if(!user.accessRight.includes(mod)) 
            return res.status(403).render('error', {message: `This module isn't in your plan`, statusCode: '403'})

        next()
    }
}
// ------------------------------------------------------------------------------------------------ //

exports.authorizeAddOn = (addOn) => {
    return async(req, res, next) =>{
        try{
            let userId = req.user.id
            let user = await User.findById(userId).populate('admin').exec()

            if(user.role=='admin' && user.settings[addOn] || user.role=='client' && user.admin.clientSettings[addOn]){
                next()
            }else{
                return res.render('error', {message: `You have not purchased this addon: ${addOn}`, statusCode: '403'})
            }
        }catch(err){
            next(err)
        }
    }
}

// ----------------------------------------------------------------------------------------------- //

exports.authorizeResource = async (req, res, next) => {                      
    try{
        let userId = req.user.id
        let user = await User.findById(userId)

        if(req.params.invoiceId){
            let invoiceId = req.params.invoiceId
            let invoice = await Invoice.findById(invoiceId)
            
            if(invoice.admin == userId){
                next()      
            }else{                        
                res.render('error', {message: `Resource Not Authorized`, statusCode: '403'})           
            }
        }else if(req.params.orderId){
            let orderId = req.params.orderId            
            let order = await Order.findById(orderId).populate('client').exec()
            
            if(order.client.admin == userId || order.client._id == userId){
                next()      
            }else{                        
                res.render('error', {message: `Resource Not Authorized`, statusCode: '403'})           
            }
        }else if(req.params.manifestId){
            let manifestId = req.params.manifestId
            let manifest = await Manifest.findById(manifestId)
            
            if(manifest.admin == userId){
                next()      
            }else{                        
                res.render('error', {message: `Resource Not Authorized`, statusCode: '403'})           
            }
        }else if(req.params.walkinId){
            let walkinId = req.params.walkinId
            let walkin = await Walkin.findById(walkinId)
            
            if(walkin.admin == userId || walkin.client == userId){
                next()      
            }else{                        
                res.render('error', {message: `Resource Not Authorized`, statusCode: '403'})           
            }
        }       
    }catch(err){
        next(err)
    }          
}

// ----------------------------------------------------------------------------------------------- //

exports.processRequest = (valueArray, keyArray, arrayLength) => {
    let arr = []
    for(let i = 0; i < arrayLength; i++){
    let obj = {}  
      for(let j = 0; j < valueArray.length; j++){            
        obj[keyArray[j]] = valueArray[j][i]                  
      }
    arr.push(obj)
    }
    return arr
}

// ----------------------------------------------------------------------------------------------- //

exports.sortBoxItem = (box, item, numOfBox) => {    
    for(let i = 0; i < numOfBox; i++){
    let tempArr = []
    item.forEach(elem => {
      if(elem.boxNumber == i+1){
        tempArr.push(elem)
      }
    })
    box[i].itemDetails = tempArr
  }
  return box
}

// --------------------------------------------- GET ARRAY OF DATES IN RANGE ----------------------------------------- //

exports.getDates = (startDate, endDate) => {
    const dates = []
    let currentDate = startDate
    const addDays = function (days) {
      const date = new Date(this.valueOf())
      date.setDate(date.getDate() + days)
      return date
    }
    while (currentDate <= endDate) {
      dates.push(currentDate)
      currentDate = addDays.call(currentDate, 1)
    }
    return dates
  }

  // --------------------------------------------- UPPERCASE REGEX CHECK ----------------------------------------- //

  exports.regexUpperCase = (arr, value) => {
    let checkArr = arr.map(item => {
      let regex = new RegExp(`(?:^|\W)${item}(?:$|\W)`,'i')
      return regex.test(value)
    })
    return checkArr
  }

  // ------------------------------------------ FIRST CHARACTER OF EVERY WORD CAPITALIZED -------------------------- //

  exports.toTitleCase = str => str.replace(/(^\w|\s\w|[,]\w)/g, m => m.toUpperCase())

  // ---------------------------------------- GET AWB PREFIX ----------------------------------------- //

  exports.getPrefix = (d) => {    
    d =  new Date(d)

    let m = d.getMonth() + 1 // get current month in number
    m = JSON.stringify(m)
    if(m.length == 1) m = 0 + m        

    let y = JSON.stringify(d.getFullYear()) // get current year in number
    y = y.substring(2,4)

    let date = JSON.stringify(d.getDate()) // get current day in number
    if(date.length == 1) date = 0 + date

    return prefix = 'A' + date + m + y    
}

exports.getXthDay = (date, gapInDays) => {
    let d = new Date(date)
    let timeInMs = d.getTime()
    
    const gap = 1000 * 60 * 60 * 24 * gapInDays
    let xthDay = timeInMs + gap
    let xthDate = new Date(xthDay)
    return xthDate.toISOString().split('T')[0]
  }

  // ------------------------------------- CHECK ORDERS FOR BILL AND WEIGHT ------------------------- //
  exports.checkOrderBillWeight = (orders) => {
    let count = 0
    orders.forEach(order => {
        if(!order.totalBill) count++
        if(!order.chargeableWeight) count++
    })
    return count
}