const User = require('../model/userModel')
const debug = require('debug')('dev')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

exports.loginPage = (req, res, next) => { 
    try{
        session = req.session
        //debug(session)
        if(session.data){
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
        req.session.destroy()
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
        let { username, password } = req.body

        const user = await User.findOne({username}).populate('admin')
        
        //CHECK IF ADMIN USER HAS ACCESS TO USERS MODULE//  
        if(user.role == 'client' && user.admin.accessRight.indexOf('user') == -1) 
            return res.render('error', {message: `Access Unauthorized`, statusCode: '400'})
        
        //CHECK IF PASSWORD IS CORRECT//
        if(user && await bcrypt.compare(password, user.password)){
            //SET SESSION//
            session = req.session
            session.data = user._id

            //SET JWT//
            const token = jwt.sign({ 
                id: user._id,
                role: user.role
            },
                process.env.ACCESS_TOKEN_SECRET_KEY,
                {expiresIn : '2h'}
            )
           user.token = token             
                           
           //SET COOKIE//
           res.cookie('coapp', token, { 
                maxAge: 1000*60*60*2,  
                httpOnly: true 
           })
           
           //REDIRECT TO DASHBOARD//
           res.redirect('/dashboard')                                                                                                          
        }else{                      
            res.render('error', {message: `Incorrect Password`, statusCode: '400'})
        }    
    }catch(err){
        next(err)
    }

}
