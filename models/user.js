const mongoose = require('mongoose')
const bcrypt=require('bcrypt')


const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique: true
    },
    password:{
        type:String
    },
    cpassword:{
        type:String
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    wishlist:[{
        productId:{
            type:String,
            ref:'product'
        },
        date:{
            type:Date,
            default:Date.now()
        }
    }],
    created_at:{
        type:Date,
        default:Date.now()
    },
    blocked_at:{
        type:Date
    },
    unBlocked_at:{
        type:Date
    },
    verified:{
        type:Boolean
    }
})
const User=mongoose.model('user',userSchema)
module.exports=User
