const User = require('../model/userModel')
const debug = require('debug')('dev')

exports.list = async(req, res, next) => {
    try{
        let userId = req.user.id
        
        let user = await User.findById(userId)

        let settingKeys = Object.keys(user.settings)
        let settingVals = Object.values(user.settings)
        
        settingVals = settingVals.filter(setting => setting == true)
        
        //let clientSettingVals = Object.values(customer.clientSettings)

        res.render('setting/list', {user, settingKeys, settingVals})
    }catch(err){
        next(err)
    }
}