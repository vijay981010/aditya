const { check } = require('express-validator')

exports.createUserValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('password', 'Please enter Password').notEmpty()        
]

exports.profileValidator = [
    check('username', 'Please enter Username').notEmpty(),
    check('password', 'Please enter Password').notEmpty()        
]

exports.userSettingValidator = [
    check('username', 'Please enter Username').notEmpty()
]