const mongoose = require('mongoose')

const Schema = mongoose.Schema

const hsnSchema = new Schema({
    item:{
        type: String,
        trim: true
    },
    hsnCode:{
        type: String,
        trim: true
    },
    admin:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
},{ timestamps: true })

const Hsn = mongoose.model('Hsn', hsnSchema)

module.exports = Hsn