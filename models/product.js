const { ObjectId, Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const prouctSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brandId:
    {
        type: mongoose.Types.ObjectId,
        ref: "brand"
    },
    categorieId:
    {
        type: mongoose.Types.ObjectId,
        ref: "categorie"
    },
    price: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    image: [{ type: String }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    crated_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date
    },
    discount: {
        type: Number,
        default: 0
    },
    likes: [{
        userId: { type: String }
    }],
    reviews: [
        {
            title: {
                type: String,
            },
            description: {
                type: String
            },
            reviewer: {
                type: String,
            },
            score: {
                type: Number
            },
            time: {
                type: Date,
                default: Date.now()
            }
        }
    ]
})
const product = mongoose.model('product', prouctSchema)
module.exports = product;