const express = require('express')
const Prodct=require('../../models/product')
const router = express.Router()

router.get(`/`,async (req,res)=>{
    // const productList= await Prodct.find()

    // if(!productList){
    // res.status(500).json({success:false})
    // }else
    
    // res.send(productList)
    res.render('admin/categories.ejs')
    
})
router.post(`/`,(req,res)=>{
    const product= new Prodct({
        name:req.body.name,
        image:req.body.image,
        countInStock:req.body.countInStock
    })
    // await Product.insertOne([product])

    product.save().then((createdProduct =>{
        res.status(201).json(createdProduct)
    }))
    .catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})

module.exports=router;