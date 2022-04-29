const { check } = require('express-validator')
const User = require('../model/userModel')
const {regexUpperCase} = require('../helpers/helpers')

exports.createUserValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('username').custom(async value => {
        //GET ARRAY OF ALL USERNAMES//
        let userlist = await User.find().select('username') 
        userlist = userlist.map(user => user.username)

        //GET BOOLEAN ARR OF MATCHED USERNAMES//
        let checkArr = regexUpperCase(userlist,value)

        //IF ARRAY CONTAINS TRUE, RENDER ERROR//
        if (checkArr.indexOf(true) != -1) {
            return Promise.reject('User already exists')
        }
    }), 
    check('password', 'Please enter Password').notEmpty()        
]

exports.profileValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('password', 'Please enter Password').notEmpty()        
]

exports.userSettingValidator = [
    check('username', 'Please enter Username').notEmpty()
]