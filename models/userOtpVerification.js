const mongoose=require('mongoose')

const userOtpVerificationSchema=new mongoose.Schema({
    userId:String,
    otp:String,
    created_at:Date,
    expired_at:Date
})

const userOtpVerification=mongoose.model('userOtpVerification',userOtpVerificationSchema)
module.exports=userOtpVerification