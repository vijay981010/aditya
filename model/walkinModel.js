const mongoose = require('mongoose')

const Schema = mongoose.Schema

const walkinSchema = new Schema({
    role: {
        type: String,
        required: true
    },    
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40
    },
    contactNumber: {
        type: String,        
        trim: true,
        maxlength: 30        
    },
    email: {
        type: String,
        trim: true,
        maxlength: 30
    },    
    address1: {
        type: String,
        trim: true,
        maxlength: 200
    },
    address2: {
        type: String,
        trim: true,
        maxlength: 200
    },
    address3: {
        type: String,
        trim: true,
        maxlength: 200
    },
    pincode: {
        type: String,
        trim: true,
        maxlength: 20
    },
    city: {
        type: String,
        trim: true,
        maxlength: 30
    },
    state: {
        type: String,
        trim: true,
        maxlength: 30
    },
    country: {
        type: String,
        trim: true,
        maxlength: 30
    },
    docType: {
        type: String,
        trim: true,
        maxlength: 30
    },
    docNumber: {
        type: String,
        trim: true,
        maxlength: 30
    },
    admin: {
        type: Schema.Types.ObjectId,        
        ref: 'User',    
    }
}, { timestamps: true })

const Walkin = mongoose.model('Walkin', walkinSchema)

module.exports = Walkin