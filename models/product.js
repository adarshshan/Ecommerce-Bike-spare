const mongoose=require('mongoose') 

const prouctSchema =mongoose.Schema({
    name:String,
    image:String,
    countInStock:Number
})

exports.product =mongoose.model('product',prouctSchema)