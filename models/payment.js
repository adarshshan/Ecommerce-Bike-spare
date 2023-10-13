const mongoose=require('mongoose')

const paymentSchema=new mongoose.Schema({
    isDeleted:{
        type:Boolean,
        default:false
    },
    created_at:{
        type:Date,
        default:Date.now
    }
})

const payment=mongoose.model('payment',paymentSchema)
module.exports=payment