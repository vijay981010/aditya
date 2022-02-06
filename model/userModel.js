const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    role: {
        type: String,
        required: true
    },    
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    token: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    contactName: {
        type: String,
        trim: true,
        maxlength: 30
    },
    address: {
        type: String,
        trim: true,
        maxlength: 200
    },
    contactNumber: {
        type: String,
        trim: true,
        maxlength: 15
    },
    email: {
        type: String,
        trim: true,
        maxlength: 30
    },
    gstNumber: {
        type: String,
        trim: true,
        maxlength: 15
    },
    website: {
        type: String,
        trim: true,
        maxlength: 30
    },
    accessRight: {
        type: Array,
    },
    serviceAccess: {
        type: Array,
    },
    defaultService: {
        type: String,
    },    
    apiCredit: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['active', 'inactive']
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',             
    }    
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User