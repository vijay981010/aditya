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
        const errors = validationResult(req)

        //validation
        if(!errors.isEmpty()) {                        
            const alert = errors.array()                                       
            return res.render('index', {alert})            
        }

        let { username, password } = req.body

        const user = await User.findOne({username:req.body.username})
        
        //password match in dB
        if(user && await bcrypt.compare(password, user.password)){
            session = req.session;
            session.data = user._id;
            const token = jwt.sign({ 
                id: user._id,
                role: user.role
            },
                process.env.ACCESS_TOKEN_SECRET_KEY,
                {expiresIn : '2h'}
            );
           user.token = token;                 
                           
           res.cookie('coapp', token, { 
                maxAge: 1000*60*60*2,  
                httpOnly: true 
           });              
           res.redirect('/dashboard')                                                                                                          
        }else{
            //res.send('Incorrect username/password')          
            res.render('error', {message: `Incorrect Password`, statusCode: '400'})
        }    
    }catch(err){
        next(err)
    }

}
