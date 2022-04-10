const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bagSchema = new Schema({
    bagNumber: {
        type: String,
        trim: true,
        maxLength: 30
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',             
    }
})

const manifestSchema = new Schema({
    manifestNumber: {
        type: String,
        trim: true,
        maxLength: 15        
    },
    manifestDate: {
        type: Date,
        default: Date.now                
    },
    dispatchTo: {
        type: String,        
        enum: ['Rainbow Logistics Ltd', 'Rainbow Sky Couriers LLC', 'Deanshill Logistics Ltd']
    },
    manifestOrigin: {
        type: String,        
        maxLength: 15
    },
    manifestDestination: {
        type: String,        
        maxLength: 15
    },
    manifestMode: {
        type: String,        
        enum: ['International']
    },
    mawbNumber: {
        type: String,        
        trim: true,
        maxLength: 20
    },
    cdNumber: {
        type: String,        
        trim: true,
        maxLength: 15
    },
    runNumber: {
        type: String,        
        trim: true,
        maxLength: 15
    },
    flightNumber: {
        type: String,        
        trim: true,
        maxLength: 15
    },
    totalAwbs: {
        type: Number
    },
    bagDetails: [bagSchema],
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }   
}, { timestamps: true })


const Manifest = mongoose.model('Manifest', manifestSchema)

module.exports = Manifest