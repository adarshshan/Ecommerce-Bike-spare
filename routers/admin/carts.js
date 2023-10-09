const express=require('express')
const router=express.Router()
const Cart=require('../../models/cart')

router.get('/',async (req,res)=>{
    const cartList=await Cart.find()

    res.send(cartList)
})

router.post('/',(req,res)=>{

})

module.exports=router