const mongoose = require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


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
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    blocked_at:{
        type:Date
    },
    unBlocked_at:{
        type:Date
    }
    
})
// //generating token
// userSchema.methods.generateAuthToken =async function(){
//     try{
//         console.log(this._id);
//         const token=jwt.sign({_id:this._id.toString()},'mynameisadarshshanuktandiamadevelopers')
//         this.tokens=this.tokens.concat({token:token})
//         await this.save()
//         console.log(`Your Token is ${token}`)
//         return token
//     }catch(error){
        
//         console.log('the error part'+error)

//     }
// }
// //converting password into hash
// userSchema.pre('save',async function(next){
//     if(this.isModified('password')){
       
//         this.password=await bcrypt.hash(this.password,10)
       
//         this.confirmpassword=await bcrypt.hash(this.password,10)
//     }
//     next()
// })

const User=mongoose.model('user',userSchema)
module.exports=User
