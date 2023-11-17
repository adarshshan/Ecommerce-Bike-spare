const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  orders: [{
    date: {
      type: Date,
      default: Date.now()
    },
    invoice:{
      type:String,
      required:true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    isCancelled:{
      type:Boolean,
      default:false
    },
    couponDiscount: {
      type: Number
    },
    walletAmount: {
      type: Number,
      default: 0
    },
    refund: {
      type: Boolean,
      default:false
    },
    products: [
      {
        product_id: {
          type: mongoose.Types.ObjectId,
          ref: "product",
          required: true,
        },
        productName:{
          type:String,
          required:true,
        },
        productPrice:{
          type:Number,
          required:true
        },
        productImage:{
          type:String,
        },
        productDiscription:{
          type:String
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
          type: String,
          default: new Date().setDate(new Date().getDate() + 7),
        }
      }
    ],
    address:[{
      addressId: {
        type: mongoose.Types.ObjectId,
        ref: 'userDetail',
        required: true
      },
      addressName:{
        type:String,
        required:true
      },
      addressPhone:{
        type:Number,
        required:true,
      }
    }]
  }]
})

const order = mongoose.model('order', orderSchema)
module.exports = order;