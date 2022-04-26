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
    },
    contactNumber: {
        type: String,        
        trim: true,              
    },
    email: {
        type: String,
        trim: true,        
    },    
    address1: {
        type: String,
        trim: true,        
    },
    address2: {
        type: String,
        trim: true,        
    },
    address3: {
        type: String,
        trim: true,        
    },
    pincode: {
        type: String,
        trim: true,        
    },
    city: {
        type: String,
        trim: true,        
    },
    state: {
        type: String,
        trim: true,        
    },
    country: {
        type: String,
        trim: true,        
    },
    docType: {
        type: String,
        trim: true,        
    },
    docNumber: {
        type: String,
        trim: true,        
    },
    admin: {
        type: Schema.Types.ObjectId,        
        ref: 'User',    
    },
    client: {
        type: Schema.Types.ObjectId,        
        ref: 'User',    
    }
}, { timestamps: true })

const Walkin = mongoose.model('Walkin', walkinSchema)

module.exports = Walkin