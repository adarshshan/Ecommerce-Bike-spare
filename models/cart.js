const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({

})

const cart=mongoose.model('cart',cartSchema);
module.exports=cart;