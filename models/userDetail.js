const mongoose=require('mongoose')

const detailSchema=new mongoose.Schema({
    name:String,
    place:String,
    state:String,
    isDeleted:{
        type:Boolean,
        default:false
    }
})
const userDetail=mongoose.model('userDetail',detailSchema)
module.exports=userDetail