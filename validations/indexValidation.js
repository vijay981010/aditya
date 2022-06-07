const { check } = require('express-validator')
const User = require('../model/userModel')

exports.autheticateUserValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('username').custom(async value => {
        const user = await User.findOne({ username: value }).populate('invoice')
        if (!user) {
            return Promise.reject('User doesnt exist')
        }else if(user.status == 'inactive'){
            return Promise.reject('Your subscription has expired. Kindly renew or contact your service provider')
        }else if(user.username == 'Miscellaneous'){
            return Promise.reject('This user is not permitted to login!!')
        }else if(user.role=='admin' && checkDateExpiry(user.invoice.paymentDate) && user.invoice.status != 'paid'){
            return Promise.reject('Your Subscription has expired. Kindly clear invoice to resume or contact Admin')
        }
    }),    
    check('password', 'Please enter Password').notEmpty(),
    check('adminCode', 'Please enter Admin Code').notEmpty(),
    check('adminCode').custom(async (value, req) => {
        let debug = require('debug')('c_app: loginValidator')                
        
        let {username} = req.req.body
        let user = await User.findOne({username, adminCode: value})        
                
        if(user == null) return Promise.reject('Incorrect Admin Code!!')
        
        debug(user.username, user.adminCode, user._id)
    })
]

function checkDateExpiry(expiryDate){
    let d = new Date()
    let time = d.getTime()
    let d2 = new Date(expiryDate)
    let time2 = d2.getTime()
    if(time2 < time) return true
    return false
}