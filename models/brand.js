const mongoose =require('mongoose')

const brandSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
})

const brand =mongoose.model('brand',brandSchema)
module.exports=brand;   