const express = require('express')
const router = express.Router()
const Brand = require('../../models/brand')

router.get('/', async (req, res) => {
    const brandList = await Brand.find()
    res.render('admin/brands',{
        title:'Brands',
        data:brandList
    })
    // res.send(brandList)
})

router.post('/', (req, res) => {
    const brands = new Brand({
        name: req.body.name
    })
    brands.save()
        .then((brandCreated) => {
            // res.status(201).json(brandCreated)
            res.redirect('/brands')
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false
            })  
        })
})
router.get('/add',(req,res)=>{
    res.render('admin/add_brands')
})
router.get('/delete/:id',(req,res)=>{
    let id=req.params.id
    Brand.findByIdAndRemove(id).then((result)=>{
        res.redirect('/brands')
    })
    .catch((err)=>{
        res.send(err)
    })
})

router.get('/edit/:id',(req,res)=>{
    let id=req.params.id;
    Brand.findById(id).then((user)=>{
        res.render('admin/edit_brand',{
            title:"Edit brand",
            data:user
        })
    })
    .catch((err)=>{
        res.send(err);
    })
})
router.post('/update/:id',(req,res)=>{
    let id =req.params.id
    Brand.findByIdAndUpdate(id,{
        name:req.body.name
    }).then((user)=>{
        res.redirect('/brands')
    })
    .catch((err)=>{
        res.send(err)
    })
})
module.exports = router