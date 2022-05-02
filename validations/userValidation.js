const { check } = require('express-validator')
const User = require('../model/userModel')
const {regexUpperCase} = require('../helpers/helpers')
const debug = require('debug')('dev')

exports.createUserValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('username').custom(async (value, req) => {
        //GET ADMIN ID//
        //debug(req.req.user.id)
        let userId = req.req.user.id        
        //GET ARRAY OF ALL USERNAMES FOR RESPECTIVE ADMIN//
        let userlist = await User.find({admin:userId}).select('username') //
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