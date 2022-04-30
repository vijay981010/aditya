const mongoose = require('mongoose')

const Schema = mongoose.Schema


const invoiceSchema = new Schema({
    invoiceNumber:{
        type: String,
        required: true
    },
    invoiceDate:{
        type: Date,        
        default: Date.now()        
    },
    invoiceStartDate:{
        type: Date,
        required: true,        
    },
    invoiceEndDate:{
        type: Date,
        required: true,        
    },
    note: {
        type: String,
        trim: true
    },
    totalAmount: {
        type: Number,
    },
    totalWeight: {
        type: Number,
    },
    totalAwbs: {
        type: Number,
    },
    client:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    admin:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
},{ timestamps: true })

const Invoice = mongoose.model('Invoice', invoiceSchema)

module.exports = Invoice