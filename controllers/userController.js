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
        if(user.role == "superadmin"){
            userList = await User.find({role: 'admin'})
        }else if(user.role == "admin"){
            userList = await User.find({role: 'client', admin: userId})
        }
        
        /* if(clientList.length == 0){
            res.json({ListOfUsers: 'No Users'})
        }else{
                        
        } */           
        
        res.render('user', {userList, user})                       
    }catch(err){
        next(err)
    }    
}


exports.createUserPage = async (req, res, next) => {
    try{
        //debug(req)
        //res.send(`Create user page for id: ${req.params.userId}`)
        let userId = req.user.id
        const user = await User.findById(userId)        
        res.render('adduser', {user})
    }catch(err){
        next(err)
    }
}

exports.createUser = async (req, res, next) => {
    try{        
        const errors = validationResult(req)

        //validation
        if(!errors.isEmpty()) {            
            let userId = req.user.id
            const user = await User.findById(userId)

            const alert = errors.array()                           
            //debug(alert)            
            return res.render('adduser', {user, alert})
            //return res.render('error', {alert, link: '/users/add'})
        }

        const {role, username, password} = req.body
        
        const hash = await bcrypt.hash(password, 10)
        const token = jwt.sign(
            { data: username },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            {expiresIn : '2h'}
       );
       const newUser = new User({
            role: role,
            username: username,
            password: hash,
            token: token            
        })

        if(req.body.admin_id){ 
            newUser.admin = req.body.admin_id                       
        }
        //debug(req.user)
        await newUser.save()        
        if(req.user.role == "superadmin"){
            res.redirect('/users/adminlist')
        }else if(req.user.role == "admin"){
            res.redirect('/users/clientlist')
        }
        /* res.json({
            message: 'User created successfuly', 
            data: user
        }) */
        
    }catch(err){
        next(err)
    }    
}

exports.singleProfile = async (req, res, next) => {
    try{
        //res.status(200).send(`Profile Form View and Update of ${req.user.id}`)
        let userId = req.user.id
        const user = await User.findById(userId)
        //debug(user.token)
        res.render('profile', {user})
    }catch(err){
        next(err)
    }
}

exports.updateProfile = async (req, res, next) => {
    try{
        const errors = validationResult(req)

        //validation
        if(!errors.isEmpty()) {            
            let userId = req.user.id
            const user = await User.findById(userId)

            const alert = errors.array()                                       
            return res.render('profile', {user, alert})            
        }

        const {role, username, password,
        companyName, contactName, address, 
        contactNumber, email, gstNumber, website, admin_id} = req.body

        //debug(req.body)

        const hash = await bcrypt.hash(password, 10);
        const token = jwt.sign(
            { data: username },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            {expiresIn : '2h'}
       );
       
       let obj = {role, username, password: hash,
        companyName, contactName, address, contactNumber, 
        email, gstNumber, website}

        if(admin_id){
            obj.admin = admin_id
        }

        await User.findByIdAndUpdate(req.user.id, obj, {new: true})
        res.redirect('/users/profile')
        
    }catch(err){
        next(err)
    }
}


exports.settingsPage = async (req, res, next) => {
    try{
        let subUserId = req.params.userId
        let userId = req.user.id

        const user = await User.findById(userId)
        let subUser = await User.findById(subUserId)
        let serviceList = await Service.find({ admin: userId })
        let moduleList = ['services', 'manifest']
        //debug(subUser.serviceAccess)        
            
        if(userId == subUser.admin || user.role == 'superadmin'){
            res.render('userSettings', {user, subUser, serviceList, moduleList})
        }else{            
            //res.status(403).send("Resource Not Authorized")
            res.render('error', {message: `You aren't authorized to access this resource`, statusCode: '403'})
        }
    }catch(err){
        next(err)
    }
}

exports.patchSettings = async (req, res, next) => {
    try{
        const errors = validationResult(req)

        //validation
        if(!errors.isEmpty()) {        
            let subUserId = req.params.userId    
            let userId = req.user.id

            const user = await User.findById(userId)
            let subUser = await User.findById(subUserId)
            let serviceList = await Service.find({ admin: userId })
            let moduleList = ['services', 'manifest']

            const alert = errors.array()                                       
            return res.render('userSettings', {user, subUser, serviceList, moduleList, alert})            
        }

        //debug(req.body)
        let { username, password, apiCredit, serviceAccess, accessRight } = req.body
        let hash
        //debug(accessRight)

        //check if password is input
        if(password){
            hash = await bcrypt.hash(password, 10)
        }
        
        let subUserId = req.params.userId
        let userId = req.user.id

        //check if username is blank
        if(!username){
            res.status(400).send('Username cannot be blank')
        }

        const user = await User.findById(userId)
        let subUser = await User.findById(subUserId)
        
        //check if it is logged in admin user or superadmin
        if(userId == subUser.admin || user.role == 'superadmin'){
            let obj = { username, apiCredit, serviceAccess, accessRight }
            
            //check if password is inputted
            if(password){
                obj.password = hash
            }
            
            //debug(obj)
            //debug(subUserId)
            await User.findByIdAndUpdate(subUserId, obj, {new: true}) 
            //debug(obj)           
            if(user.role == 'superadmin'){
                res.redirect('/users/adminlist')
            }else if(user.role == 'admin'){
                res.redirect('/users/clientlist')
            }            
        }else{            
            //res.status(403).send("Resource Not Authorized")
            res.render('error', {message: `You aren't authorized to access this resource`, statusCode: '403'})
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