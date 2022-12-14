const User = require('../model/userModel')

exports.list = async(req, res, next) => {
    try{
        let userId = req.user.id        
        let user = await User.findById(userId)

        let settingsList = [ {name: 'AWB Pdf', url: '/settings/awb'} ]

        if(user.accessRight.indexOf('invoice') != -1) settingsList.push({name: 'Invoice Pdf', url: '/settings/invoice'})
        if(user.accessRight.indexOf('manifest') != -1) settingsList.push({name: 'Manifest', url: '/settings/manifest'})

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

exports.invoiceSettings = async(req, res, next) => {
    try{
        
        let userId = req.user.id        
        let user = await User.findById(userId)

        let invoiceSettings = user.invoiceSettings        
        
        res.render('setting/invoice', {user, invoiceSettings})
    }catch(err){
        next(err)
    }
}

exports.processInvoiceSettings = async(req, res, next) => {
    try{        

        let userId = req.user.id
        
        let {layout} = req.body
        
        invoiceSettings = {layout}

        await User.findByIdAndUpdate(userId, {invoiceSettings})
        res.redirect('/settings/list')
    }catch(err){
        next(err)
    }
}

exports.manifestSettings = async(req, res, next) => {
    try{
        
        let userId = req.user.id        
        let user = await User.findById(userId)

        let manifestSettings = user.manifestSettings        
        
        res.render('setting/manifest', {user, manifestSettings})
    }catch(err){
        next(err)
    }
}

exports.processManifestSettings = async(req, res, next) => {
    try{
        //res.json(req.body)
        let userId = req.user.id

        let updateObj = {manifestSettings: req.body}

        await User.findByIdAndUpdate(userId, updateObj)

        res.redirect('/settings/manifest')

    }catch(err){
        next(err)
    }
}