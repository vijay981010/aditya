const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ledgerSchema = new Schema({
    client:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    admin:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
    },
    type: {
        type: String,
        enum: ['credit', 'debit']
    },
    amount: {
        type: Number,
    },
    description: {
        type: String,
        trim: true
    },
    reference: {
        type: String,
        trim: true
    },
    note: {
        type: String,
        trim: true
    }
}, { timestamps: true })



const Ledger = mongoose.model('Ledger', ledgerSchema)

module.exports = Ledger