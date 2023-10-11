const express=require('express')
const router=express.Router()
const Products=require('../../models/product')

router.get('/',async (req,res)=>{
    let productList=await Products.find()
    if(!productList){
        res.status(500).json({success:false})
        }else{
            res.render('user/home_page',{title:'home_page',products:productList})
        }
   
})

module.exports=router