const mongoose=require('mongoose')

const paymentSchema=new mongoose.Schema({

})

const payment=mongoose.model('payment',paymentSchema)
module.exports=payment