const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    expireDate: {
        type: String,
        require: true
    },
    isActive: {
        type: Boolean,
        require: true,
        default: true
    }
})

const coupon = mongoose.model('coupon', couponSchema)
module.exports = coupon