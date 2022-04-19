const User = require('../model/userModel')
const Service = require('../model/serviceModel')
const debug = require('debug')('dev')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const axios = require('axios')
const { validationResult } = require('express-validator')


exports.userList = async (req, res, next) => {
    try{                
        let userId = req.user.id
        let userList
        const user = await User.findById(userId)

        //GET USERS AS PER ROLE//
        if(user.role == "superadmin"){
            userList = await User.find({role: 'admin'})
        }else if(user.role == "admin"){
            userList = await User.find({role: 'client', admin: userId})
        }
                      
        res.render('user/list', {userList, user})                       
    }catch(err){
        next(err)
    }    
}


exports.createUserPage = async (req, res, next) => {
    try{        
        let userId = req.user.id
        const user = await User.findById(userId)        
        
        res.render('user/add', {user})
    }catch(err){
        next(err)
    }
}

exports.createUser = async (req, res, next) => {
    try{        
    // -------------------------------- VALIDATION -------------------------------- //
        const errors = validationResult(req)
        
        if(!errors.isEmpty()) {            
            let userId = req.user.id
            const user = await User.findById(userId)

            const alert = errors.array()                           
            
            return res.render('user/add', {user, alert})            
        }

    // -------------------------------- PROCESS INPUTS -------------------------------- //
        const {role, username, password} = req.body //GET FORM DATA
        
        const hash = await bcrypt.hash(password, 10) //HASH THE PASSWORD
        
        //GENERATE JWT//
        const token = jwt.sign(
            { data: username },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            {expiresIn : '2h'}
       )

       //CREATE NEW USER OBJECT//
       const newUser = new User({
            role: role,
            username: username,
            password: hash,
            token: token            
        })

        //IF ADMIN CREATING CLIENT USER, ATTACH ADMIN ID REFERENCE//
        if(req.body.admin_id) newUser.admin = req.body.admin_id           
                
        await newUser.save() //WRITE TO DB    

        if(req.user.role == "superadmin"){
            res.redirect('/users/adminlist')
        }else if(req.user.role == "admin"){
            res.redirect('/users/clientlist')
        }        
        
    }catch(err){
        next(err)
    }    
}

exports.singleProfile = async (req, res, next) => {
    try{                
        let userId = req.user.id
        const user = await User.findById(userId)
                
        res.render('profile', {user})
    }catch(err){
        next(err)
    }
}

exports.adminEditClientProfile = async(req, res, next) => {
    try{
        let clientId = req.params.clientId
        let userId = req.user.id

        const user = await User.findById(userId)
        const clientUser = await User.findById(clientId)
        
        res.render('profile/edit', {user, clientUser})
    }catch(err){
        next(err)
    }
}

exports.updateProfile = async (req, res, next) => {
    try{
    // -------------------------------- VALIDATION -------------------------------- //
        const errors = validationResult(req)
        
        if(!errors.isEmpty()) {            
            let userId = req.user.id
            const user = await User.findById(userId)

            const alert = errors.array()                                       
            return res.render('profile', {user, alert})            
        }

    // -------------------------------- PROCESS INPUTS -------------------------------- //        
        const {role, username, password,
        companyName, contactName, address, sacCode,
        contactNumber, email, gstNumber, website, admin_id} = req.body        

        //HASH THE PASSWORD//
        const hash = await bcrypt.hash(password, 10)

        //CREATE JWT//
        const token = jwt.sign(
            { data: username },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            {expiresIn : '2h'}
       )
       
       //CREATE OBJECT TO BE SAVED TO DB//
       let obj = {role, username, password: hash,
        companyName, contactName, address, contactNumber, 
        email, gstNumber, website, sacCode}

        if(admin_id) obj.admin = admin_id //IF CLIENT USER

        //IDENTIFY IF A SELF USER IS UPDATING OR A SUPER USER IS UPDATING A SUB USER//
        let userId = req.user.id
        debug(userId)
        if(req.body.subUserUpdate) userId = req.body.subUserUpdate
        debug(userId)
        
        //WRITE TO DB//
        await User.findByIdAndUpdate(userId, obj, {new: true})

        if(req.body.subUserUpdate){
            res.redirect('/users/clientlist')
        }else{
            res.redirect('/users/profile')
        }
        
        
    }catch(err){
        next(err)
    }
}


exports.settingsPage = async (req, res, next) => {
    try{
        let subUserId = req.params.userId //GET CLIENT ID (FOR ADMIN), ADMIN ID(FOR SUPERADMIN)
        let userId = req.user.id //GET CURRENT USER ID (ADMIN/SUPERADMIN)

        const user = await User.findById(userId)
        let subUser = await User.findById(subUserId)

        let serviceList = await Service.find({ admin: userId })
        
        let moduleList = ['user','services', 'manifest', 'invoice', 'ledger']        
            
        if(userId == subUser.admin || user.role == 'superadmin'){
            res.render('user/edit', {user, subUser, serviceList, moduleList})
        }else{                        
            res.render('error', {message: `You aren't authorized to access this resource`, statusCode: '403'})
        }
    }catch(err){
        next(err)
    }
}

exports.patchSettings = async (req, res, next) => {
    try{
    // -------------------------------- VALIDATION -------------------------------- //
        const errors = validationResult(req)
        
        if(!errors.isEmpty()) {        
            let subUserId = req.params.userId    
            let userId = req.user.id

            const user = await User.findById(userId)
            let subUser = await User.findById(subUserId)
            let serviceList = await Service.find({ admin: userId })
            let moduleList = ['services', 'manifest']

            const alert = errors.array()                                       
            return res.render('user/edit', {user, subUser, serviceList, moduleList, alert})            
        }

    // -------------------------------- PROCESS INPUTS -------------------------------- //
        let { username, password, displayName, defaultService, 
            apiCredit, serviceAccess, accessRight, trackingId } = req.body                 
        
        let hash                

        //check if password is input
        if(password) hash = await bcrypt.hash(password, 10)
        
        let subUserId = req.params.userId
        let userId = req.user.id                

        const user = await User.findById(userId)
        let subUser = await User.findById(subUserId)

        //CHECK FOR DUPLICATE TRACKING ID FOR SUPERADMIN//
        if(user.role=='superadmin'){
            //GET TRACKING IDS OF ALL ADMIN USERS
            let userlist = await User.find({role: 'admin'}).select('trackingId') 
            trackingIdArr = userlist.map(user => user.trackingId)
            if(trackingIdArr.indexOf(trackingId) != -1){
                return res.render('error', {message: 'Tracking ID already exists!!', statusCode: '400'})
            }
        }
        
        //check if it is logged in admin user or superadmin
        let userObj = {}
        if(userId == subUser.admin){
            userObj = {username}
        }else if(user.role == 'superadmin'){
            userObj = {username, displayName, defaultService, apiCredit, serviceAccess, accessRight, trackingId}
        }                  
        
        //check if password is inputted
        if(password) userObj.password = hash        
            
        await User.findByIdAndUpdate(subUserId, userObj, {new: true}) 
            
        if(user.role == 'superadmin'){
            res.redirect('/users/adminlist')
        }else if(user.role == 'admin'){
            res.redirect('/users/clientlist')
        }            

    }catch(err){
        next(err)
    }
}

exports.userstatus = async (req, res, next) => {
    try{
        //debug(req.body)
        let { status, id } = req.body
        let obj = { status }

        let response = await User.findByIdAndUpdate(id, obj, {new: true})
        //debug(response)
        if(response){
            res.status(200).json({message: 'success'})
        }else{
            res.status(400).json({message: 'error'})
        }        
    }catch(err){
        next(err)
    }
}