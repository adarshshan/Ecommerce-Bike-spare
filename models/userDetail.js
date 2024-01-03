const mongoose = require('mongoose')

const detailSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'user',
        required: true
    },
    address: [
        {
            name: {
                type: String,
                required: true
            },
            phone: {
                type: Number,
                required: true
            },
            pinCode: {
                type: Number,
                required: true
            },
            district: {
                type: String,
                required: true
            },
            fullAddress: {
                type: String,
                required: true
            },
            landmark: {
                type: String
            },
            alternativePhone: {
                type: Number
            },
            date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    created_at: {
        type: Date,
        default: Date.now()
    },
    modified_at: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})
const userDetail = mongoose.model('userDetail', detailSchema)
module.exports = userDetail