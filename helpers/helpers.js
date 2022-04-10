const User = require('../model/userModel')
const Order = require('../model/orderModel')
const jwt = require('jsonwebtoken')
const debug = require('debug')('dev')
const logger = require('../helpers/logger')

exports.verifyToken = (req, res, next) => {    
    const token = req.cookies.coapp;     
    //logger.info(`verifyToken invoked on URL: ${req.originalUrl}`)   
    if (!token) {
        //return res.status(403).json({message: "A token is required for authentication"})          
        return res.render('error', {message: `A token is required for authentication`, statusCode: '403'})            
    }    
    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);        
        req.user = decoded;
    }catch(err){        
        //return res.status(401).json({Message: "Invalid Token"})
        return res.render('error', {message: `Invalid Token`, statusCode: '401'})        
    }
    next();
}

exports.authorizeRole = (role) =>{    
    return async (req, res, next) => {        
        /* debug(req.user.role)
        debug(role) */        
        if(role.indexOf(req.user.role) == -1){
            //return res.status(403).json({message: "This page is not availaible for you"})
            return res.render('error', {message: `This page is not availaible for you`, statusCode: '403'})
        }        
        next()
    }
}

exports.authorizeUser = (req, res, next) => {    
    //debug(req.user)
    //debug(req.params)
    //debug(req)    
    //debug(req.session)
    if(req.user.role == 'superadmin'){
        return next()
    }else if(req.user.id != req.session.data){
        //return res.status(403).json({message: "Not Authorized"})
        return res.render('error', {message: `Sorry, you have been logged out or you aren't the authorized User`, statusCode: '403'})
    }
    //debug('passed')
    next()    
}

exports.authorizeOrderResource = async (req, res, next) => {
    try{
        let orderId = req.params.orderId
        let userId = req.user.id

        let order = await Order.findById(orderId).populate('client').exec()
        let user = await User.findById(userId)

        if(order.client.admin == userId || order.client._id == userId){
            next()      
        }else{            
            //res.status(403).send("Resource Not Authorized") 
            res.render('error', {message: `Resource Not Authorized`, statusCode: '403'})           
        }
    }catch(err){
        next(err)
    }
}

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

exports.sortBoxItem = (box, item, numOfBox) => {
    /* debug(box)
    debug(item)
    debug(numOfBox) */
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