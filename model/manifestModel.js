const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bagSchema = new Schema({
    bagNumber: {
        type: String,
        trim: true,        
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',             
    },
    mhbsNumber: {
        type: String,
        trim: true
    }
})

const manifestSchema = new Schema({
    manifestNumber: {
        type: String,
        trim: true,            
    },
    manifestDate: {
        type: Date,
        default: Date.now                
    },
    dispatchFrom: {
        type: String,        
        enum: ['Express Parcel Service', 'International Express']
    },
    dispatchTo: {
        type: String,        
        enum: ['Rainbow Logistics Ltd', 'Rainbow Sky Couriers LLC', 'Deanshill Logistics Ltd', 'Skyport Worldwide Ltd']
    },
    manifestOrigin: {
        type: String,            
    },
    manifestDestination: {
        type: String,                
    },
    manifestMode: {
        type: String,        
        enum: ['International']
    },
    mawbNumber: {
        type: String,        
        trim: true,        
    },
    cdNumber: {
        type: String,        
        trim: true,        
    },
    runNumber: {
        type: String,        
        trim: true,        
    },
    flightNumber: {
        type: String,        
        trim: true,        
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