const express=require('express')
const router=express.Router()
const Categorie=require('../models/categorie')

router.get('/',async (req,res)=>{
    const categorieList=await Categorie.find()

    res.send(categorieList)
})

router.post('/',(req,res)=>{
    const categorie=new Categorie({
        name:req.body.name
    })
    categorie.save()
    .then((categorieCreated)=>{
        res.status(201).json(categorieCreated)
    })
    .catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })

})

module.exports=router