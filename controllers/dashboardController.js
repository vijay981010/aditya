const debug = require('debug')('dev')
const User = require('../model/userModel')

exports.index = async (req, res, next) => {
    try{
        //debug(req)
        let userId = req.session.data
        const user = await User.findById(userId)
        //debug(user)
        res.render('dashboard', {user})
        
        
    }catch(err){
        next(err)
    }    
}