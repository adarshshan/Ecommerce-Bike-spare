const mongoose=require('mongoose') 

const prouctSchema =new mongoose.Schema({
    name:String,
    image:String,
    countInStock:Number
})
const product = mongoose.model('product',prouctSchema)
module.exports = product;