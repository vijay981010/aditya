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
    },
    hsnCode: {
        type: String,
        trim: true,        
    },
    itemQuantity: {
        type: Number
    },
    packagingType: {
        type: String
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
    },    
    consignor: {
        type: String,
        trim: true,        
    },    
    consignorCompanyName:{
        type: String,
        trim: true,        
    },
    consignorContactNumber: {
        type: String,
        trim: true,           
    },
    consignorEmail:{
        type: String,
        trim: true,        
    },
    consignorAddress1: {
        type: String,
        trim: true,        
    },
    consignorAddress2: {
        type: String,
        trim: true,        
    },
    consignorPincode: {
        type: String,
        trim: true,        
    },
    consignorCity: {
        type: String,
        trim: true,        
    },
    consignorState: {
        type: String,
        trim: true,        
    },    
    docType: {
        type: String,
        enum: ['Aadhaar Number', 'GSTIN (Normal)', 'PAN Number', 'Passport Number', 'Document']
    },
    docNumber: {
        type: String,
        trim: true,        
    },
    consignee: {
        type: String,
        trim: true,        
    },
    consigneeCompanyName:{
        type: String,
        trim: true,        
    },
    consigneeContactNumber: {
        type: String,
        trim: true,           
    },
    consigneeEmail:{
        type: String,
        trim: true,        
    },
    consigneeAddress1: {
        type: String,
        trim: true,        
    },
    consigneeAddress2: {
        type: String,
        trim: true,        
    },
    consigneePincode: {
        type: String,
        trim: true,        
    },
    consigneeCity: {
        type: String,
        trim: true,        
    },
    consigneeState: {
        type: String,
        trim: true,        
    },    
    origin: {
        type: String,
        trim: true,        
    },
    destination: {
        type: String,
        trim: true,        
    },
    numberOfBoxes: {
        type: Number
    },
    boxType: {
        type: String,        
    },    
    boxDetails: [boxSchema],
    chargeableWeight: {
        type: Number
    },
    currency: {
        type: String,
        enum: ['INR', 'USD', 'GBP', 'EUR']      
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
    },
    coforwarderAwb: {
        type: String,
        trim: true,        
    },
    clientNote: {
        type: String,
        trim: true,        
    },
    selfNote: {
        type: String,
        trim: true,        
    },
    trackingDetails: [trackingSchema],
    service: {
        type: String,
        trim: true,             
    },
    preferredVendor:{
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive']
    },    
    baseRate: Number,
    brGst : Number,
    fuelSurcharge: Number,
    fsGst: Number,
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
    },
    miscClients: {
        type: String,
        trim: true
    },
    isAwbAutoGenerated: {
        type: Boolean
    },    
    invoiceFlag: {
        type: Boolean,
        default: true
    }
}, { timestamps: true } )

const Order = mongoose.model('Order', orderSchema)

module.exports = Order