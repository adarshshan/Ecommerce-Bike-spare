const { ObjectId, Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const prouctSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brandId:
        [{
            type: mongoose.Types.ObjectId,
            ref: "brand",
            required:true
        }],
    categorieId:
        [{
            type: mongoose.Types.ObjectId,
            ref: "categorie",
            required:true
        }],
    price: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    crated_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date
    }
})
const product = mongoose.model('product', prouctSchema)
module.exports = product;