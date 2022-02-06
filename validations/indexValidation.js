const { check } = require('express-validator')
const User = require('../model/userModel')

exports.autheticateUserValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('username').custom(async value => {
        const user = await User.findOne({ username: value })
        if (!user) {
            return Promise.reject('User doesnt exist')
        }else if(user.status == 'inactive'){
            return Promise.reject('Your subscription has expired. Kindly renew or contact your service provider')
        }
    }),    
    check('password', 'Please enter Password').notEmpty()
]