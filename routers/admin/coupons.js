const express=require('express')
const router=express.Router()
const Coupon=require('../../models/coupon')


router.get('/',async (req,res)=>{
    const couponList=await Coupon.find()

    res.send(couponList)
})

router.post('/',(req,res)=>{

})

module.exports=router;