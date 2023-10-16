const express = require('express')
const router = express.Router()
const Brand = require('../../models/brand')
const { findById } = require('../../models/product')
const controller=require('../../controller/brandController')

router.get('/',controller.brandHome)

router.post('/',controller.addBrand)

router.get('/add',(req,res)=>{
    res.render('admin/add_brands')
})

router.get('/delete/:id',controller.deleteBrand)

router.get('/edit/:id',controller.editBrand)

router.post('/update/:id',controller.updateBrand)

module.exports = router