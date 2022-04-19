const User = require('../model/userModel')
const Walkin = require('../model/walkinModel')
const debug = require('debug')('dev')
const mongoose = require('mongoose')

const db = mongoose.connection

exports.list = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)

        const walkinlist = await Walkin.find({admin: userId}).sort({updatedAt: 'desc'})

        res.render('walkin/list', {user, walkinlist})
    }catch(err){
        next(err)
    }
}

exports.search = async(req, res, next) => {
    try{
        //debug(req.query)
        let {role, name} = req.query

        let data = await Walkin.findOne({role: role, name: name})
        //debug(data)
        res.status(200).json(data)
    }catch(err){
        next(err)
    }
}

exports.view = async(req, res, next) => {
    try{
        let userId = req.user.id
        let walkinId = req.params.walkinId
        
        const user = await User.findById(userId)
        const walkin = await Walkin.findById(walkinId)
        const countries = await db.collection('countries').find().toArray()

        res.render('walkin/edit', {user, walkin, countries})
    }catch(err){
        next(err)
    }
}

exports.edit = async(req, res, next) => {
    try{
        let walkinId = req.params.walkinId

        let {
            role, name, contactNumber, email, address1, 
            address2, address3, pincode, city, state, 
            country, docType, docNumber
        } = req.body

        let obj = {
            role, name, contactNumber, email, address1, 
            address2, address3, pincode, city, state, 
            country, docType, docNumber
        }

        await Walkin.findByIdAndUpdate(walkinId, obj, {new: true})

        res.redirect(`/walkins/${walkinId}/edit`)
        //res.json(obj)
    }catch(err){
        next(err)
    }
}