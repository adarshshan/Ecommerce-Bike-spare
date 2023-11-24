const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    minDiscount: {
        type: Number,
        required: true
    },
    maxDiscount:{
        type:Number,
        default:0
    },
    expireDate: {
        type: String,
        require: true
    },
    minPurchase:{
        type:Number,
        required:true
    },
    maxPurchase:{
        type:Number,
        default:0
    },
    maxusage:{
        type:Number,
        required:true
    },
    used_count:{
        type:Number,
        default:0
    },
    isActive: {
        type: Boolean,
        require: true,
        default: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    deleted_at:{
        type:Date
    },
    modified_at:{
        type:Date
    }
})

const coupon = mongoose.model('coupon', couponSchema)
module.exports = coupon