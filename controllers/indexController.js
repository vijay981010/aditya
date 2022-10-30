const User = require('../model/userModel')
const debug = require('debug')('dev')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

exports.loginPage = (req, res, next) => { 
    try{             
        
        //let session = req.session
        let token = req.cookies.coapp
        
        if(token){                                        
            res.redirect('/dashboard')            
        }else{
            res.render('index')
        }

    }catch(err){
        next(err)
    }    
}

exports.logoutPage = (req, res, next) => {
    try{        
        res.clearCookie('coapp')
        res.redirect('/')
    }catch(err){
        next(err)
    }
}

exports.authenticateUser = async (req, res, next) => {        
    try{
    // ------------------- VALIDATION ------------------- //
        const errors = validationResult(req)

        //RENDER ERRORS//
        if(!errors.isEmpty()) {                        
            const alert = errors.array()                                       
            return res.render('index', {alert})            
        }

    // ------------------- PROCESS INPUT ------------------- //
        let { username, password, adminCode } = req.body

        const user = await User.findOne({username, adminCode}).populate('admin').populate('invoice')
        
        //CHECK IF ADMIN USER HAS ACCESS TO USERS MODULE//  
        if(user.role == 'client' && user.admin.accessRight.indexOf('user') == -1) 
            return res.status(400).render('error', {message: `Access Unauthorized`, statusCode: '400'})        
        
        //CHECK IF PASSWORD IS CORRECT//
        if(user && await bcrypt.compare(password, user.password)){                  
            //DATA TO SIGN ON JWT
            let data = { id: user._id, role: user.role }

            //SET JWT//
            const token = jwt.sign( data, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn : '24h'} )                       
                           
            //SET COOKIE//
            res.cookie('coapp', token, { 
                    secure: process.env.NODE_ENV !== "development",
                    sameSite: true,
                    maxAge: 1000*60*60*24,  
                    httpOnly: true 
            })
            
            //REDIRECT TO DASHBOARD//
            res.status(200).redirect('/dashboard')                                                                                                          
        }else{                      
            res.status(400).render('error', {message: `Incorrect Password`, statusCode: '400'})
        }    
    }catch(err){
        next(err)
    }

}


