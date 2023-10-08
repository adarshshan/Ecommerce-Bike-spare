const mongoose = require('mongoose')

const userSchema =mongoose.Schema({
    name:String,
    email:String,
    phone:Number,
    password:String
    
})
exports.user=mongoose.model('user',userSchema)
