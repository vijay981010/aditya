const mongoose = require('mongoose')

const Schema = mongoose.Schema

const serviceSchema = new Schema({
    serviceName: {
        type: String,
        trim: true,
        maxlength: 30
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: 30
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })



const Service = mongoose.model('Service', serviceSchema)

module.exports = Service