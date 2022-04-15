const mongoose = require('mongoose')

const Schema = mongoose.Schema

const trackingSchema = new Schema({
    statusDate: {
        type: Date
    },
    statusTime: {
        type: String
    },
    statusLocation: {
        type: String 
    },
    statusActivity: {
        type: String
    }
})

const itemSchema = new Schema({ 
    boxNumber: {
        type: Number,        
    },  
    itemType: {
        type: String,      
        enum: ['normal', 'non-DG']  
    },
    itemName: {
        type: String,
        trim: true,
        maxlength: 30
    },
    itemQuantity: {
        type: Number
    },
    itemPrice:{
        type: Number
    }
})

const boxSchema = new Schema({    
    boxLength: {
        type: Number
    },
    boxWidth: {
        type: Number
    },
    boxHeight: {
        type: Number
    },
    volumetricWeight: {
        type: Number
    },
    actualWeight: {
        type: Number
    },
    itemDetails: [itemSchema]
})

const orderSchema = new Schema({
    bookingDate: {
        type: Date,
        required: true,
        default: Date.now
    },    
    awbNumber:{
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    consignor: {
        type: String,
        trim: true,
        maxlength: 30
    },
    consignorContactNumber: {
        type: String,
        trim: true,
        maxlength: 50       
    },
    consignorEmail:{
        type: String,
        trim: true,
        maxlength: 50
    },
    consignorAddress1: {
        type: String,
        trim: true,
        maxlength: 100
    },
    consignorAddress2: {
        type: String,
        trim: true,
        maxlength: 100
    },
    consignorPincode: {
        type: String,
        trim: true,
        maxlength: 15
    },
    consignorCity: {
        type: String,
        trim: true,
        maxlength: 15
    },
    consignorState: {
        type: String,
        trim: true,
        maxlength: 15
    },    
    docType: {
        type: String,
        enum: ['Aadhaar Number', 'GSTIN (Normal)', 'PAN Number', 'Passport Number']
    },
    docNumber: {
        type: String,
        trim: true,
        maxlength: 30
    },
    consignee: {
        type: String,
        trim: true,
        maxlength: 30
    },
    consigneeContactNumber: {
        type: String,
        trim: true,
        maxlength: 50     
    },
    consigneeEmail:{
        type: String,
        trim: true,
        maxlength: 50
    },
    consigneeAddress1: {
        type: String,
        trim: true,
        maxlength: 100
    },
    consigneeAddress2: {
        type: String,
        trim: true,
        maxlength: 100
    },
    consigneePincode: {
        type: String,
        trim: true,
        maxlength: 15
    },
    consigneeCity: {
        type: String,
        trim: true,
        maxlength: 15
    },
    consigneeState: {
        type: String,
        trim: true,
        maxlength: 15
    },    
    origin: {
        type: String,
        trim: true,
        maxlength: 15
    },
    destination: {
        type: String,
        trim: true,
        maxlength: 15
    },
    numberOfBoxes: {
        type: Number
    },
    boxType: {
        type: String,
        enum: ['spx', 'docx']
    },    
    boxDetails: [boxSchema],
    chargeableWeight: {
        type: Number
    },
    currency: {
        type: String,
        enum: ['INR', 'USD']      
    },
    invoiceType: {
        type: String,
    },
    totalValue: {
        type: Number
    },
    trackingNumber: {
        type: String,
        trim: true,
        maxlength: 30
    },
    trackingStatus: {
        type: String,
        trim: true
    },
    apiCount: {
        type: Number,
    },
    vendorName: {
        type: String,
        trim: true,
        enum: ['OTHERS', 'DPD UK', 'DHL', 'FEDEX', 'UPS', 'TNT', 'SHREE MARUTI', 'ECOM EXPRESS', 'DTDC', 'DELHIVERY', 'CITY LINK EXPRESS', 'BLUEDART', 'ARAMEX']
    },
    vendorId: {
        type: String,
        trim: true,
        enum: ['0','104','12','5','22','21','24','6','7','2','304','1','11']
    },
    coforwarder: {
        type: String,
        trim: true,
        maxlength: 30
    },
    coforwarderAwb: {
        type: String,
        trim: true,
        maxlength: 30
    },
    clientNote: {
        type: String,
        trim: true,
        maxlength: 200
    },
    selfNote: {
        type: String,
        trim: true,
        maxlength: 200
    },
    trackingDetails: [trackingSchema],
    service: {
        type: String,
        trim: true,
        maxLength: 30        
    },
    status: {
        type: String,
        enum: ['active', 'inactive']
    },    
    baseRate: Number,
    brGst : Number,
    chargeDetails: [{
        title: String,
        amount: Number,
        gst: Number
    }],
    totalBill: Number,
    client: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true } )

const Order = mongoose.model('Order', orderSchema)

module.exports = Order