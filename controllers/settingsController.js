const User = require('../model/userModel')

exports.list = async(req, res, next) => {
    try{
        let userId = req.user.id        
        let user = await User.findById(userId)

        let settingsList = [
            {name: 'AWB Pdf', url: '/settings/awb'}
        ]

        res.render('setting/list', {user, settingsList})
    }catch(err){
        next(err)
    }
}

let debug = require('debug')('c_app: awbSettings')

exports.awbSettings = async(req, res, next) => {
    try{
        
        let userId = req.user.id        
        let user = await User.findById(userId)

        let awbSettings = user.awbSettings
        if(awbSettings.title.name === undefined){
            awbSettings = {
                title: {name: 'AIRWAY BILL', fontSize: 20, xStart: 0, yStart: 0, width: 595, align:'center'},
                subTitle: {name: user.displayName, fontSize: 15, xStart: 0, yStart: 20, width: 595, align:'center'}
            }
        }
        
        res.render('setting/awb', {user, awbSettings})
    }catch(err){
        next(err)
    }
}

exports.processAwbSettings = async(req, res, next) => {
    try{        

        let userId = req.user.id
        
        let valArr = Object.values(req.body)
        let keys = ['name', 'fontSize', 'xStart', 'yStart', 'width', 'align']
        
        let title = {}, subTitle = {}, awbSettings = {}
        keys.forEach((item,i) => {
            title[item] = valArr[i]
            subTitle[item] = valArr[i+6]
        })
        
        awbSettings = {title, subTitle}

        await User.findByIdAndUpdate(userId, {awbSettings})
        res.redirect('/settings/list')
    }catch(err){
        next(err)
    }
}