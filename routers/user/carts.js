const express = require('express')
const router = express.Router()
const Cart = require('../../models/cart')
const product = require('../../models/product')
const notifier = require('node-notifier');
const path = require('path')
const controller=require('../../controller/cartController')
const axios = require('axios');

router.get('/', controller.cartHome)

router.post('/add/:id',controller.addCart)

router.get('/remove/:id', controller.removeCart)

router.get('/increaseCount/:id',async (req,res)=>{
    const id=req.params.id
    const userId=req.session.currentUserId
    const cartId=req.session.cartId
    if(userId){
        await Cart.updateOne({userId:userId,'products.productId':id},{$inc:{'products.$.quantity':1}})
    }else if(cartId){
        await Cart.updateOne({_id:cartId,'products.productId':id},{$inc:{'products.$.quantity':1}})
    }
    res.redirect('/carts')
})
router.get('/decreaseCount/:id',async (req,res)=>{
    const id=req.params.id
    const userId=req.session.currentUserId 
    const cartId=req.session.cartId
    if(userId){
        await Cart.updateOne({userId:userId,'products.productId':id},{$inc:{'products.$.quantity':-1}})
    }else if(cartId){
        await Cart.updateOne({_id:cartId,'products.productId':id},{$inc:{'products.$.quantity':-1}})
    }
    res.redirect('/carts')
})

module.exports = router