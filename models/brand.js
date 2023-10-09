const mongoose =require('mongoose')

const brandSchema= new mongoose.Schema({
    name:String
})

const brand =mongoose.model('brand',brandSchema)
module.exports=brand;   