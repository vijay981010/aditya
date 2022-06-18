const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    role: {
        type: String,
        required: true
    },    
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    token: {
        type: String,        
    },
    companyName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    contactName: {
        type: String,
        trim: true,
        maxlength: 30
    },
    address: {
        type: String,
        trim: true,
        maxlength: 200
    },
    contactNumber: {
        type: String,
        trim: true,
        maxlength: 15
    },
    email: {
        type: String,
        trim: true,
        maxlength: 30
    },
    gstNumber: {
        type: String,
        trim: true,
        maxlength: 15
    },
    website: {
        type: String,
        trim: true,
        maxlength: 30
    },
    accessRight: {
        type: Array,
    },
    serviceAccess: {
        type: Array,
    },
    defaultService: {
        type: String,
    },    
    displayName:{
        type: String,
        trim: true
    },
    apiCredit: {
        type: Number,
    },
    trackingId:{
        type: String,
        trim: true
    },
    sacCode: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive']
    },
    invoiceDefaultNote:{
        type: String,
    },
    logo:{
        type: String,
        trim: true
    },
    settings:{
        manualAwbOption: Boolean,
        cashInvoice: Boolean,
        packingListExcel: Boolean, 
        boxStickerWeightVisibility: Boolean,               
        autoHsn: Boolean,            
        awbPrintBranding: Boolean,
        displayNoName: Boolean,
        additionalTrackingStatus: Boolean,
        preferredVendor: Boolean,
        noTaxColumn: Boolean, 
    },    
    clientSettings:{
        manualAwbOption: Boolean,
        cashInvoice: Boolean,
        packingListExcel: Boolean, 
        boxStickerWeightVisibility: Boolean,               
        autoHsn: Boolean,      
        awbPrintBranding: Boolean,
        displayNoName: Boolean,
        additionalTrackingStatus: Boolean,
        preferredVendor: Boolean,
        noTaxColumn: Boolean     
    },
    awbSettings:{
        title: {
            name: String,
            fontSize: Number,
            xStart: Number,
            yStart: Number,
            width: Number,
            align: String
        },
        subTitle: {
            name: String,
            fontSize: Number,
            xStart: Number,
            yStart: Number,
            width: Number,
            align: String
        },
    },
    invoiceSettings:{
        layout: String,
    },
    trackingType:{
        type: String
    },
    adminCode:{
        type: String
    },
    invoice: {
        type: Schema.Types.ObjectId,
        ref: 'Billing'
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',             
    }    
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User