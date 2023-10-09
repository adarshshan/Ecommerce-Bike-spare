const mongoose=require('mongoose')

const detailSchema=new mongoose.Schema({
    name:String,
    place:String,
    state:String
})
const userDetail=mongoose.model('userDetail',detailSchema)
module.exports=userDetail