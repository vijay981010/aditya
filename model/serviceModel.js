const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ratechartSchema = new Schema({
    weight: {
        type: Number,
    },
    rate: {
        type: Number,
    }
})

const zoneSchema = new Schema({        
    zoneName: {
        type: String,
        trim: true,        
    },
    countries: {
        type: Array,        
    },
    ratechart: [ ratechartSchema ],           
}, { timestamps: true } )

const serviceSchema = new Schema({
    serviceCode: {
        type: String,
        trim: true,        
    },
    displayName: {
        type: String,
        trim: true,
    },
    //category: String,    
    serviceFsc:{
        type: Number,
    },
    serviceGst:{
        type: Boolean,
    },
    zone: [zoneSchema],
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    client: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true })



const Service = mongoose.model('Service', serviceSchema)

module.exports = Service