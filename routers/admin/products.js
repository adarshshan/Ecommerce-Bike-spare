const express = require('express')
const Prodct=require('../../models/product')
const Categorie=require('../../models/categorie')
const Brand=require('../../models/brand')
const router = express.Router()
const multer=require('multer')


let storrage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename:function (req,file,cb){
        cb(null,file.fieldname + "_" + Date.now()+"_"+file.originalname)
    }
})

let upload=multer({
    storage:storrage,
}).single('image')

router.get(`/`,async (req,res)=>{
    const productList= await Prodct.find()

    if(!productList){
    res.status(500).json({success:false})
    }else
    
    // res.send(productList)
    res.render('admin/products.ejs',{
        title:'Produts',
        data:productList
    })
    
})
router.post(`/`,upload,(req,res)=>{
    const product= new Prodct({
        name:req.body.name,
        brandId:req.body.brandId,
        categorieId:req.body.categorieId,
        price:req.body.price,
        stock:req.body.stock,
        description:req.body.description,
        image:req.file.filename
    })
    // await Product.insertOne([product])

    product.save().then((createdProduct =>{
        // res.status(201).json(createdProduct)
        
        req.session.message={
            type:'success',
            message:'Product Add successfully.'
        }
        res.redirect('/products')
    }))
    .catch((err)=>{
        console.log('the problem is here')
        res.status(500).json(console.log(err))
    })
})
router.get('/add',async (req,res)=>{
    let categorieList=await Categorie.find();
    const viewData={
        edit:false,
        categorieList
        
    }
    let brandList=await Brand.find()
    const showData={
        edit:false,
        brandList
    }
    res.render('admin/add_products',{viewData,showData,title:"add product"})
})
router.get('/delete/:id',(req,res)=>{
    let id=req.params.id
    Prodct.findByIdAndDelete(id).then(()=>{
        res.redirect('/products')
    })
    .catch((err)=>{
        console.log('problem is at get(/delete/:id ,Products..')
        console.log(err)
    })
})
router.get('/update/:id',async (req,res)=>{
    let id=req.params.id
    let categorieList=await Categorie.find();
    const viewData={
        edit:false,
        categorieList
        
    }
    let brandList=await Brand.find()
    const showData={
        edit:false,
        brandList
    }
    Prodct.findById(id).then((product)=>{ console.log(product)
        res.render('admin/edit_product',{product,viewData,showData,title:'edit_product'})
    })
    .catch((err)=>{
        console.log('Problem is ata update get request.')
        console.log(err)
        res.redirect('/products/uptate/:id')
    })
})

router.post('/update/:id',async (req,res)=>{
    let id=req.params.id;
    await Prodct.findByIdAndUpdate(id,{
        name:req.body.name,
        brandId:req.body.brandId,
        categorieId:req.body.categorieId,
        price:req.body.price,
        stock:req.body.stock,
        description:req.body.description

    }).then((result)=>{
        console.log(result)
        res.redirect('/products')
    }).catch((err)=>{
        console.log('The error is here at product,update,post')
        console.log(err)
    })
})

module.exports=router;