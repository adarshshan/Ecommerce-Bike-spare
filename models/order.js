const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    orders: [{
        date: {
            type: Date,
            default: Date.now()
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        couponType: {
            type: String
        },
        couponAmount: {
            type: Number
        },
        walletAmount:{
            type:Number,
            default:0
        },
        offer:{
            type:Number,
            default:0
        },
        reason:{
            type:String
        },
        products: [
            {
              product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
                required: true,
              },
              quantity: {
                type: Number,
                required: true,
              },
              status: {
                type: String,
                required: true,
              },
              delivery_date: {
                type:String,
                default:new Date().setDate(new Date().getDate() + 7),
              }
            }
          ],
          address:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'userDetails',
            required:true
          }
    }]
})

const order = mongoose.model('order', orderSchema)
module.exports = order;