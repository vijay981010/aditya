const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Service = require('../model/serviceModel')
const debug = require('debug')('dev')

exports.serviceList = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)

        const serviceList = await Service.find({admin: userId})
        res.render('servicelist', {user, serviceList}) 
    }catch(err){
        next(err)
    }
}

exports.serviceForm = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)

        res.render('addservice', { user, service: new Service() }) 
    }catch(err){
        next(err)
    }
}

exports.createService = async(req, res, next) => {
    try{
        let { admin, serviceName, displayName } = req.body

        let obj = { admin, serviceName, displayName }

        const service = new Service(obj)

        await service.save()

        res.redirect('/services/list')
    }catch(err){
        next(err)
    }
}

exports.serviceUpdateForm = async(req, res, next) => {
    try{
        let userId = req.user.id
        let serviceId = req.params.serviceId

        const user = await User.findById(userId)
        const service = await Service.findById(serviceId)
    
        res.render('updateservice', { user, service })
    }catch(err){
        next(err)
    }
}

exports.updateService = async(req, res, next) => {
    try{
        let { admin, serviceName, displayName } = req.body
        let serviceId = req.params.serviceId

        let obj = { admin, serviceName, displayName }        

        await Service.findByIdAndUpdate(serviceId, obj, {new: true})

        res.redirect('/services/list')
    }catch(err){
        next(err)
    }
}