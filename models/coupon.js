const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({

})

const coupon=mongoose.model('coupon',couponSchema)
module.exports=coupon