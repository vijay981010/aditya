const mongoose = require('mongoose')

const Schema = mongoose.Schema


const billingSchema = new Schema({
    billNumber:{
        type: String,
        required: true
    },
    date:{
        type: Date,                       
    },    
    note: {
        type: String,
        trim: true
    },
    itemDetails: [{    
        name: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },           
        amount: Number    
    }],
    totalAmount: {
        type: Number,
    },   
    status: {
        type: String,
    }, 
    paymentDate: {
        type: Date,
    },
    paymentLink: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    client:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
},{ timestamps: true })

const Billing = mongoose.model('Billing', billingSchema)

module.exports = Billing